"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  User,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  FileText,
  Shield,
  Save,
} from "lucide-react";

type Profile = {
  full_name: string;
  phone: string;
  email: string;
};

type CleanerProfile = {
  verification_status: string;
  nic_number: string;
  bio: string;
  service_areas: string[];
  nic_document_url: string;
  police_report_url: string;
};

const cities = [
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Kurunegala",
  "Jaffna",
  "Matara",
  "Anuradhapura",
];

export default function CleanerProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    email: "",
  });

  const [cleanerProfile, setCleanerProfile] = useState<CleanerProfile>({
    verification_status: "pending",
    nic_number: "",
    bio: "",
    service_areas: [],
    nic_document_url: "",
    police_report_url: "",
  });

  const [nicFile, setNicFile] = useState<File | null>(null);
  const [policeFile, setPoliceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Get base profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile({
          full_name: prof.full_name || "",
          phone: prof.phone || "",
          email: user.email || "",
        });
      }

      // Get cleaner profile
      const { data: cleanerProf } = await supabase
        .from("cleaner_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cleanerProf) {
        setCleanerProfile({
          verification_status: cleanerProf.verification_status || "pending",
          nic_number: cleanerProf.nic_number || "",
          bio: cleanerProf.bio || "",
          service_areas: cleanerProf.service_areas || [],
          nic_document_url: cleanerProf.nic_document_url || "",
          police_report_url: cleanerProf.police_report_url || "",
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const toggleArea = (city: string) => {
    setCleanerProfile((prev) => ({
      ...prev,
      service_areas: prev.service_areas.includes(city)
        ? prev.service_areas.filter((a) => a !== city)
        : [...prev.service_areas, city],
    }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}.${ext}`;

    const { error } = await supabase.storage
      .from("cleaner-documents")
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return path;
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const supabase = createClient();
      let nicUrl = cleanerProfile.nic_document_url;
      let policeUrl = cleanerProfile.police_report_url;

      // Upload documents if selected
      if (nicFile || policeFile) {
        setUploading(true);
        if (nicFile) nicUrl = await uploadFile(nicFile, "nic");
        if (policeFile)
          policeUrl = await uploadFile(policeFile, "police_report");
        setUploading(false);
      }

      // Update base profile
      await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", userId);

      // Update cleaner profile
      await supabase
        .from("cleaner_profiles")
        .update({
          nic_number: cleanerProfile.nic_number,
          bio: cleanerProfile.bio,
          service_areas: cleanerProfile.service_areas,
          nic_document_url: nicUrl,
          police_report_url: policeUrl,
        })
        .eq("id", userId);

      setCleanerProfile((prev) => ({
        ...prev,
        nic_document_url: nicUrl,
        police_report_url: policeUrl,
      }));

      setSuccessMsg("Profile updated successfully!");
      setNicFile(null);
      setPoliceFile(null);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    }

    setSaving(false);
  };

  const verificationBadge = () => {
    if (cleanerProfile.verification_status === "approved") {
      return (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          <CheckCircle size={18} />
          <div>
            <p className="font-semibold text-sm">Profile Approved</p>
            <p className="text-xs text-green-600">You can now accept jobs!</p>
          </div>
        </div>
      );
    }
    if (cleanerProfile.verification_status === "rejected") {
      return (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <XCircle size={18} />
          <div>
            <p className="font-semibold text-sm">Verification Rejected</p>
            <p className="text-xs text-red-600">
              Please re-upload your documents.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl">
        <Clock size={18} />
        <div>
          <p className="font-semibold text-sm">Verification Pending</p>
          <p className="text-xs text-orange-600">
            Admin will review your documents shortly.
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-gray-400 mt-1">
          Complete your profile to start receiving jobs
        </p>
      </motion.div>

      {/* Verification Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {verificationBadge()}
      </motion.div>

      {/* Success / Error */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
        >
          <CheckCircle size={16} /> {successMsg}
        </motion.div>
      )}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6"
        >
          {errorMsg}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <User size={16} className="text-teal-500" />
            </div>
            <h2 className="font-bold text-gray-800">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+94 77 123 4567"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={cleanerProfile.bio}
                onChange={(e) =>
                  setCleanerProfile({ ...cleanerProfile, bio: e.target.value })
                }
                placeholder="Tell customers about yourself, your experience, and what makes you great at cleaning..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Service Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-teal-500" />
            </div>
            <h2 className="font-bold text-gray-800">Service Areas</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Select cities where you can provide cleaning services
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => toggleArea(city)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  cleanerProfile.service_areas.includes(city)
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-gray-100 hover:border-teal-300 text-gray-600"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Verification Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-teal-500" />
            </div>
            <h2 className="font-bold text-gray-800">Verification Documents</h2>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 text-sm text-teal-700">
            📋 Upload your NIC and Police Clearance Certificate. These will be
            reviewed by admin before you can accept jobs.
          </div>

          <div className="space-y-5">
            {/* NIC Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIC Number
              </label>
              <input
                type="text"
                value={cleanerProfile.nic_number}
                onChange={(e) =>
                  setCleanerProfile({
                    ...cleanerProfile,
                    nic_number: e.target.value,
                  })
                }
                placeholder="e.g. 199912345678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
              />
            </div>

            {/* NIC Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIC Document{" "}
                <span className="text-gray-400">(front & back photo)</span>
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  nicFile
                    ? "border-teal-400 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {nicFile ? (
                    <>
                      <CheckCircle size={24} className="text-teal-500" />
                      <p className="text-sm font-medium text-teal-600">
                        {nicFile.name}
                      </p>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">
                        {cleanerProfile.nic_document_url
                          ? "✅ Already uploaded — click to replace"
                          : "Click to upload NIC"}
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG or PDF up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => setNicFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Police Report */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police Clearance Certificate
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  policeFile
                    ? "border-teal-400 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {policeFile ? (
                    <>
                      <CheckCircle size={24} className="text-teal-500" />
                      <p className="text-sm font-medium text-teal-600">
                        {policeFile.name}
                      </p>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">
                        {cleanerProfile.police_report_url
                          ? "✅ Already uploaded — click to replace"
                          : "Click to upload Police Report"}
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG or PDF up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => setPoliceFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploading ? "Uploading documents..." : "Saving profile..."}
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
