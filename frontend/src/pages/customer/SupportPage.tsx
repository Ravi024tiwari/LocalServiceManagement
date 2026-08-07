import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Rocket,
  CalendarCheck,
  Briefcase,
  User,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Clock,
  CheckCircle2,
  Lock,
  Star,
  Send,
  Bot,
  X,
  Sparkles,
  ArrowRight,
  FileText,
  CreditCard,
  MapPin,
  Heart,
  ExternalLink,
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";

// Sample FAQ Data Items
interface FAQItem {
  id: string;
  category: "getting-started" | "bookings-payments" | "services-providers" | "account-settings" | "safety-support";
  question: string;
  answer: string;
  steps?: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "getting-started",
    question: "How do I book a service on ServiceHub?",
    answer: "Booking a service on ServiceHub is simple and takes less than 2 minutes:",
    steps: [
      "Search for the service or category you need (e.g., Home Cleaning, Plumbing, AC Repair).",
      "Choose a verified service provider based on ratings, reviews, and price.",
      "Select your preferred scheduled date and available time slot.",
      "Enter your booking address and confirm your booking.",
      "You will receive a unique 4-digit Start OTP to share with the provider when they arrive at your location.",
    ],
  },
  {
    id: "faq-2",
    category: "bookings-payments",
    question: "How do payments work on ServiceHub?",
    answer: "We support 100% secure online payments powered by Razorpay as well as ServiceHub Wallet payments. Payment is processed safely when booking or after service completion depending on the provider policy. Funds are protected until your service is successfully completed.",
  },
  {
    id: "faq-3",
    category: "bookings-payments",
    question: "How can I cancel or reschedule a booking?",
    answer: "You can easily cancel or reschedule your booking directly from the 'My Bookings' page up to 2 hours before the scheduled time slot. Go to My Bookings -> Select Booking -> Click Cancel or Reschedule.",
  },
  {
    id: "faq-4",
    category: "safety-support",
    question: "What is the Start OTP and why is it required?",
    answer: "The 4-digit Start OTP is a security feature to protect customers. When the service provider arrives at your home, share this code with them. The provider must enter this OTP in their app to mark the job as started, ensuring only verified providers begin work.",
  },
  {
    id: "faq-5",
    category: "services-providers",
    question: "How do I contact my assigned service provider?",
    answer: "Once a booking is accepted by a provider, their contact details and live status will appear in your 'Bookings' section. You can call or message them directly from the app.",
  },
  {
    id: "faq-6",
    category: "account-settings",
    question: "How do I update my profile or saved addresses?",
    answer: "Navigate to your Profile & Settings from the sidebar or top header avatar menu. Under 'Saved Addresses', you can add, edit, or set default delivery & service addresses.",
  },
  {
    id: "faq-7",
    category: "safety-support",
    question: "Are service providers verified and background-checked?",
    answer: "Yes! Every service provider on ServiceHub undergoes strict identity verification, government ID document audits, background checks, and skill assessments before being approved on the platform.",
  },
  {
    id: "faq-8",
    category: "getting-started",
    question: "How do I leave a review for a completed service?",
    answer: "After your service status changes to COMPLETED, a 'Leave Review' prompt will appear on your booking card or service page. You can rate the provider from 1 to 5 stars and add written feedback.",
  },
];

