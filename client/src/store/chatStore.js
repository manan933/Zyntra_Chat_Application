import { create } from 'zustand';
import api from '../api/api';
import socketService from '../api/socket';

export const useChatStore = create((set, get) => ({
  activeChat: null,
  contacts: [],
  groups: [],
  workspaces: [],
  messages: {},
  typingStatus: {},
  isLoadingChats: false,
  isLoadingMessages: false,

  // Reset store for logout
  resetStore: () => set({
    activeChat: null,
    contacts: [],
    groups: [],
    workspaces: [],
    messages: {},
    typingStatus: {},
  }),

  // Initialize all chat streams (Contacts, Groups, Workspaces)
  loadChats: async () => {
    set({ isLoadingChats: true });
    try {
      const [contactsRes, workspacesRes] = await Promise.all([
        api.contacts.list(),
        api.workspaces.list(),
      ]);

      const contactsData = contactsRes.ok && contactsRes.data ? contactsRes.data : {};
      const rawContacts = contactsData.contacts && contactsData.contacts.length > 0
        ? contactsData.contacts
        : [];
      const rawGroups = contactsData.groups && contactsData.groups.length > 0
        ? contactsData.groups
        : [];

      const rawWorkspaces =
        workspacesRes.ok && workspacesRes.data
          ? Array.isArray(workspacesRes.data) && workspacesRes.data.length > 0
            ? workspacesRes.data
            : workspacesRes.data.workspaces && workspacesRes.data.workspaces.length > 0
            ? workspacesRes.data.workspaces
            : []
          : [];

      set({
        contacts: rawContacts,
        groups: rawGroups,
        workspaces: rawWorkspaces,
        isLoadingChats: false,
      });

      // Keep active chat in sync
      const current = get().activeChat;
      if (current) {
        const found =
          rawContacts.find((c) => c.id === current.id) ||
          rawGroups.find((g) => g.id === current.id);
        if (found) {
          set({ activeChat: { ...current, ...found } });
        }
      }
    } catch {
      set({ isLoadingChats: false });
    }
  },

  // Select active conversation
  selectChat: async (chat) => {
    if (!chat || !chat.id) return;
    const prev = get().activeChat;
    if (prev?.id === chat.id) return;

    if (prev?.id) socketService.leaveRoom(prev.id);
    socketService.joinRoom(chat.id);

    set({ activeChat: chat });
    await get().loadMessages(chat.id);
  },

  closeChat: () => {
    const prev = get().activeChat;
    if (prev?.id) socketService.leaveRoom(prev.id);
    set({ activeChat: null });
  },

  removeChat: (chatId, action = 'leave') => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== chatId),
      contacts: state.contacts.filter((c) => c.id !== chatId),
      activeChat: state.activeChat?.id === chatId ? null : state.activeChat
    }));
  },

  blockUser: (userId) => {
    set((state) => {
      const blocked = state.blockedUsers || [];
      if (blocked.includes(userId)) return state;
      return { blockedUsers: [...blocked, userId] };
    });
  },

  // Load messages for a chat
  loadMessages: async (chatId) => {
    if (!chatId) return;
    set({ isLoadingMessages: true });
    try {
      const res = await api.messages.byChat(chatId);
      const list = res.ok && Array.isArray(res.data) && res.data.length > 0
        ? res.data
        : (get().messages[chatId] || []);

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: list,
        },
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  // Send message with instant optimistic update
  sendMessage: async (chatId, content, attachment = null, currentUser) => {
    if (!chatId || (!content?.trim() && !attachment)) return;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticMessage = {
      id: messageId,
      chatId,
      content: content ? content.trim() : '',
      type: attachment?.type || 'text',
      attachment: attachment || null,
      senderId: currentUser?.id || currentUser?._id || 'user-1',
      senderName: currentUser?.name || 'You',
      senderUsername: currentUser?.primaryUsername || '',
      senderAvatar: currentUser?.avatar || null,
      reactions: [],
      timestamp: new Date().toISOString(),
    };

    // 1. Optimistic UI update
    set((state) => {
      const existing = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, optimisticMessage],
        },
      };
    });

    // 2. Broadcast through socket
    socketService.sendMessage(optimisticMessage);

    // 3. Persist to API
    api.messages.send(chatId, optimisticMessage).catch((e) => { console.error('ignored', e); });

    // 4. Update last message preview
    const previewText = optimisticMessage.content || (attachment?.type === 'image' ? '📷 Photo' : '📎 Attachment');
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === chatId ? { ...c, lastMessage: previewText, lastMessageTime: new Date().toISOString() } : c
      ),
      groups: state.groups.map((g) =>
        g.id === chatId ? { ...g, lastMessage: previewText, lastMessageTime: new Date().toISOString() } : g
      ),
    }));
  },

  // Handle incoming message from Socket.io
  receiveMessage: (message) => {
    if (!message || !message.chatId) return;
    const chatId = message.chatId;

    set((state) => {
      const existing = state.messages[chatId] || [];
      if (existing.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, message],
        },
      };
    });

    const preview = message.content || (message.attachment?.type === 'image' ? '📷 Photo' : '📎 Attachment');
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === chatId ? { ...c, lastMessage: preview, lastMessageTime: message.timestamp || new Date().toISOString() } : c
      ),
      groups: state.groups.map((g) =>
        g.id === chatId ? { ...g, lastMessage: preview, lastMessageTime: message.timestamp || new Date().toISOString() } : g
      ),
    }));
  },

  // Add / toggle reaction on message
  addReaction: async (chatId, messageId, emoji, userId) => {
    const uid = userId || 'user-1';

    set((state) => {
      const list = state.messages[chatId] || [];
      const updated = list.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = [...(msg.reactions || [])];
        const existing = reactions.find((r) => r.emoji === emoji);

        if (existing) {
          const userHasReacted = existing.users && existing.users.includes(uid);
          if (userHasReacted) {
            existing.users = existing.users.filter((u) => u !== uid);
            existing.count = existing.users.length;
          } else {
            existing.users = [...(existing.users || []), uid];
            existing.count = existing.users.length;
          }
        } else {
          reactions.push({
            emoji,
            count: 1,
            users: [uid],
          });
        }

        return {
          ...msg,
          reactions: reactions.filter((r) => r.count > 0),
        };
      });

      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });

    socketService.sendReaction({ messageId, emoji, userId: uid, chatId });
    api.messages.reaction(messageId, emoji, uid).catch((e) => { console.error('ignored', e); });
  },

  updateReaction: (updatedMessage) => {
    if (!updatedMessage || !updatedMessage.id) return;
    const chatId = updatedMessage.chatId;
    if (!chatId) return;

    set((state) => {
      const list = state.messages[chatId] || [];
      const updated = list.map((m) => (m.id === updatedMessage.id ? { ...m, reactions: updatedMessage.reactions } : m));
      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });
  },

  editMessage: async (chatId, messageId, newContent) => {
    if (!newContent?.trim()) return;

    set((state) => {
      const list = state.messages[chatId] || [];
      const updated = list.map((m) => (m.id === messageId ? { ...m, content: newContent.trim(), isEdited: true } : m));
      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });

    api.messages.edit(messageId, newContent.trim()).catch((e) => { console.error('ignored', e); });
  },

  deleteMessage: async (chatId, messageId) => {
    set((state) => {
      const list = state.messages[chatId] || [];
      const updated = list.filter((m) => m.id !== messageId);
      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });

    api.messages.delete(messageId).catch((e) => { console.error('ignored', e); });
  },

  addContact: async (username) => {
    const cleanUsername = username.replace(/^@/, '').trim();
    const res = await api.contacts.add(cleanUsername);
    if (res.ok && res.data) {
      await get().loadChats();
      return { success: true, contact: res.data };
    }

    // Local fallback creation
    const newContact = {
      id: `contact-${cleanUsername}`,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      username: cleanUsername,
      status: 'online',
      lastMessage: 'Added as contact',
      lastMessageTime: new Date().toISOString(),
      avatar: null,
    };
    set((state) => ({
      contacts: [newContact, ...state.contacts],
    }));
    return { success: true, contact: newContact };
  },

  createGroup: async (name, description = '') => {
    const res = await api.contacts.createGroup({ name, description });
    if (res.ok && res.data) {
      await get().loadChats();
      return { success: true, group: res.data };
    }

    // Local fallback creation
    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      membersCount: 1,
      lastMessage: 'Group created',
      lastMessageTime: new Date().toISOString(),
    };
    set((state) => ({
      groups: [newGroup, ...state.groups],
    }));
    return { success: true, group: newGroup };
  },

  createWorkspace: async (name, contextualUsername = '') => {
    const res = await api.workspaces.create({ name, contextualUsername });
    if (res.ok && res.data) {
      await get().loadChats();
      return { success: true, workspace: res.data };
    }

    // Local fallback creation
    const newWs = {
      id: `ws-${Date.now()}`,
      name,
      membersCount: 1,
      nodes: [
        { id: `node-${Date.now()}-gen`, name: 'general', membersCount: 1 },
      ],
    };
    set((state) => ({
      workspaces: [newWs, ...state.workspaces],
    }));
    return { success: true, workspace: newWs };
  },

  joinWorkspace: async (code) => {
    const res = await api.workspaces.join(code);
    if (res.ok && res.data) {
      await get().loadChats();
      return { success: true, workspace: res.data };
    }

    // Local fallback mock joining
    const joinedWs = {
      id: `ws-${Date.now()}`,
      name: `Workspace (${code})`,
      membersCount: 5,
      joinCode: code,
      nodes: [
        { id: `node-${Date.now()}-gen`, name: 'general', membersCount: 5 },
      ],
    };
    set((state) => ({
      workspaces: [joinedWs, ...state.workspaces],
    }));
    return { success: true, workspace: joinedWs };
  },

  addChannelToWorkspace: (workspaceId, channelName, folder = null) => {
    const cleanName = channelName.replace(/^#/, '').trim().toLowerCase();
    const newChannel = {
      id: `node-${Date.now()}-${cleanName}`,
      name: cleanName,
      membersCount: 1,
      folder: folder || null,
    };

    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, nodes: [...(ws.nodes || []), newChannel] }
          : ws
      ),
    }));

    return newChannel;
  },

  leaveWorkspace: (workspaceId) => {
    set((state) => ({
      workspaces: state.workspaces.filter((ws) => ws.id !== workspaceId),
    }));
  },

  toggleWorkspaceSetting: (workspaceId, settingKey) => {
    set((state) => ({
      workspaces: state.workspaces.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        const currentSettings = ws.settings || { allowEmojis: true, allowAttachments: true };
        return {
          ...ws,
          settings: {
            ...currentSettings,
            [settingKey]: currentSettings[settingKey] === false ? true : false,
          }
        };
      })
    }));
  },

  setTyping: (roomId, userName, isTyping) => {
    set((state) => {
      const current = state.typingStatus[roomId] || [];
      const updated = isTyping
        ? Array.from(new Set([...current, userName]))
        : current.filter((u) => u !== userName);

      return {
        typingStatus: {
          ...state.typingStatus,
          [roomId]: updated,
        },
      };
    });
  },
}));

export default useChatStore;
