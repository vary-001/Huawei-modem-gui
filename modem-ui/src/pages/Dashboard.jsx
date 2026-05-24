import { Link } from "react-router-dom";
import { useModem } from "../hooks/useModem";

import {
  Signal,
  Wifi,
  Phone,
  Smartphone,
  MessageSquare,
  Contact,
  Globe,
  Settings,
  ArrowRight,
  Activity,
  Router,
  Cpu,
} from "lucide-react";

export default function Dashboard() {
  const { modem, status } = useModem();

  const signal = extract(modem, "signal quality");
  const network = extract(modem, "access tech");
  const operator = extract(modem, "operator name");
  const sim = extract(modem, "own");
  const state = extract(modem, "state");
  const model = extract(modem, "model");

  return (
    <div className="space-y-6">

      {/* TOP HERO */}
      <div
        className="
          relative overflow-hidden
          bg-gradient-to-br from-[#111] to-[#0a0a0a]
          border border-[#222]
          rounded-3xl
          p-8
        "
      >
        {/* GLOW */}
        <div
          className="
            absolute top-0 right-0
            w-72 h-72
            bg-[#d97706]/10
            blur-3xl
            rounded-full
          "
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          {/* LEFT */}
          <div>
            <div
              className="
                inline-flex items-center gap-2
                bg-[#d97706]/10
                border border-[#d97706]/20
                px-4 py-2 rounded-full
                text-[#d97706]
                text-sm mb-5
              "
            >
              <Activity size={16} />
              Live Modem Connected
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight">
              Modem Control
              <span className="text-[#d97706]"> Center</span>
            </h1>

            <p className="text-gray-400 mt-4 max-w-2xl">
              Real-time modem monitoring, SMS messaging,
              internet management, USSD sessions, and
              SIM contact management — all in one place.
            </p>
          </div>

          {/* RIGHT MODEM CARD */}
          <div
            className="
              min-w-[320px]
              bg-[#111]
              border border-[#2a2a2a]
              rounded-3xl
              p-6
              shadow-2xl
            "
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm">
                  Connected Device
                </p>

                <h2 className="text-white text-xl font-bold">
                  {model || "Huawei Modem"}
                </h2>
              </div>

              <div
                className="
                  w-14 h-14 rounded-2xl
                  bg-[#d97706]/10
                  border border-[#d97706]/20
                  flex items-center justify-center
                "
              >
                <Router
                  className="text-[#d97706]"
                  size={28}
                />
              </div>
            </div>

            <div className="space-y-4">

              <MiniStat
                label="Signal"
                value={signal || "N/A"}
                icon={<Signal size={16} />}
              />

              <MiniStat
                label="Network"
                value={network || "N/A"}
                icon={<Wifi size={16} />}
              />

              <MiniStat
                label="SIM Number"
                value={sim || "Unknown"}
                icon={<Cpu size={16} />}
              />

              <MiniStat
                label="State"
                value={state || status}
                icon={<Activity size={16} />}
              />

            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Signal Strength"
          value={signal || "Loading"}
          icon={<Signal size={24} />}
        />

        <StatCard
          title="Network Type"
          value={network || "Loading"}
          icon={<Wifi size={24} />}
        />

        <StatCard
          title="Operator"
          value={operator || "Loading"}
          icon={<Phone size={24} />}
        />

        <StatCard
          title="Connection"
          value={status}
          icon={<Smartphone size={24} />}
        />

      </div>

      {/* NAVIGATION */}
      <div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Quick Access
            </h2>

            <p className="text-gray-400 text-sm">
              Navigate through modem features
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

          <NavCard
            to="/sms"
            title="SMS Inbox"
            desc="Read modem messages"
            icon={<MessageSquare />}
          />

          <NavCard
            to="/sms/send"
            title="Compose SMS"
            desc="Send real SMS"
            icon={<Phone />}
          />

          <NavCard
            to="/ussd"
            title="USSD Terminal"
            desc="Interactive sessions"
            icon={<Globe />}
          />

          <NavCard
            to="/contacts"
            title="SIM Contacts"
            desc="Manage contacts"
            icon={<Contact />}
          />

          <NavCard
            to="/settings"
            title="Settings"
            desc="Configure modem"
            icon={<Settings />}
          />

        </div>
      </div>

      {/* MODEM RAW INFO */}
      <div
        className="
          bg-[#0d0d0d]
          border border-[#1d1d1d]
          rounded-3xl
          overflow-hidden
        "
      >

        <div
          className="
            px-6 py-4 border-b border-[#1f1f1f]
            flex items-center justify-between
          "
        >
          <div>
            <h2 className="text-white text-xl font-semibold">
              Live Modem Data
            </h2>

            <p className="text-gray-500 text-sm">
              Raw realtime modem information
            </p>
          </div>

          <div
            className="
              px-3 py-1 rounded-full
              bg-green-500/10
              border border-green-500/20
              text-green-400 text-xs
            "
          >
            LIVE
          </div>
        </div>

        <div className="p-6">
          <pre
            className="
              text-gray-300 text-sm
              whitespace-pre-wrap
              overflow-x-auto
              leading-relaxed
              font-mono
            "
          >
            {modem || "Waiting for modem data..."}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* SMALL STAT */
function MiniStat({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <span className="text-[#d97706]">
          {icon}
        </span>

        {label}
      </div>

      <span className="text-white font-medium text-sm">
        {value}
      </span>
    </div>
  );
}

/* BIG CARD */
function StatCard({ title, value, icon }) {
  return (
    <div
      className="
        bg-[#0d0d0d]
        border border-[#1e1e1e]
        rounded-3xl
        p-6
        hover:border-[#d97706]
        transition-all duration-300
        hover:translate-y-[-3px]
      "
    >
      <div className="flex items-center justify-between mb-5">

        <div
          className="
            w-14 h-14 rounded-2xl
            bg-[#d97706]/10
            border border-[#d97706]/20
            flex items-center justify-center
            text-[#d97706]
          "
        >
          {icon}
        </div>

        <div
          className="
            w-3 h-3 rounded-full
            bg-green-400 animate-pulse
          "
        />
      </div>

      <p className="text-gray-400 text-sm mb-2">
        {title}
      </p>

      <h2 className="text-white text-xl font-bold">
        {value}
      </h2>
    </div>
  );
}

/* NAVIGATION CARD */
function NavCard({ to, title, desc, icon }) {
  return (
    <Link
      to={to}
      className="
        group
        bg-[#0d0d0d]
        border border-[#1e1e1e]
        rounded-3xl
        p-6
        hover:border-[#d97706]
        transition-all duration-300
        hover:translate-y-[-4px]
      "
    >
      <div
        className="
          w-14 h-14 rounded-2xl
          bg-[#d97706]/10
          border border-[#d97706]/20
          flex items-center justify-center
          text-[#d97706]
          mb-5
          group-hover:scale-110
          transition
        "
      >
        {icon}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-lg">
            {title}
          </h3>

          <p className="text-gray-400 text-sm mt-2">
            {desc}
          </p>
        </div>

        <ArrowRight
          className="
            text-gray-500
            group-hover:text-[#d97706]
            group-hover:translate-x-1
            transition
          "
          size={18}
        />
      </div>
    </Link>
  );
}

/* PARSER */
function extract(text, key) {
  if (!text) return null;

  const lines = text.split("\n");

  const found = lines.find((l) =>
    l.toLowerCase().includes(key.toLowerCase())
  );

  return found
    ? found.split(":")[1]?.trim()
    : null;
}