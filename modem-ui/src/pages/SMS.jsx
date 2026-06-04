import { useEffect, useState, useMemo } from "react";
import { socket } from "../services/socket";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Clock3,
  Trash2,
  Eye,
  X,
  User,
  Inbox as InboxIcon,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Reply,
} from "lucide-react";

const API_URL = "http://localhost:3001/api/sms/list";

export default function SMS() {
  const navigate = useNavigate();
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSms, setSelectedSms] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox"); // inbox, sent, outbox

  const fetchSms = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.success) {
        setSmsData(json.messages || []);
      } else {
        setError(json.error || "Failed to load SMS");
      }
    } catch (err) {
      setError(err.message || "Failed to load SMS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSms();
    socket.on("sms-inbox", (data) => {
      if (Array.isArray(data)) setSmsData(data);
    });
    return () => socket.off("sms-inbox");
  }, []);

  // Filter logic based on modem message state
  const filteredData = useMemo(() => {
    return smsData.filter((sms) => {
      const state = sms.state?.toLowerCase() || "";
      if (activeTab === "inbox") return state.includes("received") || state.includes("read") || !state;
      if (activeTab === "sent") return state.includes("sent");
      if (activeTab === "outbox") return state.includes("unsent") || state.includes("failed");
      return true;
    });
  }, [smsData, activeTab]);

  const handleDelete = async (id, index) => {
    if (!window.confirm("Delete this message forever?")) return;
    try {
      await fetch(`http://localhost:3001/api/sms/delete/${id || index}`, { method: 'DELETE' });
      setSmsData(prev => prev.filter((_, i) => (id ? _.id !== id : i !== index)));
    } catch (err) {
      alert("Error deleting message");
    }
  };

  const handleReply = (number) => {
    // Navigates to compose and passes the number via state
    navigate("/sms/send", { state: { recipient: number } });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white p-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/20 rounded-2xl border border-orange-500/20">
              <MessageSquare className="text-orange-500" size={28} />
            </div>
            Messenger
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-1">Connected to Modem Gateway</p>
        </div>

        <Link
          to="/sms/send"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-900/20 active:scale-95"
        >
          <Plus size={20} />
          Compose
        </Link>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex p-1.5 bg-[#111] border border-white/5 rounded-2xl w-full md:w-max">
        {[
          { id: 'inbox', label: 'Inbox', icon: InboxIcon },
          { id: 'sent', label: 'Sent', icon: Send },
          { id: 'outbox', label: 'Outbox', icon: Clock3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? "bg-orange-600 text-white shadow-lg" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* MESSAGES LIST */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse font-medium">Reading modem storage...</div>
      ) : filteredData.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-[2.5rem]">
          <div className="p-6 bg-white/5 rounded-full mb-4">
            <InboxIcon size={40} className="opacity-20" />
          </div>
          <p className="text-lg">No {activeTab} messages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredData.map((sms, index) => (
            <div
              key={sms.id || index}
              className="group bg-[#0f0f0f] border border-[#222] hover:border-orange-500/30 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                {/* AVATAR WITH DIRECTION INDICATOR */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center font-bold text-orange-500">
                    {sms.number?.substring(0, 1) === '+' ? sms.number[4] : sms.number?.[0] || "?"}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-[#0f0f0f] ${
                    activeTab === 'sent' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {activeTab === 'sent' ? <ArrowUpRight size={10} className="text-white" /> : <ArrowDownLeft size={10} className="text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="font-bold text-gray-100 truncate text-base">
                      {sms.number || "Unknown"}
                    </h2>
                    <span className="text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-lg">
                      {formatTime(sms.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {sms.text || "Empty message"}
                  </p>
                </div>
              </div>

              {/* ACTION ROW */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setSelectedSms(sms)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-orange-500/10 text-xs font-bold text-gray-400 hover:text-orange-500 transition-all"
                >
                  <Eye size={14} /> Open
                </button>
                
                {activeTab === 'inbox' && (
                  <button 
                    onClick={() => handleReply(sms.number)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-blue-500/10 text-xs font-bold text-gray-400 hover:text-blue-500 transition-all"
                  >
                    <Reply size={14} /> Reply
                  </button>
                )}

                <button 
                  onClick={() => handleDelete(sms.id, index)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODERN VIEW MODAL */}
      {selectedSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#161616]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-xl font-black">
                  {selectedSms.number?.[0] || "?"}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedSms.number}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{activeTab} Message</p>
                </div>
              </div>
              <button onClick={() => setSelectedSms(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 relative">
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedSms.text}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                  <Clock3 size={12} />
                  {formatTime(selectedSms.timestamp)}
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#161616] border-t border-white/5 flex gap-3">
              <button 
                onClick={() => setSelectedSms(null)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition"
              >
                Dismiss
              </button>
              {activeTab === 'inbox' && (
                <button 
                  onClick={() => handleReply(selectedSms.number)}
                  className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold transition flex items-center justify-center gap-2"
                >
                  <Reply size={18} /> Reply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}