"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
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
  address: string;
  city: string;
  status: string;
  total_amount: number;
};

type VerificationStatus = "pending" | "approved" | "rejected" | null;

export default function CleanerDashboard() {
  const [userName, setUserName] = useState("there");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const name = user.user_metadata?.full_name || "there";
      setUserName(name.split(" ")[0]);

      // Get cleaner verification status
      const { data: cleanerProfile } = await supabase
        .from("cleaner_profiles")
        .select("verification_status")
        .eq("id", user.id)
        .single();

      if (cleanerProfile) {
        setVerificationStatus(cleanerProfile.verification_status);
      }

      // Get assigned jobs
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("cleaner_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (bookings) {
        setJobs(bookings.slice(0, 3));
        setStats({
          totalJobs: bookings.length,
          completedJobs: bookings.filter((b) => b.status === "completed").length,
          pendingJobs: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
          totalEarnings: bookings
            .filter((b) => b.status === "completed")
            .reduce((sum, b) => sum + (b.total_amount * 0.8), 0),
        });
      }
    };

    fetchData();
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
        <p className="text-gray-400 mt-1">Here&apos;s your work overview</p>
      </motion.div>

      {/* Verification Banner */}
      {verificationStatus === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 flex items-start gap-4"
        >
          <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold text-orange-700">Verification Pending</p>
            <p className="text-sm text-orange-600 mt-1">
              Your profile is under review. Please upload your NIC and Police Clearance to get approved faster.
            </p>
            <Link
              href="/cleaner/profile"
              className="inline-block mt-3 text-sm font-semibold text-orange-600 underline"
            >
              Complete Profile →
            </Link>
          </div>
        </motion.div>
      )}

      {verificationStatus === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-6 flex items-center gap-4"
        >
          <CheckCircle className="text-teal-500 shrink-0" size={22} />
          <div>
            <p className="font-semibold text-teal-700">Profile Approved ✅</p>
            <p className="text-sm text-teal-600 mt-0.5">
              You&apos;re verified and ready to accept jobs!
            </p>
          </div>
        </motion.div>
      )}

      {verificationStatus === "rejected" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-4"
        >
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold text-red-700">Verification Rejected</p>
            <p className="text-sm text-red-600 mt-1">
              Your application was rejected. Please re-upload your documents or contact support.
            </p>
            <Link
              href="/cleaner/profile"
              className="inline-block mt-3 text-sm font-semibold text-red-600 underline"
            >
              Re-upload Documents →
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: Briefcase, label: "Total Jobs", value: stats.totalJobs, color: "text-blue-500", bg: "bg-blue-50" },
          { icon: CheckCircle, label: "Completed", value: stats.completedJobs, color: "text-green-500", bg: "bg-green-50" },
          { icon: Clock, label: "Upcoming", value: stats.pendingJobs, color: "text-orange-500", bg: "bg-orange-50" },
          { icon: DollarSign, label: "Earnings (LKR)", value: stats.totalEarnings.toLocaleString(), color: "text-teal-500", bg: "bg-teal-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp} className="card">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Upcoming Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-lg">Upcoming Jobs</h3>
          <Link
            href="/cleaner/jobs"
            className="text-sm text-teal-500 hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🧹</div>
            <p className="text-gray-500 font-medium">No jobs assigned yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Complete your profile to start receiving jobs
            </p>
            <Link
              href="/cleaner/profile"
              className="btn-primary inline-block mt-4 text-sm px-6 py-2.5"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                    🧹
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{job.service_type}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} /> {job.scheduled_date} at {job.scheduled_time}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {job.city}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-500 text-sm">
                    LKR {(job.total_amount * 0.8).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                    job.status === "completed" ? "bg-green-100 text-green-600" :
                    job.status === "confirmed" ? "bg-blue-100 text-blue-600" :
                    "bg-orange-100 text-orange-600"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl p-6 text-white"
      >
        <h3 className="font-bold text-lg mb-3">💡 Tips to Get More Jobs</h3>
        <ul className="space-y-2 text-sm text-white/90">
          <li>✅ Complete your profile with a photo</li>
          <li>✅ Upload NIC and Police Clearance quickly</li>
          <li>✅ Keep your rating above 4.5 stars</li>
          <li>✅ Always be on time and professional</li>
        </ul>
      </motion.div>
    </div>
  );
}