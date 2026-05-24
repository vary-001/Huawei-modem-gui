import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { Link } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:3001/api/sms/list";

export default function SMS() {
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchSms();

    socket.on("sms-inbox", (data) => {
      if (Array.isArray(data)) {
        setSmsData(data);
      }
    });

    return () => {
      socket.off("sms-inbox");
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";

    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="text-[#d97706]" />
            SMS Inbox
          </h1>

          <p className="text-gray-400 mt-1">
            Real-time modem messages
          </p>
        </div>

        <Link
          to="/sms/send"
          className="
            flex items-center gap-2
            bg-[#d97706]
            hover:bg-orange-700
            px-5 py-3
            rounded-xl
            transition-all duration-300
            hover:scale-105
            shadow-lg
          "
        >
          <Plus size={18} />
          Compose
        </Link>
      </div>

      {/* CONTENT */}
      <div className="
        bg-[#0b0b0b]
        border border-[#1a1a1a]
        rounded-2xl
        p-5
        shadow-2xl
      ">

        {loading ? (
          <div className="text-gray-400">
            Loading SMS messages...
          </div>

        ) : error ? (
          <div className="text-red-500">
            {error}
          </div>

        ) : smsData.length === 0 ? (
          <div className="text-gray-500">
            No SMS messages found.
          </div>

        ) : (

          <div className="space-y-4">

            {smsData.map((sms, index) => (

              <div
                key={sms.id || index}
                className="
                  bg-[#111]
                  border border-[#1f1f1f]
                  hover:border-[#d97706]
                  rounded-2xl
                  p-5
                  transition-all duration-300
                  hover:shadow-[0_0_25px_rgba(217,119,6,0.15)]
                "
              >

                {/* TOP HEADER */}
                <div className="flex justify-between items-start gap-4">

                  {/* SENDER */}
                  <div className="flex items-center gap-3">

                    {/* AVATAR */}
                    <div className="
                      w-12 h-12
                      rounded-full
                      bg-[#d97706]
                      flex items-center justify-center
                      font-bold text-black
                      text-lg
                    ">
                      {(sms.number || "?")[0]}
                    </div>

                    <div>
                      <h2 className="font-semibold text-lg">
                        {sms.number || "Unknown Sender"}
                      </h2>

                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">

                        <Clock3 size={13} />

                        <span>
                          {formatTime(sms.timestamp)}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* STATE */}
                  {sms.state && (
                    <div className="
                      flex items-center gap-1
                      bg-[#1f1f1f]
                      border border-[#2c2c2c]
                      px-3 py-1
                      rounded-full
                      text-xs
                      uppercase
                      tracking-wide
                      text-[#d97706]
                    ">
                      <CheckCircle2 size={12} />
                      {sms.state}
                    </div>
                  )}

                </div>

                {/* MESSAGE BODY */}
                <div className="
                  mt-5
                  text-gray-200
                  leading-relaxed
                  whitespace-pre-wrap
                  text-sm
                  bg-[#0d0d0d]
                  border border-[#181818]
                  rounded-xl
                  p-4
                ">
                  {sms.text || "No message content"}
                </div>

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  );
}