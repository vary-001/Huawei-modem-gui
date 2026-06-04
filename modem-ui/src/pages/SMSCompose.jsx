import { useState, useEffect } from "react";
import { socket } from "../services/socket";
import { 
  Send, 
  User, 
  MessageCircle, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SMSCompose() {
  
  const navigate = useNavigate();
  const [number, setNumber] = useState(location.state?.recipient || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Status can be: 'idle', 'sending', 'success', 'error'
  const [status, setStatus] = useState({ type: "idle", text: "" });

  useEffect(() => {
    socket.on("sms-status", (data) => setStatus({ type: "sending", text: data }));
    socket.on("sms-sent", (data) => {
      setStatus({ type: "success", text: `Delivered to ${data.number}` });
      setSending(false);
    });
    socket.on("sms-error", (err) => {
      setStatus({ type: "error", text: `Failed: ${err}` });
      setSending(false);
    });

    return () => {
      socket.off("sms-status");
      socket.off("sms-sent");
      socket.off("sms-error");
    };
  }, []);

  const sendSMS = async (e) => {
    e?.preventDefault();
    if (!number.trim() || !message.trim()) return;

    setSending(true);
    setStatus({ type: "sending", text: "Initializing modem..." });

    try {
      const res = await fetch("http://localhost:3001/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: number.trim(), message: message.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Network error");
      }
    } catch (err) {
      setStatus({ type: "error", text: err.message });
      setSending(false);
    }
  };

  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* TOP HEADER */}
        <div className="p-6 border-b border-white/5 bg-[#161616]/50 backdrop-blur-md flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold tracking-tight">New Message</h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* STATUS INDICATOR BAR */}
        {status.type !== "idle" && (
          <div className={`px-6 py-2 flex items-center gap-2 text-xs font-medium transition-all animate-in slide-in-from-top ${
            status.type === 'sending' ? 'bg-orange-500/10 text-orange-500' :
            status.type === 'success' ? 'bg-green-500/10 text-green-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {status.type === 'sending' && <Loader2 size={14} className="animate-spin" />}
            {status.type === 'success' && <CheckCircle2 size={14} />}
            {status.type === 'error' && <AlertCircle size={14} />}
            {status.text}
          </div>
        )}

        {/* FORM BODY */}
        <form onSubmit={sendSMS} className="p-8 space-y-6">
          
          {/* RECIPIENT INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-1 font-bold">Recipient</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="+250 788..."
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-600"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* MESSAGE INPUT */}
          <div className="space-y-2">
            <div className="flex justify-between items-end ml-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Message</label>
              <span className={`text-[10px] ${charCount > 160 ? 'text-orange-500' : 'text-gray-600'}`}>
                {charCount} / 160 ({smsSegments} SMS)
              </span>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-5 text-gray-500 group-focus-within:text-orange-500 transition-colors">
                <MessageCircle size={18} />
              </div>
              <textarea
                placeholder="Write your message here..."
                rows="6"
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-600 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            type="submit"
            disabled={sending || !number.trim() || !message.trim()}
            className={`
              w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95
              ${sending || !number.trim() || !message.trim() 
                ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/20"
              }
            `}
          >
            {sending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Message
              </>
            )}
          </button>
        </form>

        {/* FOOTER DECORATION (Phone Home Bar) */}
        <div className="pb-4 flex justify-center">
           <div className="w-32 h-1.5 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}