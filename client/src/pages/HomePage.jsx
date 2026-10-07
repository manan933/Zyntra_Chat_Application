import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Plus,
  Shield,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
  AlertTriangle,
  Crown,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Users,
  Compass
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import ZyntraOpeningAnimation from '../components/animation/ZyntraOpeningAnimation';

// Motion Presets
const springTransition = { type: 'spring', stiffness: 380, damping: 28 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition
  }
};

const cardHover = {
  rest: { y: 0, transition: { duration: 0.2 } },
  hover: { y: -3, transition: { duration: 0.2 } }
};

const HomePage = () => {
  const { user, setActiveContext, addContext, logout } = useAuthStore();
  const {
    workspaces: workspaceList,
    createWorkspace,
    leaveWorkspace,
    joinGroupByCode,
    setActiveWorkspace
  } = useWorkspaceStore();
  const navigate = useNavigate();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [leaveConfirmWs, setLeaveConfirmWs] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newContextUsername, setNewContextUsername] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  // Opening Animation State
  const [showOpeningAnim, setShowOpeningAnim] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('splash') === '1') return true;
    if (params.get('splash') === 'done') return false;
    return false;
  });

  useEffect(() => {
    document.title = 'Zyntra — Context Navigator';
    if (window.location.search.includes('create=1')) {
      setCreateModalOpen(true);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto-generate contextual username when typing workspace name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setNewWorkspaceName(val);
    const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    const primary = user?.primaryUsername || 'user';
    setNewContextUsername(cleanSlug ? `${primary}.${cleanSlug}` : '');
  };

  const handleSelectContext = (contextType, wsId = null) => {
    const primary = user?.primaryUsername || 'user';
    if (contextType === 'personal') {
      const personalCtx = user?.contexts?.find((c) => c.type === 'personal');
      setActiveContext(
        personalCtx || {
          id: 'ctx-personal',
          type: 'personal',
          name: 'Personal',
          username: `${primary}.personal`
        }
      );
      navigate('/personal');
    } else if (wsId) {
      const ws = workspaceList.find((w) => w.id === wsId);
      if (ws) {
        setActiveWorkspace(ws);
        const wsCtx = {
          id: `ctx-${ws.id}`,
          type: 'workplace',
          name: ws.name,
          username: ws.contextualUsername || `${primary}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        };
        addContext(wsCtx);
        setActiveContext(wsCtx);
        navigate(`/workspace/${ws.id}`);
      }
    }
  };

  // Create workspace
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const newWs = createWorkspace({
      name: newWorkspaceName.trim(),
      contextualUsername: newContextUsername.trim(),
    });

    if (newWs) {
      const wsCtx = {
        id: `ctx-${newWs.id}`,
        type: 'workplace',
        name: newWs.name,
        username: newWs.contextualUsername
      };
      addContext(wsCtx);
      setNewWorkspaceName('');
      setNewContextUsername('');
      setCreateModalOpen(false);
      handleSelectContext('workplace', newWs.id);
    }
  };

  // Join workspace via code
  const handleJoinWorkspace = (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCodeInput.trim()) return;

    const res = joinGroupByCode(joinCodeInput.trim());
    if (res.success) {
      setJoinCodeInput('');
      setJoinModalOpen(false);
      navigate(`/workspace/${res.node.parentId || 'ws-giet'}`);
    } else {
      setJoinError(res.error || 'Invalid join code. Please try again.');
    }
  };

  // Confirm leave workspace
  const handleConfirmLeaveWorkspace = () => {
    if (!leaveConfirmWs) return;
    leaveWorkspace(leaveConfirmWs.id);
    setLeaveConfirmWs(null);
  };

  const createdWorkspaces = workspaceList.filter((ws) => ws.isOwner);
  const joinedWorkspaces = workspaceList.filter((ws) => !ws.isOwner);

  return (
    <div
      style={{
        minHeight: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: 'var(--color-text-primary)'
      }}
      className="custom-scrollbar"
    >
      {/* ── TOP NAVIGATION BAR (Sleek SaaS Navbar) ──────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border-primary)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        className="px-4 sm:px-8 py-3"
      >
        <div className="max-w-[1180px] mx-auto flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--elevation-1)',
                  overflow: 'hidden',
                  padding: '3px'
                }}
              >
                <img
                  src="/zyntra-logo.png"
                  alt="Zyntra"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.025em'
                }}
              >
                Zyntra
              </span>
            </div>

            <div
              style={{
                width: '1px',
                height: '16px',
                backgroundColor: 'var(--color-border-primary)',
                margin: '0 4px'
              }}
              className="hidden sm:block"
            />

            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-primary)'
              }}
              className="hidden sm:inline-block"
            >
              Spaces & Hub
            </span>
          </div>

          {/* Right: Actions & User Avatar Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Join with Code Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setJoinModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '9px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-primary)',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              className="hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <KeyRound size={14} />
              <span className="hidden sm:inline">Join by Code</span>
            </motion.button>

            {/* Primary Create Workplace Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9px',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(var(--color-accent-rgb), 0.28)',
                transition: 'opacity 150ms ease'
              }}
              className="hover:opacity-95"
            >
              <Plus size={15} />
              <span>New Workplace</span>
            </motion.button>

            {/* User Dropdown Trigger */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: '10px',
                  border: userMenuOpen ? '1px solid var(--color-accent)' : '1px solid var(--color-border-primary)',
                  backgroundColor: userMenuOpen ? 'var(--color-bg-hover)' : 'var(--color-bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                className="hover:bg-[var(--color-bg-hover)]"
              >
                <Avatar
                  name={user?.name || 'User'}
                  src={user?.avatar}
                  size="sm"
                  status="online"
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    maxWidth: '100px'
                  }}
                  className="hidden md:inline-block truncate"
                >
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--color-text-tertiary)',
                    transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 200ms ease'
                  }}
                />
              </motion.button>

              {/* Polished Menu Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '240px',
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: '14px',
                      boxShadow: 'var(--elevation-3)',
                      padding: '6px',
                      zIndex: 50,
                      overflow: 'hidden'
                    }}
                  >
                    {/* User summary header */}
                    <div
                      style={{
                        padding: '10px 12px 10px 12px',
                        borderBottom: '1px solid var(--color-border-primary)',
                        marginBottom: '4px'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)'
                        }}
                        className="truncate"
                      >
                        {user?.name || 'Zyntra Member'}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: 'var(--color-accent)',
                          marginTop: '2px'
                        }}
                      >
                        @{user?.primaryUsername || 'user'}
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSelectContext('personal');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-text-primary)',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <MessageSquare size={16} className="text-[var(--color-text-secondary)]" />
                        <span>Personal Space</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings/appearance');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-text-primary)',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <Settings size={16} className="text-[var(--color-text-secondary)]" />
                        <span>Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowOpeningAnim(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-text-primary)',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                        <span>Replay Intro</span>
                      </button>

                      <div
                        style={{
                          height: '1px',
                          backgroundColor: 'var(--color-border-primary)',
                          margin: '4px 0'
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          color: '#ef4444',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CANVAS ─────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* ── REFINED USER IDENTITY HEADER ─────────────────────── */}
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '20px',
              border: '1px solid var(--color-border-primary)',
              boxShadow: 'var(--elevation-2)',
              overflow: 'hidden',
              position: 'relative'
            }}
            className="p-6 sm:p-8"
          >
            {/* Ambient accent banner */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--color-accent), #8b5cf6, #3b82f6)'
              }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Identity details */}
              <div className="flex items-center gap-5">
                <Avatar
                  name={user?.name || 'User'}
                  src={user?.avatar}
                  size="xl"
                  status="online"
                />

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.025em',
                        margin: 0
                      }}
                    >
                      {user?.name || 'Soumya Mohanty'}
                    </h1>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        backgroundColor: 'rgba(var(--color-accent-rgb), 0.08)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      @{user?.primaryUsername || 'soumya'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>·</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      Permanent Single Identity
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageSquare size={16} className="text-[var(--color-accent)]" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>SPACE</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Personal</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Building2 size={16} style={{ color: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>WORKPLACES</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {workspaceList.length} Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── SECTION 1: PERSONAL SPACE (Featured Card) ──────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0
                  }}
                >
                  Personal Direct Messaging
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-tertiary)',
                    margin: '2px 0 0'
                  }}
                >
                  Private chats and casual groups with your personal contacts
                </p>
              </div>
            </div>

            <motion.div
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              onClick={() => handleSelectContext('personal')}
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '18px',
                padding: '22px 26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: 'var(--elevation-2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 200ms ease, box-shadow 200ms ease'
              }}
              className="hover:border-[var(--color-accent)] group"
            >
              <div className="flex items-center gap-4.5 min-w-0">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <MessageSquare size={22} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Personal Space & Direct Chats
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(var(--color-accent-rgb), 0.08)',
                        color: 'var(--color-accent)'
                      }}
                    >
                      Default
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px'
                    }}
                    className="truncate"
                  >
                    Context Handle:{' '}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        color: 'var(--color-accent)',
                        fontWeight: 600
                      }}
                    >
                      @{user?.primaryUsername || 'soumya'}.personal
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  flexShrink: 0
                }}
                className="group-hover:translate-x-1 transition-transform"
              >
                <span>Open Space</span>
                <ArrowRight size={16} />
              </div>
            </motion.div>
          </motion.div>

          {/* ── SECTION 2: ORGANIZATIONS YOU CREATED ───────────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    Organizations You Created
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-secondary)',
                      padding: '1px 7px',
                      borderRadius: '999px'
                    }}
                  >
                    {createdWorkspaces.length}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-tertiary)',
                    margin: '2px 0 0'
                  }}
                >
                  Workspaces where you are the administrator
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setCreateModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(var(--color-accent-rgb), 0.08)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(var(--color-accent-rgb), 0.2)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> New
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdWorkspaces.map((ws) => (
                <motion.div
                  key={ws.id}
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                  onClick={() => handleSelectContext('workplace', ws.id)}
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    minHeight: '170px',
                    boxShadow: 'var(--elevation-1)',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease'
                  }}
                  className="hover:border-[var(--color-accent)] group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '11px',
                          backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                          color: 'var(--color-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Building2 size={20} />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Crown size={12} /> Owner
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        margin: '0 0 4px'
                      }}
                      className="truncate"
                    >
                      {ws.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-tertiary)',
                        margin: 0,
                        lineHeight: 1.4
                      }}
                      className="line-clamp-2"
                    >
                      {ws.description || 'Organizational structure & departmental channels.'}
                    </p>
                  </div>

                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--color-border-primary)',
                      marginTop: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: 'var(--color-accent)',
                        fontWeight: 600
                      }}
                      className="truncate"
                    >
                      @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-accent)'
                      }}
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <span>Enter</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Modern Create Organization Tile */}
              <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                onClick={() => setCreateModalOpen(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1.5px dashed var(--color-border-secondary)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '170px',
                  transition: 'all 150ms ease'
                }}
                className="hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-primary)] group"
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    boxShadow: 'var(--elevation-1)'
                  }}
                  className="group-hover:scale-105 transition-transform"
                >
                  <Plus size={20} />
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Create Organization
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-tertiary)',
                    marginTop: '2px'
                  }}
                >
                  Setup team or company hierarchy
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── SECTION 3: ORGANIZATIONS YOU JOINED ─────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    Organizations You Joined
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-secondary)',
                      padding: '1px 7px',
                      borderRadius: '999px'
                    }}
                  >
                    {joinedWorkspaces.length}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-tertiary)',
                    margin: '2px 0 0'
                  }}
                >
                  Workspaces you participate in as a member
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setJoinModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <KeyRound size={13} /> Enter Code
              </motion.button>
            </div>

            {joinedWorkspaces.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderRadius: '16px',
                  border: '1px dashed var(--color-border-primary)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  No joined organizations yet
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-tertiary)',
                    maxWidth: '440px',
                    margin: '6px auto 16px'
                  }}
                >
                  Enter an organization invitation code from your company or institution to participate.
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setJoinModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)',
                    color: 'var(--color-accent)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={14} /> Join by Code
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {joinedWorkspaces.map((ws) => (
                  <motion.div
                    key={ws.id}
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '170px',
                      boxShadow: 'var(--elevation-1)'
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '11px',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Building2 size={20} />
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            color: '#7c3aed',
                            border: '1px solid rgba(124, 58, 237, 0.2)'
                          }}
                        >
                          Member
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          margin: '0 0 4px'
                        }}
                        className="truncate"
                      >
                        {ws.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-tertiary)',
                          margin: 0,
                          lineHeight: 1.4
                        }}
                        className="line-clamp-2"
                      >
                        Created by {ws.creatorName || 'Administrator'} · {ws.memberCount || 1200} members
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '14px',
                        borderTop: '1px solid var(--color-border-primary)',
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 600
                        }}
                        className="truncate"
                      >
                        @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeaveConfirmWs(ws);
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          className="hover:bg-red-500/10"
                        >
                          Leave
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectContext('workplace', ws.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-accent)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Open <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* ── MODAL: CREATE WORKPLACE ──────────────────────────────── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Workplace"
        size="md"
      >
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '6px'
              }}
            >
              Workplace Name
            </label>
            <input
              placeholder="e.g. Acme Innovations or Stanford University"
              value={newWorkspaceName}
              onChange={handleNameChange}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              className="focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '6px'
              }}
            >
              Contextual Username in this Organization
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-tertiary)', fontSize: '13px', fontWeight: 600 }}>
                @
              </span>
              <input
                placeholder="soumya.acme"
                value={newContextUsername}
                onChange={(e) => setNewContextUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 28px',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
                className="focus:border-[var(--color-accent)]"
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '6px 0 0 0' }}>
              Members of this workplace will see this identity while your permanent account remains @{user?.primaryUsername || 'soumya'}.
            </p>
          </div>

          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-primary)',
                backgroundColor: 'transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newWorkspaceName.trim()}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: newWorkspaceName.trim() ? 'pointer' : 'not-allowed',
                opacity: newWorkspaceName.trim() ? 1 : 0.5
              }}
            >
              Create Workplace
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: JOIN VIA CODE ─────────────────────────────────── */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setJoinError('');
        }}
        title="Join Workspace"
        size="sm"
      >
        <form onSubmit={handleJoinWorkspace} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Join Code
            </label>
            <input
              placeholder="e.g. ZYN-ABC-0001"
              value={joinCodeInput}
              onChange={(e) => {
                setJoinCodeInput(e.target.value.toUpperCase());
                setJoinError('');
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 700,
                boxSizing: 'border-box',
                color: 'var(--color-text-primary)'
              }}
              className="focus:border-[var(--color-accent)]"
            />
            {joinError && (
              <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>
                {joinError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setJoinModalOpen(false)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-primary)',
                backgroundColor: 'transparent',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Join
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: CONFIRM LEAVE WORKSPACE ───────────────────────── */}
      {leaveConfirmWs && (
        <Modal
          isOpen={true}
          onClose={() => setLeaveConfirmWs(null)}
          title={`Leave ${leaveConfirmWs.name}?`}
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Confirm Workspace Departure
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to leave <strong>{leaveConfirmWs.name}</strong>? You can rejoin at any time using a valid join code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setLeaveConfirmWs(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-primary)',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveWorkspace}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Leave Workspace
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Opening Intro Animation */}
      {showOpeningAnim && (
        <ZyntraOpeningAnimation
          mode="fullscreen"
          autoplay={true}
          enableSound={true}
          onComplete={() => setShowOpeningAnim(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
