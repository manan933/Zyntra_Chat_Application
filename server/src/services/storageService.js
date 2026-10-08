import { db } from '../config/turso.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class StorageService {
  async findUserByEmail(email) {
    const clean = (email || '').toLowerCase().trim();
    console.log(`[DB] findUserByEmail: ${clean}`);
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)', args: [clean] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async findUserByUsername(username) {
    const clean = (username || '').toLowerCase().trim().replace(/^@/, '');
    console.log(`[DB] findUserByUsername: ${clean}`);
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE LOWER(primaryUsername) = LOWER(?)', args: [clean] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async findUserById(id) {
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE _id = ?', args: [id] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async createUser({ name, email, primaryUsername, password, avatar, bio }) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanUsername = (primaryUsername || '').toLowerCase().trim().replace(/^@/, '');
    console.log(`[DB] createUser: ${cleanEmail} / @${cleanUsername}`);
    const id = `user-${crypto.randomUUID()}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await db.execute({
      sql: 'INSERT INTO users (_id, name, email, primaryUsername, password, avatar, bio, contexts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, name.trim(), cleanEmail, cleanUsername, hashedPassword, avatar || null, bio || '', '[]']
    });
    console.log(`[DB] createUser success: ${id}`);

    return this.findUserById(id);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch (e) {
      console.error('[DB] Password compare error:', e);
      return false;
    }
  }

  async updateUserProfile(userId, { name, bio, avatar, phone }) {
    let sql = 'UPDATE users SET ';
    const args = [];
    if (name !== undefined) { sql += 'name = ?, '; args.push(name); }
    if (bio !== undefined) { sql += 'bio = ?, '; args.push(bio); }
    if (avatar !== undefined) { sql += 'avatar = ?, '; args.push(avatar); }
    sql = sql.slice(0, -2) + ' WHERE _id = ?';
    args.push(userId);
    if (args.length > 1) {
      await db.execute({ sql, args });
    }
    return this.findUserById(userId);
  }

  async searchUsers(query, excludeUserId) {
    const q = `%${(query || '').toLowerCase().trim().replace(/^@/, '')}%`;
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE _id != ? AND (LOWER(name) LIKE ? OR LOWER(primaryUsername) LIKE ? OR LOWER(email) LIKE ?)',
      args: [excludeUserId || '', q, q, q]
    });
    return res.rows.map(r => this.mapUserRow(r));
  }

  async getMessagesByChat(chatId) {
    const res = await db.execute({
      sql: 'SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC',
      args: [chatId]
    });
    return res.rows.map(r => ({
      ...r,
      attachment: r.attachment ? JSON.parse(r.attachment) : null,
      reactions: r.reactions ? JSON.parse(r.reactions) : [],
      isEdited: Boolean(r.isEdited)
    }));
  }

  getCanonicalDmId(username1, username2) {
    const u1 = (username1 || '').toLowerCase().trim().replace(/^@/, '');
    const u2 = (username2 || '').toLowerCase().trim().replace(/^@/, '');
    return 'dm_' + [u1, u2].sort().join('_');
  }

  async saveMessage(message) {
    console.log(`[DB] saveMessage in ${message.chatId}: ${message.content?.substring(0, 30)}`);
    await db.execute({
      sql: 'INSERT INTO messages (id, chatId, senderId, senderName, senderUsername, content, attachment, reactions, isEdited, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        message.id, message.chatId, message.senderId, message.senderName || '', 
        message.senderUsername || '', message.content || '', 
        message.attachment ? JSON.stringify(message.attachment) : null, 
        '[]', 0, message.timestamp || new Date().toISOString()
      ]
    });

    // If this is a DM, auto-link the contacts so both users see the conversation
    if (message.chatId && message.chatId.startsWith('dm_')) {
      const parts = message.chatId.replace('dm_', '').split('_');
      if (parts.length === 2) {
        try {
          const u1 = await this.findUserByUsername(parts[0]);
          const u2 = await this.findUserByUsername(parts[1]);
          if (u1 && u2) {
            await db.execute({
              sql: 'INSERT OR IGNORE INTO contacts (id, user_id, contact_id, type) VALUES (?, ?, ?, ?)',
              args: [`c_${u1._id}_${u2._id}`, u1._id, u2._id, 'contact']
            }).catch(() => {});
            await db.execute({
              sql: 'INSERT OR IGNORE INTO contacts (id, user_id, contact_id, type) VALUES (?, ?, ?, ?)',
              args: [`c_${u2._id}_${u1._id}`, u2._id, u1._id, 'contact']
            }).catch(() => {});
          }
        } catch (e) { /* ignored */ }
      }
    }

    return message;
  }

  async editMessage(messageId, newContent) {
    await db.execute({
      sql: 'UPDATE messages SET content = ?, isEdited = 1 WHERE id = ?',
      args: [newContent.trim(), messageId]
    });
    const res = await db.execute({ sql: 'SELECT * FROM messages WHERE id = ?', args: [messageId] });
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  async deleteMessage(messageId) {
    const res = await db.execute({ sql: 'DELETE FROM messages WHERE id = ?', args: [messageId] });
    return res.rowsAffected > 0;
  }

  async addReaction(messageId, emoji, userId) {
    const res = await db.execute({ sql: 'SELECT reactions FROM messages WHERE id = ?', args: [messageId] });
    if (res.rows.length === 0) return null;
    let reactions = JSON.parse(res.rows[0].reactions || '[]');
    const uid = userId || 'user-1';
    
    let existing = reactions.find(r => r.emoji === emoji);
    if (existing) {
      if (!existing.users.includes(uid)) {
        existing.users.push(uid);
      } else {
        existing.users = existing.users.filter(u => u !== uid);
      }
      existing.count = existing.users.length;
    } else {
      reactions.push({ emoji, count: 1, users: [uid] });
    }
    reactions = reactions.filter(r => r.count > 0);
    
    await db.execute({
      sql: 'UPDATE messages SET reactions = ? WHERE id = ?',
      args: [JSON.stringify(reactions), messageId]
    });
    
    const msgs = await this.getMessagesByChat(messageId);
    return msgs.find(m => m.id === messageId);
  }

  async getUserConversations(currentUserId, currentUsername) {
    const cleanUsername = (currentUsername || '').toLowerCase().trim().replace(/^@/, '');
    console.log(`[DB] getUserConversations for ${cleanUsername} (${currentUserId})`);

    // 1. Get all contacts where current user is involved
    const contactsRes = await db.execute({
      sql: 'SELECT * FROM contacts WHERE user_id = ? OR contact_id = ?',
      args: [currentUserId, currentUserId]
    });

    // 2. Also check messages table for any DMs involving currentUsername
    const messagesRes = await db.execute({
      sql: 'SELECT DISTINCT chatId FROM messages WHERE chatId LIKE ?',
      args: [`%${cleanUsername}%`]
    });

    const partnerUsernames = new Set();
    const partnerUserIds = new Set();

    for (const row of contactsRes.rows) {
      const partnerId = row.user_id === currentUserId ? row.contact_id : row.user_id;
      if (partnerId && partnerId !== currentUserId) {
        partnerUserIds.add(partnerId);
      }
    }

    for (const row of messagesRes.rows) {
      if (row.chatId && row.chatId.startsWith('dm_')) {
        const parts = row.chatId.replace('dm_', '').split('_');
        if (parts.length === 2) {
          const partner = parts[0] === cleanUsername ? parts[1] : (parts[1] === cleanUsername ? parts[0] : null);
          if (partner && partner !== cleanUsername) {
            partnerUsernames.add(partner);
          }
        }
      }
    }

    // Resolve user details
    const partnerUsers = [];
    for (const uid of partnerUserIds) {
      const u = await this.findUserById(uid);
      if (u && u.primaryUsername !== cleanUsername && !partnerUsers.some(p => p._id === u._id)) {
        partnerUsers.push(u);
      }
    }
    for (const uname of partnerUsernames) {
      const u = await this.findUserByUsername(uname);
      if (u && u.primaryUsername !== cleanUsername && !partnerUsers.some(p => p._id === u._id)) {
        partnerUsers.push(u);
      }
    }

    // Build conversation list
    const conversations = [];
    for (const partner of partnerUsers) {
      const dmId = this.getCanonicalDmId(cleanUsername, partner.primaryUsername);
      
      const lastMsgRes = await db.execute({
        sql: 'SELECT content, attachment, timestamp FROM messages WHERE chatId = ? ORDER BY timestamp DESC LIMIT 1',
        args: [dmId]
      });

      let lastMessage = 'Connected on Zyntra';
      let lastMessageTime = partner.created_at || new Date().toISOString();

      if (lastMsgRes.rows.length > 0) {
        const m = lastMsgRes.rows[0];
        lastMessage = m.content || (m.attachment ? '📎 Attachment' : 'Message');
        lastMessageTime = m.timestamp;
      }

      conversations.push({
        id: dmId,
        userId: partner._id,
        username: partner.primaryUsername,
        name: partner.name,
        avatar: partner.avatar,
        status: partner.status || 'online',
        bio: partner.bio || '',
        lastMessage,
        lastMessageTime,
        type: 'contact',
      });
    }

    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    const groupsRes = await db.execute('SELECT * FROM groups');

    return {
      contacts: conversations,
      groups: groupsRes.rows.map(g => ({ ...g, type: 'group' }))
    };
  }

  async getContactsAndGroups(userId, username) {
    if (userId) {
      return this.getUserConversations(userId, username);
    }
    const cRes = await db.execute('SELECT * FROM contacts');
    const gRes = await db.execute('SELECT * FROM groups');
    return { contacts: cRes.rows, groups: gRes.rows.map(g => ({ ...g, type: 'group' })) };
  }

  async addContact(currentUserId, currentUsername, targetUsername) {
    const cleanTarget = (targetUsername || '').toLowerCase().trim().replace(/^@/, '');
    const cleanCurrent = (currentUsername || '').toLowerCase().trim().replace(/^@/, '');
    
    console.log(`[DB] addContact: ${cleanCurrent} adding ${cleanTarget}`);
    const targetUser = await this.findUserByUsername(cleanTarget);
    if (!targetUser) return null;

    const dmId = this.getCanonicalDmId(cleanCurrent, cleanTarget);

    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO contacts (id, user_id, contact_id, type) VALUES (?, ?, ?, ?)',
        args: [`c_${currentUserId}_${targetUser._id}`, currentUserId, targetUser._id, 'contact']
      });
      await db.execute({
        sql: 'INSERT OR IGNORE INTO contacts (id, user_id, contact_id, type) VALUES (?, ?, ?, ?)',
        args: [`c_${targetUser._id}_${currentUserId}`, targetUser._id, currentUserId, 'contact']
      });
    } catch (e) {
      console.warn('[DB] addContact relation warning:', e.message);
    }

    return {
      id: dmId,
      userId: targetUser._id,
      username: targetUser.primaryUsername,
      name: targetUser.name,
      avatar: targetUser.avatar,
      status: targetUser.status || 'online',
      bio: targetUser.bio || '',
      lastMessage: 'Connected on Zyntra',
      lastMessageTime: new Date().toISOString(),
      type: 'contact'
    };
  }

  async addContactByUsername(username) {
    return this.addContact('temp-user', 'user', username);
  }

  async createGroup(name, description = '') {
    const id = `group-${Date.now()}`;
    await db.execute({
      sql: 'INSERT INTO groups (id, name, description, type, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, description, 'group', new Date().toISOString()]
    });
    return { id, name, description, type: 'group', membersCount: 1 };
  }

  async getWorkspaces() {
    const res = await db.execute('SELECT * FROM workspaces');
    return res.rows.map(w => ({
      ...w,
      nodes: [],
      settings: JSON.parse(w.settings || '{}')
    }));
  }

  async getAllNodes() {
    const res = await db.execute('SELECT * FROM nodes');
    const nodeMap = {};
    for (const n of res.rows) {
      nodeMap[n.id] = {
        id: n.id,
        workspaceId: n.workspace_id,
        name: n.name,
        parentId: n.folder || null,
        children: [],
        memberCount: n.membersCount || 1,
        hasConversation: true,
        joinCode: '',
        description: `${n.name} channel`,
        members: []
      };
    }
    return nodeMap;
  }

  async getWorkspaceTree(workspaceId) {
    return this.getAllNodes();
  }

  async createWorkspace(name, contextualUsername) {
    const wsId = `ws-${Date.now()}`;
    const code = `WS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await db.execute({
      sql: 'INSERT INTO workspaces (id, name, joinCode, description, settings, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [wsId, name, code, '', '{}', new Date().toISOString()]
    });
    
    await this.addNodeToWorkspace(wsId, { name: 'general', folder: null });
    
    return {
      id: wsId, name, joinCode: code, membersCount: 1, isOwner: true, role: 'owner', nodes: []
    };
  }

  async addNodeToWorkspace(workspaceId, { name, folder, description, isAnnouncement = false }) {
    const cleanName = (name || 'new-channel').replace(/^#/, '').toLowerCase().trim();
    const nodeId = `${workspaceId}-${cleanName}-${Date.now().toString(36)}`;
    
    await db.execute({
      sql: 'INSERT INTO nodes (id, workspace_id, name, folder, isAnnouncement, membersCount) VALUES (?, ?, ?, ?, ?, ?)',
      args: [nodeId, workspaceId, cleanName, folder || null, isAnnouncement ? 1 : 0, 1]
    });
    
    return { id: nodeId, name: cleanName, folder, description, isAnnouncement };
  }

  async joinWorkspace(code) {
    const cleanCode = code.toUpperCase().trim();
    const res = await db.execute({ sql: 'SELECT * FROM workspaces WHERE joinCode = ?', args: [cleanCode] });
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  mapUserRow(row) {
    if (!row) return null;
    let parsedContexts = [];
    try {
      parsedContexts = JSON.parse(row.contexts || '[]');
    } catch (e) {
      console.warn(`[DB] Failed to parse contexts for user ${row.email}`);
    }

    return {
      _id: row._id,
      id: row._id,
      name: row.name,
      email: row.email,
      primaryUsername: row.primaryUsername,
      password: row.password,
      avatar: row.avatar,
      bio: row.bio,
      status: row.status,
      contexts: parsedContexts,
    };
  }
}

export const storageService = new StorageService();
export default storageService;
