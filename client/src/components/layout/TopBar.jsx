import React from 'react';
import { Search, Bell, ArrowLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import WorkspaceBreadcrumb from '../workspace/WorkspaceBreadcrumb';
import useAuthStore from '../../store/useAuthStore';

const TopBar = ({ breadcrumbPath, onNavigateBreadcrumb, title, onBackClick }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <div
      className="px-3 sm:px-6 py-2 sm:py-2.5"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-bg-primary)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        flexShrink: 0,
        userSelect: 'none',
        zIndex: 10,
        minHeight: '56px',
      }}
    >
      <div className="flex items-center min-w-0 flex-1 pr-3 sm:pr-5 mr-2">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="lg:hidden p-1.5 -ml-1 mr-2 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
            title="Back to channels"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {breadcrumbPath && breadcrumbPath.length > 0 ? (
          <WorkspaceBreadcrumb
            path={breadcrumbPath}
            onNavigate={onNavigateBreadcrumb}
          />
        ) : (
          title && (
            <h1 
              style={{ color: 'var(--color-text-primary)' }}
              className="text-sm font-bold truncate tracking-tight m-0"
            >
              {title}
            </h1>
          )
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {}}
          style={{ color: 'var(--color-text-secondary)' }}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          title="Search workspace"
        >
          <Search size={16} />
        </button>
        <button
          onClick={() => {}}
          style={{ color: 'var(--color-text-secondary)' }}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell size={16} />
          <span 
            style={{ backgroundColor: 'var(--color-accent)', ringColor: 'var(--color-bg-primary)' }}
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2" 
          />
        </button>
        <div 
          style={{ borderColor: 'var(--color-border-primary)' }}
          className="pl-1 border-l ml-1"
        >
          <Avatar name={user?.name || 'Soumya'} src={user?.avatar} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
