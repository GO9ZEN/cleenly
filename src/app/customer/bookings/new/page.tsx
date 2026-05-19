"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const services = [
  { icon: "🏠", label: "Home Cleaning", price: 2500 },
  { icon: "🏢", label: "Office Cleaning", price: 3500 },
  { icon: "🧹", label: "Deep Cleaning", price: 4500 },
  { icon: "🚗", label: "Vehicle Cleaning", price: 1500 },
  { icon: "🎉", label: "Post-Event Cleanup", price: 3000 },
  { icon: "🏗️", label: "Post-Construction", price: 5000 },
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

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

const steps = ["Service", "Schedule", "Location", "Confirm"];

export default function NewBookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    service: "",
    serviceIcon: "",
    servicePrice: 0,
    date: "",
    time: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cash" as "cash" | "card" | "wallet",
  });

  const updateForm = (fields: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: bookingError } = await supabase.from("bookings").insert({
      customer_id: user.id,
      service_type: form.service,
      scheduled_date: form.date,
      scheduled_time: form.time,
      address: form.address,
      city: form.city,
      notes: form.notes,
      total_amount: form.servicePrice,
      payment_method: form.paymentMethod,
      status: "pending",
      payment_status: "unpaid",
    });

    if (bookingError) {
      setError(bookingError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-teal-500" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-400 mb-2">
          Your {form.service} has been booked.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          We&apos;ll assign a verified cleaner shortly and notify you.
        </p>
        <div className="bg-teal-50 rounded-2xl p-5 text-left mb-8 space-y-2">
          <p className="text-sm">
            <span className="font-semibold text-gray-700">Service:</span>{" "}
            <span className="text-gray-500">
              {form.serviceIcon} {form.service}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-semibold text-gray-700">Date:</span>{" "}
            <span className="text-gray-500">
              {form.date} at {form.time}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            <span className="text-gray-500">
              {form.address}, {form.city}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-semibold text-gray-700">Total:</span>{" "}
            <span className="text-teal-600 font-bold">
              LKR {form.servicePrice.toLocaleString()}
            </span>
          </p>
        </div>
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="btn-primary px-8 py-3"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">New Booking</h1>
        <p className="text-gray-400 mt-1">Book a verified cleaner in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: i <= step ? "#2a9d8f" : "#e5e7eb",
                  color: i <= step ? "#ffffff" : "#9ca3af",
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              >
                {i < step ? "✓" : i + 1}
              </motion.div>
              <span
                className={`text-xs mt-1 font-medium ${i <= step ? "text-teal-500" : "text-gray-400"}`}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300 ${i < step ? "bg-teal-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          {/* STEP 0 — Service */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Choose a Service
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {services.map((s) => (
                  <button
                    key={s.label}
                    onClick={() =>
                      updateForm({
                        service: s.label,
                        serviceIcon: s.icon,
                        servicePrice: s.price,
                      })
                    }
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                      form.service === s.label
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-100 hover:border-teal-200"
                    }`}
                  >
                    <span className="text-4xl">{s.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {s.label}
                    </span>
                    <span className="text-xs text-teal-500 font-bold">
                      LKR {s.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Schedule */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Pick Date & Time
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => updateForm({ date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => updateForm({ time: t })}
                        className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.time === t
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-gray-100 hover:border-teal-300 text-gray-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Service Location
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateForm({ city: c })}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.city === c
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-gray-100 hover:border-teal-300 text-gray-600"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => updateForm({ address: e.target.value })}
                    placeholder="No. 12, Main Street, Colombo 03"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Notes{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm({ notes: e.target.value })}
                    placeholder="e.g. 2 bedrooms, bring own supplies, pet at home..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Confirm Booking
              </h2>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-800">
                    {form.serviceIcon} {form.service}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-semibold text-gray-800">
                    {form.date} at {form.time}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[55%]">
                    {form.address}, {form.city}
                  </span>
                </div>
                {form.notes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[55%]">
                      {form.notes}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-extrabold text-teal-500 text-lg">
                    LKR {form.servicePrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["cash", "card", "wallet"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => updateForm({ paymentMethod: method })}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 capitalize transition-all ${
                        form.paymentMethod === method
                          ? "border-teal-500 bg-teal-50 text-teal-600"
                          : "border-gray-100 text-gray-500 hover:border-teal-200"
                      }`}
                    >
                      {method === "cash"
                        ? "💵 Cash"
                        : method === "card"
                          ? "💳 Card"
                          : "📱 Wallet"}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() =>
            step === 0 ? router.push("/customer/dashboard") : setStep(step - 1)
          }
          className="btn-secondary px-6 py-3"
        >
          {step === 0 ? "Cancel" : "← Back"}
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => {
              if (step === 0 && !form.service)
                return alert("Please select a service");
              if (step === 1 && (!form.date || !form.time))
                return alert("Please select date and time");
              if (step === 2 && (!form.city || !form.address))
                return alert("Please enter your location");
              setStep(step + 1);
            }}
            className="btn-primary px-6 py-3"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary px-8 py-3"
          >
            {loading ? "Booking..." : "Confirm Booking ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
