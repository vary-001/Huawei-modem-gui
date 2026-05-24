import { useEffect, useState } from "react";
import { Wifi, Activity } from "lucide-react";

export default function Internet() {
  const [signal, setSignal] = useState(60);

  // fake live animation (we’ll later connect real modem data)
  useEffect(() => {
    const interval = setInterval(() => {
      setSignal((prev) => {
        const change = Math.random() * 10 - 5;
        let next = prev + change;
        if (next > 100) next = 100;
        if (next < 10) next = 10;
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const bars = Math.round(signal / 10);

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Wifi className="text-[#d97706]" />
        <div>
          <h1 className="text-2xl font-bold">Internet Status</h1>
          <p className="text-gray-400 text-sm">
            Live network connection monitor
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-6 rounded-xl">

        {/* SIGNAL TEXT */}
        <div className="flex justify-between mb-4">
          <span className="text-gray-400">Signal Strength</span>
          <span className="text-[#d97706] font-bold">{Math.round(signal)}%</span>
        </div>

        {/* GRAPH BARS */}
        <div className="flex items-end gap-2 h-32">

          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`
                w-6 rounded-sm transition-all duration-300
                ${i < bars ? "bg-[#d97706]" : "bg-[#222]"}
              `}
              style={{
                height: `${(i + 1) * 10}px`,
              }}
            />
          ))}

        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 mt-6 text-sm text-gray-300">
          <Activity className="text-[#d97706]" />
          <span>
            {signal > 70
              ? "Excellent Connection"
              : signal > 40
              ? "Stable Connection"
              : "Weak Signal"}
          </span>
        </div>

      </div>

      {/* NETWORK INFO CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Mode</p>
          <p className="text-white font-semibold">3G / UMTS</p>
        </div>

        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Operator</p>
          <p className="text-white font-semibold">Active Network</p>
        </div>

        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Latency</p>
          <p className="text-white font-semibold">~45ms</p>
        </div>

      </div>

    </div>
  );
}