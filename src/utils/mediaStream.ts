/**
 * Media Stream Management & Virtual Camera Fallback
 * Provides real WebRTC media stream acquisition with graceful fallbacks
 * if physical devices are unavailable, blocked, or in restricted iframes.
 */

export interface MediaDevicesState {
  hasCamera: boolean;
  hasMicrophone: boolean;
  permissionGranted: boolean;
  isVirtual: boolean;
}

/**
 * Creates an animated canvas stream with synthetic audio for environments
 * without a physical webcam, ensuring 100% functionality and testability.
 */
export function createVirtualMediaStream(userName: string, avatarSeed: string): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let animationFrameId: number;
  let angle = 0;

  function draw() {
    if (!ctx) return;
    angle += 0.03;

    // Dark sleek gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 480);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Subtle moving grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Outer pulsating circle
    const pulse = Math.sin(angle) * 12;
    ctx.beginPath();
    ctx.arc(320, 210, 85 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner glowing ring
    ctx.beginPath();
    ctx.arc(320, 210, 75, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(240, 130, 400, 290);
    ringGrad.addColorStop(0, '#6366f1');
    ringGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = ringGrad;
    ctx.fill();

    // User Avatar Initials or Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initial = (userName || 'User').charAt(0).toUpperCase();
    ctx.fillText(initial, 320, 212);

    // Name Tag
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(userName || 'Anonymous', 320, 330);

    // Virtual Mode Badge
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.beginPath();
    ctx.roundRect(220, 360, 200, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '13px sans-serif';
    ctx.fillText('Virtual Video Stream Active', 320, 378);

    // Simulated audio waveform dots
    ctx.fillStyle = '#818cf8';
    for (let i = -5; i <= 5; i++) {
      const h = Math.abs(Math.sin(angle * 2 + i * 0.5)) * 18 + 4;
      ctx.fillRect(320 + i * 16 - 3, 420 - h / 2, 6, h);
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  // Capture canvas video stream
  const canvasStream = canvas.captureStream(30);

  // Generate synthetic silent/subtle audio track using Web Audio API
  let audioTrack: MediaStreamTrack | undefined;
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.0001; // virtually silent, provides valid WebRTC audio track
    osc.connect(gain);
    const dest = audioCtx.createMediaStreamDestination();
    gain.connect(dest);
    osc.start();
    audioTrack = dest.stream.getAudioTracks()[0];
  } catch (err) {
    console.warn('Could not create synthetic audio context:', err);
  }

  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach(track => {
    // Cleanup loop when track is stopped
    const origStop = track.stop.bind(track);
    track.stop = () => {
      cancelAnimationFrame(animationFrameId);
      origStop();
    };
    combinedStream.addTrack(track);
  });

  if (audioTrack) {
    combinedStream.addTrack(audioTrack);
  }

  return combinedStream;
}

/**
 * Requests real user camera and microphone with automatic fallback
 */
export async function getMediaStream(
  preferVirtual = false,
  userName = 'User',
  avatarSeed = 'user1'
): Promise<{ stream: MediaStream; isVirtual: boolean }> {
  if (preferVirtual) {
    return {
      stream: createVirtualMediaStream(userName, avatarSeed),
      isVirtual: true,
    };
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not supported in this environment');
    }

    // Use flexible ideal constraints to avoid OverconstrainedError on mobile portrait orientations
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (constraintErr) {
      console.warn('Ideal constraints failed, trying basic video/audio fallback:', constraintErr);
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    }

    return { stream, isVirtual: false };
  } catch (err) {
    console.warn('Real camera/mic unavailable, activating Virtual Video mode:', err);
    return {
      stream: createVirtualMediaStream(userName, avatarSeed),
      isVirtual: true,
    };
  }
}

/**
 * Requests screen display capture
 */
export async function getScreenMediaStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error('Screen sharing is not supported in this browser.');
  }

  return await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'monitor',
    } as MediaTrackConstraints,
    audio: true,
  });
}
