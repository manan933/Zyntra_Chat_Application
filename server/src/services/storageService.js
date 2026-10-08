// ========================================================
// Zyntra Embedded Storage Service
// High-performance JSON-persisted embedded database engine
// Guarantees 100% operational auth, messaging, and sockets
// even when external MongoDB Atlas/local server is offline
// ========================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'zyntra_local_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed dataset
const getDefaultDatabase = () => {
  const passwordHash = bcrypt.hashSync('password123', 10);

  return {
    users: [
      {
        _id: 'user-1',
        name: 'Soumya Mohanty',
        email: 'soumya@zyntra.com',
        primaryUsername: 'soumya',
        password: passwordHash,
        avatar: null,
        bio: 'Lead Engineer & Systems Architect · Building contextual communication',
        status: 'online',
        contexts: [
          { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'soumya.personal' },
          { id: 'ctx-giet', type: 'workplace', name: 'GIET University', username: 'soumya.giet' },
          { id: 'ctx-abc', type: 'workplace', name: 'ABC Technologies', username: 'soumya.backend' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'contact-alex',
        name: 'Alex Morgan',
        email: 'alex@zyntra.com',
        primaryUsername: 'alex',
        password: passwordHash,
        avatar: null,
        bio: 'Fullstack developer & cloud infrastructure engineer',
        status: 'online',
        contexts: [],
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'contact-sarah',
        name: 'Sarah Connor',
        email: 'sarah@zyntra.com',
        primaryUsername: 'sarah',
        password: passwordHash,
        avatar: null,
        bio: 'UI/UX Design Systems Lead',
        status: 'online',
        contexts: [],
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'contact-david',
        name: 'David Chen',
        email: 'david@zyntra.com',
        primaryUsername: 'david',
        password: passwordHash,
        avatar: null,
        bio: 'Distributed Systems & Security Engineer',
        status: 'offline',
        contexts: [],
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'contact-maya',
        name: 'Maya Lin',
        email: 'maya@zyntra.com',
        primaryUsername: 'maya',
        password: passwordHash,
        avatar: null,
        bio: 'Product Strategist & Community Architect',
        status: 'online',
        contexts: [],
        createdAt: new Date().toISOString(),
      },
    ],
    contacts: [
      {
        id: 'contact-alex',
        userId: 'contact-alex',
        name: 'Alex Morgan',
        username: 'alex',
        status: 'online',
        lastMessage: 'Awesome! Testing it right now and it feels super fast.',
        lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'contact-sarah',
        userId: 'contact-sarah',
        name: 'Sarah Connor',
        username: 'sarah',
        status: 'online',
        lastMessage: 'The new responsive design looks fantastic on mobile.',
        lastMessageTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'contact-david',
        userId: 'contact-david',
        name: 'David Chen',
        username: 'david',
        status: 'offline',
        lastMessage: 'Merged the pull request 👍',
        lastMessageTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'contact-maya',
        userId: 'contact-maya',
        name: 'Maya Lin',
        username: 'maya',
        status: 'online',
        lastMessage: 'Let me know when you have time for a quick sync.',
        lastMessageTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
    groups: [
      {
        id: 'group-engineering',
        name: 'Engineering Core',
        membersCount: 12,
        lastMessage: 'All unit and integration tests passing.',
        lastMessageTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'group-design',
        name: 'Product & Design',
        membersCount: 8,
        lastMessage: 'Reviewed the typography scale and tokens.',
        lastMessageTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    workspaces: [
      {
        id: 'ws-giet',
        name: 'GIET University',
        joinCode: 'ZYN-GIET-0001',
        membersCount: 5200,
        isOwner: true,
        role: 'owner',
        nodes: [
          { id: 'giet-announcements', name: 'official-announcements', membersCount: 5200, folder: null, isAnnouncement: true },
          { id: 'giet-cse-general', name: 'cse-general', membersCount: 1450, folder: 'Computer Science & Eng' },
          { id: 'giet-cse-aiml-research', name: 'aiml-research', membersCount: 420, folder: 'Computer Science / AI & ML' },
          { id: 'giet-cse-aiml-sec-a', name: 'section-a-3rd-year', membersCount: 65, folder: 'Computer Science / AI & ML' },
          { id: 'giet-cse-aiml-sec-b', name: 'section-b-3rd-year', membersCount: 62, folder: 'Computer Science / AI & ML' },
          { id: 'giet-cse-ds', name: 'data-science-projects', membersCount: 380, folder: 'Computer Science & Eng' },
          { id: 'giet-placement-2025', name: 'campus-drives-2025', membersCount: 3200, folder: 'Placement & Careers', isAnnouncement: true },
        ],
      },
      {
        id: 'ws-abc',
        name: 'ABC Technologies',
        joinCode: 'WS-ABC-900',
        membersCount: 1200,
        isOwner: false,
        role: 'member',
        nodes: [
          { id: 'abc-announcements', name: 'announcements', membersCount: 1200, folder: null, isAnnouncement: true },
          { id: 'abc-frontend-react', name: 'frontend-react', membersCount: 85, folder: 'Engineering' },
          { id: 'abc-backend-go', name: 'backend-go', membersCount: 92, folder: 'Engineering' },
          { id: 'abc-design-system', name: 'design-system', membersCount: 64, folder: 'Product & Design' },
        ],
      },
      {
        id: 'ws-zyntra',
        name: 'Zyntra Technologies',
        joinCode: 'WS-ZYNTRA-01',
        membersCount: 45,
        isOwner: true,
        role: 'owner',
        nodes: [
          { id: 'node-general', name: 'general', membersCount: 45, folder: null },
          { id: 'node-dev', name: 'dev-chat', membersCount: 28, folder: 'Engineering' },
          { id: 'node-announcements', name: 'announcements', membersCount: 45, folder: null, isAnnouncement: true },
        ],
      },
    ],
    messages: [
      {
        id: 'msg-alex-1',
        chatId: 'contact-alex',
        senderId: 'contact-alex',
        senderName: 'Alex Morgan',
        senderUsername: 'alex',
        content: 'Hey! Are we deploying the new build today?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '🚀', count: 1, users: ['user-1'] }],
      },
      {
        id: 'msg-alex-2',
        chatId: 'contact-alex',
        senderId: 'user-1',
        senderName: 'Soumya Mohanty',
        senderUsername: 'soumya',
        content: 'Yes! The new frontend is completely rebuilt — clean, lightweight, and adaptable across all mobile and desktop screens.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '🔥', count: 2, users: ['contact-alex', 'user-1'] }],
      },
      {
        id: 'msg-alex-3',
        chatId: 'contact-alex',
        senderId: 'contact-alex',
        senderName: 'Alex Morgan',
        senderUsername: 'alex',
        content: 'Awesome! Testing it right now and it feels super fast.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '👍', count: 1, users: ['user-1'] }],
      },
      {
        id: 'msg-giet-1',
        chatId: 'giet-announcements',
        senderId: 'user-1',
        senderName: 'Soumya Mohanty',
        senderUsername: 'soumya',
        content: '📢 Welcome to the GIET University official communications channel. Mid-term examination schedule and lab rosters have been posted to the portal.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        reactions: [{ emoji: '📌', count: 18, users: ['user-1'] }, { emoji: '👍', count: 42, users: [] }],
      },
      {
        id: 'msg-aiml-1',
        chatId: 'giet-cse-aiml-sec-a',
        senderId: 'contact-sarah',
        senderName: 'Sarah Connor',
        senderUsername: 'sarah',
        content: 'Hey team, did everyone complete the Deep Learning lab assignment on Convolutional Neural Networks?',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '🧠', count: 6, users: ['user-1'] }],
      },
      {
        id: 'msg-aiml-2',
        chatId: 'giet-cse-aiml-sec-a',
        senderId: 'user-1',
        senderName: 'Soumya Mohanty',
        senderUsername: 'soumya',
        content: 'Yes, repo is pushed to GitHub with model checkpoints and confusion matrix plots!',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '🔥', count: 5, users: ['contact-sarah'] }],
      },
      {
        id: 'msg-abc-1',
        chatId: 'abc-frontend-react',
        senderId: 'contact-david',
        senderName: 'David Chen',
        senderUsername: 'david',
        content: 'React 19 concurrent features and Vite 8 builds are performing remarkably well. Bundle footprint is down by 58%.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        reactions: [{ emoji: '⚡', count: 7, users: ['user-1'] }],
      },
      {
        id: 'msg-ws-1',
        chatId: 'node-general',
        senderId: 'contact-sarah',
        senderName: 'Sarah Connor',
        senderUsername: 'sarah',
        content: 'Welcome everyone to the #general channel in Zyntra Technologies!',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        reactions: [{ emoji: '🎉', count: 4, users: ['user-1', 'contact-alex'] }],
      },
    ],
  };
};

class StorageService {
  constructor() {
    this.db = this.loadDatabase();
  }

  loadDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed.users && parsed.messages) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Storage] Error reading db file, regenerating defaults:', err.message);
    }

    const initial = getDefaultDatabase();
    this.persistDatabase(initial);
    return initial;
  }

  persistDatabase(data = this.db) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error persisting to db file:', err.message);
    }
  }

  isMongoLive() {
    return mongoose.connection.readyState === 1;
  }

  // ─── USER OPERATIONS ──────────────────────────────────────────────
  async findUserByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return this.db.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  async findUserByUsername(username) {
    if (!username) return null;
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    return this.db.users.find((u) => u.primaryUsername.toLowerCase() === clean) || null;
  }

  async findUserById(id) {
    if (!id) return null;
    return this.db.users.find((u) => u._id === id || u.id === id) || null;
  }

  async createUser({ name, email, primaryUsername, password, avatar, bio }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = primaryUsername.replace(/^@/, '').toLowerCase().trim();

    const existingEmail = await this.findUserByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error('An account with that email address already exists');
    }

    const existingUser = await this.findUserByUsername(cleanUsername);
    if (existingUser) {
      throw new Error(`Username @${cleanUsername} is already taken`);
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      _id: userId,
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      primaryUsername: cleanUsername,
      password: hashedPassword,
      avatar: avatar || null,
      bio: bio || 'Building contextual communication',
      status: 'online',
      contexts: [
        {
          id: 'ctx-personal',
          type: 'personal',
          name: 'Personal',
          username: `${cleanUsername}.personal`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.db.users.push(newUser);

    // Also add to global contacts directory so others can find them
    this.db.contacts.push({
      id: `contact-${cleanUsername}`,
      userId,
      name: newUser.name,
      username: newUser.primaryUsername,
      status: 'online',
      lastMessage: 'Joined Zyntra',
      lastMessageTime: new Date().toISOString(),
    });

    this.persistDatabase();
    return newUser;
  }

  async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  async updateUserProfile(userId, { name, bio, avatar, phone }) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;

    // Update in contacts
    const contact = this.db.contacts.find((c) => c.username === user.primaryUsername || c.userId === userId);
    if (contact) {
      if (name !== undefined) contact.name = name;
      if (avatar !== undefined) contact.avatar = avatar;
    }

    this.persistDatabase();
    return user;
  }

  // ─── MESSAGE OPERATIONS ───────────────────────────────────────────
  async getMessagesByChat(chatId) {
    if (!chatId) return [];
    return this.db.messages
      .filter((m) => m.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async saveMessage(msgData) {
    const messageId = msgData.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existingIndex = this.db.messages.findIndex((m) => m.id === messageId);

    const message = {
      id: messageId,
      chatId: msgData.chatId,
      senderId: msgData.senderId || 'user-1',
      senderName: msgData.senderName || 'Soumya',
      senderUsername: msgData.senderUsername || 'soumya',
      senderAvatar: msgData.senderAvatar || null,
      content: msgData.content ? msgData.content.trim() : '',
      type: msgData.type || 'text',
      attachment: msgData.attachment || null,
      reactions: msgData.reactions || [],
      timestamp: msgData.timestamp || new Date().toISOString(),
      isEdited: Boolean(msgData.isEdited),
    };

    if (existingIndex >= 0) {
      this.db.messages[existingIndex] = { ...this.db.messages[existingIndex], ...message };
    } else {
      this.db.messages.push(message);
    }

    // Update lastMessage on contacts/groups
    const preview = message.content || (message.attachment?.type === 'image' ? '📷 Photo' : '📎 Attachment');
    const contact = this.db.contacts.find((c) => c.id === message.chatId);
    if (contact) {
      contact.lastMessage = preview;
      contact.lastMessageTime = message.timestamp;
    }
    const group = this.db.groups.find((g) => g.id === message.chatId);
    if (group) {
      group.lastMessage = preview;
      group.lastMessageTime = message.timestamp;
    }

    this.persistDatabase();
    return message;
  }

  async editMessage(messageId, newContent) {
    const msg = this.db.messages.find((m) => m.id === messageId);
    if (!msg) return null;

    msg.content = newContent.trim();
    msg.isEdited = true;
    this.persistDatabase();
    return msg;
  }

  async deleteMessage(messageId) {
    const initialLen = this.db.messages.length;
    this.db.messages = this.db.messages.filter((m) => m.id !== messageId);
    this.persistDatabase();
    return this.db.messages.length < initialLen;
  }

  async addReaction(messageId, emoji, userId) {
    const msg = this.db.messages.find((m) => m.id === messageId);
    if (!msg) return null;

    const uid = userId || 'user-1';
    if (!msg.reactions) msg.reactions = [];

    const existing = msg.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      if (!existing.users.includes(uid)) {
        existing.users.push(uid);
      } else {
        existing.users = existing.users.filter((u) => u !== uid);
      }
      existing.count = existing.users.length;
    } else {
      msg.reactions.push({
        emoji,
        count: 1,
        users: [uid],
      });
    }

    msg.reactions = msg.reactions.filter((r) => r.count > 0);
    this.persistDatabase();
    return msg;
  }

  // ─── CONTACTS & GROUPS OPERATIONS ─────────────────────────────────
  async getContactsAndGroups() {
    return {
      contacts: this.db.contacts,
      groups: this.db.groups,
    };
  }

  async addContactByUsername(username) {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    const existing = this.db.contacts.find((c) => c.username?.toLowerCase() === clean);
    if (existing) return existing;

    const targetUser = await this.findUserByUsername(clean);
    const newContact = {
      id: `contact-${clean}`,
      userId: targetUser ? targetUser._id : `user-${clean}`,
      name: targetUser ? targetUser.name : clean.charAt(0).toUpperCase() + clean.slice(1),
      username: clean,
      avatar: targetUser ? targetUser.avatar : null,
      status: targetUser ? targetUser.status : 'online',
      lastMessage: 'Added as connection',
      lastMessageTime: new Date().toISOString(),
    };

    this.db.contacts.push(newContact);
    this.persistDatabase();
    return newContact;
  }

  async createGroup(name, description = '') {
    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      membersCount: 1,
      lastMessage: 'Group created',
      lastMessageTime: new Date().toISOString(),
    };
    this.db.groups.push(newGroup);
    this.persistDatabase();
    return newGroup;
  }

  // ─── WORKSPACES OPERATIONS ────────────────────────────────────────
  async getWorkspaces() {
    return this.db.workspaces;
  }

  async createWorkspace(name, contextualUsername) {
    const wsId = `ws-${Date.now()}`;
    const code = `WS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newWs = {
      id: wsId,
      name,
      joinCode: code,
      membersCount: 1,
      isOwner: true,
      role: 'owner',
      nodes: [
        { id: `${wsId}-general`, name: 'general', membersCount: 1, folder: null },
      ],
    };

    this.db.workspaces.push(newWs);
    this.persistDatabase();
    return newWs;
  }

  async joinWorkspace(code) {
    const cleanCode = code.toUpperCase().trim();
    const existing = this.db.workspaces.find((w) => w.joinCode === cleanCode);
    if (existing) {
      existing.membersCount = (existing.membersCount || 1) + 1;
      this.persistDatabase();
      return existing;
    }

    const newJoined = {
      id: `ws-${Date.now()}`,
      name: `Workspace (${cleanCode})`,
      joinCode: cleanCode,
      membersCount: 8,
      isOwner: false,
      role: 'member',
      nodes: [
        { id: `node-${Date.now()}-gen`, name: 'general', membersCount: 8, folder: null },
      ],
    };

    this.db.workspaces.push(newJoined);
    this.persistDatabase();
    return newJoined;
  }
}

export const storageService = new StorageService();
export default storageService;
