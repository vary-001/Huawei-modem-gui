import { useState, useEffect, useCallback } from "react";
import { socket } from "../services/socket";
import {
  Phone,
  Smartphone,
  LoaderCircle,
  Check,
  X,
  Code2,
  PhoneCall,
} from "lucide-react";

const dialButtons = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
];

export default function Call() {
  const [dialValue, setDialValue] = useState("");
  const [status, setStatus] = useState("Idle");
  const [calls, setCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const updateStatus = useCallback((payload) => {
    const statusLabel = payload.voice?.["emergency-only"] === "yes" ? "Emergency only" : "Ready";
    setStatus(statusLabel);
    setCalls(payload.calls || []);
    setIncomingCall(payload.incoming || null);
    setActiveCall(payload.active || null);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/call/status");
      const data = await res.json();
      if (data.success) {
        updateStatus(data.status);
      } else {
        setMessage(data.error || "Unable to load call status.");
      }
    } catch (err) {
      setMessage(err.message || "Call status request failed.");
    }
  };

  useEffect(() => {
    fetchStatus();

    socket.on("call-update", (payload) => {
      updateStatus(payload);
    });

    return () => {
      socket.off("call-update");
    };
  }, [updateStatus]);

  const addDigit = (digit) => {
    setDialValue((prev) => prev + digit);
  };

  const removeDigit = () => {
    setDialValue((prev) => prev.slice(0, -1));
  };

  const clearDial = () => {
    setDialValue("");
  };

  const handleAction = async (path) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:3001/api/call/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          path === "dial"
            ? JSON.stringify({ number: dialValue.trim() })
            : undefined,
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.error || "Call action failed.");
      } else {
        if (path === "dial") {
          setDialValue("");
        }
      }
    } catch (err) {
      setMessage(err.message || "Call action failed.");
    } finally {
      setLoading(false);
      fetchStatus();
    }
  };

  const dialDisabled = !dialValue.trim() || loading;
  const hasIncoming = Boolean(incomingCall);
  const hasActive = Boolean(activeCall);

  return (
    <div className="h-[calc(100vh-110px)] overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
        <div className="relative bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden flex flex-col">
          {loading && (
            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 bg-[#111] border border-[#333] px-8 py-6 rounded-2xl shadow-2xl">
                <LoaderCircle className="text-[#d97706] animate-spin" size={40} />
                <p className="text-gray-300 text-sm">Processing call action...</p>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#d97706]/20 border border-[#d97706]/30 flex items-center justify-center">
                <Smartphone className="text-[#d97706]" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Call Center</h1>
                <p className="text-gray-400 text-sm">Dial, answer, and manage voice calls</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full text-xs font-medium border bg-gray-500/10 text-gray-300 border-gray-500/20">
              Modem: {status}
            </div>
          </div>

          <div className="p-6 border-b border-[#1f1f1f]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-[#111] rounded-3xl p-5 border border-[#222] shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Dialer</p>
                <p className="text-3xl font-semibold text-white break-all">{dialValue || "Enter a number"}</p>
              </div>
              <div className="bg-[#111] rounded-3xl p-5 border border-[#222] shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Call state</p>
                <p className="text-sm text-gray-300 mb-2">Incoming: {hasIncoming ? "Yes" : "No"}</p>
                <p className="text-sm text-gray-300">Active: {hasActive ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-6">
            {dialButtons.map((digit) => (
              <button
                key={digit}
                onClick={() => addDigit(digit)}
                className="rounded-3xl bg-[#111] border border-[#222] py-6 text-xl text-white hover:border-[#d97706] transition"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={removeDigit}
              className="rounded-3xl bg-[#111] border border-[#222] py-6 text-xl text-white hover:border-[#d97706] transition"
            >
              <Code2 size={24} />
            </button>
            <button
              onClick={clearDial}
              className="rounded-3xl bg-[#111] border border-[#222] py-6 text-xl text-white hover:border-[#d97706] transition"
            >
              Clear
            </button>
            <button
              onClick={() => handleAction("dial")}
              disabled={dialDisabled}
              className={`rounded-3xl py-6 text-xl font-semibold transition ${dialDisabled ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-green-500 text-black hover:bg-green-400"}`}
            >
              <PhoneCall size={22} className="inline-block mr-2" /> Dial
            </button>
          </div>

          <div className="p-6 border-t border-[#1f1f1f] space-y-4">
            {incomingCall && (
              <div className="bg-[#111] border border-[#2f662e] rounded-3xl p-5 text-green-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-green-300">Incoming call</p>
                    <p className="text-lg font-semibold">{incomingCall.number || "Unknown number"}</p>
                    <p className="text-sm text-gray-400">State: {incomingCall.state}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction("answer")}
                      className="px-4 py-3 rounded-2xl bg-green-500 text-black font-semibold hover:bg-green-400"
                    >
                      Answer
                    </button>
                    <button
                      onClick={() => handleAction("hangup")}
                      className="px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {hasActive && !incomingCall && (
              <div className="bg-[#111] border border-[#44332e] rounded-3xl p-5 text-yellow-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-yellow-300">Active call</p>
                    <p className="text-lg font-semibold">{activeCall?.number || "Unknown"}</p>
                    <p className="text-sm text-gray-400">State: {activeCall?.state}</p>
                  </div>
                  <button
                    onClick={() => handleAction("hangup")}
                    className="px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500"
                  >
                    Hang Up
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#111] border border-[#222] rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="text-[#d97706]" />
                <p className="text-sm text-gray-400">Recent call state</p>
              </div>
              <div className="grid gap-3">
                {calls.length === 0 ? (
                  <p className="text-sm text-gray-500">No current calls.</p>
                ) : (
                  calls.map((call) => (
                    <div key={call.path} className="rounded-2xl bg-[#121212] p-4 border border-[#222]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{call.number || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{call.path}</p>
                        </div>
                        <span className="text-xs uppercase tracking-wide text-gray-400">{call.state || "unknown"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {message && (
              <div className="rounded-3xl bg-[#1d1313] border border-[#662020] px-4 py-3 text-sm text-red-300">
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#1f1f1f] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center">
              <Phone size={28} className="text-[#d97706]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Call Center Controls</h2>
              <p className="text-gray-400 text-sm">Use the keypad to place outgoing calls, or manage incoming ones live.</p>
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 overflow-auto">
            <div className="rounded-3xl bg-[#111] border border-[#222] p-5">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Call Engine</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0f0f0f] p-4">
                  <p className="text-xs text-gray-400">Dialed</p>
                  <p className="text-lg font-semibold text-white">{dialValue || "-"}</p>
                </div>
                <div className="rounded-2xl bg-[#0f0f0f] p-4">
                  <p className="text-xs text-gray-400">Last status</p>
                  <p className="text-lg font-semibold text-white">{incomingCall ? "Incoming" : activeCall ? "Active" : "Idle"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#111] border border-[#222] p-5">
              <p className="text-sm text-gray-400 mb-3">Call Actions</p>
              <div className="grid gap-3">
                <button
                  onClick={() => handleAction("dial")}
                  disabled={dialDisabled}
                  className={`w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${dialDisabled ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-green-500 text-black hover:bg-green-400"}`}
                >
                  Place Call
                </button>
                <button
                  onClick={() => handleAction("answer")}
                  disabled={!hasIncoming || loading}
                  className={`w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${!hasIncoming ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-black hover:bg-blue-400"}`}
                >
                  Answer Incoming Call
                </button>
                <button
                  onClick={() => handleAction("hangup")}
                  disabled={!hasActive && !hasIncoming}
                  className={`w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${!hasActive && !hasIncoming ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-500"}`}
                >
                  Hang Up Call
                </button>
                <button
                  onClick={() => handleAction("hangup-all")}
                  disabled={loading}
                  className="w-full rounded-3xl px-4 py-3 bg-[#333] text-sm font-semibold text-white hover:bg-[#444] transition"
                >
                  Hang Up All Calls
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-[#111] border border-[#222] p-5">
              <p className="text-sm text-gray-400 mb-3">Incoming / Active Call Info</p>
              <div className="space-y-3">
                <div className="rounded-3xl bg-[#0f0f0f] p-4 border border-[#222]">
                  <p className="text-xs text-gray-500">Incoming</p>
                  <p className="font-semibold text-white">{incomingCall?.number || "No incoming call"}</p>
                  <p className="text-xs text-gray-500">{incomingCall?.state || "-"}</p>
                </div>
                <div className="rounded-3xl bg-[#0f0f0f] p-4 border border-[#222]">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="font-semibold text-white">{activeCall?.number || "No active call"}</p>
                  <p className="text-xs text-gray-500">{activeCall?.state || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
