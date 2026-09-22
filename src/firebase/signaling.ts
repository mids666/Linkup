import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  runTransaction,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, PartnerInfo } from '../types';

export interface FirebaseSignalingCallbacks {
  onMatched: (roomId: string, partner: PartnerInfo, isInitiator: boolean) => void;
  onSignal: (signal: any) => void;
  onPartnerLeft: (reason: string) => void;
  onOnlineCountUpdate: (count: number) => void;
}

class FirebaseSignalingManager {
  private queueUnsub: Unsubscribe | null = null;
  private roomUnsub: Unsubscribe | null = null;
  private signalsUnsub: Unsubscribe | null = null;
  private presenceInterval: ReturnType<typeof setInterval> | null = null;
  private presenceQueryUnsub: Unsubscribe | null = null;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private processedSignalIds = new Set<string>();

  // Heartbeat & Online Presence
  startPresence(profile: UserProfile, onOnlineCount?: (count: number) => void) {
    this.currentUserId = profile.id;
    const presenceRef = doc(db, 'presence', profile.id);

    const heartbeat = async () => {
      try {
        await setDoc(presenceRef, {
          userId: profile.id,
          userName: profile.name,
          avatarSeed: profile.avatarSeed,
          gender: profile.gender,
          country: profile.country,
          lastSeen: Date.now(),
        }, { merge: true });
      } catch (err) {
        console.warn('Presence heartbeat error:', err);
      }
    };

    heartbeat();
    if (this.presenceInterval) clearInterval(this.presenceInterval);
    this.presenceInterval = setInterval(heartbeat, 15000);

    // Listen to online presence count
    if (onOnlineCount && !this.presenceQueryUnsub) {
      try {
        const presenceCol = collection(db, 'presence');
        this.presenceQueryUnsub = onSnapshot(presenceCol, (snapshot) => {
          const now = Date.now();
          const activeDocs = snapshot.docs.filter((d) => {
            const data = d.data();
            return data.lastSeen && now - data.lastSeen < 45000;
          });
          onOnlineCount(Math.max(1, activeDocs.length));
        });
      } catch (err) {
        console.warn('Presence listener warning:', err);
      }
    }
  }

  stopPresence(userId: string) {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
    if (this.presenceQueryUnsub) {
      this.presenceQueryUnsub();
      this.presenceQueryUnsub = null;
    }
    deleteDoc(doc(db, 'presence', userId)).catch(() => {});
  }

