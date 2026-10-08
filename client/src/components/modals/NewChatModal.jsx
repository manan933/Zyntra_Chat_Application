import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Search, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import api from '../../api/api';

export const NewChatModal = ({ isOpen, onClose, onAddContact, onCreateGroup, onStartDirectChat }) => {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'group'
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Group creation state
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!search.trim() || activeTab !== 'contact') {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const cleanQuery = search.replace(/^@/, '').trim();
        const res = await api.contacts.search(cleanQuery);
        if (res.ok && Array.isArray(res.data)) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const handleSelectUser = async (user) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onAddContact(user.primaryUsername || user.username);
      if (res?.success) {
        onClose();
        if (res.contact) {
          onStartDirectChat?.(res.contact);
        }
      } else {
        setError(res?.error || 'Failed to add contact');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onCreateGroup(groupName.trim(), groupDesc.trim());
      if (res?.success) {
        onClose();
        setGroupName('');
        setGroupDesc('');
        if (res.group) {
          onStartDirectChat?.(res.group);
        }
      } else {
        setError(res?.error || 'Failed to create group');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Conversation">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mb-4 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('contact');
            setError(null);
          }}
          className={`shrink-0 flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'contact'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <UserPlus size={14} />
          <span>Direct Contact</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('group');
            setError(null);
          }}
          className={`shrink-0 flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'group'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users size={14} />
          <span>New Group</span>
        </button>
        
        <button
          type="button"
          onClick={() => {
            setActiveTab('join_group');
            setError(null);
          }}
          className={`shrink-0 flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'join_group'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Search size={14} />
          <span>Join Group</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">
          {error}
        </div>
      )}

      {activeTab === 'contact' ? (
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or @username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          {/* Search Result List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-xs text-[var(--text-muted)] gap-2">
                <Loader2 size={16} className="animate-spin" /> Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id || user._id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        @{user.primaryUsername || user.username}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectUser(user)}
                    className="py-1 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-xs font-bold cursor-pointer border-none transition-colors"
                  >
                    Chat
                  </button>
                </div>
              ))
            ) : search.trim() ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                No users found matching &ldquo;{search}&rdquo;
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                Type a registered friend&apos;s username above to find them.
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Group Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Team or Family"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              placeholder="What is this group about?"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!groupName.trim() || isSubmitting}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
            <span>Create Group</span>
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          alert('Join group by ID triggered: ' + groupName); // Since we don't have backend, mock it
          onClose();
        }} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Group Invite Code / ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GRP-XYZ-123"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!groupName.trim()}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            <Users size={14} />
            <span>Join Group</span>
          </button>
        </form>
      )}
    </Modal>
  );
};

export default NewChatModal;
