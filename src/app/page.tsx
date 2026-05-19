"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { useState } from "react";

// ── ANIMATION VARIANTS ───────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

// ── SCROLL REVEAL WRAPPER ────────────────────────────────
function RevealOnScroll({
  children,
  variant = fadeUp,
  className = "",
}: {
  children: React.ReactNode;
  variant?: typeof fadeUp;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── NAVBAR ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white/80 backdrop-blur-sm"
      } border-b border-gray-100`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image src="/logo.png" alt="Cleenly Logo" width={36} height={36} />
          </motion.div>
          <span className="text-2xl font-bold text-teal-500">CLEENLY</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {(["how-it-works", "services", "why-us", "contact"] as const).map(
            (id) => (
              <a
                key={id}
                href={`#${id}`}
                className="hover:text-teal-500 transition-colors capitalize"
              >
                {id.replace(/-/g, " ")}
              </a>
            ),
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm px-4 py-2">
            Login
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1.5">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-gray-600"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-gray-600"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-gray-600"
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 px-6 overflow-hidden"
          >
            <div className="py-4 flex flex-col gap-4 text-sm font-medium text-gray-600">
              {(["how-it-works", "services", "why-us", "contact"] as const).map(
                (id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-teal-500 transition-colors capitalize"
                  >
                    {id.replace(/-/g, " ")}
                  </a>
                ),
              )}
              <Link href="/login" className="btn-secondary text-center text-sm">
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary text-center text-sm"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── HERO ─────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const stats = [
    { value: "500+", label: "Happy Customers" },
    { value: "120+", label: "Verified Cleaners" },
    { value: "1200+", label: "Jobs Completed" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-teal-50 via-white to-green-50 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left */}
        <motion.div
          style={{ y, opacity }}
          className="flex-1 text-center md:text-left"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block bg-teal-100 text-teal-600 text-sm font-semibold px-4 py-1 rounded-full mb-4"
          >
            🇱🇰 Sri Lanka&apos;s #1 Cleaning Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            Clean Spaces,
            <br />
            <span className="text-teal-500">Clear Minds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-gray-500 mb-8 max-w-lg"
          >
            Book verified, trained, and trusted cleaners in minutes. Homes,
            offices, events — we&apos;ve got it covered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="btn-primary text-base px-8 py-4 block text-center"
              >
                Book a Cleaner
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register?role=cleaner"
                className="btn-secondary text-base px-8 py-4 block text-center"
              >
                Become a Cleaner
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-6 mt-10 justify-center md:justify-start text-sm text-gray-400 flex-wrap"
          >
            {[
              "✅ Background Verified",
              "✅ Trained Professionals",
              "✅ Secure Payments",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          className="flex-1 flex justify-center"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100">
            <p className="text-sm text-gray-400 font-medium mb-6">
              Trusted across Sri Lanka
            </p>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.6 + i * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="text-center"
                >
                  <p className="text-3xl font-extrabold text-teal-500">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-8 bg-teal-50 rounded-2xl p-4 text-center"
            >
              <p className="text-teal-700 font-semibold text-sm">
                Next available cleaner
              </p>
              <p className="text-2xl font-bold text-teal-500 mt-1">
                Today, 2:00 PM
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/register"
                  className="btn-primary w-full mt-4 block text-center text-sm"
                >
                  Book Now
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: "📋",
      step: "01",
      title: "Choose Your Service",
      desc: "Pick from home, office, deep clean, vehicle, post-construction and more.",
    },
    {
      icon: "📅",
      step: "02",
      title: "Pick Date & Time",
      desc: "Select your preferred schedule. See real-time cleaner availability.",
    },
    {
      icon: "✅",
      step: "03",
      title: "Get a Verified Cleaner",
      desc: "We match you with a background-checked, trained professional near you.",
    },
    {
      icon: "⭐",
      step: "04",
      title: "Rate & Pay",
      desc: "Pay securely online or cash. Leave a review to help the community.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900">
            How It Works
          </h2>
          <p className="text-gray-400 mt-3">
            Booking a cleaner has never been this easy
          </p>
        </RevealOnScroll>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="card text-center group cursor-default hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ duration: 0.4 }}
                className="text-4xl mb-4 inline-block"
              >
                {s.icon}
              </motion.div>
              <span className="text-xs font-bold text-teal-400 tracking-widest">
                STEP {s.step}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mt-2 mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── SERVICES ─────────────────────────────────────────────
function Services() {
  const services = [
    {
      icon: "🏠",
      title: "Home Cleaning",
      desc: "Regular or one-time full home cleaning service.",
    },
    {
      icon: "🏢",
      title: "Office Cleaning",
      desc: "Keep your workspace spotless and professional.",
    },
    {
      icon: "🧹",
      title: "Deep Cleaning",
      desc: "Thorough top-to-bottom cleaning for any space.",
    },
    {
      icon: "🚗",
      title: "Vehicle Cleaning",
      desc: "Interior and exterior car cleaning at your location.",
    },
    {
      icon: "🎉",
      title: "Post-Event Cleanup",
      desc: "Fast cleanup after parties, weddings, and events.",
    },
    {
      icon: "🏗️",
      title: "Post-Construction",
      desc: "Remove dust and debris after renovation works.",
    },
  ];

  return (
    <section id="services" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Our Services
          </h2>
          <p className="text-gray-400 mt-3">
            Professional cleaning for every need
          </p>
        </RevealOnScroll>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              whileHover={{
                y: -6,
                borderLeftColor: "#2a9d8f",
                borderLeftWidth: "4px",
              }}
              className="card group border-l-4 border-transparent transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.3, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-4xl mb-4 inline-block"
              >
                {s.icon}
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
              <Link
                href="/register"
                className="inline-block mt-4 text-teal-500 text-sm font-semibold hover:underline"
              >
                Book Now →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── WHY US ───────────────────────────────────────────────
function WhyUs() {
  const reasons = [
    {
      icon: "🔍",
      title: "Background Verified",
      desc: "Every cleaner submits NIC, police report, and goes through our approval process.",
    },
    {
      icon: "🎓",
      title: "Professionally Trained",
      desc: "All cleaners complete our online training before their first booking.",
    },
    {
      icon: "💳",
      title: "Secure Payments",
      desc: "Pay via card, wallet or cash. All transactions are safe and transparent.",
    },
    {
      icon: "⏱️",
      title: "On-Time Guarantee",
      desc: "Late? We notify you instantly and reschedule at no extra cost.",
    },
    {
      icon: "🌟",
      title: "Rating System",
      desc: "Every job is rated. Low performers are removed. Quality is non-negotiable.",
    },
    {
      icon: "📱",
      title: "Easy Booking",
      desc: "Book, track, and manage everything from one simple dashboard.",
    },
  ];

  return (
    <section id="why-us" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Why Choose CLEENLY?
          </h2>
          <p className="text-gray-400 mt-3">
            We&apos;re not just a cleaning service — we&apos;re a platform built
            on trust
          </p>
        </RevealOnScroll>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={fadeUp}
              whileHover={{ backgroundColor: "#f0fafa", scale: 1.02 }}
              className="flex gap-4 p-6 rounded-2xl transition-colors cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="text-3xl shrink-0"
              >
                {r.icon}
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{r.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── JOIN AS CLEANER ──────────────────────────────────────
function JoinAsCleaner() {
  const badges = [
    "✅ Flexible Hours",
    "✅ Fair Pay",
    "✅ Full Training Provided",
    "✅ Weekly Payouts",
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-teal-500 to-teal-600 overflow-hidden relative">
      {/* Background blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto text-center text-white relative z-10">
        <RevealOnScroll>
          <h2 className="text-4xl font-extrabold mb-4">
            Earn on Your Own Schedule
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            Join CLEENLY as a cleaner. Set your own hours, choose your jobs, and
            get paid weekly. Students, part-timers, and professionals welcome.
          </p>
        </RevealOnScroll>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          {badges.map((item) => (
            <motion.span
              key={item}
              variants={fadeUp}
              whileHover={{
                scale: 1.08,
                backgroundColor: "rgba(255,255,255,0.35)",
              }}
              className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium cursor-default"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>

        <RevealOnScroll>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register?role=cleaner"
              className="inline-block bg-white text-teal-600 font-bold px-10 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              Apply to Become a Cleaner
            </Link>
          </motion.div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────
function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-400 py-14 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <RevealOnScroll variant={fadeLeft} className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="Cleenly" width={32} height={32} />
            <span className="text-white text-xl font-bold">CLEENLY</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Sri Lanka&apos;s smart on-demand cleaning platform. Powered by
            PANDAS Group (Pvt) Ltd.
          </p>
          <p className="mt-4 text-sm">📞 +94 72 070 6660</p>
          <p className="text-sm">✉️ official.pandasgroup@gmail.com</p>
          <p className="text-sm">📍 Kurunegala, Sri Lanka</p>
        </RevealOnScroll>

        <RevealOnScroll variant={fadeUp}>
          <h4 className="text-white font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/register"
                className="hover:text-teal-400 transition-colors"
              >
                Book a Cleaner
              </Link>
            </li>
            <li>
              <Link
                href="/register?role=cleaner"
                className="hover:text-teal-400 transition-colors"
              >
                Become a Cleaner
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-teal-400 transition-colors"
              >
                Login
              </Link>
            </li>
          </ul>
        </RevealOnScroll>

        <RevealOnScroll variant={fadeRight}>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </RevealOnScroll>
      </div>

      <div className="max-w-6xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-xs">
        © {new Date().getFullYear()} CLEENLY — Powered by PANDAS Group (Pvt)
        Ltd. All rights reserved.
      </div>
    </footer>
  );
}

// ── PAGE ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Services />
      <WhyUs />
      <JoinAsCleaner />
      <Footer />
    </main>
  );
}
