"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

type Booking = {
  id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  city: string;
  status: string;
  total_amount: number;
};

type Cleaner = {
  id: string;
  full_name: string;
  verification_status: string;
};

type PendingCleanerRaw = {
  id: string;
  verification_status: string;
  profiles: {
    full_name: string;
  } | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCleaners: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingCleaners, setPendingCleaners] = useState<Cleaner[]>([]);

  const statusColor: Record<string, string> = {
    pending: "bg-orange-100 text-orange-600",
    confirmed: "bg-blue-100 text-blue-600",
    in_progress: "bg-purple-100 text-purple-600",
    completed: "bg-green-100 text-green-600",
    cancelled: "bg-red-100 text-red-600",
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { count: customers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer");

      const { count: cleaners } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "cleaner");

      const { data: bookings, count: bookingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      const { count: pendingVerif } = await supabase
        .from("cleaner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending");

      const { data: pendingList } = await supabase
        .from("cleaner_profiles")
        .select("id, verification_status, profiles(full_name)")
        .eq("verification_status", "pending")
        .limit(5);

      if (bookings) {
        const revenue = bookings
          .filter((b) => b.status === "completed")
          .reduce((sum: number, b) => sum + b.total_amount * 0.2, 0);

        setStats({
          totalCustomers: customers || 0,
          totalCleaners: cleaners || 0,
          totalBookings: bookingCount || 0,
          totalRevenue: revenue,
          pendingVerifications: pendingVerif || 0,
          pendingBookings: bookings.filter((b) => b.status === "pending")
            .length,
        });

        setRecentBookings(bookings.slice(0, 5));
      }

      if (pendingList) {
        setPendingCleaners(
          (pendingList as unknown as PendingCleanerRaw[]).map((p) => ({
            id: p.id,
            full_name: p.profiles?.full_name || "Unknown",
            verification_status: p.verification_status,
          })),
        );
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Full platform overview</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            icon: Users,
            label: "Total Customers",
            value: stats.totalCustomers,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            icon: Briefcase,
            label: "Total Cleaners",
            value: stats.totalCleaners,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            icon: CalendarDays,
            label: "Total Bookings",
            value: stats.totalBookings,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            icon: DollarSign,
            label: "Platform Revenue",
            value: `LKR ${stats.totalRevenue.toLocaleString()}`,
            color: "text-teal-500",
            bg: "bg-teal-50",
          },
          {
            icon: Clock,
            label: "Pending Verifications",
            value: stats.pendingVerifications,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            icon: Clock,
            label: "Pending Bookings",
            value: stats.pendingBookings,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp} className="card">
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-lg">Recent Bookings</h3>
            <Link
              href="/admin/bookings"
              className="text-sm text-teal-500 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No bookings yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {booking.service_type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.scheduled_date} · {booking.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[booking.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-xs text-teal-500 font-bold mt-1">
                      LKR {booking.total_amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Verifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-lg">
              Pending Verifications
            </h3>
            <Link
              href="/admin/cleaners"
              className="text-sm text-teal-500 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {pendingCleaners.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">All caught up!</p>
              <p className="text-gray-400 text-sm">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCleaners.map((cleaner) => (
                <div
                  key={cleaner.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">
                      {cleaner.full_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {cleaner.full_name}
                      </p>
                      <p className="text-xs text-orange-500">Awaiting review</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/cleaners"
                    className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-teal-600 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
