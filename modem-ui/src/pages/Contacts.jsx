import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Search,
  User,
  ContactRound,
  Smartphone,
  Download,
  Copy,
  Check,
} from "lucide-react";

const API_URL = "http://localhost:3001/api/contacts/list";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const decodeName = (hex) => {
    try {
      if (!hex) return "Unknown";
      if (/^[0-9A-Fa-f]+$/.test(hex)) {
        return hex
          .match(/.{1,4}/g)
          .map((chunk) => String.fromCharCode(parseInt(chunk, 16)))
          .join("")
          .replace(/\0/g, "")
          .trim();
      }
      return hex;
    } catch {
      return hex;
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.success) {
          const cleaned = (json.contacts || []).map((c) => ({
            ...c,
            decodedName: decodeName(c.name),
          }));
          setContacts(cleaned);
        } else {
          setError(json.error || "Failed to load contacts.");
        }
      } catch (err) {
        setError(err.message || "Failed to load contacts.");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const q = search.toLowerCase();
      return (
        contact.decodedName?.toLowerCase().includes(q) ||
        contact.number?.includes(q)
      );
    });
  }, [contacts, search]);

  const copyToClipboard = (contact) => {
    const text = `${contact.decodedName}: ${contact.number}`;
    navigator.clipboard.writeText(text);
    setCopiedId(contact.index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to Google Contacts CSV format
  const exportToCSV = () => {
    if (filteredContacts.length === 0) return;

    // Google Contacts CSV Headers
    const headers = ["Name", "Given Name", "Family Name", "Phone 1 - Type", "Phone 1 - Value"];
    
    const rows = filteredContacts.map(c => {
      const name = c.decodedName || "Unknown";
      // Basic logic to split name for Given/Family name fields
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      return [
        `"${name}"`,
        `"${firstName}"`,
        `"${lastName}"`,
        "Mobile",
        `"${c.number}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `google_contacts_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-white p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-600/40 flex items-center justify-center">
            <ContactRound size={24} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SIM Contacts</h1>
            <p className="text-gray-400 text-xs">Manage and export modem contacts</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#2b2b2b] rounded-xl text-sm focus:border-orange-500 outline-none transition"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* STATS - Smaller version */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", val: contacts.length, icon: User },
          { label: "Found", val: filteredContacts.length, icon: Search },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-[#262626] p-3 rounded-xl flex items-center gap-3">
            <stat.icon size={18} className="text-orange-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold leading-none">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACTS GRID */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.index}
              className="group bg-[#111] border border-[#232323] hover:border-orange-500/50 p-3 rounded-2xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Small Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                  {contact.decodedName?.charAt(0)?.toUpperCase() || "?"}
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-semibold truncate text-gray-100 group-hover:text-orange-400 transition">
                    {contact.decodedName || "Unknown"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} className="text-gray-500" />
                    <p className="text-xs text-gray-400 truncate">{contact.number}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right mr-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                    SIM #{contact.index}
                  </span>
                </div>
                
                {/* Actions */}
                <button
                  onClick={() => copyToClipboard(contact)}
                  className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 transition"
                  title="Copy Contact"
                >
                  {copiedId === contact.index ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-[#262626] rounded-2xl">
              No contacts found
            </div>
          )}
        </div>
      )}
    </div>
  );
}