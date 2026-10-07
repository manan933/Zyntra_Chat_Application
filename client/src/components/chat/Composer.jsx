import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Image as ImageIcon, Smile, SendHorizontal, X, Loader2, FileText } from 'lucide-react';
import EmojiPicker from '../ui/EmojiPicker';
import socketService from '../../api/socket';
import api from '../../api/api';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const Composer = ({ chatId, onSend, currentUser }) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Handle typing emissions
  const handleTyping = () => {
    if (!chatId || !currentUser) return;
    socketService.startTyping(chatId, currentUser.name || 'User', currentUser.id || currentUser._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(chatId, currentUser.id || currentUser._id);
    }, 2000);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    handleTyping();

    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const localBlob = isImage ? URL.createObjectURL(file) : null;

    setAttachment({
      name: file.name,
      size: formatSize(file.size),
      type: isImage ? 'image' : 'file',
      mimeType: file.type,
      url: localBlob,
      isUploading: true,
    });

    setIsUploading(true);
    try {
      const res = await api.upload.file(file);
      if (res.ok && res.data?.url) {
        setAttachment({
          name: res.data.name || file.name,
          size: res.data.size || formatSize(file.size),
          type: isImage ? 'image' : 'file',
          mimeType: res.data.mimeType || file.type,
          url: res.data.url,
          isUploading: false,
        });
      }
    } catch {
      // Keep local blob if upload endpoint fallback occurs
      setAttachment((prev) => (prev ? { ...prev, isUploading: false } : null));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || isUploading) return;

    onSend?.(text.trim(), attachment);
    setText('');
    setAttachment(null);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (chatId && currentUser) {
      socketService.stopTyping(chatId, currentUser.id || currentUser._id);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const hasContent = Boolean(text.trim() || attachment);

  return (
    <div className="relative px-3 sm:px-4 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))] bg-[var(--bg-primary)] border-t border-[var(--border)] shrink-0">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          e.target.value = '';
        }}
      />

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-full left-4 mb-2 z-50">
          <EmojiPicker onSelect={handleInsertEmoji} onClose={() => setShowEmoji(false)} />
        </div>
      )}

      {/* Attachment Preview Chip */}
      {attachment && (
        <div className="mb-2 flex items-center justify-between p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] max-w-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachment.type === 'image' && attachment.url ? (
              <img
                src={attachment.url}
                alt="preview"
                className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                <FileText size={18} />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate text-[var(--text-primary)]">
                {attachment.name}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                <span>{attachment.size}</span>
                {attachment.isUploading && (
                  <span className="text-[var(--accent)] flex items-center gap-1 font-semibold">
                    <Loader2 size={10} className="animate-spin" /> Uploading...
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer border-none bg-transparent"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Composer Pill Input Row */}
      <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-3 py-1.5 focus-within:border-[var(--accent)] transition-all">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title="Attach File"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
            title="Upload Photo"
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center ${
              showEmoji ? 'text-[var(--accent)] bg-[var(--accent-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Emoji"
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          enterKeyHint="send"
          autoCapitalize="sentences"
          autoComplete="on"
          className="flex-1 bg-transparent border-none outline-none resize-none py-1.5 text-sm sm:text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] min-h-[36px] max-h-[120px] leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!hasContent || isUploading}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none transition-all ${
            hasContent && !isUploading
              ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] cursor-pointer shadow-md active:scale-90'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
          }`}
          title="Send"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SendHorizontal size={17} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Composer;
