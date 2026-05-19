"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/cleaners", icon: Briefcase, label: "Cleaners" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static flex flex-col
      `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
          <Image src="/logo.png" alt="Cleenly" width={32} height={32} />
          <div>
            <span className="text-xl font-bold text-teal-400">CLEENLY</span>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="mx-4 mt-4 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Shield size={16} className="text-teal-400" />
          <span className="text-teal-400 text-sm font-semibold">
            Super Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-teal-500" />
            <span className="text-sm font-semibold text-gray-700">
              Admin Control Panel
            </span>
          </div>
          <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
