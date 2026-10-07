import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import Composer from './Composer';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const ChatArea = ({
  chat,
  messages = [],
  currentUser,
  typingUsers = [],
  onBack,
  onSend,
  onEditMessage,
  onDeleteMessage,
  onReaction,
}) => {
  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp).toDateString();
      if (msgDate !== lastDate) {
        groups.push({ type: 'date', date: formatDate(msg.timestamp), id: `date-${msgDate}` });
        lastDate = msgDate;
      }
      groups.push({ type: 'message', data: msg, id: msg.id });
    });

    return groups;
  }, [messages]);

  // Scroll to bottom on messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 180);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // If no conversation is active (desktop empty state)
  if (!chat) {
    return (
      <div style={{ display: 'flex', flex: '1 1 0%', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', backgroundColor: 'var(--bg-primary)', textAlign: 'center' }}>
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-sm">
          <MessageSquare size={32} />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
          Select a Conversation
        </h2>
        <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
          Choose a contact or channel from the sidebar, or click New Chat to get started.
        </p>
      </div>
    );
  }

  const currentUserId = currentUser?.id || currentUser?._id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%', height: '100%', minHeight: 0, overflow: 'hidden', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
      {/* ── Chat Header ────────────────────────────────────────────── */}
      <header className="h-14 min-h-[56px] px-3 sm:px-4 bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center justify-between shrink-0 z-10 select-none">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {/* Back button (Mobile only) */}
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0"
            title="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Conversation Avatar */}
          <Avatar
            name={chat.name}
            src={chat.avatar}
            size="md"
            status={chat.status || (chat.type === 'channel' ? null : 'online')}
          />

          {/* Title & Status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)] truncate tracking-tight m-0">
                {chat.name}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                <ShieldCheck size={10} />
                E2EE
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-1.5 mt-0.5">
              {chat.membersCount ? (
                <span>{chat.membersCount} members</span>
              ) : chat.status === 'online' ? (
                <span className="text-[var(--online)] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--online)] inline-block" /> Active now
                </span>
              ) : (
                <span>Direct Message</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Message Feed ────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4 flex flex-col relative"
      >
        {groupedMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-3">
              💬
            </div>
            <div className="text-sm font-bold text-[var(--text-primary)] mb-1">
              Start the Conversation
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xs">
              Say hello — messages in this chat are end-to-end encrypted.
            </p>
          </div>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.id} className="flex items-center justify-center my-3 select-none">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border)] shadow-xs">
                    {item.date}
                  </span>
                </div>
              );
            }

            const msg = item.data;
            const isOwn = Boolean(
              currentUserId &&
                (msg.senderId === currentUserId ||
                  (currentUser?.primaryUsername &&
                    msg.senderUsername?.toLowerCase() === currentUser.primaryUsername.toLowerCase()))
            );

            return (
              <MessageBubble
                key={item.id}
                message={msg}
                isOwn={isOwn}
                currentUserId={currentUserId}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onReaction={onReaction}
              />
            );
          })
        )}

        {/* Real-time Typing indicator banner */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] italic px-2 py-1 mt-2 select-none animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>{typingUsers.join(', ')} is typing...</span>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-18 right-5 w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none z-20"
          title="Scroll to bottom"
        >
          <ChevronDown size={18} />
        </button>
      )}

      {/* ── Message Composer ────────────────────────────────────────── */}
      <Composer
        chatId={chat.id}
        currentUser={currentUser}
        onSend={(content, attachment) => onSend?.(content, attachment)}
      />
    </div>
  );
};

export default ChatArea;
