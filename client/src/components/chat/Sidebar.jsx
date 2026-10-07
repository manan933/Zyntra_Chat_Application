import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  Building2,
  Moon,
  Sun,
  Settings,
  LogOut,
  MessageSquarePlus,
  Hash,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import useThemeStore from '../../store/themeStore';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const Sidebar = ({
  contacts = [],
  groups = [],
  workspaces = [],
  activeChat,
  currentUser,
  onSelectChat,
  onOpenNewChat,
  onOpenWorkspaceModal,
  onOpenSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'workplace'
  const [search, setSearch] = useState('');
  const { theme, toggleTheme } = useThemeStore();

  // Filter direct contacts + groups
  const directList = useMemo(() => {
    const list = [
      ...contacts.map((c) => ({ ...c, type: 'contact' })),
      ...groups.map((g) => ({ ...g, type: 'group' })),
    ];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.username?.toLowerCase().includes(q) ||
        item.lastMessage?.toLowerCase().includes(q)
    );
  }, [contacts, groups, search]);

  // Flatten workspace channels
  const workplaceChannels = useMemo(() => {
    const channels = [];
    workspaces.forEach((ws) => {
      // If workspace has nodes or rootNode
      if (ws.nodes && Array.isArray(ws.nodes)) {
        ws.nodes.forEach((n) => {
          channels.push({
            id: n.id,
            name: `${ws.name} / #${n.name}`,
            workspaceName: ws.name,
            type: 'channel',
            avatar: null,
            membersCount: n.membersCount || ws.membersCount,
          });
        });
      } else {
        // Fallback workspace item
        channels.push({
          id: ws.id,
          name: `#${ws.name}`,
          workspaceName: ws.name,
          type: 'channel',
          avatar: null,
          membersCount: ws.membersCount || 1,
        });
      }
    });

    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  }, [workspaces, search]);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden' }}>
      {/* ── Top Brand Header ────────────────────────────────────────── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
            Z
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
            Zyntra
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* ── Tabs (Direct vs Workplace) ─────────────────────────────── */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('direct')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'direct'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Users size={14} />
          <span>Chats</span>
          <span className="ml-0.5 text-[10px] opacity-75 font-mono">
            {directList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workplace')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'workplace'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Building2 size={14} />
          <span>Workplaces</span>
          <span className="ml-0.5 text-[10px] opacity-75 font-mono">
            {workplaceChannels.length}
          </span>
        </button>
      </div>

      {/* ── Search Input ────────────────────────────────────────────── */}
      <div className="px-3 py-1 shrink-0">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder={activeTab === 'direct' ? 'Search chats or @handle...' : 'Search channels...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────────────────── */}
      <div className="px-3 py-2 flex items-center gap-2 shrink-0">
        {activeTab === 'direct' ? (
          <button
            type="button"
            onClick={onOpenNewChat}
            className="w-full py-1.5 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
          >
            <MessageSquarePlus size={14} />
            <span>+ New Chat</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenWorkspaceModal}
            className="w-full py-1.5 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
          >
            <Plus size={14} />
            <span>+ Create / Join Workplace</span>
          </button>
        )}
      </div>

      {/* ── Conversation List Feed ─────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 py-1 space-y-0.5">
        {activeTab === 'direct' ? (
          directList.length === 0 ? (
            <div className="text-center py-10 px-4 text-[var(--text-muted)] text-xs">
              <p className="font-semibold mb-1 text-[var(--text-secondary)]">No conversations found</p>
              <p>Click &ldquo;+ New Chat&rdquo; above to find friends by username.</p>
            </div>
          ) : (
            directList.map((item) => {
              const isActive = activeChat?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectChat(item)}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Avatar
                    name={item.name}
                    src={item.avatar}
                    size="md"
                    status={item.status || 'online'}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-sm truncate font-semibold ${
                          isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.lastMessageTime && (
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium">
                          {formatTime(item.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate m-0 leading-tight">
                      {item.lastMessage || 'Connected on Zyntra'}
                    </p>
                  </div>
                </button>
              );
            })
          )
        ) : (
          workplaceChannels.length === 0 ? (
            <div className="text-center py-10 px-4 text-[var(--text-muted)] text-xs">
              <p className="font-semibold mb-1 text-[var(--text-secondary)]">No workplaces yet</p>
              <p>Create a team workplace or join one with an invite code.</p>
            </div>
          ) : (
            workplaceChannels.map((item) => {
              const isActive = activeChat?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectChat(item)}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0 font-bold">
                    <Hash size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-semibold truncate text-[var(--text-primary)]">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate m-0">
                      {item.membersCount ? `${item.membersCount} members` : 'Channel'}
                    </p>
                  </div>
                </button>
              );
            })
          )
        )}
      </div>

      {/* ── Bottom Current User Bar ────────────────────────────────── */}
      <div className="h-14 px-3 py-2 bg-[var(--bg-primary)] border-t border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar
            name={currentUser?.name || 'User'}
            src={currentUser?.avatar}
            size="sm"
            status="online"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
              {currentUser?.name || 'User'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
              @{currentUser?.primaryUsername || 'user'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
