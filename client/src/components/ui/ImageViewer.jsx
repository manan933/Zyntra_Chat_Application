import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { getFileUrl } from '../../api/api';

export const ImageViewer = ({ isOpen, onClose, src, title }) => {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setZoomed(false);
      return;
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const fullUrl = getFileUrl(src);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = title || 'photo.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Top Floating Bar */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none"
      >
        <span className="text-white/90 text-xs sm:text-sm font-semibold truncate max-w-[60%] bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          {title || 'Image Preview'}
        </span>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(!zoomed);
            }}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white/90 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={zoomed ? 'Zoom Out' : 'Zoom In'}
          >
            {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white/90 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-black/50 hover:bg-red-500/80 text-white/90 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Image Preview Container */}
      <div
        className="max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={fullUrl}
          alt={title || 'Preview'}
          onClick={() => setZoomed(!zoomed)}
          className={`rounded-xl object-contain transition-transform duration-200 cursor-pointer select-none shadow-2xl ${
            zoomed ? 'scale-125' : 'scale-100'
          }`}
          style={{ maxHeight: '85vh', maxWidth: '90vw' }}
        />
      </div>
    </div>
  );
};

export default ImageViewer;
