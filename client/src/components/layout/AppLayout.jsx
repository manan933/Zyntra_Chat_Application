import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Home } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/useAuthStore';

/** Breakpoint: < 768px = mobile single-pane */
const MOBILE_BP = 768;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
};

/**
 * AppLayout — shell for all authenticated pages.
 *
 * Desktop (>= 768px):
 *   [Sidebar 300px fixed] | [Main flex-1]
 *   Both always visible, side-by-side.
 *
 * Mobile (< 768px):
 *   Either sidebar OR main visible — never both.
 *   isMobileChatOpen=true  → show main (chat), hide sidebar
 *   isMobileChatOpen=false → show sidebar (list), hide main
 */
const AppLayout = ({ children, sidebar, isMobileChatOpen = false }) => {
  const { user, logout, activeContext } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Visibility logic
  const showSidebar = !isMobile || !isMobileChatOpen;
  const showMain    = !isMobile || isMobileChatOpen;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ─── Sidebar ───────────────────────────────────────────── */}
      <aside
        style={{
          // Desktop: fixed 300px | Mobile: full-width when visible
          width:    isMobile ? '100%' : '300px',
          minWidth: isMobile ? undefined : '300px',
          maxWidth: isMobile ? undefined : '300px',
          flexShrink: 0,
          height: '100%',
          display: showSidebar ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          borderRight: isMobile ? 'none' : '1px solid var(--sidebar-border)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 20,
        }}
      >
        {/* Sidebar scrollable content area */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {sidebar}
        </div>

        {/* Bottom User Bar */}
        <div
          style={{
            padding: '10px 14px',
            paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '8px',
          }}
        >
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div style={{ flexShrink: 0 }}>
              <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" status="online" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--sidebar-text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: 'rgba(147, 197, 253, 0.8)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                @{activeContext?.username || user?.primaryUsername || 'user'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <BottomBtn onClick={() => navigate('/')} title="Home">
              <Home size={15} />
            </BottomBtn>
            <BottomBtn onClick={() => navigate('/settings/appearance')} title="Settings">
              <Settings size={15} />
            </BottomBtn>
            <BottomBtn onClick={handleLogout} title="Sign Out" danger>
              <LogOut size={15} />
            </BottomBtn>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,          // CRITICAL: prevents vertical flex blowout
          height: '100%',
          display: showMain ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundColor: 'var(--color-bg-primary)',
          overflow: 'hidden',
          position: 'relative',
          // On mobile full-width
          width: isMobile ? '100%' : undefined,
        }}
      >
        {children}
      </main>
    </div>
  );
};

const BottomBtn = ({ children, onClick, title, danger }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    title={title}
    style={{
      width: '30px',
      height: '30px',
      borderRadius: '8px',
      background: 'none',
      border: 'none',
      color: 'var(--sidebar-text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 150ms, color 150ms',
      flexShrink: 0,
    }}
    className={danger ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-white hover:bg-white/10'}
  >
    {children}
  </motion.button>
);

export default AppLayout;