  // Join Matchmaking Queue
  async enterQueue(
    profile: UserProfile,
    onMatched: (roomId: string, partner: PartnerInfo, isInitiator: boolean) => void
  ) {
    this.currentUserId = profile.id;
    this.leaveQueue();

    const queueCol = collection(db, 'matchmaking_queue');
    const selfQueueRef = doc(db, 'matchmaking_queue', profile.id);

    // 1. Try to find a match in the existing queue
    try {
      const now = Date.now();
      const candidateQuery = query(
        queueCol,
        where('status', '==', 'waiting'),
        orderBy('timestamp', 'asc'),
        limit(15)
      );

      const querySnapshot = await getDocs(candidateQuery);
      let matchedCandidate: any = null;

      for (const docSnap of querySnapshot.docs) {
        if (docSnap.id === profile.id) continue;
        const candidate = docSnap.data();

        // Expired entry (older than 60s)
        if (!candidate.timestamp || now - candidate.timestamp > 60000) {
          continue;
        }

        // Check gender preference filtering
        if (profile.genderPreference && profile.genderPreference !== 'any' && candidate.gender !== profile.genderPreference) {
          continue;
        }
        if (candidate.genderPreference && candidate.genderPreference !== 'any' && candidate.genderPreference !== profile.gender) {
          continue;
        }

        matchedCandidate = candidate;
        break;
      }

      if (matchedCandidate) {
        // Attempt atomic transaction to claim candidate
        const roomId = `room_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        const partnerInfo: PartnerInfo = {
          id: matchedCandidate.userId,
          name: matchedCandidate.userName,
          avatarSeed: matchedCandidate.avatarSeed,
          age: matchedCandidate.age,
          gender: matchedCandidate.gender,
          country: matchedCandidate.country,
          countryFlag: matchedCandidate.countryFlag,
        };

        const roomRef = doc(db, 'rooms', roomId);
        const candidateRef = doc(db, 'matchmaking_queue', matchedCandidate.userId);

        let success = false;
        try {
          await runTransaction(db, async (transaction) => {
            const candDoc = await transaction.get(candidateRef);
            if (!candDoc.exists() || candDoc.data()?.status !== 'waiting') {
              throw new Error('Candidate already claimed');
            }

            // Create Room
            transaction.set(roomRef, {
              roomId,
              initiatorId: profile.id,
              receiverId: matchedCandidate.userId,
              createdAt: Date.now(),
              status: 'active',
              closeReason: null,
            });

            // Update candidate
            transaction.update(candidateRef, {
              status: 'matched',
              matchedRoomId: roomId,
              isInitiator: false,
              partner: {
                id: profile.id,
                name: profile.name,
                avatarSeed: profile.avatarSeed,
                age: profile.age,
                gender: profile.gender,
                country: profile.country,
                countryFlag: profile.countryFlag,
              },
            });

            // Set self
            transaction.set(selfQueueRef, {
              userId: profile.id,
              status: 'matched',
              matchedRoomId: roomId,
              isInitiator: true,
              partner: partnerInfo,
              timestamp: Date.now(),
            });
          });
          success = true;
        } catch (txnErr) {
          console.log('Transaction conflict or candidate taken, falling back to waiting:', txnErr);
        }

        if (success) {
          this.currentRoomId = roomId;
          onMatched(roomId, partnerInfo, true);
          return;
        }
      }
    } catch (err) {
      console.warn('Queue search error:', err);
    }

    // 2. Put self in queue and listen for another user to claim us
    await setDoc(selfQueueRef, {
      userId: profile.id,
      userName: profile.name,
      avatarSeed: profile.avatarSeed,
      age: profile.age,
      gender: profile.gender,
      country: profile.country,
      countryFlag: profile.countryFlag,
      genderPreference: profile.genderPreference,
      status: 'waiting',
      matchedRoomId: null,
      isInitiator: false,
      partner: null,
      timestamp: Date.now(),
    });

    this.queueUnsub = onSnapshot(selfQueueRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data.status === 'matched' && data.matchedRoomId && data.partner) {
        this.currentRoomId = data.matchedRoomId;
        this.leaveQueue();
        onMatched(data.matchedRoomId, data.partner, !!data.isInitiator);
      }
    });
  }

  // Cancel queue
  leaveQueue() {
    if (this.queueUnsub) {
      this.queueUnsub();
      this.queueUnsub = null;
    }
    if (this.currentUserId) {
      deleteDoc(doc(db, 'matchmaking_queue', this.currentUserId)).catch(() => {});
    }
  }

  // Setup room listeners for WebRTC signals & status
  joinRoom(
    roomId: string,
    selfId: string,
    onSignal: (signal: any) => void,
    onPartnerLeft: (reason: string) => void
  ) {
    this.currentRoomId = roomId;
    this.currentUserId = selfId;
    this.processedSignalIds.clear();

    // Clean up prior room subscriptions
    if (this.roomUnsub) {
      this.roomUnsub();
      this.roomUnsub = null;
    }
    if (this.signalsUnsub) {
      this.signalsUnsub();
      this.signalsUnsub = null;
    }

    // 1. Listen to room closure / status
    const roomRef = doc(db, 'rooms', roomId);
    this.roomUnsub = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data.status === 'closed') {
        onPartnerLeft(data.closeReason || 'Partner left the chat.');
      }
    });

    // 2. Listen to incoming WebRTC signals
    const signalsCol = collection(db, 'rooms', roomId, 'signals');
    const signalsQuery = query(signalsCol, orderBy('timestamp', 'asc'));

    this.signalsUnsub = onSnapshot(signalsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docId = change.doc.id;
          if (this.processedSignalIds.has(docId)) return;
          this.processedSignalIds.add(docId);

          const data = change.doc.data();
          if (data.senderId !== selfId && data.signal) {
            onSignal(data.signal);
          }
        }
      });
    });
  }

  // Send WebRTC signal (offer, answer, ice-candidate)
  async sendSignal(roomId: string, senderId: string, signal: any) {
    try {
      const signalsCol = collection(db, 'rooms', roomId, 'signals');
      await addDoc(signalsCol, {
        senderId,
        signal,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Error sending signal over Firestore:', err);
    }
  }

  // Leave / Close Room
  async leaveRoom(roomId: string, reason: string = 'Partner disconnected') {
    if (this.roomUnsub) {
      this.roomUnsub();
      this.roomUnsub = null;
    }
    if (this.signalsUnsub) {
      this.signalsUnsub();
      this.signalsUnsub = null;
    }
    this.processedSignalIds.clear();
    this.currentRoomId = null;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'closed',
        closeReason: reason,
      });
    } catch (err) {
      // room might already be closed
    }
  }
}

export const firebaseSignaling = new FirebaseSignalingManager();
