"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

type Cleaner = {
  id: string;
  full_name: string;
  phone: string;
  verification_status: string;
  nic_number: string;
  created_at: string;
};

type CleanerRaw = {
  id: string;
  verification_status: string;
  nic_number: string | null;
  profiles: {
    full_name: string;
    phone: string;
    created_at: string;
  } | null;
};

export default function AdminCleanersPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchCleaners = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cleaner_profiles")
      .select(`
        id,
        verification_status,
        nic_number,
        profiles(full_name, phone, created_at)
      `)
      .order("created_at", { referencedTable: "profiles", ascending: false });

    if (data) {
      setCleaners(
        (data as unknown as CleanerRaw[]).map((c) => ({
          id: c.id,
          full_name: c.profiles?.full_name || "Unknown",
          phone: c.profiles?.phone || "—",
          verification_status: c.verification_status,
          nic_number: c.nic_number || "Not uploaded",
          created_at: c.profiles?.created_at?.split("T")[0] || "—",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  const updateVerification = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase
      .from("cleaner_profiles")
      .update({ verification_status: status })
      .eq("id", id);

    setCleaners((prev) =>
      prev.map((c) => c.id === id ? { ...c, verification_status: status } : c)
    );
  };

  const filtered = cleaners
    .filter((c) => filter === "all" || c.verification_status === filter)
    .filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));

  const statusColor: Record<string, string> = {
    pending: "bg-orange-100 text-orange-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Cleaner Management</h1>
        <p className="text-gray-400 mt-1">Verify and manage cleaner applications</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cleaners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-teal-500 text-white"
                  : "bg-white text-gray-500 hover:bg-teal-50 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading cleaners...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🧹</div>
          <p className="text-gray-500 font-medium">No cleaners found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((cleaner, i) => (
            <motion.div
              key={cleaner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                    {cleaner.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{cleaner.full_name}</h3>
                    <p className="text-sm text-gray-400">{cleaner.phone} · Joined {cleaner.created_at}</p>
                    <p className="text-xs text-gray-400 mt-0.5">NIC: {cleaner.nic_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1 ${statusColor[cleaner.verification_status]}`}>
                    {cleaner.verification_status === "pending" && <Clock size={10} />}
                    {cleaner.verification_status === "approved" && <CheckCircle size={10} />}
                    {cleaner.verification_status === "rejected" && <XCircle size={10} />}
                    {cleaner.verification_status}
                  </span>

                  {cleaner.verification_status === "pending" && (
                    <>
                      <button
                        onClick={() => updateVerification(cleaner.id, "approved")}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => updateVerification(cleaner.id, "rejected")}
                        className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}

                  {cleaner.verification_status === "approved" && (
                    <button
                      onClick={() => updateVerification(cleaner.id, "rejected")}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Revoke
                    </button>
                  )}

                  {cleaner.verification_status === "rejected" && (
                    <button
                      onClick={() => updateVerification(cleaner.id, "approved")}
                      className="text-xs text-green-500 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 transition-colors"
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}