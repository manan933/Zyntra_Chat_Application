import jwt from 'jsonwebtoken';
import storageService from '../services/storageService.js';

export const setupChatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zyntra_jwt_secret_dev_key_2026');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}, User ID: ${socket.user?.id || 'unknown'}`);

    // Join a specific chat room (channel, DM, or personal group)
    socket.on('join_room', (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`[Socket.io] User (${socket.id}) joined room: ${roomId}`);
    });

    // Leave a room
    socket.on('leave_room', (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`[Socket.io] User (${socket.id}) left room: ${roomId}`);
    });

    // Handle incoming message
    socket.on('send_message', async (data) => {
      try {
        const {
          id,
          chatId,
          content,
          senderId,
          senderName,
          senderUsername,
          senderAvatar,
          chatType,
          attachment,
          timestamp,
        } = data;

        if (!chatId || (!content?.trim() && !attachment)) return;

        const messageId = id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const finalContent = content ? content.trim() : '';

        // 1. Instant persistence in embedded storage engine (0 latency)
        const savedMessage = await storageService.saveMessage({
          id: messageId,
          chatId,
          chatType: chatType || 'workspace-node',
          senderId: socket.user?.id || senderId || 'user-1',
          senderName: senderName || 'User',
          senderUsername: senderUsername || '',
          senderAvatar: senderAvatar || null,
          content: finalContent,
          type: attachment?.type || 'text',
          attachment: attachment || null,
          reactions: [],
          timestamp: timestamp || new Date().toISOString(),
        });

        // 2. Broadcast immediately to peers in the room
        socket.to(chatId).emit('receive_message', savedMessage);
      } catch (err) {
        console.error('[Socket.io] Error sending message:', err.message);
      }
    });

    // Handle typing status
    socket.on('typing_start', ({ roomId, userName, userId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', { userId, userName, isTyping: true });
    });

    socket.on('typing_stop', ({ roomId, userId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', { userId, isTyping: false });
    });

    // Handle real-time reactions
    socket.on('send_reaction', async ({ messageId, emoji, userId, chatId }) => {
      try {
        const uid = userId || 'user-1';
        const updated = await storageService.addReaction(messageId, emoji, uid);

        if (chatId && updated) {
          io.to(chatId).emit('update_reaction', updated);
        }
      } catch (err) {
        console.error('[Socket.io] Error in reaction handler:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

export default setupChatSocket;
