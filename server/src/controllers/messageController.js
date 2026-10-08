import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { Contact } from '../models/Contact.js';
import User from '../models/User.js';
import storageService from '../services/storageService.js';

// @desc    Get all messages for a specific chat (channel, contact, or personal group)
// @route   GET /api/messages/:chatId
// @access  Public / Private
export const getMessagesByChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();
        return res.status(200).json({
          success: true,
          count: messages.length,
          data: messages,
        });
      } catch (err) {
        console.warn('[Messages] Mongoose query fallback to storage service:', err.message);
      }
    }

    // Embedded storage fallback
    const list = await storageService.getMessagesByChat(chatId);
    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:chatId
// @access  Public / Private
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const {
      id,
      content,
      senderId,
      senderName,
      senderUsername,
      senderAvatar,
      chatType,
      attachment,
      timestamp,
    } = req.body;

    if (!chatId || (!content?.trim() && !attachment)) {
      return res.status(400).json({
        success: false,
        message: 'chatId and either content or attachment are required',
      });
    }

    const newId = id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const finalContent = content ? content.trim() : '';

    if (mongoose.connection.readyState === 1) {
      try {
        let message = await Message.findOne({ id: newId });
        if (!message) {
          message = await Message.create({
            id: newId,
            chatId,
            chatType: chatType || 'workspace-node',
            senderId: senderId || req.user?._id?.toString() || 'user-1',
            senderName: senderName || req.user?.name || 'Soumya',
            senderUsername: senderUsername || req.user?.primaryUsername || '',
            senderAvatar: senderAvatar || req.user?.avatar || null,
            content: finalContent,
            type: attachment?.type || 'text',
            attachment: attachment || null,
            reactions: [],
            timestamp: timestamp ? new Date(timestamp) : new Date(),
          });
        }
        return res.status(201).json({
          success: true,
          data: message,
        });
      } catch (err) {
        console.warn('[Messages] Mongoose send fallback to storage service:', err.message);
      }
    }

    const saved = await storageService.saveMessage({
      id: newId,
      chatId,
      chatType,
      senderId: senderId || req.user?._id || 'user-1',
      senderName: senderName || req.user?.name || 'Soumya',
      senderUsername: senderUsername || req.user?.primaryUsername || 'soumya',
      senderAvatar: senderAvatar || req.user?.avatar || null,
      content: finalContent,
      type: attachment?.type || 'text',
      attachment: attachment || null,
      timestamp: timestamp || new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit an existing message
// @route   PUT /api/messages/:id
// @access  Public / Private
export const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty',
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const message = await Message.findOne({ id });
        if (message) {
          message.content = content.trim();
          message.isEdited = true;
          await message.save();
          return res.status(200).json({ success: true, data: message });
        }
      } catch {}
    }

    const updated = await storageService.editMessage(id, content);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Public / Private
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        const message = await Message.findOneAndDelete({ id });
        if (message) {
          return res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            data: { id },
          });
        }
      } catch {}
    }

    await storageService.deleteMessage(id);
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or increment reaction on a message
// @route   POST /api/messages/:id/reactions
// @access  Public / Private
export const addReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji, userId } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const uid = userId || req.user?._id?.toString() || 'user-1';

    if (mongoose.connection.readyState === 1) {
      try {
        const message = await Message.findOne({ id });
        if (message) {
          const existing = message.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            if (!existing.users.includes(uid)) existing.users.push(uid);
            existing.count = existing.users.length;
          } else {
            message.reactions.push({ emoji, count: 1, users: [uid] });
          }
          await message.save();
          return res.status(200).json({ success: true, data: message });
        }
      } catch {}
    }

    const updated = await storageService.addReaction(id, emoji, uid);
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
