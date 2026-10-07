import React from 'react';
import { getFileUrl } from '../../api/api';

const gradients = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
];

const getGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const getInitials = (name = '') => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const sizes = {
  xs: { box: 'w-6 h-6 text-[10px]', dot: 'w-2 h-2 ring-1' },
  sm: { box: 'w-8 h-8 text-[12px]', dot: 'w-2.5 h-2.5 ring-1.5' },
  md: { box: 'w-10 h-10 text-[14px]', dot: 'w-3 h-3 ring-2' },
  lg: { box: 'w-12 h-12 text-[16px]', dot: 'w-3.5 h-3.5 ring-2' },
  xl: { box: 'w-16 h-16 text-[20px]', dot: 'w-4 h-4 ring-2' },
};

export const Avatar = ({ src, name = 'User', size = 'md', status = null, className = '' }) => {
  const currentSize = sizes[size] || sizes.md;
  const imageUrl = src ? getFileUrl(src) : null;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${currentSize.box} rounded-full object-cover shadow-sm`}
          onError={(e) => {
            // Graceful fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          style={{ background: getGradient(name) }}
          className={`${currentSize.box} rounded-full flex items-center justify-center text-white font-bold select-none shadow-sm`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-[var(--bg-primary)] ${currentSize.dot} ${
            status === 'online' ? 'bg-[var(--online)]' : 'bg-slate-400'
          }`}
          title={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
