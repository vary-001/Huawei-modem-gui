import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Search,
  User,
  ContactRound,
  Smartphone,
} from "lucide-react";

const API_URL = "http://localhost:3001/api/contacts/list";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // decode hex unicode names from SIM
  const decodeName = (hex) => {
    try {
      if (!hex) return "Unknown";

      if (/^[0-9A-Fa-f]+$/.test(hex)) {
        return hex
          .match(/.{1,4}/g)
          .map((chunk) =>
            String.fromCharCode(parseInt(chunk, 16))
          )
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

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="
              w-14 h-14 rounded-2xl
              bg-[#d97706]/20
              border border-[#d97706]/40
              flex items-center justify-center
              shadow-lg shadow-orange-900/20
            "
          >
            <ContactRound
              size={28}
              className="text-[#d97706]"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              SIM Contacts
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Manage contacts stored on your modem SIM card
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-[350px]">
          <Search
            size={18}
            className="
              absolute left-4 top-1/2 -translate-y-1/2
              text-gray-500
            "
          />

          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-11 pr-4 py-3
              bg-[#111111]
              border border-[#2b2b2b]
              rounded-2xl
              text-white
              outline-none
              focus:border-[#d97706]
              focus:ring-2 focus:ring-[#d97706]/20
              transition
            "
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          className="
            bg-[#111111]
            border border-[#262626]
            rounded-2xl
            p-5
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Total Contacts
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {contacts.length}
              </h2>
            </div>

            <div
              className="
                w-12 h-12 rounded-xl
                bg-[#d97706]/20
                flex items-center justify-center
              "
            >
              <User className="text-[#d97706]" />
            </div>
          </div>
        </div>

        <div
          className="
            bg-[#111111]
            border border-[#262626]
            rounded-2xl
            p-5
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                International Numbers
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {
                  contacts.filter((c) =>
                    c.number?.startsWith("+")
                  ).length
                }
              </h2>
            </div>

            <div
              className="
                w-12 h-12 rounded-xl
                bg-[#d97706]/20
                flex items-center justify-center
              "
            >
              <Smartphone className="text-[#d97706]" />
            </div>
          </div>
        </div>

        <div
          className="
            bg-[#111111]
            border border-[#262626]
            rounded-2xl
            p-5
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Search Results
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {filteredContacts.length}
              </h2>
            </div>

            <div
              className="
                w-12 h-12 rounded-xl
                bg-[#d97706]/20
                flex items-center justify-center
              "
            >
              <Search className="text-[#d97706]" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTACTS */}
      <div
        className="
          bg-[#0f0f0f]
          border border-[#232323]
          rounded-3xl
          overflow-hidden
        "
      >
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Loading contacts...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">
            {error}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No contacts found.
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e1e]">
            {filteredContacts.map((contact) => {
              const initials =
                contact.decodedName?.charAt(0)?.toUpperCase() ||
                "?";

              return (
                <div
                  key={contact.index}
                  className="
                    group
                    px-6 py-5
                    hover:bg-[#151515]
                    transition-all duration-300
                    cursor-pointer
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* AVATAR */}
                      <div
                        className="
                          w-14 h-14 rounded-2xl
                          bg-gradient-to-br
                          from-[#d97706]
                          to-orange-900
                          flex items-center justify-center
                          text-white font-bold text-lg
                          shadow-lg
                          shrink-0
                        "
                      >
                        {initials}
                      </div>

                      {/* INFO */}
                      <div className="min-w-0">
                        <h2
                          className="
                            text-white font-semibold text-lg
                            truncate
                            group-hover:text-[#d97706]
                            transition
                          "
                        >
                          {contact.decodedName || "Unknown"}
                        </h2>

                        <div className="flex items-center gap-2 mt-1">
                          <Phone
                            size={14}
                            className="text-gray-500"
                          />

                          <p className="text-gray-400 text-sm">
                            {contact.number || "No number"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right shrink-0">
                      <div
                        className="
                          inline-flex items-center
                          px-3 py-1 rounded-full
                          text-xs font-medium
                          bg-[#d97706]/10
                          text-[#f59e0b]
                          border border-[#d97706]/20
                        "
                      >
                        SIM #{contact.index}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Type: {contact.type}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}