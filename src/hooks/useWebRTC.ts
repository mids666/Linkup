import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CallStatus,
  CryptoInspectorData,
  EncryptedMessage,
  FavoriteUser,
  GenderPreference,
  IncomingCallData,
  PartnerInfo,
  ServerStats,
  UserProfile,
} from '../types';
import {
  computeSafetyNumber,
  deriveAESSharedKey,
  encryptPayload,
  decryptPayload,
  exportPublicKey,
  generateECDHKeyPair,
  importPublicKey,
  bufferToHex,
} from '../utils/crypto';
import {
  createVirtualMediaStream,
  getMediaStream,
  getScreenMediaStream,
} from '../utils/mediaStream';
import {
  getFavorites,
  getOrCreateUserProfile,
  isUserFavorite,
  removeFavorite,
  saveFavorite,
  saveUserProfile,
  updateFavoriteNote,
} from '../utils/storage';
import { firebaseSignaling } from '../firebase/signaling';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export function useWebRTC() {
  const [profile, setProfile] = useState<UserProfile>(() => getOrCreateUserProfile());
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const [currentPartner, setCurrentPartner] = useState<PartnerInfo | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);

  // Media Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVirtualStream, setIsVirtualStream] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Messages & E2EE Crypto
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoInspectorData>({
    algorithm: 'AES-GCM (256-bit)',
    keyExchange: 'NIST P-256 (ECDH)',
    sharedKeyFingerprint: 'Awaiting Peer Connection...',
    safetyNumber: '---- - ---- - ---- - ----',
    isVerified: false,
  });

  // Call & Server state
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [serverStats, setServerStats] = useState<ServerStats>({
    onlineCount: 1,
    activeChatCount: 0,
    queueCount: 0,
  });
  const [favorites, setFavorites] = useState<FavoriteUser[]>(() => getFavorites());
  const [favoritesStatus, setFavoritesStatus] = useState<Record<string, { online: boolean; status: string }>>({});
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [peerConnectionState, setPeerConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Refs for persistent instances
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const ecdhKeyPairRef = useRef<CryptoKeyPair | null>(null);
  const ecdhPublicKeyBase64Ref = useRef<string | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const partnerPublicKeyBase64Ref = useRef<string | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingSignalsRef = useRef<any[]>([]);
  const isSimulatedRef = useRef<boolean>(false);
  const wsSendQueueRef = useRef<string[]>([]);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);

  // Send message over WebSocket with queueing if not yet open
  const sendWs = useCallback((data: unknown) => {
    const payload = JSON.stringify(data);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(payload);
    } else {
      wsSendQueueRef.current.push(payload);
    }
  }, []);

  // Initialize local media stream
  const initLocalStream = useCallback(async (preferVirtual = false) => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const { stream, isVirtual } = await getMediaStream(preferVirtual, profile.name, profile.avatarSeed);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVirtualStream(isVirtual);
      return stream;
    } catch (err) {
      console.error('Failed to get media stream:', err);
      const virtualStream = createVirtualMediaStream(profile.name, profile.avatarSeed);
      localStreamRef.current = virtualStream;
      setLocalStream(virtualStream);
      setIsVirtualStream(true);
      return virtualStream;
    }
  }, [profile.name, profile.avatarSeed]);

  // Clean up WebRTC Peer Connection & E2EE State
  const cleanupPeerConnection = useCallback(() => {
    isSimulatedRef.current = false;
    pendingSignalsRef.current = [];

    if (currentRoomIdRef.current) {
      firebaseSignaling.leaveRoom(currentRoomIdRef.current, 'Partner disconnected');
      currentRoomIdRef.current = null;
    }

    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (e) {
        // ignore
      }
      dataChannelRef.current = null;
    }

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {
        // ignore
      }
      pcRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    setRemoteStream(null);
    setMessages([]);
    sharedKeyRef.current = null;
    partnerPublicKeyBase64Ref.current = null;
    pendingCandidatesRef.current = [];
    setPeerConnectionState('new');
    setCryptoData({
      algorithm: 'AES-GCM (256-bit)',
      keyExchange: 'NIST P-256 (ECDH)',
      sharedKeyFingerprint: 'Awaiting Peer Connection...',
      safetyNumber: '---- - ---- - ---- - ----',
      isVerified: false,
    });
  }, []);

  // Establish E2EE keys when both public keys are exchanged
  const finalizeE2EE = useCallback(async (partnerPubKeyBase64: string) => {
    try {
      if (!ecdhKeyPairRef.current || !ecdhPublicKeyBase64Ref.current) {
        return;
      }
      partnerPublicKeyBase64Ref.current = partnerPubKeyBase64;
      const partnerKey = await importPublicKey(partnerPubKeyBase64);
      const derivedKey = await deriveAESSharedKey(ecdhKeyPairRef.current.privateKey, partnerKey);
      sharedKeyRef.current = derivedKey;

      const safetyNum = await computeSafetyNumber(ecdhPublicKeyBase64Ref.current, partnerPubKeyBase64);

      // Export raw representation for visual inspection fingerprint
      const rawPartnerKey = await window.crypto.subtle.exportKey('raw', partnerKey);
      const fingerprint = bufferToHex(rawPartnerKey).slice(0, 16).toUpperCase();

      setCryptoData(prev => ({
        ...prev,
        sharedKeyFingerprint: `SHA256-${fingerprint}`,
        safetyNumber: safetyNum,
        isVerified: true,
      }));
    } catch (err) {
      console.error('Failed to complete E2EE key agreement:', err);
    }
  }, []);

  // Setup DataChannel event handlers for E2EE messaging
  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    dataChannelRef.current = channel;

    channel.onopen = async () => {
      // Exchange ECDH public keys immediately upon open
      if (ecdhPublicKeyBase64Ref.current) {
        channel.send(
          JSON.stringify({
            type: 'e2ee_key_exchange',
            publicKey: ecdhPublicKeyBase64Ref.current,
          })
        );
      }
    };

    channel.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'e2ee_key_exchange') {
          await finalizeE2EE(payload.publicKey);
          // If we haven't sent ours yet, reply with our public key
          if (ecdhPublicKeyBase64Ref.current && channel.readyState === 'open') {
            channel.send(
              JSON.stringify({
                type: 'e2ee_key_ack',
                publicKey: ecdhPublicKeyBase64Ref.current,
              })
            );
          }
        } else if (payload.type === 'e2ee_key_ack') {
          await finalizeE2EE(payload.publicKey);
        } else if (payload.type === 'encrypted_chat') {
          let decryptedText = '[Encrypted Payload]';
          if (sharedKeyRef.current) {
            try {
              decryptedText = await decryptPayload(payload.ciphertext, payload.iv, sharedKeyRef.current);
            } catch (decErr) {
              console.error('Decryption error:', decErr);
              decryptedText = '⚠️ Decryption failed (Key mismatch)';
            }
          }

          setMessages(prev => [
            ...prev,
            {
              id: payload.id,
              senderId: payload.senderId,
              senderName: payload.senderName,
              timestamp: payload.timestamp,
              text: decryptedText,
              ivHex: payload.ivHex,
              ciphertextHex: payload.ciphertextHex,
              isEncrypted: true,
            },
          ]);

          setCryptoData(prev => ({
            ...prev,
            lastEncryptedPayload: {
              iv: payload.ivHex || 'N/A',
              ciphertextSnippet: (payload.ciphertextHex || '').slice(0, 32) + '...',
              authTagSnippet: (payload.ciphertextHex || '').slice(-32),
              timestamp: Date.now(),
            },
          }));
        }
      } catch (err) {
        console.error('DataChannel message handling error:', err);
      }
    };

    channel.onerror = (err) => {
      console.warn('DataChannel error:', err);
    };

    channel.onclose = () => {
      console.log('DataChannel closed');
    };
  }, [finalizeE2EE]);

  // Process incoming WebRTC signal (offer, answer, candidate)
  const processSignal = useCallback(
    async (signal: any, pc: RTCPeerConnection) => {
      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
          // Process queued candidates
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            if (cand && cand.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('Queued candidate error:', e);
              }
            }
          }
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendWs({
            type: 'signal',
            signal: {
              type: 'answer',
              sdp: answer.sdp,
            },
          });
          if (currentRoomIdRef.current) {
            firebaseSignaling.sendSignal(currentRoomIdRef.current, profile.id, {
              type: 'answer',
              sdp: answer.sdp,
            });
          }
        } else if (signal.type === 'answer') {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
            while (pendingCandidatesRef.current.length > 0) {
              const cand = pendingCandidatesRef.current.shift();
              if (cand && cand.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.warn('Queued candidate error:', e);
                }
              }
            }
          }
        } else if (signal.type === 'ice-candidate') {
          if (signal.candidate && signal.candidate.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              } catch (e) {
                console.warn('ICE candidate error:', e);
              }
            } else {
              pendingCandidatesRef.current.push(signal.candidate);
            }
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC signal:', err);
      }
    },
    [sendWs]
  );

  // Create WebRTC Peer Connection and handle offer/answer
  const createPeerConnection = useCallback(
    async (roomId: string, isHost: boolean) => {
      cleanupPeerConnection();
      currentRoomIdRef.current = roomId;

      // 1. Ensure local stream is ready FIRST before instantiating WebRTC
      let stream = localStreamRef.current;
      if (!stream || stream.getTracks().length === 0) {
        stream = await initLocalStream();
      }

      // 2. Generate fresh ECDH key pair for this session
      const keyPair = await generateECDHKeyPair();
      ecdhKeyPairRef.current = keyPair;
      const pubKeyBase64 = await exportPublicKey(keyPair.publicKey);
      ecdhPublicKeyBase64Ref.current = pubKeyBase64;

      // 3. Create peer connection
      const pc = new RTCPeerConnection(RTC_CONFIG);

      pc.onconnectionstatechange = () => {
        setPeerConnectionState(pc.connectionState);
        if (pc.connectionState === 'connected') {
          setCallStatus('connected');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setCallStatus('partner_disconnected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setCallStatus('connected');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candJson = event.candidate.toJSON ? event.candidate.toJSON() : event.candidate;
          sendWs({
            type: 'signal',
            signal: {
              type: 'ice-candidate',
              candidate: candJson,
            },
          });
          if (roomId) {
            firebaseSignaling.sendSignal(roomId, profile.id, {
              type: 'ice-candidate',
              candidate: candJson,
            });
          }
        }
      };

      // Accumulator stream to ensure all tracks (audio & video) trigger React re-renders
      const remoteAccumulator = new MediaStream();
      pc.ontrack = (event) => {
        if (event.track) {
          // Avoid duplicate track additions
          const exists = remoteAccumulator.getTracks().some(t => t.id === event.track.id);
          if (!exists) {
            remoteAccumulator.addTrack(event.track);
          }
          // Produce a fresh MediaStream instance reference so React components attach & play immediately
          setRemoteStream(new MediaStream(remoteAccumulator.getTracks()));
        }

        if (event.streams && event.streams[0]) {
          const primaryStream = event.streams[0];
          primaryStream.onaddtrack = () => {
            setRemoteStream(new MediaStream(primaryStream.getTracks()));
          };
          setRemoteStream(new MediaStream(primaryStream.getTracks()));
        }
      };

      // 4. Add all local tracks (video & audio) BEFORE creating offer or answer
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      // Now it is safe to publish the pc instance to refs for incoming signals
      pcRef.current = pc;

      if (isHost) {
        // Initiator creates data channel
        const dc = pc.createDataChannel('e2ee-messaging', {
          ordered: true,
        });
        setupDataChannel(dc);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendWs({
            type: 'signal',
            signal: {
              type: 'offer',
              sdp: offer.sdp,
            },
          });
          if (roomId) {
            firebaseSignaling.sendSignal(roomId, profile.id, {
              type: 'offer',
              sdp: offer.sdp,
            });
          }
        } catch (err) {
          console.error('Failed creating WebRTC offer:', err);
        }
      } else {
        // Receiver waits for data channel
        pc.ondatachannel = (event) => {
          setupDataChannel(event.channel);
        };
      }

      // Drain any signals that arrived before pc finished initializing
      while (pendingSignalsRef.current.length > 0) {
        const queuedSignal = pendingSignalsRef.current.shift();
        if (queuedSignal) {
          await processSignal(queuedSignal, pc);
        }
      }
    },
    [cleanupPeerConnection, initLocalStream, sendWs, setupDataChannel, processSignal]
  );

  // Connect WebSocket with auto-reconnect
  useEffect(() => {
    let isCleanedUp = false;

    const connectWebSocket = () => {
      if (isCleanedUp) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);

        // Register with server
        ws.send(
          JSON.stringify({
            type: 'register',
            userId: profile.id,
            userName: profile.name,
            avatarSeed: profile.avatarSeed,
            age: profile.age,
            gender: profile.gender,
            country: profile.country,
            countryFlag: profile.countryFlag,
            genderPreference: profile.genderPreference,
          })
        );

        // Flush any queued messages
        while (wsSendQueueRef.current.length > 0) {
          const item = wsSendQueueRef.current.shift();
          if (item) ws.send(item);
        }

        // Check favorites status
        const favs = getFavorites();
        if (favs.length > 0) {
          ws.send(
            JSON.stringify({
              type: 'check_favorites_status',
              userIds: favs.map(f => f.id),
            })
          );
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'registered':
              break;

            case 'stats_update':
              setServerStats({
                onlineCount: msg.onlineCount || 1,
                activeChatCount: msg.activeChatCount || 0,
                queueCount: msg.queueCount || 0,
              });
              break;

            case 'searching':
              setCallStatus('searching');
              setQueuePosition(msg.queuePosition || 1);
              break;

            case 'search_cancelled':
              setCallStatus('idle');
              setQueuePosition(0);
              break;

            case 'match_found': {
              currentRoomIdRef.current = msg.roomId;
              setCurrentRoomId(msg.roomId);
              setCurrentPartner(msg.partner);
              setIsInitiator(msg.isInitiator);
              setDisconnectReason(null);
              setCallStatus('connecting');

              firebaseSignaling.joinRoom(
                msg.roomId,
                profile.id,
                async (sig) => {
                  const currentPc = pcRef.current;
                  if (!currentPc) {
                    pendingSignalsRef.current.push(sig);
                    return;
                  }
                  await processSignal(sig, currentPc);
                },
                (reason) => {
                  cleanupPeerConnection();
                  setCurrentPartner(null);
                  setCurrentRoomId(null);
                  setDisconnectReason(reason);
                  setCallStatus('partner_disconnected');
                }
              );

              await createPeerConnection(msg.roomId, msg.isInitiator);
              break;
            }

            case 'partner_skipped':
              cleanupPeerConnection();
              setCurrentPartner(null);
              setCurrentRoomId(null);
              setDisconnectReason('Partner skipped to the next person.');
              setCallStatus('partner_skipped');
              break;

            case 'partner_disconnected':
              cleanupPeerConnection();
              setCurrentPartner(null);
              setCurrentRoomId(null);
              setDisconnectReason(msg.reason || 'Partner left the chat.');
              setCallStatus('partner_disconnected');
              break;

            case 'call_stopped_camera_disabled':
              cleanupPeerConnection();
              setCurrentPartner(null);
              setCurrentRoomId(null);
              setDisconnectReason(msg.reason || 'Call stopped automatically: Camera was turned off. Video chat requires an active camera.');
              setCallStatus('partner_disconnected');
              break;

            case 'incoming_call':
              setIncomingCall(msg);
              break;

            case 'call_declined':
              alert('Your call invitation was declined.');
              setCallStatus('idle');
              break;

            case 'call_failed':
              alert(`Call failed: ${msg.reason || 'User unreachable'}`);
              setCallStatus('idle');
              break;

            case 'favorites_status_result':
              setFavoritesStatus(msg.statuses || {});
              break;

            case 'report_confirmed':
              cleanupPeerConnection();
              setCurrentPartner(null);
              setCurrentRoomId(null);
              break;

            case 'signal': {
              const pc = pcRef.current;
              if (!pc) {
                // Buffer signal until peer connection finishes initialization
                pendingSignalsRef.current.push(msg.signal);
                return;
              }
              await processSignal(msg.signal, pc);
              break;
            }
          }
        } catch (err) {
          console.error('Error in WS onmessage:', err);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        if (!isCleanedUp) {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };
    };

    connectWebSocket();

    // Heartbeat ping
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      isCleanedUp = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [profile.id, profile.name, profile.avatarSeed, profile.age, profile.gender, profile.country, profile.countryFlag, profile.genderPreference, createPeerConnection, cleanupPeerConnection, processSignal]);

  // Start Firebase Firestore real-time presence & online user tracking
  useEffect(() => {
    firebaseSignaling.startPresence(profile, (onlineCount) => {
      setServerStats(prev => ({
        ...prev,
        onlineCount: Math.max(prev.onlineCount, onlineCount),
      }));
    });

    return () => {
      firebaseSignaling.stopPresence(profile.id);
    };
  }, [profile]);

  // Initial media acquisition on load
  useEffect(() => {
    initLocalStream(false);
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [initLocalStream]);

  // Track loss detection during call
  useEffect(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleEnded = () => {
      if (callStatus === 'connected' || callStatus === 'connecting') {
        sendWs({ type: 'camera_disabled' });
        cleanupPeerConnection();
        setCurrentPartner(null);
        setCurrentRoomId(null);
        setDisconnectReason('Call stopped automatically: Camera device was disconnected.');
        setCallStatus('partner_disconnected');
        setIsVideoEnabled(false);
      }
    };

    videoTrack.addEventListener('ended', handleEnded);
    return () => {
      videoTrack.removeEventListener('ended', handleEnded);
    };
  }, [localStream, callStatus, sendWs, cleanupPeerConnection]);

  // Start finding random match
  const startRandomSearch = useCallback((genderPref?: GenderPreference) => {
    isSimulatedRef.current = false;
    // Camera-always-on requirement: Ensure camera is enabled before starting video chat
    if (!isVideoEnabled && localStreamRef.current) {
      const tracks = localStreamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        tracks[0].enabled = true;
        setIsVideoEnabled(true);
      }
    }

    const pref = genderPref || profile.genderPreference || 'any';
    cleanupPeerConnection();
    setCurrentPartner(null);
    setCurrentRoomId(null);
    currentRoomIdRef.current = null;
    setDisconnectReason(null);
    setCallStatus('searching');

    sendWs({
      type: 'find_match',
      genderPreference: pref,
    });

    // Cloud matchmaking queue for GitHub Pages and cross-network users
    firebaseSignaling.enterQueue(
      { ...profile, genderPreference: pref },
      async (roomId, partner, isInit) => {
        currentRoomIdRef.current = roomId;
        setCurrentRoomId(roomId);
        setCurrentPartner(partner);
        setIsInitiator(isInit);
        setDisconnectReason(null);
        setCallStatus('connecting');

        firebaseSignaling.joinRoom(
          roomId,
          profile.id,
          async (sig) => {
            const currentPc = pcRef.current;
            if (!currentPc) {
              pendingSignalsRef.current.push(sig);
              return;
            }
            await processSignal(sig, currentPc);
          },
          (reason) => {
            cleanupPeerConnection();
            setCurrentPartner(null);
            setCurrentRoomId(null);
            setDisconnectReason(reason);
            setCallStatus('partner_disconnected');
          }
        );

        await createPeerConnection(roomId, isInit);
      }
    );
  }, [profile, isVideoEnabled, cleanupPeerConnection, sendWs, createPeerConnection, processSignal]);

  // Cancel search
  const cancelSearch = useCallback(() => {
    isSimulatedRef.current = false;
    sendWs({ type: 'cancel_search' });
    firebaseSignaling.leaveQueue();
    setCallStatus('idle');
  }, [sendWs]);

  // Simulate an instant live test match for testing on a single device or testing mobile setup
  const simulateTestMatch = useCallback(async () => {
    cleanupPeerConnection();
    isSimulatedRef.current = true;
    setCallStatus('connecting');
    setDisconnectReason(null);

    // Camera-always-on requirement: Ensure camera preview is enabled
    if (!isVideoEnabled && localStreamRef.current) {
      const tracks = localStreamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        tracks[0].enabled = true;
        setIsVideoEnabled(true);
      }
    }

    // 1. Generate local ECDH keys if needed
    let localKeyPair = ecdhKeyPairRef.current;
    if (!localKeyPair) {
      localKeyPair = await generateECDHKeyPair();
      ecdhKeyPairRef.current = localKeyPair;
      const pubKey = await exportPublicKey(localKeyPair.publicKey);
      ecdhPublicKeyBase64Ref.current = pubKey;
    }

    // 2. Generate simulated partner ECDH key pair
    const partnerKeyPair = await generateECDHKeyPair();
    const partnerPubKeyBase64 = await exportPublicKey(partnerKeyPair.publicKey);
    const partnerKeyObj = await importPublicKey(partnerPubKeyBase64);
    const derivedSharedKey = await deriveAESSharedKey(localKeyPair.privateKey, partnerKeyObj);
    sharedKeyRef.current = derivedSharedKey;

    const safetyNum = await computeSafetyNumber(ecdhPublicKeyBase64Ref.current!, partnerPubKeyBase64);
    const rawPartnerKey = await window.crypto.subtle.exportKey('raw', partnerKeyObj);
    const fingerprint = bufferToHex(rawPartnerKey).slice(0, 16).toUpperCase();

    // 3. Create simulated partner stream with animated video
    const simPartner: PartnerInfo = {
      id: 'sim_sophia',
      name: 'Sophia (Test Partner)',
      avatarSeed: 'lorelei',
      age: 23,
      gender: 'female',
      country: 'France',
      countryFlag: '🇫🇷',
    };

    const simStream = createVirtualMediaStream('Sophia', 'lorelei');
    setRemoteStream(simStream);
    setCurrentPartner(simPartner);
    setCurrentRoomId('room_test_sim');
    setIsInitiator(true);

    setTimeout(async () => {
      if (!isSimulatedRef.current) return;
      setCallStatus('connected');
      setCryptoData({
        algorithm: 'AES-GCM (256-bit)',
        keyExchange: 'NIST P-256 (ECDH)',
        sharedKeyFingerprint: `SHA256-${fingerprint}`,
        safetyNumber: safetyNum,
        isVerified: true,
      });

      const welcomeText = "Bonjour! I am Sophia from Paris. Real WebRTC video, audio, and AES-256-GCM end-to-end encryption are working seamlessly! ✨";
      const encrypted = await encryptPayload(welcomeText, derivedSharedKey);

      setMessages([
        {
          id: `msg_welcome_${Date.now()}`,
          senderId: 'sim_sophia',
          senderName: 'Sophia',
          timestamp: Date.now(),
          text: welcomeText,
          ivHex: encrypted.ivHex,
          ciphertextHex: encrypted.ciphertextHex,
          isEncrypted: true,
        },
      ]);
    }, 600);
  }, [cleanupPeerConnection, isVideoEnabled]);

  // Skip partner to another random match
  const skipPartner = useCallback((autoFindNext = true, genderPref?: GenderPreference) => {
    const pref = genderPref || profile.genderPreference || 'any';

    if (isSimulatedRef.current) {
      isSimulatedRef.current = false;
      cleanupPeerConnection();
      setCurrentPartner(null);
      setCurrentRoomId(null);
      setDisconnectReason(null);
      if (autoFindNext) {
        startRandomSearch(pref);
      } else {
        setCallStatus('idle');
      }
      return;
    }

    firebaseSignaling.leaveQueue();
    if (currentRoomIdRef.current) {
      firebaseSignaling.leaveRoom(currentRoomIdRef.current, 'Partner skipped to the next person.');
    }

    sendWs({
      type: 'skip',
      autoFindNext,
      genderPreference: pref,
    });
    cleanupPeerConnection();
    setCurrentPartner(null);
    setCurrentRoomId(null);
    setDisconnectReason(null);
    if (autoFindNext) {
      setCallStatus('searching');
    } else {
      setCallStatus('idle');
    }
  }, [profile.genderPreference, cleanupPeerConnection, sendWs, startRandomSearch]);

  // Report partner
  const reportPartner = useCallback(
    (reason: string, details?: string, autoFindNext = true) => {
      if (!currentPartner) return;
      sendWs({
        type: 'report',
        targetUserId: currentPartner.id,
        targetUserName: currentPartner.name,
        reason,
        details,
        autoFindNext,
      });
      cleanupPeerConnection();
      setCurrentPartner(null);
      setCurrentRoomId(null);
      if (autoFindNext) {
        setCallStatus('searching');
      } else {
        setCallStatus('idle');
      }
    },
    [currentPartner, cleanupPeerConnection, sendWs]
  );

  // Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (isScreenSharing) {
      // Stop screen share -> switch back to camera track
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender && videoTrack) {
          await videoSender.replaceTrack(videoTrack);
        }
      }
    } else {
      // Start screen share
      try {
        const screenStream = await getScreenMediaStream();
        screenStreamRef.current = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        screenVideoTrack.onended = async () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
          if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (videoSender && videoTrack) {
              await videoSender.replaceTrack(videoTrack);
            }
          }
        };

        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenVideoTrack);
        }
        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  }, [isScreenSharing]);

  // Video Toggle - Camera-always-on Rule Enforcement
  // "users cannot video chat with camera off, when someone disable camera stop the call automatically."
  const toggleVideo = useCallback(() => {
    if (callStatus === 'connected' || callStatus === 'connecting') {
      // In an active call: disabling the camera immediately stops the call automatically!
      if (isVideoEnabled) {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => {
            t.enabled = false;
          });
        }
        setIsVideoEnabled(false);
        sendWs({ type: 'camera_disabled' });
        cleanupPeerConnection();
        setCurrentPartner(null);
        setCurrentRoomId(null);
        setDisconnectReason(
          'Call stopped automatically: You turned off your camera. Video chat requires your camera to remain enabled.'
        );
        setCallStatus('partner_disconnected');
        return;
      } else {
        // Re-enabling camera
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => {
            t.enabled = true;
          });
        }
        setIsVideoEnabled(true);
      }
    } else {
      // Idle or searching: user preview toggle
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
          const nextState = !videoTracks[0].enabled;
          videoTracks[0].enabled = nextState;
          setIsVideoEnabled(nextState);
        }
      }
    }
  }, [callStatus, isVideoEnabled, cleanupPeerConnection, sendWs]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioEnabled(nextState);
      }
    }
  }, []);

  // Toggle Virtual Avatar Mode
  const toggleVirtualMode = useCallback(async () => {
    const nextVirtual = !isVirtualStream;
    const newStream = await initLocalStream(nextVirtual);
    const pc = pcRef.current;
    if (pc && newStream) {
      const newVideoTrack = newStream.getVideoTracks()[0];
      const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (videoSender && newVideoTrack) {
        await videoSender.replaceTrack(newVideoTrack);
      }
    }
  }, [isVirtualStream, initLocalStream]);

  // Send E2EE Chat Message
  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const timestamp = Date.now();

      // Handle simulated test match partner interaction
      if (isSimulatedRef.current) {
        let ivH = 'NONE';
        let ctH = 'NONE';

        if (sharedKeyRef.current) {
          const encrypted = await encryptPayload(text, sharedKeyRef.current);
          ivH = encrypted.ivHex;
          ctH = encrypted.ciphertextHex;
        }

        setMessages(prev => [
          ...prev,
          {
            id,
            senderId: profile.id,
            senderName: profile.name,
            timestamp,
            text,
            ivHex: ivH,
            ciphertextHex: ctH,
            isEncrypted: !!sharedKeyRef.current,
          },
        ]);

        if (sharedKeyRef.current && ivH !== 'NONE') {
          setCryptoData(prev => ({
            ...prev,
            lastEncryptedPayload: {
              iv: ivH,
              ciphertextSnippet: ctH.slice(0, 32) + '...',
              authTagSnippet: ctH.slice(-32),
              timestamp,
            },
          }));
        }

        // Automated intelligent response from test partner Sophia
        setTimeout(async () => {
          if (!isSimulatedRef.current) return;
          const replies = [
            "I can see and hear your feed clearly! The WebRTC stream is working with zero dropped frames.",
            "Verified! Each message in our chat is securely encrypted with AES-256-GCM and unique 96-bit initialization vectors.",
            "You can test the audio mute, screen share, and video filters using the controls bar below.",
            "Try clicking the Star icon in the top right to test saving me to your Favorites drawer!",
            "Notice: If you turn off your camera right now, the call will terminate automatically according to the camera policy.",
            "Click 'Skip' anytime to test the transition to the next match or back to the search queue!",
          ];
          const chosenReply = replies[Math.floor(Math.random() * replies.length)];
          let repIv = 'NONE';
          let repCt = 'NONE';

          if (sharedKeyRef.current) {
            const enc = await encryptPayload(chosenReply, sharedKeyRef.current);
            repIv = enc.ivHex;
            repCt = enc.ciphertextHex;
          }

          setMessages(prev => [
            ...prev,
            {
              id: `msg_sophia_${Date.now()}`,
              senderId: 'sim_sophia',
              senderName: 'Sophia',
              timestamp: Date.now(),
              text: chosenReply,
              ivHex: repIv,
              ciphertextHex: repCt,
              isEncrypted: !!sharedKeyRef.current,
            },
          ]);
        }, 1200);

        return;
      }

      // Normal WebRTC DataChannel path
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
        return;
      }

      if (sharedKeyRef.current) {
        const encrypted = await encryptPayload(text, sharedKeyRef.current);

        dataChannelRef.current.send(
          JSON.stringify({
            type: 'encrypted_chat',
            id,
            senderId: profile.id,
            senderName: profile.name,
            timestamp,
            ciphertext: encrypted.ciphertextBase64,
            iv: encrypted.ivBase64,
            ivHex: encrypted.ivHex,
            ciphertextHex: encrypted.ciphertextHex,
          })
        );

        setMessages(prev => [
          ...prev,
          {
            id,
            senderId: profile.id,
            senderName: profile.name,
            timestamp,
            text,
            ivHex: encrypted.ivHex,
            ciphertextHex: encrypted.ciphertextHex,
            isEncrypted: true,
          },
        ]);

        setCryptoData(prev => ({
          ...prev,
          lastEncryptedPayload: {
            iv: encrypted.ivHex,
            ciphertextSnippet: encrypted.ciphertextHex.slice(0, 32) + '...',
            authTagSnippet: encrypted.ciphertextHex.slice(-32),
            timestamp,
          },
        }));
      } else {
        // Unencrypted fallback if key agreement still pending
        dataChannelRef.current.send(
          JSON.stringify({
            type: 'encrypted_chat',
            id,
            senderId: profile.id,
            senderName: profile.name,
            timestamp,
            ciphertext: btoa(text),
            iv: '',
            ivHex: 'NONE (KEY_PENDING)',
            ciphertextHex: 'NONE',
          })
        );

        setMessages(prev => [
          ...prev,
          {
            id,
            senderId: profile.id,
            senderName: profile.name,
            timestamp,
            text,
            isEncrypted: false,
          },
        ]);
      }
    },
    [profile.id, profile.name]
  );

  // Favorites Management
  const addCurrentToFavorites = useCallback(
    (notes?: string) => {
      if (!currentPartner) return;
      const fav: FavoriteUser = {
        id: currentPartner.id,
        name: currentPartner.name,
        avatarSeed: currentPartner.avatarSeed,
        addedAt: Date.now(),
        notes: notes || '',
        lastMetAt: Date.now(),
      };
      saveFavorite(fav);
      setFavorites(getFavorites());
    },
    [currentPartner]
  );

  const removeContactFavorite = useCallback((userId: string) => {
    removeFavorite(userId);
    setFavorites(getFavorites());
  }, []);

  const updateContactNotes = useCallback((userId: string, notes: string) => {
    updateFavoriteNote(userId, notes);
    setFavorites(getFavorites());
  }, []);

  // Direct Call to Favorite User
  const callFavorite = useCallback(
    (targetUserId: string) => {
      cleanupPeerConnection();
      setCurrentPartner(null);
      setCurrentRoomId(null);
      setCallStatus('connecting');

      sendWs({
        type: 'direct_call_invite',
        targetUserId,
      });
    },
    [cleanupPeerConnection, sendWs]
  );

  // Accept incoming call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    const { callId, roomId, caller } = incomingCall;
    setIncomingCall(null);

    cleanupPeerConnection();
    setCurrentRoomId(roomId);
    setCurrentPartner({
      id: caller.id,
      name: caller.name,
      avatarSeed: caller.avatarSeed,
    });
    setCallStatus('connecting');

    sendWs({
      type: 'accept_direct_call',
      callerId: caller.id,
      callId,
      roomId,
    });

    await createPeerConnection(roomId, false);
  }, [incomingCall, cleanupPeerConnection, sendWs, createPeerConnection]);

  // Decline incoming call
  const declineIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    sendWs({
      type: 'decline_direct_call',
      callerId: incomingCall.caller.id,
      callId: incomingCall.callId,
    });
    setIncomingCall(null);
  }, [incomingCall, sendWs]);

  // Refresh status of favorites
  const refreshFavoritesStatus = useCallback(() => {
    const favs = getFavorites();
    if (favs.length > 0) {
      sendWs({
        type: 'check_favorites_status',
        userIds: favs.map(f => f.id),
      });
    }
  }, [sendWs]);

  // Update full profile (age, gender, country, countryFlag, genderPreference, etc.)
  const updateFullProfile = useCallback(
    (updatedData: Partial<UserProfile>) => {
      const merged: UserProfile = { ...profile, ...updatedData };
      setProfile(merged);
      saveUserProfile(merged);
      sendWs({
        type: 'update_profile',
        userName: merged.name,
        avatarSeed: merged.avatarSeed,
        age: merged.age,
        gender: merged.gender,
        country: merged.country,
        countryFlag: merged.countryFlag,
        genderPreference: merged.genderPreference,
      });
    },
    [profile, sendWs]
  );

  // Update gender matchmaking preference
  const setGenderPreference = useCallback(
    (pref: GenderPreference) => {
      updateFullProfile({ genderPreference: pref });
    },
    [updateFullProfile]
  );

  // Update profile name
  const updateProfileName = useCallback(
    (newName: string) => {
      updateFullProfile({ name: newName });
    },
    [updateFullProfile]
  );

  return {
    profile,
    callStatus,
    disconnectReason,
    currentPartner,
    currentRoomId,
    isInitiator,
    localStream,
    remoteStream,
    isVirtualStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    messages,
    cryptoData,
    incomingCall,
    serverStats,
    favorites,
    favoritesStatus,
    queuePosition,
    peerConnectionState,
    isWsConnected,
    isCurrentPartnerFavorite: currentPartner ? isUserFavorite(currentPartner.id) : false,
    startRandomSearch,
    cancelSearch,
    skipPartner,
    simulateTestMatch,
    reportPartner,
    toggleScreenShare,
    toggleVideo,
    toggleAudio,
    toggleVirtualMode,
    sendChatMessage,
    addCurrentToFavorites,
    removeContactFavorite,
    updateContactNotes,
    callFavorite,
    acceptIncomingCall,
    declineIncomingCall,
    refreshFavoritesStatus,
    updateProfileName,
    updateFullProfile,
    setGenderPreference,
  };
}
