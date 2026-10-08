import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Copy,
  Check,
  UserPlus,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  Bell,
  BellOff,
  Hash,
  Ban,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import useChatStore from '../../store/chatStore';

const ROLE_CONFIG = {
  owner: { label: 'Owner', bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
  admin: { label: 'Admin', bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' },
  moderator: { label: 'Mod', bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
  member: { label: 'Member', bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)' },
};

export const GroupInfoPanel = ({ chat, onClose, onLeaveChat }) => {
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'media'

  if (!chat) return null;

  const isChannel = chat.type === 'channel';
  const isDirect = !isChannel && chat.type !== 'group';
  const joinCode = chat.joinCode || (isChannel ? 'ZYN-WS-001' : null);

  const handleCopyCode = () => {
    if (joinCode) {
      navigator.clipboard?.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-80 h-full bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col shrink-0 overflow-hidden select-none z-20">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
          {isChannel ? 'Channel Details' : isDirect ? 'Contact Details' : 'Group Info'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {/* ── Hero Info Card ────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)]">
          {isChannel ? (
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center font-bold mb-3">
              <Hash size={28} />
            </div>
          ) : (
            <Avatar name={chat.name} src={chat.avatar} size="lg" className="mb-3" />
          )}

          <h3 className="text-base font-bold text-[var(--text-primary)] m-0">
            {chat.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 m-0 font-mono">
            {chat.workspaceName ? `${chat.workspaceName}` : chat.username ? `@${chat.username}` : `${chat.membersCount || 12} members`}
          </p>


        </div>

        {/* ── Join Code Card (if channel) ───────────────────────────── */}
        {joinCode && (
          <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Invite Code
              </span>
              <span className="font-mono text-xs font-bold text-[var(--accent)] truncate block">
                {joinCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-1 px-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-[11px] font-bold border-none cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* ── Quick Controls ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              muted
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {muted ? <BellOff size={14} /> : <Bell size={14} />}
            <span>{muted ? 'Muted' : 'Mute'}</span>
          </button>
        </div>

        {/* ── Members or Mutual Groups ────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Users size={14} className="text-blue-500" />
              <span>{isDirect ? 'Mutual Connections' : `Participants (${(chat.members || []).length})`}</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {isDirect ? (
              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-center text-[11px] text-[var(--text-secondary)]">
                You both are members of <strong className="text-[var(--text-primary)]">Zyntra Technologies</strong> and <strong className="text-[var(--text-primary)]">Design Team</strong>.
              </div>
            ) : (
              (chat.members || []).map((m) => {
                const roleCfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.member;
                return (
                  <div
                    key={m.id}
                    className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={m.name} size="sm" status={m.status} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                          @{m.username}
                        </div>
                      </div>
                    </div>

                    <span
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold border shrink-0"
                      style={{
                        backgroundColor: roleCfg.bg,
                        color: roleCfg.text,
                        borderColor: roleCfg.border,
                      }}
                    >
                      {roleCfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Shared Attachments Summary ────────────────────────────── */}
        <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
            Shared in this chat
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <ImageIcon size={14} className="text-blue-500" />
              <span>14 Photos</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <FileText size={14} className="text-indigo-500" />
              <span>6 Docs</span>
            </div>
          </div>
        </div>

        {/* ── Leave / Delete / Block Action ────────────────────── */}
        {(isChannel || chat.type === 'group') && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Leave ${chat.name}?`)) {
                  onLeaveChat?.(chat.id, 'leave');
                  onClose();
                }
              }}
              className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/25 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Leave</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (confirm(`Permanently delete ${chat.name}?`)) {
                  onLeaveChat?.(chat.id, 'delete');
                  onClose();
                }
              }}
              className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <X size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}

        {isDirect && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Block ${chat.name}? They will not be able to send you messages.`)) {
                useChatStore.getState().blockUser(chat.id);
                onLeaveChat?.(chat.id, 'delete'); // Automatically close and delete chat locally
                onClose();
              }
            }}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <Ban size={14} />
            <span>Block User</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default GroupInfoPanel;
