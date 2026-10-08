import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, MessageSquare, Building2, Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!name.trim() || !email.trim() || !password || !username.trim()) return;
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        primaryUsername: username.trim(),
      });
    } else {
      if (!email.trim() || !password) return;
      await login(email.trim(), password);
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden select-none">
      {/* ── Left Showcase Panel (Desktop / Tablet) ─────────────────── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[48%] xl:w-[50%] h-full flex-col justify-between p-8 lg:p-12 xl:p-16 bg-[var(--bg-secondary)] border-r border-[var(--border)] relative overflow-hidden shrink-0">
        {/* Ambient background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 border border-white/15">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  Zyntra
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold tracking-wide uppercase border border-blue-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Unified Contextual Communication
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              Communication that follows where you belong.
            </h2>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed">
              Connect effortlessly across personal circles and high-velocity workplace teams in one responsive, secure hub.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="relative z-10 my-8 space-y-3.5 max-w-lg">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-primary)]/70 border border-[var(--border)] backdrop-blur-sm transition-all hover:border-[var(--border-focus)]/50">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">
                Secure & Private
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
                Authenticated channels ensure private direct messages and attachments stay confidential.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-primary)]/70 border border-[var(--border)] backdrop-blur-sm transition-all hover:border-[var(--border-focus)]/50">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">
                Real-Time Messaging
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
                Low-latency WebSocket sync with live typing feedback, instant emoji reactions, and receipt indicators.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-primary)]/70 border border-[var(--border)] backdrop-blur-sm transition-all hover:border-[var(--border-focus)]/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">
                Workplace & Direct Contexts
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
                Organize projects into structured channels or enjoy friction-free direct conversations in a single unified view.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Identity Badge */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              SM
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>Soumya Mohanty</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                @soumya · Lead Architect
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 text-[11px] font-bold">
            Demo Ready
          </span>
        </div>
      </div>

      {/* ── Right Authentication Panel (Responsive Full Width/Height) ─ */}
      <div className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-8 sm:py-12 relative">
        {/* Subtle ambient light on auth side */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[460px] lg:max-w-[480px] my-auto flex flex-col">
          {/* Mobile Brand Header */}
          <div className="md:hidden flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-2.5">
              Z
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">
              Zyntra
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Communication that follows where you belong.
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] m-0">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {isRegister
                ? 'Join Zyntra to communicate seamlessly across direct chats and channels.'
                : 'Enter your credentials to access your conversations and team workspaces.'}
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl mb-6 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearError();
                setName(''); setEmail(''); setPassword(''); setUsername('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-none ${
                !isRegister
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearError();
                setName(''); setEmail(''); setPassword(''); setUsername('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-none ${
                isRegister
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Unique Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 px-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm sm:text-base font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                placeholder="name@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-4 pr-11 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer border-none bg-transparent flex items-center justify-center p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer border-none shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In to Zyntra'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>



          {/* Security & Privacy Reassurance */}
          <div className="mt-8 pt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] text-center">
            <Lock size={13} className="text-emerald-500 shrink-0" />
            <span>Secure authentication · Session tokens securely isolated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