export default function SupportPage() {
  const navigate = useNavigate();

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // AI Chat Assistant Modal State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Hello! 👋 Welcome to ServiceHub Support. I'm your AI Assistant. How can I help you today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Filter FAQs based on search or category selection
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendChatMessage = (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");

    // Simulate AI Assistant response
    setTimeout(() => {
      let botReply =
        "Thank you for asking! You can explore verified services on the home dashboard or search nearby professionals. Is there anything specific you need help with?";

      const lower = messageText.toLowerCase();
      if (lower.includes("book") || lower.includes("how to")) {
        botReply =
          "To book a service: 1) Go to Nearby Services, 2) Select your service, 3) Pick a date & time slot, and 4) Confirm booking. You'll receive a 4-digit OTP for security!";
      } else if (lower.includes("otp") || lower.includes("pin")) {
        botReply =
          "The Start OTP is a 4-digit security code generated for your booking. Share it with your provider when they arrive so they can start the service!";
      } else if (lower.includes("payment") || lower.includes("pay") || lower.includes("refund")) {
        botReply =
          "Payments are processed securely via Razorpay or your ServiceHub Wallet. Refunds for cancelled bookings are credited automatically within 24-48 hours.";
      } else if (lower.includes("contact") || lower.includes("phone")) {
        botReply =
          "You can reach our human support team 7 days a week at +91 98765 43210 or email support@servicehub.com.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50/50 pb-16">
        {/* ========================================== */}
        {/* HERO BANNER & SEARCH                       */}
        {/* ========================================== */}
        <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/20 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>24/7 Customer Help & Knowledge Base</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              How can we help you?
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
              We're here to help and answer any question you might have. Choose a topic below or search for quick answers.
            </p>

            {/* HERO SEARCH BAR */}
            <div className="max-w-2xl mx-auto relative pt-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles, booking steps, OTP, payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-white rounded-2xl text-gray-900 placeholder-gray-400 text-sm font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30 transition-all"
                />
                <button
                  onClick={() => setSearchQuery(searchQuery)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-10 relative z-20">
          {/* ========================================== */}
          {/* TOPIC CATEGORY CARDS                       */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedCategory("getting-started")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedCategory === "getting-started"
                  ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-white border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl w-fit mb-3">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Getting Started</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Learn the basics of ServiceHub</p>
            </button>

            <button
              onClick={() => setSelectedCategory("bookings-payments")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedCategory === "bookings-payments"
                  ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20"
                  : "bg-white border-gray-100 hover:border-blue-200"
              }`}
            >
              <div className="p-3 bg-blue-100/70 text-blue-700 rounded-xl w-fit mb-3">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Bookings & Payments</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Manage bookings & payments</p>
            </button>

            <button
              onClick={() => setSelectedCategory("services-providers")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedCategory === "services-providers"
                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20"
                  : "bg-white border-gray-100 hover:border-amber-200"
              }`}
            >
              <div className="p-3 bg-amber-100/70 text-amber-700 rounded-xl w-fit mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Services & Providers</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Find top-rated professionals</p>
            </button>

            <button
              onClick={() => setSelectedCategory("account-settings")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedCategory === "account-settings"
                  ? "bg-purple-50 border-purple-300 ring-2 ring-purple-500/20"
                  : "bg-white border-gray-100 hover:border-purple-200"
              }`}
            >
              <div className="p-3 bg-purple-100/70 text-purple-700 rounded-xl w-fit mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Account & Settings</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Manage profile & addresses</p>
            </button>

            <button
              onClick={() => setSelectedCategory("safety-support")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedCategory === "safety-support"
                  ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
                  : "bg-white border-gray-100 hover:border-rose-200"
              }`}
            >
              <div className="p-3 bg-rose-100/70 text-rose-700 rounded-xl w-fit mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Safety & Support</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Your safety is our priority</p>
            </button>
          </div>

          {/* ========================================== */}
          {/* HOW SERVICEHUB WORKS - STEP BY STEP GUIDE  */}
          {/* ========================================== */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  How ServiceHub Works for New Customers
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Follow these 5 simple steps to book verified local services hassle-free.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                Step-by-Step Walkthrough
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {/* STEP 1 */}
              <div className="space-y-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  1
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm">Search & Discover</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Browse categories or use nearby location filters to explore top-rated professionals near you.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="space-y-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  2
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm">Select Date & Time</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Choose your preferred date and convenient time slot fitting your daily schedule.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="space-y-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  3
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm">Get Start OTP</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Receive a unique 4-digit Start OTP in your booking details to verify when the provider arrives.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="space-y-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  4
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm">Job Execution</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  The verified expert performs the requested work with 100% service guarantee.
                </p>
              </div>

              {/* STEP 5 */}
              <div className="space-y-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  5
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm">Pay & Rate</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Pay securely via Razorpay or Wallet and rate your service provider to help others.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* MAIN HELP CONTENT & FAQs GRID              */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: POPULAR ARTICLES / FAQS (SPAN 8) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Showing {filteredFaqs.length} help articles
                  </p>
                </div>

                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    View All Categories
                  </button>
                )}
              </div>

              {/* ACCORDION LIST */}
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-3">
                    <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-900">No matching help articles</h3>
                    <p className="text-xs text-gray-500">
                      Try searching with different keywords or ask our AI Support Assistant.
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;

                    return (
                      <div
                        key={faq.id}
                        className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm ${
                          isOpen ? "border-emerald-300 ring-2 ring-emerald-500/10" : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                        >
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {faq.question}
                          </span>
                          <div className={`p-1 rounded-full transition-transform ${isOpen ? "bg-emerald-100 text-emerald-700 rotate-180" : "bg-gray-100 text-gray-500"}`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-5 pt-1 text-xs text-gray-600 border-t border-gray-50 space-y-3 animate-in fade-in duration-200">
                            <p className="leading-relaxed font-medium">{faq.answer}</p>

                            {faq.steps && (
                              <ol className="space-y-2 list-decimal pl-4 font-medium text-gray-700">
                                {faq.steps.map((step, i) => (
                                  <li key={i} className="leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: CONTACT CHANNELS & QUICK LINKS (SPAN 4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* NEED MORE HELP CARD */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-gray-900 text-base">Need more help?</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Our support team & AI Assistant are available 7 days a week to assist you.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* AI CHAT BUTTON */}
                  <button
                    onClick={() => setIsAiChatOpen(true)}
                    className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                          <span>Live AI Chat</span>
                          <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                            24/7
                          </span>
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-medium">Instant AI automated support</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* EMAIL SUPPORT */}
                  <a
                    href="mailto:support@servicehub.com"
                    className="w-full p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-between transition-all cursor-pointer group block"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-xs">Email Support</h4>
                        <p className="text-[11px] text-gray-500 font-medium">support@servicehub.com</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* CALL SUPPORT */}
                  <a
                    href="tel:+919876543210"
                    className="w-full p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-between transition-all cursor-pointer group block"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-xs">Call Us</h4>
                        <p className="text-[11px] text-gray-500 font-medium">+91 98765 43210</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* QUICK LINKS */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-extrabold text-gray-900 text-sm">Quick Links</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate("/bookings")}
                    className="w-full p-2.5 hover:bg-gray-50 rounded-xl flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>My Bookings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full p-2.5 hover:bg-gray-50 rounded-xl flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>My Profile & Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate("/liked-services")}
                    className="w-full p-2.5 hover:bg-gray-50 rounded-xl flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Liked Services</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* WHY CHOOSE SERVICEHUB VALUE PROPS          */}
          {/* ========================================== */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 text-center tracking-tight">
              Why Choose ServiceHub?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-xs">Trusted Professionals</h4>
                <p className="text-[11px] text-gray-500 font-medium">100% verified & background checked experts</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <Rocket className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-xs">Easy Booking</h4>
                <p className="text-[11px] text-gray-500 font-medium">Book services in just a few taps</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-xs">Secure Payments</h4>
                <p className="text-[11px] text-gray-500 font-medium">100% secure Razorpay & Wallet protection</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-xs">24/7 Support</h4>
                <p className="text-[11px] text-gray-500 font-medium">We're always here to assist you</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                  <Star className="w-6 h-6 fill-rose-500 text-rose-500" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-xs">Satisfaction Guaranteed</h4>
                <p className="text-[11px] text-gray-500 font-medium">Top quality service or refund guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* INTERACTIVE AI CHAT ASSISTANT DEMO MODAL   */}
        {/* ========================================== */}
        {isAiChatOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[550px] animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-emerald-700 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Bot className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                      ServiceHub AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">Always online • AI Support Demo</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiChatOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 custom-scrollbar">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2.5 max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.sender === "user" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {msg.sender === "user" ? "U" : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs font-medium space-y-1 ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span
                        className={`text-[9px] block text-right ${
                          msg.sender === "user" ? "text-emerald-100" : "text-gray-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Quick Prompts */}
              <div className="p-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
                <button
                  onClick={() => handleSendChatMessage("How do I book a service?")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                >
                  How to book?
                </button>
                <button
                  onClick={() => handleSendChatMessage("What is the Start OTP?")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                >
                  What is OTP?
                </button>
                <button
                  onClick={() => handleSendChatMessage("How do payments and refunds work?")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                >
                  Payments & Refunds
                </button>
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Ask any question about ServiceHub..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
