import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, ShieldCheck, Volume2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { playCallStartSound, playCallEndSound } from '../../utils/zyntraSound';

export const CallModal = ({ isOpen, onClose, chat, isVideo = false }) => {
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  const [screenSharing, setScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      playCallStartSound();
      setDuration(0);
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    playCallEndSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-[#0e1320] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-8 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <ShieldCheck size={12} />
            <span>Secure Call</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-xs font-semibold">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Center Stage: Video View or Audio Wave Avatar */}
        <div className="my-6 flex flex-col items-center justify-center z-10 w-full">
          {!cameraOff ? (
            <div className="w-full h-56 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
              <Avatar name={chat.name} src={chat.avatar} size="lg" />
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
                {chat.name} · 1080p 60fps
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-blue-600/20 animate-ping absolute inset-0 pointer-events-none" />
                <Avatar name={chat.name} src={chat.avatar} size="xl" />
              </div>
              <h3 className="text-lg font-bold text-white m-0">{chat.name}</h3>
              <p className="text-xs text-slate-400 mt-1 m-0">Voice connection active (HD Opus)</p>

              {/* Animated Audio Waveform Bars */}
              <div className="flex items-center gap-1 mt-6 h-8">
                {[14, 24, 32, 18, 28, 12, 22, 30, 16, 26, 14, 20].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="flex items-center gap-3 mt-4 z-10">
          <button
            type="button"
            onClick={() => setMicMuted(!micMuted)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              micMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
            }`}
            title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setCameraOff(!cameraOff)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              cameraOff
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
            }`}
            title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setScreenSharing(!screenSharing)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              screenSharing
                ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
            }`}
            title="Share Screen"
          >
            <Monitor size={20} />
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="p-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-red-600/30 border-none"
            title="End Call"
          >
            <PhoneOff size={20} />
            <span className="text-xs">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
