"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Role = "customer" | "cleaner";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone: form.phone,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Redirect based on role
    if (role === "customer") router.push("/customer/dashboard");
    if (role === "cleaner") router.push("/cleaner/dashboard");
  };

  return (
    <div className="w-full max-w-md my-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="Cleenly" width={56} height={56} />
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join CLEENLY today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(["customer", "cleaner"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                role === r
                  ? "bg-teal-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "customer" ? "🏠 Customer" : "🧹 Cleaner"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Sarasa Silva"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          {role === "cleaner" && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-700">
              📋 After registering, you&apos;ll need to upload your <strong>NIC</strong> and <strong>Police Clearance</strong> for verification before you can accept jobs.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center mt-2"
          >
            {loading ? "Creating Account..." : `Register as ${role === "customer" ? "Customer" : "Cleaner"}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-500 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <p className="text-center mt-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-teal-500 transition-colors">← Back to Home</Link>
      </p>
    </div>
  );
}