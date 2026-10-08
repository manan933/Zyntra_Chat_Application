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
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Volume2,
  Copy,
  Check,
  Megaphone,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import useThemeStore from '../../store/themeStore';
import CreateChannelModal from '../modals/CreateChannelModal';

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
  onAddChannel,
}) => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'workplace'
  const [search, setSearch] = useState('');
  const [activeWorkspaceIndex, setActiveWorkspaceIndex] = useState(0);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    'Computer Science & Eng': true,
    'Computer Science / AI & ML': true,
    Engineering: true,
  });
  const [copiedWsCode, setCopiedWsCode] = useState(false);

  const { theme, toggleTheme } = useThemeStore();

  const currentWorkspace = workspaces[activeWorkspaceIndex] || workspaces[0];

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

  // Group workspace channels by folder
  const groupedWorkspaceChannels = useMemo(() => {
    if (!currentWorkspace || !currentWorkspace.nodes) return { root: [], folders: {} };
    const nodes = currentWorkspace.nodes || [];
    const q = search.trim().toLowerCase();

    const root = [];
    const folders = {};

    nodes.forEach((n) => {
      if (q && !n.name.toLowerCase().includes(q) && !(n.folder && n.folder.toLowerCase().includes(q))) {
        return;
      }

      const item = {
        id: n.id,
        name: `#${n.name}`,
        rawName: n.name,
        workspaceName: currentWorkspace.name,
        type: 'channel',
        avatar: null,
        membersCount: n.membersCount || currentWorkspace.membersCount,
        isAnnouncement: n.isAnnouncement,
        joinCode: currentWorkspace.joinCode,
      };

      if (!n.folder) {
        root.push(item);
      } else {
        if (!folders[n.folder]) folders[n.folder] = [];
        folders[n.folder].push(item);
      }
    });

    return { root, folders };
  }, [currentWorkspace, search]);

  const toggleFolder = (folderName) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard?.writeText(code);
      setCopiedWsCode(true);
      setTimeout(() => setCopiedWsCode(false), 2000);
    }
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden' }}>
      {/* ── Top Brand Header ────────────────────────────────────────── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border)] shrink-0 select-none">
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
      <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 shrink-0 select-none">
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
            {workspaces.length}
          </span>
        </button>
      </div>

      {/* ── Workplace Switcher Header (When in Workplaces Tab) ──────── */}
      {activeTab === 'workplace' && currentWorkspace && (
        <div className="px-3 py-1.5 shrink-0 select-none relative">
          <div
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="p-2.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-between cursor-pointer hover:border-[var(--accent)] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentWorkspace.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[var(--text-primary)] truncate flex items-center gap-1">
                  <span>{currentWorkspace.name}</span>
                  <ChevronDown size={13} className="text-[var(--text-muted)] shrink-0" />
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1 font-mono">
                  <span>Code: {currentWorkspace.joinCode || 'WS-001'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handleCopyCode(e, currentWorkspace.joinCode || 'WS-001')}
              className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] cursor-pointer"
              title="Copy Workplace Code"
            >
              {copiedWsCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Switcher Dropdown */}
          {workspaceDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl z-30 animate-fade-in space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1 block">
                Switch Workplace
              </span>
              {workspaces.map((ws, idx) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceIndex(idx);
                    setWorkspaceDropdownOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between cursor-pointer border-none transition-colors ${
                    activeWorkspaceIndex === idx
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{ws.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">{ws.nodes?.length || 3} channels</span>
                </button>
              ))}

              <div className="pt-1 border-t border-[var(--border)] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceDropdownOpen(false);
                    onOpenWorkspaceModal?.();
                  }}
                  className="w-full py-1.5 px-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] text-[var(--accent)] text-xs font-bold rounded-xl cursor-pointer border border-[var(--border)] flex items-center justify-center gap-1"
                >
                  <Plus size={13} />
                  <span>Join / Create New</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Search Input ────────────────────────────────────────────── */}
      <div className="px-3 py-1 shrink-0">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder={activeTab === 'direct' ? 'Search chats or @handle...' : 'Search channels or folders...'}
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
          <div className="flex items-center gap-1.5 w-full">
            <button
              type="button"
              onClick={() => setCreateChannelModalOpen(true)}
              className="flex-1 py-1.5 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
            >
              <Hash size={14} />
              <span>+ Channel</span>
            </button>
            <button
              type="button"
              onClick={onOpenWorkspaceModal}
              className="py-1.5 px-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
              title="Add / Join Workplace"
            >
              <Plus size={14} />
            </button>
          </div>
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
                      <span className="text-sm truncate font-semibold text-[var(--text-primary)]">
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
          /* ── WORKPLACES CHANNELS TREE ────────────────────────────── */
          <div className="space-y-2 select-none pt-1">
            {/* Root Channels */}
            {groupedWorkspaceChannels.root.map((channel) => {
              const isActive = activeChat?.id === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelectChat(channel)}
                  className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer border-none text-left ${
                    isActive
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-bold'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {channel.isAnnouncement ? (
                      <Megaphone size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <Hash size={14} className="opacity-75 shrink-0" />
                    )}
                    <span className="text-xs font-semibold truncate">{channel.rawName}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                    {channel.membersCount}
                  </span>
                </button>
              );
            })}

            {/* Nested Folders & Categories */}
            {Object.entries(groupedWorkspaceChannels.folders).map(([folderName, folderChannels]) => {
              const isExpanded = expandedFolders[folderName] !== false;
              return (
                <div key={folderName} className="space-y-0.5">
                  <div
                    onClick={() => toggleFolder(folderName)}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {isExpanded ? <FolderOpen size={13} className="text-[var(--accent)]" /> : <Folder size={13} />}
                      <span className="truncate uppercase tracking-wider text-[10px]">{folderName}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-75">{folderChannels.length}</span>
                  </div>

                  {isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l border-[var(--border)] ml-3 my-0.5">
                      {folderChannels.map((channel) => {
                        const isActive = activeChat?.id === channel.id;
                        return (
                          <button
                            key={channel.id}
                            type="button"
                            onClick={() => onSelectChat(channel)}
                            className={`w-full px-2 py-1.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer border-none text-left ${
                              isActive
                                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-bold'
                                : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Hash size={13} className="opacity-75 shrink-0" />
                              <span className="text-xs font-medium truncate">{channel.rawName}</span>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                              {channel.membersCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Current User Bar ────────────────────────────────── */}
      <div className="h-14 px-3 py-2 bg-[var(--bg-primary)] border-t border-[var(--border)] flex items-center justify-between shrink-0 select-none">
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
        >
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

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title="Open Settings"
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Create Channel Modal ────────────────────────────────────── */}
      <CreateChannelModal
        isOpen={createChannelModalOpen}
        onClose={() => setCreateChannelModalOpen(false)}
        activeWorkspace={currentWorkspace}
        onAddChannel={onAddChannel}
      />
    </aside>
  );
};

export default Sidebar;
