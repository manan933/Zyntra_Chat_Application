import React, { useState } from 'react';
import { Building2, KeyRound, Loader2, Plus } from 'lucide-react';
import Modal from '../ui/Modal';

export const WorkspaceModal = ({ isOpen, onClose, onCreateWorkspace, onJoinWorkspace }) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onCreateWorkspace(name.trim(), handle.trim());
      if (res?.success) {
        onClose();
        setName('');
        setHandle('');
      } else {
        setError(res?.error || 'Failed to create workspace');
      }
    } catch {
      setError('An error occurred');
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
        onClose();
        setCode('');
      } else {
        setError(res?.error || 'Invalid workspace invite code');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workplace Collaboration">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('create');
            setError(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Plus size={14} />
          <span>Create Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('join');
            setError(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'join'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <KeyRound size={14} />
          <span>Join with Code</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">
          {error}
        </div>
      )}

      {activeTab === 'create' ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
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
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Contextual Username (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. john.acme"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Your identity inside this specific workplace.
            </span>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
            <span>Create Organization</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Workspace Invite Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WS-849201"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] uppercase"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            <span>Join Workplace</span>
          </button>
        </form>
      )}
    </Modal>
  );
};

export default WorkspaceModal;
