import { useState, useEffect, useRef } from "react";
import { socket } from "../services/socket";
import {
  Send,
  Smartphone,
  Terminal,
  Wifi,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";

export default function USSD() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("ussd-status", (msg) => {
      addLog("STATUS", msg);

      if (
        msg.toLowerCase().includes("active") ||
        msg.toLowerCase().includes("reply")
      ) {
        setSessionActive(true);
      }
    });

    socket.on("ussd-response", (data) => {
      addLog("RESPONSE", data.response);

      setLoading(false);

      if (
        data.response?.toLowerCase().includes("terminated") ||
        data.response?.toLowerCase().includes("completed")
      ) {
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
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const sendUSSD = async () => {
    if (!code.trim() || loading) return;

    addLog("INPUT", code);

    setLoading(true);

    try {
      await fetch("http://localhost:3001/api/ussd/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
    } catch (err) {
      addLog("ERROR", err.message);
      setLoading(false);
    }

    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendUSSD();
    }
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

        {/* LEFT PANEL */}
        <div
          className="
            relative
            bg-[#0f0f0f]
            border border-[#222]
            rounded-3xl
            overflow-hidden
            flex flex-col
          "
        >

          {/* BLUR LOADING OVERLAY */}
          {loading && (
            <div
              className="
                absolute inset-0 z-20
                backdrop-blur-sm
                bg-black/40
                flex items-center justify-center
              "
            >
              <div
                className="
                  flex flex-col items-center gap-4
                  bg-[#111]
                  border border-[#333]
                  px-8 py-6 rounded-2xl
                  shadow-2xl
                "
              >
                <LoaderCircle
                  className="
                    text-[#d97706]
                    animate-spin
                  "
                  size={40}
                />

                <p className="text-gray-300 text-sm">
                  Processing USSD request...
                </p>
              </div>
            </div>
          )}

          {/* HEADER */}
          <div
            className="
              p-6 border-b border-[#1f1f1f]
              flex items-center justify-between
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-14 h-14 rounded-2xl
                  bg-[#d97706]/20
                  border border-[#d97706]/30
                  flex items-center justify-center
                "
              >
                <Smartphone
                  className="text-[#d97706]"
                  size={28}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  USSD Session
                </h1>

                <p className="text-gray-400 text-sm">
                  Real-time modem interaction
                </p>
              </div>
            </div>

            <div
              className={`
                px-4 py-2 rounded-full text-xs font-medium
                border
                ${
                  sessionActive
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }
              `}
            >
              {sessionActive ? "ACTIVE SESSION" : "IDLE"}
            </div>
          </div>

          {/* QUICK CODES */}
          <div className="p-6 border-b border-[#1f1f1f]">
            <p className="text-sm text-gray-400 mb-4">
              Quick USSD Codes
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "*182#",
                "*182*1#",
                "*182*7#",
                "*456#",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setCode(item)}
                  className="
                    px-4 py-2 rounded-xl
                    bg-[#151515]
                    border border-[#2b2b2b]
                    hover:border-[#d97706]
                    hover:bg-[#1b1b1b]
                    transition
                    text-sm text-gray-300
                  "
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="flex-1 p-6 flex flex-col justify-end">
            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Enter USSD Code
                </label>

                <div className="relative">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="*182#"
                    className="
                      w-full
                      bg-[#121212]
                      border border-[#2c2c2c]
                      rounded-2xl
                      px-5 py-4
                      pr-14
                      text-white
                      outline-none
                      focus:border-[#d97706]
                      focus:ring-2
                      focus:ring-[#d97706]/20
                      transition
                      font-mono
                      text-lg
                    "
                  />

                  <button
                    onClick={sendUSSD}
                    disabled={loading}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      w-10 h-10 rounded-xl
                      bg-[#d97706]
                      hover:bg-orange-700
                      flex items-center justify-center
                      transition
                    "
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>

              <div
                className="
                  flex items-center gap-2
                  text-xs text-gray-500
                "
              >
                <ArrowRight size={14} />
                Press ENTER to send instantly
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="
            bg-[#0f0f0f]
            border border-[#222]
            rounded-3xl
            overflow-hidden
            flex flex-col
          "
        >

          {/* TERMINAL HEADER */}
          <div
            className="
              p-5 border-b border-[#1f1f1f]
              flex items-center justify-between
            "
          >
            <div className="flex items-center gap-3">
              <Terminal className="text-[#d97706]" />

              <div>
                <h2 className="font-semibold text-white">
                  Session Output
                </h2>

                <p className="text-xs text-gray-500">
                  Live modem responses
                </p>
              </div>
            </div>

            <Wifi className="text-green-400" size={18} />
          </div>

          {/* LOGS */}
          <div
            className="
              flex-1 overflow-y-auto
              p-6
              space-y-4
              font-mono
            "
          >
            {logs.length === 0 ? (
              <div
                className="
                  h-full flex flex-col
                  items-center justify-center
                  text-center
                "
              >
                <Terminal
                  size={60}
                  className="text-[#d97706]/40 mb-5"
                />

                <h3 className="text-xl font-semibold text-white">
                  No Active Session
                </h3>

                <p className="text-gray-500 mt-2 max-w-sm">
                  Send a USSD request from the left panel
                  to begin modem interaction.
                </p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`
                    rounded-2xl p-4 border
                    ${
                      log.type === "ERROR"
                        ? "bg-red-500/10 border-red-500/20"
                        : log.type === "INPUT"
                        ? "bg-[#d97706]/10 border-[#d97706]/20"
                        : "bg-[#151515] border-[#262626]"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`
                        text-xs font-bold tracking-wider
                        ${
                          log.type === "ERROR"
                            ? "text-red-400"
                            : log.type === "INPUT"
                            ? "text-[#d97706]"
                            : "text-green-400"
                        }
                      `}
                    >
                      {log.type}
                    </span>

                    <span className="text-xs text-gray-500">
                      {log.time}
                    </span>
                  </div>

                  <div
                    className="
                      text-sm whitespace-pre-wrap
                      text-gray-200 leading-relaxed
                    "
                  >
                    {log.message}
                  </div>
                </div>
              ))
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}