"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";

type Booking = {
  id: string;
  service_type: string;
  scheduled_date: string;
  total_amount: number;
  status: string;
};

export default function EarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bookings")
        .select("id, service_type, scheduled_date, total_amount, status")
        .eq("cleaner_id", user.id)
        .order("scheduled_date", { ascending: false });

      if (data) setBookings(data);
      setLoading(false);
    };
    fetchEarnings();
  }, []);

  const completed = bookings.filter((b) => b.status === "completed");
  const totalEarned = completed.reduce(
    (sum, b) => sum + b.total_amount * 0.8,
    0,
  );
  const pending = bookings
    .filter((b) => b.status === "confirmed" || b.status === "in_progress")
    .reduce((sum, b) => sum + b.total_amount * 0.8, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Earnings</h1>
        <p className="text-gray-400 mt-1">Track your income from CLEENLY</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: DollarSign,
            label: "Total Earned",
            value: `LKR ${totalEarned.toLocaleString()}`,
            color: "text-teal-500",
            bg: "bg-teal-50",
          },
          {
            icon: Clock,
            label: "Pending Payout",
            value: `LKR ${pending.toLocaleString()}`,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            icon: CheckCircle,
            label: "Jobs Completed",
            value: completed.length,
            color: "text-green-500",
            bg: "bg-green-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div
                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <TrendingUp size={20} className="text-teal-500 shrink-0" />
        <p className="text-sm text-teal-700">
          You receive <strong>80%</strong> of every booking. Payouts are
          processed every <strong>Friday</strong> via bank transfer.
        </p>
      </div>

      {/* Earnings Table */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-5">Transaction History</h3>
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : completed.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-gray-500 font-medium">No earnings yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Complete jobs to start earning
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {b.service_type}
                    </p>
                    <p className="text-xs text-gray-400">{b.scheduled_date}</p>
                  </div>
                </div>
                <p className="font-bold text-green-500">
                  + LKR {(b.total_amount * 0.8).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
