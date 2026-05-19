"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";

type Booking = {
  id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  city: string;
  status: string;
  total_amount: number;
  notes: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-orange-100 text-orange-600",
  confirmed: "bg-blue-100 text-blue-600",
  in_progress: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function CleanerJobsPage() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("cleaner_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("bookings").update({ status }).eq("id", id);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Jobs</h1>
        <p className="text-gray-400 mt-1">Manage your assigned cleaning jobs</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "confirmed", "in_progress", "completed"].map(
          (f) => (
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
          ),
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                    🧹
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {job.service_type}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[job.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="font-extrabold text-teal-500">
                  LKR {(job.total_amount * 0.8).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-teal-400" />
                  {job.scheduled_date} at {job.scheduled_time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-400" />
                  {job.city}
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin size={14} className="text-gray-300" />
                  {job.address}
                </div>
                {job.notes && (
                  <div className="flex items-start gap-2 col-span-2">
                    <Clock size={14} className="text-gray-300 mt-0.5" />
                    <span className="text-gray-400 italic">{job.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {job.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(job.id, "in_progress")}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Start Job
                  </button>
                )}
                {job.status === "in_progress" && (
                  <button
                    onClick={() => updateStatus(job.id, "completed")}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Mark Complete ✓
                  </button>
                )}
                {job.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(job.id, "confirmed")}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Accept Job
                    </button>
                    <button
                      onClick={() => updateStatus(job.id, "cancelled")}
                      className="text-xs px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
