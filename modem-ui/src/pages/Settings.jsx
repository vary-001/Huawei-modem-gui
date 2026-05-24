import { useState } from "react";
import { Settings as SettingsIcon, Wifi, Smartphone, RefreshCw } from "lucide-react";

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
            Manage modem system preferences
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
          <p className="text-gray-400 text-sm">Connected via USB</p>
        </div>

        {/* NETWORK */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="text-[#d97706]" />
            <h2 className="font-semibold">Network Mode</h2>
          </div>
          <p className="text-gray-400 text-sm">3G / UMTS Preferred</p>
        </div>

        {/* REFRESH */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] p-5 rounded-xl hover:border-[#d97706] transition md:col-span-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-[#d97706]" />
            <h2 className="font-semibold">System Actions</h2>
          </div>

          <button className="mt-4 px-4 py-2 bg-[#d97706] hover:bg-orange-700 rounded-lg transition">
            Restart Modem Service
          </button>
        </div>

      </div>
    </div>
  );
}