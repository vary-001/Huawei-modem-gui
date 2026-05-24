import { useModem } from "../hooks/useModem";
import { Signal, Wifi, Phone, Smartphone } from "lucide-react";

export default function Dashboard() {
  const { modem, status } = useModem();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#d97706]">
          Live Modem Dashboard
        </h1>

        <p className="text-gray-400 text-sm">
          Status: {status}
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card
          icon={<Signal />}
          title="Signal"
          value={extract(modem, "signal quality")}
        />

        <Card
          icon={<Wifi />}
          title="Network"
          value={extract(modem, "access tech")}
        />

        <Card
          icon={<Phone />}
          title="Operator"
          value={extract(modem, "operator name")}
        />

      <Card
  icon={<Smartphone />}
  title="SIM"
  value={extract(modem, "SIM")}
/>

      </div>

      {/* RAW DEBUG (VERY IMPORTANT) */}
      <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-xl">
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
          {modem || "Waiting for modem data..."}
        </pre>
      </div>

    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-xl hover:border-[#d97706] transition">
      <div className="text-[#d97706] mb-2">{icon}</div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-white font-semibold">
        {value || "Loading..."}
      </h2>
    </div>
  );
}

// simple parser helper (because mmcli is text)
function extract(text, key) {
  if (!text) return null;
  const lines = text.split("\n");
  const found = lines.find((l) => l.toLowerCase().includes(key));
  return found ? found.split(":")[1]?.trim() : null;
}