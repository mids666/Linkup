import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  userName: string;
  avatarSeed: string;
  age?: number;
  gender?: string;
  country?: string;
  countryFlag?: string;
  genderPreference?: string;
  status: 'idle' | 'searching' | 'in_call';
  currentRoomId?: string;
  partnerId?: string;
  blockedUsers: Set<string>;
}

interface Room {
  id: string;
  peers: [string, string];
  createdAt: number;
}

interface ReportRecord {
  id: string;
  reporterId: string;
  targetUserId: string;
  targetUserName: string;
  reason: string;
  details?: string;
  timestamp: number;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data structures
const clients = new Map<string, ConnectedClient>();
const searchingQueue: string[] = [];
const activeRooms = new Map<string, Room>();
const reportsList: ReportRecord[] = [];

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/stats', (req, res) => {
  res.json({
    onlineCount: clients.size,
    activeChatCount: activeRooms.size,
    queueCount: searchingQueue.length,
  });
});

app.get('/api/reports', (req, res) => {
  res.json({
    count: reportsList.length,
    reports: reportsList.slice(-20), // return recent
  });
});

app.get('/api/debug-status', (req, res) => {
  res.json({
    onlineCount: clients.size,
    queueCount: searchingQueue.length,
    searchingQueue,
    clients: Array.from(clients.values()).map(c => ({
      userId: c.userId,
      userName: c.userName,
      gender: c.gender,
      genderPreference: c.genderPreference,
      status: c.status,
    })),
    roomsCount: activeRooms.size,
    rooms: Array.from(activeRooms.values()),
  });
});

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastStats() {
    const statsPayload = JSON.stringify({
      type: 'stats_update',
      onlineCount: clients.size,
      activeChatCount: activeRooms.size,
      queueCount: searchingQueue.length,
    });
    for (const client of clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(statsPayload);
      }
    }
  }

  function removeFromQueue(userId: string) {
    const idx = searchingQueue.indexOf(userId);
    if (idx !== -1) {
      searchingQueue.splice(idx, 1);
    }
  }

  function cleanupRoom(roomId: string, initiatorId?: string, reason = 'Call ended') {
    const room = activeRooms.get(roomId);
    if (!room) return;

    activeRooms.delete(roomId);

    for (const peerId of room.peers) {
      const peer = clients.get(peerId);
      if (peer) {
        peer.status = 'idle';
        peer.currentRoomId = undefined;
        peer.partnerId = undefined;

        if (peerId !== initiatorId && peer.ws.readyState === WebSocket.OPEN) {
          peer.ws.send(
            JSON.stringify({
              type: 'partner_disconnected',
              reason,
            })
          );
        }
      }
    }
  }

  function tryMatchUser(userId: string): boolean {
    const client = clients.get(userId);
    if (!client || client.status !== 'searching') return false;

    // Find candidate in queue
    for (let i = 0; i < searchingQueue.length; i++) {
      const candidateId = searchingQueue[i];
      if (candidateId === userId) continue;

      const candidate = clients.get(candidateId);
      if (!candidate || candidate.status !== 'searching') {
        searchingQueue.splice(i, 1);
        i--;
        continue;
      }

      // Check block lists
      if (client.blockedUsers.has(candidateId) || candidate.blockedUsers.has(userId)) {
        continue;
      }

      // Check gender preference filtering
      const clientPref = client.genderPreference || 'any';
      const candidatePref = candidate.genderPreference || 'any';
      const clientGender = client.gender || 'other';
      const candidateGender = candidate.gender || 'other';

      const clientSatisfied = clientPref === 'any' || clientPref === candidateGender;
      const candidateSatisfied = candidatePref === 'any' || candidatePref === clientGender;

      if (!clientSatisfied || !candidateSatisfied) {
        continue;
      }

      console.log(`[MATCH] Connecting ${client.userName} (${client.userId}) with ${candidate.userName} (${candidate.userId})`);

      // Match found!
      removeFromQueue(userId);
      removeFromQueue(candidateId);

      const roomId = `room_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
      activeRooms.set(roomId, {
        id: roomId,
        peers: [userId, candidateId],
        createdAt: Date.now(),
      });

      client.status = 'in_call';
      client.currentRoomId = roomId;
      client.partnerId = candidateId;

      candidate.status = 'in_call';
      candidate.currentRoomId = roomId;
      candidate.partnerId = userId;

      // Notify peer A (initiator)
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: 'match_found',
            roomId,
            partner: {
              id: candidate.userId,
              name: candidate.userName,
              avatarSeed: candidate.avatarSeed,
              age: candidate.age,
              gender: candidate.gender,
              country: candidate.country,
              countryFlag: candidate.countryFlag,
            },
            isInitiator: true,
          })
        );
      }

      // Notify peer B (receiver)
      if (candidate.ws.readyState === WebSocket.OPEN) {
        candidate.ws.send(
          JSON.stringify({
            type: 'match_found',
            roomId,
            partner: {
              id: client.userId,
              name: client.userName,
              avatarSeed: client.avatarSeed,
              age: client.age,
              gender: client.gender,
              country: client.country,
              countryFlag: client.countryFlag,
            },
            isInitiator: false,
          })
        );
      }

      broadcastStats();
      return true;
    }

    return false;
  }

  // Periodic matchmaking runner to avoid any timing or race conditions
  const queueInterval = setInterval(() => {
    if (searchingQueue.length >= 2) {
      for (const uid of [...searchingQueue]) {
        tryMatchUser(uid);
      }
    }
  }, 1500);

  wss.on('connection', (ws: WebSocket) => {
    let currentUserId: string | null = null;

    ws.on('message', (rawMessage: string) => {
      try {
        const msg = JSON.parse(rawMessage.toString());

        switch (msg.type) {
          case 'register': {
            const { userId, userName, avatarSeed, age, gender, country, countryFlag, genderPreference } = msg;
            currentUserId = userId;

            const existing = clients.get(userId);
            const blockedUsers = existing ? existing.blockedUsers : new Set<string>();

            clients.set(userId, {
              ws,
              userId,
              userName: userName || 'Anonymous',
              avatarSeed: avatarSeed || 'pilot',
              age: typeof age === 'number' ? age : undefined,
              gender: gender || 'other',
              country: country || 'United States',
              countryFlag: countryFlag || '🇺🇸',
              genderPreference: genderPreference || 'any',
              status: 'idle',
              blockedUsers,
            });

            ws.send(
              JSON.stringify({
                type: 'registered',
                userId,
                onlineCount: clients.size,
                activeChatCount: activeRooms.size,
              })
            );
            broadcastStats();
            break;
          }

          case 'update_profile': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (client) {
              if (msg.userName) client.userName = msg.userName;
              if (msg.avatarSeed) client.avatarSeed = msg.avatarSeed;
              if (typeof msg.age === 'number') client.age = msg.age;
              if (msg.gender) client.gender = msg.gender;
              if (msg.country) client.country = msg.country;
              if (msg.countryFlag) client.countryFlag = msg.countryFlag;
              if (msg.genderPreference) client.genderPreference = msg.genderPreference;
            }
            break;
          }

          case 'find_match': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (!client) return;

            if (msg.genderPreference) {
              client.genderPreference = msg.genderPreference;
            }

            // If already in a room, leave it first
            if (client.currentRoomId) {
              cleanupRoom(client.currentRoomId, currentUserId, 'Partner skipped');
            }

            client.status = 'searching';
            if (!searchingQueue.includes(currentUserId)) {
              searchingQueue.push(currentUserId);
            }

            ws.send(JSON.stringify({ type: 'searching', queuePosition: searchingQueue.length }));
            broadcastStats();

            // Attempt matching immediately
            tryMatchUser(currentUserId);
            break;
          }

          case 'cancel_search': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (client) {
              client.status = 'idle';
              removeFromQueue(currentUserId);
              ws.send(JSON.stringify({ type: 'search_cancelled' }));
              broadcastStats();
            }
            break;
          }

          case 'camera_disabled': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (!client) return;

            const roomId = client.currentRoomId;
            const partnerId = client.partnerId;

            if (roomId && partnerId) {
              const partner = clients.get(partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(
                  JSON.stringify({
                    type: 'partner_disconnected',
                    reason: 'Partner disabled their camera. Call stopped automatically because camera must remain active.',
                    reasonCode: 'camera_disabled',
                  })
                );
                partner.status = 'idle';
                partner.currentRoomId = undefined;
                partner.partnerId = undefined;
              }
              activeRooms.delete(roomId);
            }

            client.currentRoomId = undefined;
            client.partnerId = undefined;
            client.status = 'idle';

            ws.send(
              JSON.stringify({
                type: 'call_stopped_camera_disabled',
                reason: 'Call stopped automatically: You turned off your camera. Video chat requires your camera to remain enabled.',
                reasonCode: 'camera_disabled',
              })
            );
            broadcastStats();
            break;
          }

          case 'skip': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (!client) return;

            if (msg.genderPreference) {
              client.genderPreference = msg.genderPreference;
            }

            const roomId = client.currentRoomId;
            const partnerId = client.partnerId;

            if (roomId && partnerId) {
              const partner = clients.get(partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(
                  JSON.stringify({
                    type: 'partner_skipped',
                    reason: 'Partner skipped to next user.',
                  })
                );
                partner.status = 'idle';
                partner.currentRoomId = undefined;
                partner.partnerId = undefined;
              }
              activeRooms.delete(roomId);
            }

            client.currentRoomId = undefined;
            client.partnerId = undefined;

            if (msg.autoFindNext) {
              client.status = 'searching';
              if (!searchingQueue.includes(currentUserId)) {
                searchingQueue.push(currentUserId);
              }
              ws.send(JSON.stringify({ type: 'searching', queuePosition: searchingQueue.length }));
              broadcastStats();
              tryMatchUser(currentUserId);
            } else {
              client.status = 'idle';
              ws.send(JSON.stringify({ type: 'skipped' }));
              broadcastStats();
            }
            break;
          }

          case 'signal': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (!client || !client.partnerId) return;

            const partner = clients.get(client.partnerId);
            if (partner && partner.ws.readyState === WebSocket.OPEN) {
              partner.ws.send(
                JSON.stringify({
                  type: 'signal',
                  fromUserId: currentUserId,
                  signal: msg.signal,
                })
              );
            }
            break;
          }

          case 'report': {
            if (!currentUserId) return;
            const client = clients.get(currentUserId);
            if (!client) return;

            const { targetUserId, targetUserName, reason, details } = msg;

            // Block user
            client.blockedUsers.add(targetUserId);

            // Log report
            const report: ReportRecord = {
              id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              reporterId: currentUserId,
              targetUserId,
              targetUserName: targetUserName || 'Anonymous',
              reason: reason || 'other',
              details: details || '',
              timestamp: Date.now(),
            };
            reportsList.push(report);

            // If currently in a room with the reported user, end it immediately
            if (client.partnerId === targetUserId && client.currentRoomId) {
              const target = clients.get(targetUserId);
              if (target && target.ws.readyState === WebSocket.OPEN) {
                target.ws.send(
                  JSON.stringify({
                    type: 'partner_disconnected',
                    reason: 'Session ended due to a report.',
                  })
                );
                target.status = 'idle';
                target.currentRoomId = undefined;
                target.partnerId = undefined;
              }
              activeRooms.delete(client.currentRoomId);
              client.currentRoomId = undefined;
              client.partnerId = undefined;
              client.status = 'idle';
            }

            ws.send(
              JSON.stringify({
                type: 'report_confirmed',
                targetUserId,
                message: 'User reported and blocked successfully.',
              })
            );

            // Auto-queue next partner if requested
            if (msg.autoFindNext) {
              client.status = 'searching';
              if (!searchingQueue.includes(currentUserId)) {
                searchingQueue.push(currentUserId);
              }
              ws.send(JSON.stringify({ type: 'searching', queuePosition: searchingQueue.length }));
              broadcastStats();
              tryMatchUser(currentUserId);
            } else {
              broadcastStats();
            }
            break;
          }

          case 'direct_call_invite': {
            if (!currentUserId) return;
            const caller = clients.get(currentUserId);
            if (!caller) return;

            const { targetUserId } = msg;
            const target = clients.get(targetUserId);

            if (!target || target.ws.readyState !== WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'call_failed',
                  targetUserId,
                  reason: 'User is currently offline.',
                })
              );
              return;
            }

            if (target.status === 'in_call') {
              ws.send(
                JSON.stringify({
                  type: 'call_failed',
                  targetUserId,
                  reason: 'User is currently busy in another call.',
                })
              );
              return;
            }

            const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const roomId = `room_direct_${callId}`;

            // Send ringing invite to target
            target.ws.send(
              JSON.stringify({
                type: 'incoming_call',
                callId,
                roomId,
                caller: {
                  id: caller.userId,
                  name: caller.userName,
                  avatarSeed: caller.avatarSeed,
                },
              })
            );

            // Inform caller that it's ringing
            ws.send(
              JSON.stringify({
                type: 'call_ringing',
                callId,
                roomId,
                targetUserId,
              })
            );
            break;
          }

          case 'accept_direct_call': {
            if (!currentUserId) return;
            const target = clients.get(currentUserId);
            if (!target) return;

            const { callerId, roomId } = msg;
            const caller = clients.get(callerId);

            if (!caller || caller.ws.readyState !== WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'call_failed',
                  targetUserId: callerId,
                  reason: 'Caller disconnected.',
                })
              );
              return;
            }

            // Remove both from queue if they were searching
            removeFromQueue(currentUserId);
            removeFromQueue(callerId);

            activeRooms.set(roomId, {
              id: roomId,
              peers: [callerId, currentUserId],
              createdAt: Date.now(),
            });

            caller.status = 'in_call';
            caller.currentRoomId = roomId;
            caller.partnerId = currentUserId;

            target.status = 'in_call';
            target.currentRoomId = roomId;
            target.partnerId = callerId;

            // Notify caller (initiator)
            caller.ws.send(
              JSON.stringify({
                type: 'match_found',
                roomId,
                partner: {
                  id: target.userId,
                  name: target.userName,
                  avatarSeed: target.avatarSeed,
                },
                isInitiator: true,
                isDirectCall: true,
              })
            );

            // Notify receiver
            target.ws.send(
              JSON.stringify({
                type: 'match_found',
                roomId,
                partner: {
                  id: caller.userId,
                  name: caller.userName,
                  avatarSeed: caller.avatarSeed,
                },
                isInitiator: false,
                isDirectCall: true,
              })
            );

            broadcastStats();
            break;
          }

          case 'decline_direct_call': {
            if (!currentUserId) return;
            const { callerId } = msg;
            const caller = clients.get(callerId);
            if (caller && caller.ws.readyState === WebSocket.OPEN) {
              caller.ws.send(
                JSON.stringify({
                  type: 'call_declined',
                  targetUserId: currentUserId,
                  reason: 'User declined the invitation.',
                })
              );
            }
            break;
          }

          case 'check_favorites_status': {
            const { userIds } = msg;
            if (Array.isArray(userIds)) {
              const statusMap: Record<string, { online: boolean; status: string }> = {};
              for (const id of userIds) {
                const user = clients.get(id);
                if (user && user.ws.readyState === WebSocket.OPEN) {
                  statusMap[id] = {
                    online: true,
                    status: user.status,
                  };
                } else {
                  statusMap[id] = {
                    online: false,
                    status: 'offline',
                  };
                }
              }
              ws.send(
                JSON.stringify({
                  type: 'favorites_status_result',
                  statuses: statusMap,
                })
              );
            }
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        const client = clients.get(currentUserId);
        if (client) {
          removeFromQueue(currentUserId);

          if (client.currentRoomId) {
            cleanupRoom(client.currentRoomId, currentUserId, 'Partner disconnected.');
          }

          clients.delete(currentUserId);
          broadcastStats();
        }
      }
    });
  });

  // Setup Vite middleware for development or static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
