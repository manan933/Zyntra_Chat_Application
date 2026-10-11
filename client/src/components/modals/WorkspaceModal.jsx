import React, { useState, useEffect } from 'react';
import {
  Building2,
  KeyRound,
  Loader2,
  Plus,
  ArrowRight,
  Hash,
  Copy,
  Check,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Modal from '../ui/Modal';

export const WorkspaceModal = ({
  isOpen,
  onClose,
  workspaces = [],
  activeWorkspace = null,
  onSelectWorkspace,
  onCreateWorkspace,
  onJoinWorkspace,
  initialTab = 'select',
}) => {
  const [activeTab, setActiveTab] = useState('select'); // 'select' | 'join' | 'create'
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      if (workspaces.length > 0) {
        setActiveTab(initialTab || 'select');
      } else {
        setActiveTab('create');
      }
      setError(null);
      setName('');
      setHandle('');
      setCode('');
    }
  }, [isOpen, workspaces.length, initialTab]);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleChooseWorkspace = (ws) => {
    onSelectWorkspace?.(ws);
    onClose();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onCreateWorkspace(name.trim(), handle.trim());
      if (res?.success) {
        setName('');
        setHandle('');
        if (res.workspace) {
          onSelectWorkspace?.(res.workspace);
        }
        onClose();
      } else {
        setError(res?.error || 'Failed to create workspace');
      }
    } catch {
      setError('An error occurred while creating workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onJoinWorkspace(code.trim().toUpperCase());
      if (res?.success) {
        setCode('');
        if (res.workspace) {
          onSelectWorkspace?.(res.workspace);
        }
        onClose();
      } else {
        setError(res?.error || 'Invalid workspace invite code. Please check and try again.');
      }
    } catch {
      setError('An error occurred while joining workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workplace Collaboration"
      size="lg"
    >
      {/* Header explanation banner */}
      <div className="mb-4">
        <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
          Connect with your team or university to access organized channels, projects, and contextual chats.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl mb-4 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('select');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'select'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
          }`}
        >
          <Building2 size={14} />
          <span>Choose Workspace</span>
          <span className="ml-0.5 text-[10px] opacity-75 font-mono">
            {workspaces.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('join');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'join'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
          }`}
        >
          <KeyRound size={14} />
          <span>Join with Code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('create');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'create'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
          }`}
        >
          <Plus size={14} />
          <span>+ Create New</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── TAB 1: CHOOSE WORKSPACE ───────────────────────────────── */}
      {activeTab === 'select' && (
        <div className="flex flex-col gap-3">
          {workspaces.length === 0 ? (
            <div className="text-center py-8 px-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
                <Building2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                No Workspaces Joined Yet
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-4">
                Join a workspace using an invite code or create a new organization for your team or university.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('join')}
                  className="py-1.5 px-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Join with Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="py-1.5 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  + Create Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-0.5">
              {workspaces.map((ws) => {
                const isCurrent = activeWorkspace?.id === ws.id;
                const nodeNames = (ws.nodes || []).map((n) => `#${n.name}`).slice(0, 3).join(', ');
                const extraNodes = (ws.nodes?.length || 0) > 3 ? ` +${ws.nodes.length - 3} more` : '';

                return (
                  <div
                    key={ws.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)]'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--border-focus)]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                            {ws.name}
                          </span>
                          {ws.joinCode && (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, ws.joinCode, ws.id)}
                              className="px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border)] text-[10px] font-mono text-[var(--accent)] hover:border-[var(--accent)] cursor-pointer flex items-center gap-1"
                              title="Click to copy invite code"
                            >
                              <span>{ws.joinCode}</span>
                              {copiedCode === ws.id ? (
                                <Check size={10} className="text-emerald-500" />
                              ) : (
                                <Copy size={10} className="opacity-70" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-2 flex-wrap">
                          <span>{ws.membersCount || ws.memberCount || 1} members</span>
                          <span>•</span>
                          <span className="font-mono truncate">
                            {nodeNames ? `${nodeNames}${extraNodes}` : '1 channel'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleChooseWorkspace(ws)}
                        className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-xs flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                        }`}
                      >
                        {isCurrent ? <CheckCircle2 size={13} /> : <ArrowRight size={13} />}
                        <span>{isCurrent ? 'Current Workspace' : 'Enter Workspace'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: JOIN WITH CODE ─────────────────────────────────── */}
      {activeTab === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Workspace Invite Code *
            </label>
            <div className="relative flex items-center">
              <KeyRound size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. WS-ABDYU or ZYN-GIET-0001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase"
                autoFocus
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block">
              Ask your team administrator or classmate for their 6-12 character workspace invite code.
            </span>
          </div>

          <button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            <span>Join Workplace</span>
          </button>
        </form>
      )}

      {/* ── TAB 3: CREATE WORKSPACE ───────────────────────────────── */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Organization / Team Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp or University Tech Lab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Contextual Username (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. john.acme"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Your identity inside this specific workplace.
            </span>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
            <span>Create Organization & Channels</span>
          </button>
        </form>
      )}

      {/* Bottom Dismiss / Skip Button */}
      <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-muted)]">
          Want to chat directly with friends?
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer py-1 px-2"
        >
          Continue to Direct Chats →
        </button>
      </div>
    </Modal>
  );
};

export default WorkspaceModal;
