import { db } from '../config/turso.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class StorageService {
  async findUserByEmail(email) {
    console.log(`[DB] findUserByEmail: ${email}`);
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async findUserByUsername(username) {
    console.log(`[DB] findUserByUsername: ${username}`);
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE primaryUsername = ?', args: [username] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async findUserById(id) {
    const res = await db.execute({ sql: 'SELECT * FROM users WHERE _id = ?', args: [id] });
    if (res.rows.length === 0) return null;
    return this.mapUserRow(res.rows[0]);
  }

  async createUser({ name, email, primaryUsername, password, avatar, bio }) {
    console.log(`[DB] createUser: ${email} / @${primaryUsername}`);
    // Use random UUID for robust conflict-free IDs
    const id = `user-${crypto.randomUUID()}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Explicit transaction logic for bulletproof inserts
    const transaction = await db.transaction();
    try {
      await transaction.execute({
        sql: 'INSERT INTO users (_id, name, email, primaryUsername, password, avatar, bio, contexts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [id, name, email, primaryUsername, hashedPassword, avatar || null, bio || '', '[]']
      });
      await transaction.commit();
      console.log(`[DB] createUser success: ${id}`);
    } catch (err) {
      console.error(`[DB] createUser failed:`, err.message);
      await transaction.rollback();
      throw err;
    }

    return this.findUserById(id);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
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

  async saveMessage(message) {
    await db.execute({
      sql: 'INSERT INTO messages (id, chatId, senderId, senderName, senderUsername, content, attachment, reactions, isEdited, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        message.id, message.chatId, message.senderId, message.senderName || '', 
        message.senderUsername || '', message.content || '', 
        message.attachment ? JSON.stringify(message.attachment) : null, 
        '[]', 0, message.timestamp || new Date().toISOString()
      ]
    });
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

  async getContactsAndGroups() {
    const cRes = await db.execute('SELECT * FROM contacts');
    const gRes = await db.execute('SELECT * FROM groups');
    
    const mappedContacts = cRes.rows.map(c => ({
      id: c.id,
      userId: c.contact_id,
      username: c.contact_id.replace('user-', ''), 
      name: c.contact_id.replace('user-', ''), // Simplified mapping
      type: 'contact'
    }));
    return { contacts: mappedContacts, groups: gRes.rows };
  }

  async addContactByUsername(username) {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    const contactId = `contact-${clean}`;
    const targetUser = await this.findUserByUsername(clean);
    const targetId = targetUser ? targetUser._id : `user-${clean}`;
    
    try {
      await db.execute({
        sql: 'INSERT INTO contacts (id, user_id, contact_id, type) VALUES (?, ?, ?, ?)',
        args: [contactId, 'current-user', targetId, 'contact']
      });
    } catch (e) { /* ignored */ }
    
    return {
      id: contactId,
      userId: targetId,
      name: targetUser ? targetUser.name : clean,
      username: clean,
      avatar: targetUser ? targetUser.avatar : null,
      status: targetUser ? targetUser.status : 'online',
      lastMessage: 'Added as connection',
      lastMessageTime: new Date().toISOString()
    };
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
