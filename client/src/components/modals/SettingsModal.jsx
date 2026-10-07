import React, { useState, useRef } from 'react';
import { User, Palette, Upload, Loader2, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import useThemeStore from '../../store/themeStore';
import api from '../../api/api';

export const SettingsModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'appearance'
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);
  const { theme, setTheme } = useThemeStore();

  const handleAvatarFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await api.upload.file(file);
      if (res.ok && res.data?.url) {
        setAvatarUrl(res.data.url);
      } else {
        setErrorMsg('Failed to upload picture');
      }
    } catch {
      setErrorMsg('Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await onUpdateProfile({
      name: name.trim(),
      avatar: avatarUrl.trim() || null,
    });

    setIsSaving(false);
    if (res?.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } else {
      setErrorMsg(res?.error || 'Failed to update profile');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zyntra Settings">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <User size={14} />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'appearance'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Palette size={14} />
          <span>Appearance</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-3 flex items-center gap-2">
          <Check size={14} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">
          {errorMsg}
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]);
                e.target.value = '';
              }}
            />

            <Avatar name={name || user?.name} src={avatarUrl} size="lg" />

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="py-1 px-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                <span>Upload Photo</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] text-[var(--danger)] hover:underline text-left bg-transparent border-none cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Primary Username (Permanent)
            </label>
            <input
              type="text"
              disabled
              value={`@${user?.primaryUsername || 'username'}`}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text-muted)] cursor-not-allowed opacity-75"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] cursor-not-allowed opacity-75"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 mt-1 flex items-center justify-center gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
            <span>Save Changes</span>
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
            Color Scheme
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Theme Card */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-blue-950/30 border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="w-full h-16 rounded-lg bg-[#0a0d14] border border-white/10 p-2 flex flex-col justify-between mb-2">
                <div className="w-12 h-2 rounded-full bg-blue-500" />
                <div className="w-20 h-2 rounded-full bg-white/20 self-end" />
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Dark Obsidian</div>
              <div className="text-[10px] text-[var(--text-muted)]">Default contrast dark theme</div>
            </button>

            {/* Light Theme Card */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-blue-50 border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="w-full h-16 rounded-lg bg-white border border-slate-200 p-2 flex flex-col justify-between mb-2">
                <div className="w-12 h-2 rounded-full bg-blue-600" />
                <div className="w-20 h-2 rounded-full bg-slate-200 self-end" />
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Clean Light</div>
              <div className="text-[10px] text-[var(--text-muted)]">Bright airy daylight theme</div>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SettingsModal;
