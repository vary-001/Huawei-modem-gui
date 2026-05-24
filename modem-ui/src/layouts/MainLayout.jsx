import { NavLink } from "react-router-dom";
import { Wifi, MessageSquare, Terminal, Settings, Home, Phone } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "SMS", path: "/sms", icon: MessageSquare },
  { name: "Contacts", path: "/contacts", icon: Phone },
  { name: "USSD", path: "/ussd", icon: Terminal },
  { name: "Internet", path: "/internet", icon: Wifi },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b0b0b] border-r border-[#1a1a1a] p-4">

        <h1 className="text-xl font-bold text-[#d97706] mb-8">
          Modem UI
        </h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  transition
                  ${
                    isActive
                      ? "bg-[#111] text-[#d97706]"
                      : "text-white hover:text-[#d97706] hover:bg-[#111]"
                  }
                `
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>

    </div>
  );
}