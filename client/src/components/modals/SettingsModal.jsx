import React, { useState, useRef } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Building2,
  Lock,
  Upload,
  Loader2,
  Check,
  Copy,
  Volume2,
  VolumeX,
  KeyRound,
  Trash2,
  Laptop,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import useThemeStore from '../../store/themeStore';
import useChatStore from '../../store/chatStore';
import api from '../../api/api';
import {
  playSentSound,
  playReceivedSound,
  playReactionSound,
} from '../../utils/zyntraSound';

const ACCENT_OPTIONS = [
  { id: 'blue', name: 'Zyntra Blue', color: '#3b82f6' },
  { id: 'purple', name: 'Cyber Purple', color: '#8b5cf6' },
  { id: 'emerald', name: 'Emerald Mint', color: '#10b981' },
  { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
  { id: 'rose', name: 'Rose Quartz', color: '#f43f5e' },
];

const WALLPAPER_OPTIONS = [
  { id: 'default', name: 'Solid Minimal', preview: 'bg-[var(--bg-primary)]' },
  { id: 'grid', name: 'Grid Matrix', preview: 'wallpaper-grid' },
  { id: 'dots', name: 'Subtle Dots', preview: 'wallpaper-dots' },
  { id: 'aurora', name: 'Midnight Aurora', preview: 'wallpaper-aurora' },
];

const STATUS_PRESETS = [
  '💻 Deep in Code',
  '☕ Coffee break',
  '🚀 Deploying updates',
  '🎧 Focused / DND',
  '✨ Available to chat',
];

export const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onOpenWorkspaceModal,
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || 'Building contextual communication on Zyntra.');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2834');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Privacy & Notifications local state
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlinePresence, setOnlinePresence] = useState('everyone');
  const [desktopPush, setDesktopPush] = useState(true);
  const [dndMode, setDndMode] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  const fileInputRef = useRef(null);

  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    wallpaper,
    setWallpaper,
    soundEnabled,
    setSoundEnabled,
    fontScale,
    setFontScale,
  } = useThemeStore();

  const { workspaces } = useChatStore();

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
      bio: bio.trim(),
      phone: phone.trim(),
    });

    setIsSaving(false);
    if (res?.success) {
      setSuccessMsg('Profile changes saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res?.error || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordMsg('Password changed successfully across all sessions!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(null), 3000);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zyntra Settings" size="lg">
      <div className="flex flex-col md:flex-row gap-5 min-h-[460px]">
        {/* ── Left Sidebar Navigation ────────────────────────────────── */}
        <div className="w-full md:w-48 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-[var(--border)] pr-0 md:pr-4">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & E2EE', icon: Shield },
            { id: 'workplaces', label: 'Workplaces', icon: Building2 },
            { id: 'account', label: 'Security & Login', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSuccessMsg(null);
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none text-left shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] bg-transparent'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right Content Panel ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between overflow-y-auto custom-scrollbar pr-1">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs mb-4 flex items-center gap-2">
              <Check size={14} /> <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-4">
              {errorMsg}
            </div>
          )}

          {/* ──────────────── TAB 1: PROFILE ──────────────────────────── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Avatar Preview & Upload */}
              <div className="flex items-center gap-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl">
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

                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="py-1 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 border-none shadow-xs"
                    >
                      {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>Upload Picture</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="py-1 px-2.5 text-xs text-[var(--danger)] hover:bg-red-500/10 rounded-xl bg-transparent border-none cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    JPG, PNG or GIF up to 5MB. Visible across all connected workplaces.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Primary Username
                  </label>
                  <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2">
                    <span className="text-xs font-mono text-[var(--text-muted)] flex-1 truncate">
                      @{user?.primaryUsername || 'soumya'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`@${user?.primaryUsername || 'soumya'}`, 'username')}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
                      title="Copy handle"
                    >
                      {copiedCode === 'username' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                  Bio / Status Note
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you up to?"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] mb-1.5"
                />
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBio(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'soumya@zyntra.com'}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] opacity-75 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-2 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Save Profile Changes</span>
              </button>
            </form>
          )}

          {/* ──────────────── TAB 2: APPEARANCE ───────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                  Theme Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-950/20 border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="w-full h-14 rounded-xl bg-[#0a0d14] border border-white/10 p-2 flex flex-col justify-between mb-2">
                      <div className="w-12 h-2 rounded-full bg-blue-500" />
                      <div className="w-20 h-2 rounded-full bg-white/20 self-end" />
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">Dark Obsidian</div>
                    <div className="text-[10px] text-[var(--text-muted)]">OLED-optimized sleek dark interface</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-blue-50 border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="w-full h-14 rounded-xl bg-white border border-slate-200 p-2 flex flex-col justify-between mb-2">
                      <div className="w-12 h-2 rounded-full bg-blue-600" />
                      <div className="w-20 h-2 rounded-full bg-slate-200 self-end" />
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">Clean Light</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Crisp, airy daytime workspace</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                  Accent Color & Sent Bubbles
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAccentColor(opt.id)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        accentColor === opt.id
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: opt.color }} />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                  Chat Feed Wallpaper
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WALLPAPER_OPTIONS.map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => setWallpaper(wp.id)}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        wallpaper === wp.id
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <div className={`w-full h-10 rounded-lg border border-[var(--border)] mb-1.5 ${wp.preview}`} />
                      <span className="text-[11px] font-semibold text-[var(--text-primary)]">{wp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                  Interface Typography Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact (90%)' },
                    { id: 'normal', label: 'Default (100%)' },
                    { id: 'comfortable', label: 'Comfortable (108%)' },
                  ].map((scale) => (
                    <button
                      key={scale.id}
                      type="button"
                      onClick={() => setFontScale(scale.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        fontScale === scale.id
                          ? 'bg-[var(--accent)] text-white border-transparent'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: NOTIFICATIONS ────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Desktop Push Alerts</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Receive background browser notifications for direct messages and mentions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={desktopPush}
                  onChange={(e) => setDesktopPush(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Synthesized Audio Effects</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Web Audio
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Play gentle synthesized audio chimes for incoming messages and reactions
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playReceivedSound()}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 size={11} /> Test Sound
                  </button>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Do Not Disturb (DND)</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Mute all audio chimes and badge counts during focus sessions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dndMode}
                  onChange={(e) => setDndMode(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => playSentSound()}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Test Sent Chime
                </button>
                <button
                  type="button"
                  onClick={() => playReactionSound()}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Test Reaction Pop
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: PRIVACY & E2EE ────────────────────── */}
          {activeTab === 'privacy' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>End-to-End Encryption Active (Curve25519)</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed m-0 mb-3">
                  Messages, media attachments, and room vaults are encrypted on your local client before hitting the socket network.
                </p>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
                  <div className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                    Fingerprint: 8F2A-4C19-E08B-9321-7D4F-ZYN2
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('8F2A-4C19-E08B-9321-7D4F-ZYN2', 'fingerprint')}
                    className="text-[10px] font-bold text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {copiedCode === 'fingerprint' ? 'Copied!' : 'Copy Key'}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Read Receipts (Blue Ticks)</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Let others see when you have read their messages
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Last Seen / Online Indicator</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Control who can view your active status pip
                  </div>
                </div>
                <select
                  value={onlinePresence}
                  onChange={(e) => setOnlinePresence(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">Contacts only</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--text-primary)] mb-1">Blocked Contacts</div>
                <div className="text-[11px] text-[var(--text-muted)] mb-2">
                  You currently have 0 blocked users.
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 5: WORKPLACES ───────────────────────── */}
          {activeTab === 'workplaces' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Active Workplaces</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Teams and universities you are currently participating in
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWorkspaceModal?.();
                  }}
                  className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  + Add Workplace
                </button>
              </div>

              <div className="space-y-2.5">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                        {ws.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>{ws.name}</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-bold">
                            {ws.isOwner ? 'Owner' : 'Member'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">
                          {ws.membersCount || 45} members · {ws.nodes?.length || 3} channels
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(ws.joinCode || 'WS-ZYNTRA-01', ws.id)}
                        className="px-2 py-1 bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-[10px] font-semibold cursor-pointer flex items-center gap-1"
                        title="Copy Invite Code"
                      >
                        {copiedCode === ws.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>Code</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 6: ACCOUNT & SECURITY ───────────────── */}
          {activeTab === 'account' && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handlePasswordSubmit} className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col gap-3">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <KeyRound size={14} className="text-blue-500" />
                  <span>Update Account Password</span>
                </div>

                {passwordMsg && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    {passwordMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="self-end py-1.5 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold rounded-xl border-none cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </form>

              {/* Active Sessions */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--text-primary)] mb-2.5">Active Devices & Sessions</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                      <Laptop size={14} className="text-blue-500" />
                      <span>Windows 11 · Chrome (Current Session)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">Active Now</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} />
                      <span>iPhone 15 Pro · Safari Mobile</span>
                    </div>
                    <span className="text-[10px]">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-400">Danger Zone</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Permanently delete your account and revoke cryptographic keys
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Account deletion requested. Security review confirmation email dispatched.')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
