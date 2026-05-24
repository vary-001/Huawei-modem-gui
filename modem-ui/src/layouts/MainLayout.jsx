import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Wifi,
  MessageSquare,
  Terminal,
  Settings,
  Home,
  Phone,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "SMS", path: "/sms", icon: MessageSquare },
  { name: "Contacts", path: "/contacts", icon: Phone },
  { name: "USSD", path: "/ussd", icon: Terminal },
  { name: "Internet", path: "/internet", icon: Wifi },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#0b0b0b]/95 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-4">

        <h1 className="text-lg font-bold text-[#d97706]">
          Modem UI
        </h1>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="
            p-2 rounded-lg
            bg-[#111]
            border border-[#222]
            hover:border-[#d97706]
            hover:text-[#d97706]
            transition
          "
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative z-50
          top-0 left-0 h-full
          w-72 md:w-64
          bg-[#0b0b0b]
          border-r border-[#1a1a1a]
          p-5
          transition-transform duration-300

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* LOGO */}
        <div className="hidden md:block mb-10">
          <h1 className="text-2xl font-bold text-[#d97706] tracking-wide">
            Modem UI
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Linux Modem Management
          </p>
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-[#d97706]">
              Modem UI
            </h1>

            <p className="text-xs text-gray-500">
              Navigation
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="
              p-2 rounded-lg
              bg-[#111]
              border border-[#222]
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-4
                  px-4 py-3 rounded-xl
                  transition-all duration-300
                  border

                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-[#d97706]/20
                        to-[#ff9d2f]/10
                        border-[#d97706]/40
                        text-[#d97706]
                        shadow-lg shadow-orange-500/10
                      `
                      : `
                        border-transparent
                        text-gray-300
                        hover:bg-[#111]
                        hover:border-[#222]
                        hover:text-[#d97706]
                      `
                  }
                `
                }
              >
                <div
                  className="
                    p-2 rounded-lg
                    bg-[#111]
                    group-hover:bg-[#1a1a1a]
                    transition
                  "
                >
                  <Icon size={18} />
                </div>

                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* BOTTOM STATUS */}
        <div
          className="
            absolute bottom-5 left-5 right-5
            bg-[#111]
            border border-[#1f1f1f]
            rounded-2xl
            p-4
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

            <p className="text-sm font-medium">
              Modem Connected
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Real-time modem monitoring active
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1 overflow-auto
          p-4 md:p-6 lg:p-8
          pt-20 md:pt-6
        "
      >
        {children}
      </main>
    </div>
  );
}