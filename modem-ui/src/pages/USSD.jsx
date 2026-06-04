import { useState, useEffect, useRef } from "react";
import { socket } from "../services/socket";
import {
  Send,
  Smartphone,
  Terminal,
  Wifi,
  LoaderCircle,
  Hash,
  XCircle,
  History,
  Zap,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function USSD() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [lastResponse, setLastResponse] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("ussd-status", (msg) => {
      addLog("STATUS", msg);
      if (msg.toLowerCase().includes("active") || msg.toLowerCase().includes("reply")) {
        setSessionActive(true);
      }
    });

    socket.on("ussd-response", (data) => {
      addLog("RESPONSE", data.response);
      setLastResponse(data.response);
      setLoading(false);
      
      // If response doesn't look like it expects a follow-up, close session
      if (data.response?.toLowerCase().includes("terminated") || 
          data.response?.toLowerCase().includes("completed")) {
        setSessionActive(false);
      }
    });

    socket.on("ussd-error", (err) => {
      addLog("ERROR", err);
      setLoading(false);
    });

    return () => {
      socket.off("ussd-status");
      socket.off("ussd-response");
      socket.off("ussd-error");
    };
  }, []);

  const addLog = (type, message) => {
    setLogs((prev) => [...prev, { type, message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendUSSD = async (overrideCode) => {
    const finalCode = overrideCode || code;
    if (!finalCode.trim() || loading) return;

    addLog("INPUT", finalCode);
    setLoading(true);

    try {
      await fetch("http://localhost:3001/api/ussd/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: finalCode.trim() }),
      });
      setCode("");
    } catch (err) {
      addLog("ERROR", err.message);
      setLoading(false);
    }
  };

  // Advanced: Parse response to find menu items like "1. Balance"
  const getMenuItems = (text) => {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+[:.]/.test(line))
      .map(line => line.match(/^(\d+)/)[1]);
  };

  const menuItems = getMenuItems(lastResponse);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 p-2 lg:p-4">
      
      {/* LEFT: CONTROLS & SMARTPHONE UI */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        
        {/* SESSION CARD */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
          
          <div className={`mb-6 p-4 rounded-3xl ${sessionActive ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-500/10 text-gray-500'} transition-colors`}>
            <Smartphone size={40} strokeWidth={1.5} />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">USSD Session</h2>
          <p className="text-gray-500 text-sm mb-6 font-medium">Interact with carrier services</p>

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            sessionActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-gray-600 border-white/5'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
            {sessionActive ? "Live Session Active" : "Modem Idle"}
          </div>
        </div>

        {/* INPUT BOX */}
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500 px-2">
            <span>Terminal Input</span>
            <Hash size={14} className="text-orange-500" />
          </div>
          
          <div className="relative group">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendUSSD()}
              placeholder={sessionActive ? "Enter menu option..." : "*182#"}
              className="w-full bg-[#1a1a1a] border border-white/5 focus:border-orange-500/50 rounded-2xl py-4 pl-5 pr-14 text-white font-mono text-lg outline-none transition-all placeholder:text-gray-700"
            />
            <button
              onClick={() => sendUSSD()}
              disabled={loading || !code.trim()}
              className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-all disabled:opacity-20"
            >
              <Send size={18} />
            </button>
          </div>

          {/* DYNAMIC MENU OPTIONS (Advanced Feature) */}
          {sessionActive && menuItems.length > 0 && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-3 ml-1">Detected Options</p>
              <div className="grid grid-cols-4 gap-2">
                {menuItems.map(item => (
                  <button
                    key={item}
                    onClick={() => sendUSSD(item)}
                    className="py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PRESETS */}
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
             <History size={14} /> Quick Codes
          </div>
          <div className="flex flex-wrap gap-2">
            {["*182#", "*131#", "*150#", "*100#"].map(c => (
              <button 
                key={c} 
                onClick={() => setCode(c)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: LIVE CONVERSATION THREAD */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl">
        
        {/* THREAD HEADER */}
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center">
              <Terminal size={16} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Conversation</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Carrier Network Response</p>
            </div>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
            title="Clear History"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* DIALOGUE AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
              <Zap size={60} className="mb-4" />
              <p className="text-lg font-medium">Ready to dial...</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${log.type === 'INPUT' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] rounded-3xl px-6 py-4 relative ${
                  log.type === 'INPUT' 
                    ? 'bg-orange-600 text-white rounded-tr-none shadow-lg shadow-orange-900/20' 
                    : log.type === 'ERROR'
                    ? 'bg-red-950/40 border border-red-500/20 text-red-200 rounded-tl-none'
                    : 'bg-[#1a1a1a] border border-white/5 text-gray-200 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{log.message}</p>
                  <span className={`text-[9px] font-black uppercase mt-2 block opacity-40 ${log.type === 'INPUT' ? 'text-right' : 'text-left'}`}>
                    {log.type} • {log.time}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4 bg-[#111] p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <LoaderCircle className="text-orange-500 animate-spin" size={40} />
              <div className="text-center">
                <p className="text-sm font-bold">Waiting for Network</p>
                <p className="text-xs text-gray-500">Transmitting USSD payload...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}