"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Calendar, MapPin, Search } from "lucide-react";

type BookingRaw = {
  id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  city: string;
  address: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  profiles: { full_name: string } | null;
};

type Booking = {
  id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  city: string;
  address: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  customer_name: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-orange-100 text-orange-600",
  confirmed: "bg-blue-100 text-blue-600",
  in_progress: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          profiles!bookings_customer_id_fkey(full_name)
        `,
        )
        .order("created_at", { ascending: false });

      if (data) {
        setBookings(
          (data as unknown as BookingRaw[]).map((b) => ({
            id: b.id,
            service_type: b.service_type,
            scheduled_date: b.scheduled_date,
            scheduled_time: b.scheduled_time,
            city: b.city,
            address: b.address,
            status: b.status,
            total_amount: b.total_amount,
            payment_method: b.payment_method,
            payment_status: b.payment_status,
            customer_name: b.profiles?.full_name || "Unknown",
          })),
        );
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter(
      (b) =>
        b.service_type.toLowerCase().includes(search.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">All Bookings</h1>
        <p className="text-gray-400 mt-1">
          Manage and track all platform bookings
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by service, customer, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            "all",
            "pending",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-teal-500 text-white"
                  : "bg-white text-gray-500 hover:bg-teal-50 border border-gray-200"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
            >
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                    🧹
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {booking.service_type}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Customer: {booking.customer_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor[booking.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                  <p className="font-extrabold text-teal-500 mt-1">
                    LKR {booking.total_amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-teal-400" />
                  {booking.scheduled_date} at {booking.scheduled_time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-teal-400" />
                  {booking.city}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(booking.id, "completed")}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
