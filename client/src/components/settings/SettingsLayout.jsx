import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navTabs = [
  { to: '/settings/appearance', label: 'Appearance & personalization' },
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/account', label: 'Account' },
  { to: '/settings/privacy', label: 'Privacy & Security' },
  { to: '/settings/notifications', label: 'Notifications' },
  { to: '/settings/workspace', label: 'Workspace Settings' },
];

const SettingsLayout = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const currentTab = navTabs.find((t) => t.to === location.pathname) || navTabs[0];

  return (
    <div
      className="p-2 sm:p-4"
      style={{
        minHeight: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Outer Card Container */}
      <div
        className="w-full max-w-[1060px] mx-auto p-4 sm:p-6"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '20px',
          boxShadow: 'var(--elevation-3)',
          border: '1px solid var(--color-border-primary)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header Bar matching media_1789559080552.png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            userSelect: 'none'
          }}
        >
          {/* Left Title & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <span
              onClick={() => navigate('/')}
              title="Go to Zyntra Hub"
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.025em',
                cursor: 'pointer'
              }}
            >
              Zyntra
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
              Settings
            </span>

            {/* Dropdown trigger for section */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: dropdownOpen ? 'var(--color-bg-hover)' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
              >
                <span>{currentTab.label}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>▾</span>
              </button>

              {/* Section dropdown menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '12px',
                    boxShadow: 'var(--elevation-2)',
                    minWidth: '220px',
                    zIndex: 50,
                    padding: '6px'
                  }}
                >
                  {navTabs.map((tab) => (
                    <div
                      key={tab.to}
                      onClick={() => {
                        navigate(tab.to);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: tab.to === location.pathname ? 700 : 500,
                        color: tab.to === location.pathname ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        backgroundColor: tab.to === location.pathname ? 'rgba(var(--color-accent-rgb), 0.1)' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right User Avatar */}
          <div
            onClick={() => navigate('/')}
            title="Return to Hub"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',
              boxShadow: 'var(--elevation-1)'
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              'S'
            )}
          </div>
        </div>

        {/* The Crisp Blue Bordered Container */}
        <div
          className="p-3 sm:p-6"
          style={{
            border: '2px solid var(--color-accent)',
            borderRadius: '14px',
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
