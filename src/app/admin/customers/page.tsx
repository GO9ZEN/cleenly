"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Search, Mail, Phone, Calendar } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  created_at: string;
  total_bookings: number;
};

type ProfileRaw = {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const supabase = createClient();

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      if (profiles) {
        // Get booking counts for each customer
        const customerData = await Promise.all(
          (profiles as ProfileRaw[]).map(async (p) => {
            const { count } = await supabase
              .from("bookings")
              .select("*", { count: "exact", head: true })
              .eq("customer_id", p.id);

            // Get email from auth (we store it in metadata)
            return {
              id: p.id,
              full_name: p.full_name || "Unknown",
              phone: p.phone || "—",
              email: "—",
              created_at: p.created_at?.split("T")[0] || "—",
              total_bookings: count || 0,
            };
          }),
        );
        setCustomers(customerData);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Customers</h1>
        <p className="text-gray-400 mt-1">
          All registered customers on CLEENLY
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Active Today", value: "—" },
          {
            label: "Avg Bookings",
            value: customers.length
              ? (
                  customers.reduce((s, c) => s + c.total_bookings, 0) /
                  customers.length
                ).toFixed(1)
              : 0,
          },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-extrabold text-teal-500">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading customers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-gray-500 font-medium">No customers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg shrink-0">
                    {customer.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {customer.full_name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={11} /> {customer.phone}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} /> Joined {customer.created_at}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Count Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-center bg-teal-50 px-4 py-2 rounded-xl">
                    <p className="text-lg font-extrabold text-teal-500">
                      {customer.total_bookings}
                    </p>
                    <p className="text-xs text-gray-400">Bookings</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
