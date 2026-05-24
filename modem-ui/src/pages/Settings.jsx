import {
  useState
} from "react";

import {
  Settings as SettingsIcon,
  Wifi,
  Smartphone,
  RefreshCw,
  Code2,
  Link2Icon,
  ExternalLink
} from "lucide-react";

export default function Settings() {
  const [theme] = useState("dark");

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-[#d97706]" />
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-400 text-sm">
            Manage modem system preferences & system info
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* MODEM STATUS */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="text-[#d97706]" />
            <h2 className="font-semibold">Modem Status</h2>
          </div>
          <p className="text-gray-400 text-sm">Connected via USB (USB modem detected)</p>
        </div>

        {/* NETWORK */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="text-[#d97706]" />
            <h2 className="font-semibold">Network Mode</h2>
          </div>
          <p className="text-gray-400 text-sm">3G / UMTS Preferred</p>
        </div>

        {/* SYSTEM ACTIONS */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition md:col-span-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-[#d97706]" />
            <h2 className="font-semibold">System Actions</h2>
          </div>

          <button className="mt-4 px-4 py-2 bg-[#d97706] hover:bg-orange-700 rounded-lg transition">
            Restart Modem Service
          </button>
        </div>

        {/* AUTHOR CARD */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition md:col-span-2">

          <h2 className="text-lg font-semibold mb-3 text-[#d97706]">
            Developer & Author
          </h2>

          <p className="text-gray-400 text-sm mb-4">
            Built with passion for Linux modem automation, real-time telecom
            monitoring, and network control systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">

            {/* GITHUB */}
            <a
              href="https://github.com/vary-001"
              target="_blank"
              className="
                flex items-center gap-2
                px-4 py-2 rounded-lg
                bg-[#111] hover:bg-[#1a1a1a]
                border border-[#222]
                hover:border-[#d97706]
                transition
              "
            >
              <Code2 size={18} />
              GitHub: vary-001
              <ExternalLink size={14} className="opacity-60" />
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://instagram.com/vary_dev"
              target="_blank"
              className="
                flex items-center gap-2
                px-4 py-2 rounded-lg
                bg-[#111] hover:bg-[#1a1a1a]
                border border-[#222]
                hover:border-[#d97706]
                transition
              "
            >
              <Link2Icon size={18} />
              Instagram: vary_dev
              <ExternalLink size={14} className="opacity-60" />
            </a>

          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="bg-black border border-[#1a1a1a] p-5 rounded-xl md:col-span-2 text-center">

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} VaryDev Systems. All rights reserved.
          </p>

          <p className="text-xs text-gray-600 mt-2">
            Unauthorized copying, modification, or redistribution is prohibited.
          </p>

        </div>

      </div>
    </div>
  );
}