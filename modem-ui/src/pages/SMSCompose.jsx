import { useState, useEffect } from "react";
import { socket } from "../services/socket";
import { Send } from "lucide-react";

export default function SMSCompose() {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    socket.on("sms-status", (data) => setStatus(data));
    socket.on("sms-sent", (data) => setStatus(`Sent ✔ ${data.number}`));
    socket.on("sms-error", (err) => setStatus(`Error ❌ ${err}`));

    return () => {
      socket.off("sms-status");
      socket.off("sms-sent");
      socket.off("sms-error");
    };
  }, []);

  const sendSMS = async (event) => {
    event?.preventDefault();

    if (!number.trim() || !message.trim()) {
      setStatus("Please enter both recipient number and message.");
      return;
    }

    setSending(true);
    setStatus("Sending message...");

    try {
      const res = await fetch("http://localhost:3001/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: number.trim(), message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus(`Send failed ❌ ${data?.error || res.statusText}`);
      } else {
        setStatus(`Message sent ✔ ${number.trim()}`);
        setNumber("");
        setMessage("");
      }
    } catch (err) {
      setStatus(`Send failed ❌ ${err.message || "Network error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#d97706]">
          Send SMS
        </h1>
        <p className="text-gray-400 text-sm">
          Compose and send messages via modem
        </p>
      </div>

      {/* FORM */}
      <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-6 rounded-xl space-y-4">

        {/* NUMBER */}
        <input
          className="w-full p-3 bg-black border border-[#333] focus:border-[#d97706] text-white rounded-lg outline-none"
          placeholder="Recipient number (+250...)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />

        {/* MESSAGE */}
        <textarea
          className="w-full p-3 bg-black border border-[#333] focus:border-[#d97706] text-white rounded-lg outline-none"
          placeholder="Type your message..."
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={sendSMS}
          disabled={sending || !number.trim() || !message.trim()}
          className={`
            flex items-center gap-2
            bg-[#d97706] hover:bg-orange-700
            text-white px-4 py-2 rounded-lg
            transition
            ${sending || !number.trim() || !message.trim() ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"}
          `}
        >
          <Send size={18} />
          {sending ? "Sending..." : "Send Message"}
        </button>

        {/* STATUS */}
        <div className="text-sm text-gray-300">
          Status: <span className="text-[#d97706]">{status}</span>
        </div>

      </div>
    </div>
  );
}