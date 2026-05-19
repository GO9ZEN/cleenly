"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: "🏠", label: "Home Cleaning" },
  { icon: "🏢", label: "Office" },
  { icon: "🧹", label: "Deep Clean" },
  { icon: "🚗", label: "Vehicle" },
  { icon: "🎉", label: "Post-Event" },
  { icon: "🏗️", label: "Construction" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function CustomerDashboard() {
  const [userName, setUserName] = useState("there");
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedJobs: 0,
    pendingJobs: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || "there";
        setUserName(name.split(" ")[0]);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900">
          Hey, {userName}! 👋
        </h1>
        <p className="text-gray-400 mt-1">What would you like cleaned today?</p>
      </motion.div>

      {/* Quick Book Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Quick Book</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Book a Cleaner Now</h2>
          <p className="text-teal-100 text-sm mb-4">
            Verified professionals available today
          </p>
          <Link
            href="/customer/bookings/new"
            className="inline-block bg-white text-teal-600 font-bold px-6 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            Book Now →
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            icon: CalendarDays,
            label: "Total Bookings",
            value: stats.totalBookings,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            icon: CheckCircle,
            label: "Completed",
            value: stats.completedJobs,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            icon: Clock,
            label: "Pending",
            value: stats.pendingJobs,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            icon: Star,
            label: "Avg Rating",
            value: stats.averageRating || "—",
            color: "text-yellow-500",
            bg: "bg-yellow-50",
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

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card mb-8"
      >
        <h3 className="font-bold text-gray-800 mb-4">Our Services</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {services.map((s) => (
            <Link
              key={s.label}
              href="/customer/bookings/new"
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <span className="text-xs text-gray-500 text-center font-medium">
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Bookings</h3>
          <Link
            href="/customer/bookings"
            className="text-sm text-teal-500 hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {/* Empty state */}
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🧹</div>
          <p className="text-gray-500 font-medium">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Book your first cleaning service!
          </p>
          <Link
            href="/customer/bookings/new"
            className="btn-primary inline-block mt-4 text-sm px-6 py-2.5"
          >
            Book Now
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
