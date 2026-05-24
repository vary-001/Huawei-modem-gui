import { useState, useEffect, useRef } from "react";
import { socket } from "../services/socket";
import { Send, Terminal } from "lucide-react";

export default function USSD() {
 const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("ussd-status", (msg) => {
      addLog("STATUS", msg);
    });

    socket.on("ussd-response", (data) => {
      addLog("RESPONSE", data.response);
    });

    socket.on("ussd-error", (err) => {
      addLog("ERROR", err);
    });

    return () => {
      socket.off("ussd-status");
      socket.off("ussd-response");
      socket.off("ussd-error");
    };
  }, []);

  const addLog = (type, message) => {
    setLogs((prev) => [...prev, { type, message }]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendUSSD = async () => {
  if (!code || loading) return;

  setLoading(true);
  addLog("INPUT", code);

  try {
    await fetch("http://localhost:3001/api/ussd/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  } finally {
    setTimeout(() => setLoading(false), 2000);
  }

  setCode("");
};

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#d97706] flex items-center gap-2">
          <Terminal /> USSD Terminal
        </h1>
        <p className="text-gray-400 text-sm">
          Interactive modem USSD session
        </p>
      </div>

      {/* TERMINAL WINDOW */}
      <div className="bg-black border border-[#1a1a1a] rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-sm">

        {logs.map((log, i) => (
          <div key={i} className="mb-2">
            <span className="text-[#d97706]">[{log.type}]</span>{" "}
            <span className="text-gray-300 whitespace-pre-wrap">
              {log.message}
            </span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="flex gap-2">

        <input
          className="
            flex-1 p-3
            bg-black border border-[#333]
            text-white rounded-lg
            focus:border-[#d97706]
            outline-none
            font-mono
          "
          placeholder="Enter USSD code (*182#)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={sendUSSD}
          disabled={loading}
          className="
            flex items-center gap-2
            px-5 py-2 rounded-lg
            bg-[#d97706] hover:bg-orange-700
            text-white transition
            disabled:opacity-60
          "
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={18} />
          )}
          {loading ? "Sending..." : "Send"}
        </button>

      </div>
    </div>
  );
}