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
  Zap,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function Dashboard() {
  const { modem, status } = useModem();

  // Data Extraction
  const signal = extract(modem, "signal quality");
  const network = extract(modem, "access tech");
  const operator = extract(modem, "operator name");
  const sim = extract(modem, "own");
  const state = extract(modem, "state");
  const model = extract(modem, "model");
  const imei = extract(modem, "imei");

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* --- HERO SECTION --- */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-900 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          
          {/* Animated Background Element */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full -mr-20 -mt-20 animate-pulse" />

          {/* Left: Content */}
          <div className="flex-1 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} className="animate-pulse" />
              System Online
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
              Modem <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Command</span> Center
            </h1>
            <p className="text-gray-400 mt-6 text-lg max-w-xl leading-relaxed">
              Experience total control over your modem hardware. Manage high-speed 
              messaging, voice calls, and real-time network diagnostics.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-10">
              <Link to="/sms/send" className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2">
                Send Message <ArrowRight size={18} />
              </Link>
              <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-sm font-medium text-gray-300">Modem: {status}</span>
              </div>
            </div>
          </div>

          {/* Right: Modern Modem HUD Card */}
          <div className="w-full lg:w-[400px] bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center border border-orange-600/30">
                  <Router className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{model || "Hardware"}</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Dev-ID: {imei?.substring(0, 8)}...</p>
                </div>
              </div>
              <SignalBars signalStrength={signal} />
            </div>

            <div className="space-y-5">
              <HUDLine label="Operator" value={operator || "Searching..."} icon={<Globe size={14} />} color="text-blue-400" />
              <HUDLine label="Access Tech" value={network || "None"} icon={<Wifi size={14} />} color="text-green-400" />
              <HUDLine label="SIM Status" value={state || "Checking"} icon={<Cpu size={14} />} color="text-orange-400" />
              
              {/* Voice/SMS Quick Stats Indicators */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
                <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Phone size={18} className="text-orange-500 mb-1" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Voice Ready</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                  <MessageSquare size={18} className="text-orange-500 mb-1" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">SMS Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK ACCESS GRID --- */}
      <section>
        <div className="flex items-end justify-between mb-6 px-2">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Management Suite</h2>
            <p className="text-gray-500 text-sm">Select a module to interact with the modem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NavCard to="/sms" title="Inbox" desc="Manage messages" icon={<MessageSquare />} count="Live" />
          <NavCard to="/call" title="Phone" desc="Voice Terminal" icon={<Phone />} count="New" />
          <NavCard to="/contacts" title="Directory" desc="SIM Contacts" icon={<Contact />} />
          <NavCard to="/ussd" title="Services" desc="USSD Sessions" icon={<Globe />} />
        </div>
      </section>

      {/* --- LIVE SYSTEM LOGS --- */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-orange-500" />
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Real-time Telemetry</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-green-500 uppercase">Stream Active</span>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-black/50 rounded-2xl p-6 border border-white/5 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto scrollbar-hide text-gray-400">
            {modem ? (
              modem.split('\n').map((line, i) => (
                <div key={i} className="mb-1">
                  <span className="text-orange-900 mr-4">[{new Date().toLocaleTimeString()}]</span>
                  <span className={line.includes(':') ? "text-gray-300" : "text-gray-600"}>{line}</span>
                </div>
              ))
            ) : (
              <span className="animate-pulse">Awaiting system handshake...</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** 
 * CUSTOM SVG SIGNAL BARS COMPONENT
 * Renders signal strength as cellular bars
 */
function SignalBars({ signalStrength }) {
  // Logic to determine bar count based on signal string (e.g., "15, 99")
  const value = parseInt(signalStrength?.split(',')[0]) || 0;
  const bars = value > 25 ? 4 : value > 18 ? 3 : value > 10 ? 2 : value > 0 ? 1 : 0;

  return (
    <div className="flex items-end gap-1 h-6">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1.5 rounded-sm transition-all duration-500 ${
            bar <= bars 
              ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
              : "bg-white/10"
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

function HUDLine({ label, value, icon, color }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        <span className={color}>{icon}</span>
        {label}
      </div>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function NavCard({ to, title, desc, icon, count }) {
  return (
    <Link to={to} className="group relative bg-[#111] border border-white/5 p-6 rounded-3xl hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all duration-300">
      {count && (
        <span className="absolute top-4 right-4 bg-orange-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md">
          {count}
        </span>
      )}
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-600/10 transition-all">
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-orange-500 transition-colors">{title}</h3>
      <p className="text-gray-500 text-sm leading-snug">{desc}</p>
      <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-orange-500 transition-all">
        Open Module <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function extract(text, key) {
  if (!text) return null;
  const lines = text.split("\n");
  const found = lines.find((l) => l.toLowerCase().includes(key.toLowerCase()));
  return found ? found.split(":")[1]?.trim() : null;
}