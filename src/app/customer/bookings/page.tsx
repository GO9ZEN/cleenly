"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

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
  created_at: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-orange-100 text-orange-600",
  confirmed: "bg-blue-100 text-blue-600",
  in_progress: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const serviceIcon: Record<string, string> = {
  "Home Cleaning": "🏠",
  "Office Cleaning": "🏢",
  "Deep Cleaning": "🧹",
  "Vehicle Cleaning": "🚗",
  "Post-Event Cleanup": "🎉",
  "Post-Construction": "🏗️",
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setBookings(data);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="text-gray-400 mt-1">
            Track and manage your cleaning bookings
          </p>
        </div>
        <Link
          href="/customer/bookings/new"
          className="btn-primary flex items-center gap-2 text-sm px-5 py-3"
        >
          <Plus size={16} /> New Booking
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-500 hover:bg-teal-50 border border-gray-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="text-5xl mb-3">🧹</div>
          <p className="text-gray-500 font-medium">No bookings found</p>
          <p className="text-gray-400 text-sm mt-1">
            Book your first cleaning service!
          </p>
          <Link
            href="/customer/bookings/new"
            className="btn-primary inline-block mt-4 text-sm px-6 py-2.5"
          >
            Book Now
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl">
                    {serviceIcon[booking.service_type] || "🧹"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {booking.service_type}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[booking.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-teal-500 text-lg">
                    LKR {booking.total_amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {booking.payment_method}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-teal-400 shrink-0" />
                  {booking.scheduled_date} at {booking.scheduled_time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-400 shrink-0" />
                  {booking.address}, {booking.city}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Booked on {new Date(booking.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  {booking.status === "pending" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button className="text-xs text-teal-500 flex items-center gap-1 hover:underline">
                    Details <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
