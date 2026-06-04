import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Wifi,
  MessageSquare,
  Terminal,
  Settings,
  Home,
  Phone,
  PhoneCall,
  Menu,
  X,
  Cpu,
  Activity,
  Bell,
  Search,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "SMS Inbox", path: "/sms", icon: MessageSquare },
  { name: "Contacts", path: "/contacts", icon: Phone },
  { name: "Voice Calls", path: "/call", icon: PhoneCall },
  { name: "USSD Code", path: "/ussd", icon: Terminal },
  { name: "Internet", path: "/internet", icon: Wifi },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentPage = navItems.find(item => item.path === location.pathname)?.name || "Overview";

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed md:relative z-50
          top-0 left-0 h-full
          w-72 md:w-64 lg:w-72
          bg-[#0a0a0a]/80 backdrop-blur-xl
          border-r border-white/5
          flex flex-col
          transition-transform duration-500 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* LOGO SECTION */}
        <div className="p-8">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center border border-orange-600/30 group-hover:scale-110 transition-transform">
              <img src="/modem.png" alt="Modem Icon" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                MODEM<span className="text-orange-500">PRO</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                v2.0 Enterprise
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION - FIXED NavLink logic here */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                ${isActive 
                  ? "bg-orange-600/10 text-orange-500 border border-orange-600/20 shadow-[0_0_20px_rgba(234,88,12,0.1)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }
              `}
            >
              {/* Using a function as a child to access isActive state safely */}
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* SYSTEM MINI CARD */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300">Modem Linked</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Signal</span>
                <span className="text-[10px] text-orange-500 font-bold">Excellent</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-orange-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* TOP HEADER */}
        <header 
          className={`
            sticky top-0 z-40 w-full h-20 px-6 lg:px-10 flex items-center justify-between
            transition-all duration-300
            ${scrolled ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"}
          `}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 bg-white/5 rounded-xl border border-white/10"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Pages</span>
                <span className="text-gray-700">/</span>
                <span className="text-white">{currentPage}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-gray-400 tracking-tighter">CPU 12%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-green-500" />
                  <span className="text-xs font-bold text-gray-400 tracking-tighter">LATENCY 42ms</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <button className="p-2.5 text-gray-400 hover:text-white transition-colors">
                  <Search size={20} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-white relative transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-[#050505]" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 p-[1px]">
                   <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center">
                      <span className="text-xs font-black">AD</span>
                   </div>
                </div>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {children}
        </main>

        {/* MOBILE OVERLAY */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
    </div>
  );
}