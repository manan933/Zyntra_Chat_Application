import React, { useEffect, useState } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import NewChatModal from '../components/modals/NewChatModal';
import WorkspaceModal from '../components/modals/WorkspaceModal';
import SettingsModal from '../components/modals/SettingsModal';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import socketService from '../api/socket';

export const ChatPage = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const {
    activeChat,
    contacts,
    groups,
    workspaces,
    messages,
    typingStatus,
    loadChats,
    selectChat,
    closeChat,
    sendMessage,
    receiveMessage,
    addReaction,
    updateReaction,
    editMessage,
    deleteMessage,
    addContact,
    createGroup,
    createWorkspace,
    joinWorkspace,
    setTyping,
  } = useChatStore();

  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    loadChats();

    const handleReceive = (msg) => receiveMessage(msg);
    const handleReaction = (msg) => updateReaction(msg);
    const handleTyping = ({ roomId, userName, isTyping }) => setTyping(roomId, userName, isTyping);

    socketService.on('receive_message', handleReceive);
    socketService.on('update_reaction', handleReaction);
    socketService.on('user_typing', handleTyping);

    return () => {
      socketService.off('receive_message', handleReceive);
      socketService.off('update_reaction', handleReaction);
      socketService.off('user_typing', handleTyping);
    };
  }, [loadChats, receiveMessage, updateReaction, setTyping]);

  const activeMessages = activeChat?.id ? messages[activeChat.id] || [] : [];
  const currentTypingUsers = activeChat?.id ? typingStatus[activeChat.id] || [] : [];

  return (
    <>
      {/* ─── Main layout: fills parent fully ─────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          flex: '1 1 0%',
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        {/*
          Mobile  (< 768px): show sidebar OR chat area, not both
          Desktop (≥ 768px): always show sidebar at fixed width
        */}
        <div
          style={{
            /* Mobile: hide sidebar when a chat is open */
            display: activeChat ? 'none' : 'flex',
            flexDirection: 'column',
            width: '100%',
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
          }}
          // On md+ screens Tailwind overrides: show always, fixed width
          className="md:!flex md:!w-[320px] lg:!w-[340px]"
        >
          <Sidebar
            contacts={contacts}
            groups={groups}
            workspaces={workspaces}
            activeChat={activeChat}
            currentUser={user}
            onSelectChat={(chat) => selectChat(chat)}
            onOpenNewChat={() => setNewChatModalOpen(true)}
            onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onLogout={logout}
          />
        </div>

        {/* ── Chat Area ────────────────────────────────────────────── */}
        {/*
          Mobile: show chat area only when chat is active
          Desktop: always show, fills remaining space
        */}
        <div
          style={{
            display: !activeChat ? 'none' : 'flex',
            flexDirection: 'column',
            flex: '1 1 0%',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
          className="md:!flex"
        >
          <ChatArea
            chat={activeChat}
            messages={activeMessages}
            currentUser={user}
            typingUsers={currentTypingUsers}
            onBack={closeChat}
            onSend={(content, attachment) =>
              activeChat && sendMessage(activeChat.id, content, attachment, user)
            }
            onEditMessage={(msgId, content) =>
              activeChat && editMessage(activeChat.id, msgId, content)
            }
            onDeleteMessage={(msgId) =>
              activeChat && deleteMessage(activeChat.id, msgId)
            }
            onReaction={(msgId, emoji) =>
              activeChat && addReaction(activeChat.id, msgId, emoji, user?.id || user?._id)
            }
          />
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onAddContact={addContact}
        onCreateGroup={createGroup}
        onStartDirectChat={(chat) => selectChat(chat)}
      />

      <WorkspaceModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        onCreateWorkspace={createWorkspace}
        onJoinWorkspace={joinWorkspace}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        onUpdateProfile={updateProfile}
      />
    </>
  );
};

export default ChatPage;
