import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const EMOJI_LIST = [
  // Frequently Used
  '👍', '❤️', '🔥', '😂', '🎉', '🚀', '👏', '✨', '💯', '💡', '😍', '🙌', '☕', '🤝', '⚡', '👀',
  // Smileys
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😘', '😋', '😛',
  '😜', '🤪', '😎', '🤓', '🧐', '🤔', '🤫', '🤭', '🤐', '🤨', '😐', '😑', '😏', '😒', '🙄', '😬',
  '😮', '😲', '😳', '🥺', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '🥱', '😤', '😡', '🤬',
  // Gestures & People
  '👋', '🤚', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆',
  '👇', '☝️', '👎', '✊', '👊', '🤛', '🤜', '🫶', '👐', '🤲', '🙏', '✍️', '💪', '🧠', '🧑‍💻', '🕵️',
  // Tech, Work & Objects
  '💻', '🖥️', '📱', '⚙️', '🛠️', '🔧', '📊', '📈', '📉', '📅', '📁', '📄', '📝', '📌', '📎', '🔒',
  '🔑', '🛡️', '📦', '📧', '🔔', '🎯', '⭐', '🌟', '💎', '🏆', '🥇', '🥈', '🥉', '👑', '🪄', '🍻',
  // Food & Celebration
  '☕', '🍵', '🍕', '🍔', '🍟', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁', '🎈', '🎊', '🎁', '🏖️', '✈️',
  // Hearts & Symbols
  '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💖', '💗', '💓', '💞', '💕', '✅',
];

export const EmojiPicker = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_LIST;
    return EMOJI_LIST.filter((e) => e.includes(search.trim()));
  }, [search]);

  return (
    <div
      className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-2xl p-3 w-72 sm:w-80 flex flex-col z-50 select-none animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div className="relative mb-2.5 flex items-center">
        <Search size={14} className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search emojis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all"
          autoFocus
        />
      </div>

      {/* Grid of emojis */}
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto custom-scrollbar p-1">
        {filtered.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose?.();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-[var(--bg-hover)] active:scale-90 transition-transform cursor-pointer border-none bg-transparent"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
