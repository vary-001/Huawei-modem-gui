import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../services/socket";
import {
  Phone,
  LoaderCircle,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Clock,
  Signal,
  Delete,
  PhoneIncoming,
  Pause,
  Play,
  Grid3X3,
} from "lucide-react";

const dialButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function Call() {
  const [dialValue, setDialValue] = useState("");
  const [status, setStatus] = useState("Ready");
  const [calls, setCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [volume, setVolume] = useState(70);
  const [callStart, setCallStart] = useState(null);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  
  const audioContextRef = useRef(null);
  const callTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const updateStatus = useCallback((payload) => {
    setStatus(payload.voice?.["emergency-only"] === "yes" ? "Emergency" : "Ready");
    setCalls(payload.calls || []);
    setIncomingCall(payload.incoming || null);
    setActiveCall(payload.active || null);
  }, []);

  const requestMediaAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMediaAccess(true);
      return true;
    } catch (err) {
      setMessage("Microphone access required");
      return false;
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
  }, []);

  useEffect(() => {
    requestMediaAccess();
    socket.on("call-update", (payload) => {
      updateStatus(payload);
      if (payload.active && !callTimerRef.current) startCallTimer();
      else if (!payload.active) stopCallTimer();
    });
    return () => {
      socket.off("call-update");
      stopCallTimer();
    };
  }, [updateStatus, startCallTimer, stopCallTimer]);

  const handleAction = async (path) => {
    setLoading(true);
    try {
      const body = path === "dial" ? JSON.stringify({ number: dialValue.trim() }) : undefined;
      const res = await fetch(`http://localhost:3001/api/call/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!data.success) setMessage(data.error);
      else if (path === "dial") setDialValue("");
    } catch (err) {
      setMessage("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  // UI VIEWS
  const isCallActive = activeCall || incomingCall;

  return (
    <div className="max-w-md mx-auto h-[85vh] bg-[#0a0a0a] text-white rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-2xl relative overflow-hidden flex flex-col">
      
      {/* 1. TOP STATUS BAR */}
      <div className="px-8 pt-6 pb-2 flex justify-between items-center text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        <div className="flex items-center gap-1.5">
          <Signal size={12} className={status === "Ready" ? "text-green-500" : "text-red-500"} />
          {status}
        </div>
        <div className="flex items-center gap-2">
          {hasMediaAccess ? <Mic size={10} className="text-orange-500" /> : <MicOff size={10} className="text-red-500" />}
          <span>MODEM L1</span>
        </div>
      </div>

      {/* 2. DYNAMIC MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {!isCallActive ? (
          /* DIALER VIEW */
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex-1 flex flex-col justify-center items-center mb-8">
              <input 
                readOnly
                value={dialValue}
                placeholder="Enter Number"
                className="w-full bg-transparent text-center text-4xl font-light tracking-tighter outline-none placeholder:text-gray-800 text-orange-500"
              />
              {dialValue && (
                <button 
                  onClick={() => setDialValue(v => v.slice(0, -1))}
                  className="mt-4 p-2 text-gray-600 hover:text-white transition"
                >
                  <Delete size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {dialButtons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => setDialValue(v => v + btn)}
                  className="w-16 h-16 mx-auto rounded-full bg-[#151515] hover:bg-[#252525] active:bg-orange-600 transition-all flex items-center justify-center text-2xl font-medium border border-white/5"
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              disabled={!dialValue || loading}
              onClick={() => handleAction("dial")}
              className="w-20 h-20 mx-auto rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/20 disabled:opacity-20 disabled:grayscale transition-all active:scale-90"
            >
              {loading ? <LoaderCircle className="animate-spin" /> : <Phone size={32} fill="currentColor" />}
            </button>
          </div>
        ) : (
          /* ACTIVE/INCOMING CALL VIEW */
          <div className="flex-1 flex flex-col items-center justify-between py-10 animate-in slide-in-from-bottom duration-500">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                 <div className={`absolute inset-0 rounded-full bg-orange-500/20 animate-ping ${!activeCall && 'opacity-100'}`} />
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center relative">
                    <UserAvatar number={activeCall?.number || incomingCall?.number} />
                 </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {activeCall?.number || incomingCall?.number || "Unknown"}
                </h2>
                <p className="text-orange-500 font-medium text-sm mt-1 uppercase tracking-widest">
                  {incomingCall ? "Incoming Call..." : activeCall ? "Active Call" : "Connecting..."}
                </p>
              </div>

              {activeCall && (
                <div className="flex items-center justify-center gap-2 text-gray-400 font-mono text-lg">
                   <Clock size={16} />
                   {formatDuration(callDuration)}
                </div>
              )}
            </div>

            {/* CALL ACTIONS */}
            <div className="w-full space-y-8">
              {activeCall && (
                <div className="grid grid-cols-3 gap-6">
                   <CallActionBtn icon={isMuted ? MicOff : Mic} label="Mute" active={isMuted} onClick={toggleMute} />
                   <CallActionBtn icon={Grid3X3} label="Keypad" />
                   <CallActionBtn icon={isSpeaker ? Volume2 : VolumeX} label="Speaker" active={isSpeaker} onClick={() => setIsSpeaker(!isSpeaker)} />
                </div>
              )}

              <div className="flex justify-center gap-12">
                {incomingCall ? (
                  <>
                    <button onClick={() => handleAction("hangup")} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center active:scale-90 transition"><PhoneOff size={24} /></button>
                    <button onClick={() => handleAction("answer")} className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center active:scale-90 transition animate-bounce"><Phone size={24} fill="currentColor" /></button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleAction("hangup")} 
                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl shadow-red-900/40 active:scale-90 transition-all"
                  >
                    <PhoneOff size={32} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM HOME INDICATOR */}
      <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto mb-3" />

      {/* NOTIFICATION OVERLAY */}
      {message && (
        <div className="absolute bottom-10 left-6 right-6 bg-red-600 text-white p-3 rounded-2xl text-xs font-bold flex justify-between items-center animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2"><X size={14} /> {message}</div>
          <button onClick={() => setMessage(null)} className="opacity-50">Dismiss</button>
        </div>
      )}
    </div>
  );
}

// Sub-components for cleaner code
function CallActionBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${active ? 'bg-white text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
        <Icon size={22} />
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function UserAvatar({ number }) {
  return (
    <div className="text-3xl font-black text-gray-700">
      {number?.replace('+', '').substring(0, 1) || <Phone size={30} />}
    </div>
  );
}