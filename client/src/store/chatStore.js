import { create } from 'zustand';
import api from '../api/api';
import socketService from '../api/socket';

const INITIAL_CONTACTS = [
  {
    id: 'contact-alex',
    name: 'Alex Morgan',
    username: 'alex',
    status: 'online',
    lastMessage: 'Hey! Are we deploying the new build today?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    avatar: null,
  },
  {
    id: 'contact-sarah',
    name: 'Sarah Connor',
    username: 'sarah',
    status: 'online',
    lastMessage: 'The new responsive design looks fantastic on mobile.',
    lastMessageTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    avatar: null,
  },
  {
    id: 'contact-david',
    name: 'David Chen',
    username: 'david',
    status: 'offline',
    lastMessage: 'Merged the pull request 👍',
    lastMessageTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    avatar: null,
  },
  {
    id: 'contact-maya',
    name: 'Maya Lin',
    username: 'maya',
    status: 'online',
    lastMessage: 'Let me know when you have time for a quick sync.',
    lastMessageTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    avatar: null,
  },
];

const INITIAL_GROUPS = [
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
];

const INITIAL_WORKSPACES = [
  {
    id: 'ws-giet',
    name: 'GIET University',
    joinCode: 'ZYN-GIET-0001',
    membersCount: 5200,
    isOwner: true,
    role: 'owner',
    description: 'Official university communications & academic department channels',
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
    description: 'Enterprise product engineering & architecture hub',
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
    description: 'Core platform engineering, protocol design and E2EE security',
    nodes: [
      { id: 'node-general', name: 'general', membersCount: 45, folder: null },
      { id: 'node-dev', name: 'dev-chat', membersCount: 28, folder: 'Engineering' },
      { id: 'node-announcements', name: 'announcements', membersCount: 45, folder: null, isAnnouncement: true },
    ],
  },
];

const INITIAL_MESSAGES = {
  'contact-alex': [
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
  ],
  'giet-announcements': [
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
  ],
  'giet-cse-aiml-sec-a': [
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
  ],
  'abc-frontend-react': [
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
  ],
  'node-general': [
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

export const useChatStore = create((set, get) => ({
  activeChat: null,
  contacts: INITIAL_CONTACTS,
  groups: INITIAL_GROUPS,
  workspaces: INITIAL_WORKSPACES,
  messages: INITIAL_MESSAGES,
  typingStatus: {},
  isLoadingChats: false,
  isLoadingMessages: false,

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
        : INITIAL_CONTACTS;
      const rawGroups = contactsData.groups && contactsData.groups.length > 0
        ? contactsData.groups
        : INITIAL_GROUPS;

      const rawWorkspaces =
        workspacesRes.ok && workspacesRes.data
          ? Array.isArray(workspacesRes.data) && workspacesRes.data.length > 0
            ? workspacesRes.data
            : workspacesRes.data.workspaces && workspacesRes.data.workspaces.length > 0
            ? workspacesRes.data.workspaces
            : INITIAL_WORKSPACES
          : INITIAL_WORKSPACES;

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
    api.messages.send(chatId, optimisticMessage).catch(() => {});

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
    api.messages.reaction(messageId, emoji, uid).catch(() => {});
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

    api.messages.edit(messageId, newContent.trim()).catch(() => {});
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

    api.messages.delete(messageId).catch(() => {});
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
