import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminPaymentStats,
  fetchAdminPayments,
  setSearchFilter,
  setStatusFilter,
  setProviderFilter,
  setMethodFilter,
  setDateRangeFilter,
  setAmountRangeFilter,
  resetFilters,
  setPage,
  setLimit,
  setSelectedPayment,
} from "@/store/slices/adminPaymentSlice";
import { type PaymentItem } from "@/services/adminPayment.api";

import AdminLayout from "@/layout/AdminLayout";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  CreditCard,
  Building2,
  Wallet,
  ArrowUpRight,
  ChevronRight as ChevronRightIcon,
  X,
  IndianRupee,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  MoreVertical,
  Check,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AdminPayments() {
  const dispatch = useAppDispatch();
  const { payments, pagination, stats, filters, selectedPayment, isLoading, isStatsLoading } =
    useAppSelector((state) => state.adminPayment);

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState("This Month");

  // Mobile Filter Sheet Local Form State
  const [tempStatus, setTempStatus] = useState(filters.status);
  const [tempProvider, setTempProvider] = useState(filters.providerId);
  const [tempMethod, setTempMethod] = useState(filters.method);
  const [tempMinAmount, setTempMinAmount] = useState(filters.minAmount || "");
  const [tempMaxAmount, setTempMaxAmount] = useState(filters.maxAmount || "");

  // Debounced search dispatch
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setSearchFilter(searchInput));
      }
    }, 350);
    // to start the next call to the backend only after this time is passed, this is helpful in avoiding multiple requests to the backend
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, dispatch]);

  // Initial fetch stats & payments
  useEffect(() => {
    dispatch(fetchAdminPaymentStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminPayments());
  }, [
    dispatch,
    pagination.currentPage,
    pagination.limit,
    filters.search,
    filters.status,
    filters.providerId,
    filters.method,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
  ]);

  // Apply filters from Mobile Sheet
  const handleApplyMobileFilters = () => {
    dispatch(setStatusFilter(tempStatus));
    dispatch(setProviderFilter(tempProvider));
    dispatch(setMethodFilter(tempMethod));
    dispatch(
      setAmountRangeFilter({
        minAmount: tempMinAmount ? Number(tempMinAmount) : 0,
        maxAmount: tempMaxAmount ? Number(tempMaxAmount) : 0,
      })
    );
    setIsFilterSheetOpen(false);
  };

  const handleResetMobileFilters = () => {
    setTempStatus("ALL");
    setTempProvider("ALL");
    setTempMethod("ALL");
    setTempMinAmount("");
    setTempMaxAmount("");
    dispatch(resetFilters());
    setSearchInput("");
  };

  // CSV Export Function
  const handleExportCSV = () => {
    if (!payments || payments.length === 0) return;
    const headers = [
      "Payment ID",
      "Booking ID",
      "Customer",
      "Provider",
      "Service",
      "Method",
      "Amount",
      "Platform Fee",
      "Provider Amount",
      "Status",
      "Date",
    ];

    const csvRows = payments.map((p) => [
      p.paymentId,
      p.bookingId,
      `"${p.customer.name}"`,
      `"${p.provider.name}"`,
      `"${p.service.title}"`,
      p.method,
      p.amount,
      p.platformFee,
      p.providerAmount,
      p.status,
      `"${new Date(p.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Colors Helper

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Successful
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Payment Method Icon Helper
  const getMethodBadge = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes("upi")) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
          <span className="text-[10px] font-extrabold text-blue-600">UPI</span>
        </span>
      );
    }
    if (m.includes("card")) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <CreditCard className="w-3 h-3 text-blue-600" />
          <span>Card</span>
        </span>
      );
    }
    if (m.includes("net") || m.includes("banking")) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          <Building2 className="w-3 h-3 text-purple-600" />
          <span>Net Banking</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <Wallet className="w-3 h-3 text-emerald-600" />
        <span>{method}</span>
      </span>
    );
  };

  // Default metric values if stats loading
  const kpis = stats?.kpiMetrics || {
    totalRevenue: { value: 1245680, growth: "+12.4%", period: "vs last 30 days" },
    successfulPayments: { value: 2458, growth: "+15.3%", period: "vs last 30 days" },
    pendingPayments: { value: 84, growth: "+8.6%", period: "vs last 30 days" },
    failedPayments: { value: 16, growth: "-11.1%", period: "vs last 30 days" },
    refundedAmount: { value: 18540, growth: "+5.3%", period: "vs last 30 days" },
    platformCommission: { value: 218000, growth: "+18.6%", period: "vs last 30 days" },
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* ========================================== */}
        {/* 1. TOP PAGE HEADER BAR                     */}
        {/* ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payments</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Monitor all payments, revenue, refunds and transaction history.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {/* Date Range Selector Pill */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:border-emerald-500 hover:bg-white transition-all cursor-pointer shadow-2xs">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span>May 20 – Jun 20, 2025</span>
            </div>

            {/* Export CTA Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. KPI METRIC CARDS GRID (6 CARDS)         */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {kpis.totalRevenue.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Total Revenue</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                ₹{kpis.totalRevenue.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.totalRevenue.period}</p>
          </div>

          {/* Card 2: Successful Payments */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {kpis.successfulPayments.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Successful Payments</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                {kpis.successfulPayments.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.successfulPayments.period}</p>
          </div>

          {/* Card 3: Pending Payments */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-amber-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {kpis.pendingPayments.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Pending Payments</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                {kpis.pendingPayments.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.pendingPayments.period}</p>
          </div>

          {/* Card 4: Failed Payments */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-rose-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5 bg-rose-50 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3" />
                {kpis.failedPayments.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Failed Payments</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                {kpis.failedPayments.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.failedPayments.period}</p>
          </div>

          {/* Card 5: Refunded Amount */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {kpis.refundedAmount.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Refunded Amount</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                ₹{kpis.refundedAmount.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.refundedAmount.period}</p>
          </div>

          {/* Card 6: Platform Commission */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {kpis.platformCommission.growth}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Platform Commission</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                ₹{kpis.platformCommission.value.toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{kpis.platformCommission.period}</p>
          </div>
        </div>

        {/* ========================================== */}
        {/* 3. CHARTS SECTION (2 CHARTS GRID)          */}
        {/*    Excluding Payment Method Chart as asked */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Revenue Overview (Line/Area Chart - 7 Cols on desktop) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Revenue Overview</h3>
                <p className="text-[11px] text-gray-400 font-medium">Income timeline trend over time</p>
              </div>

              {/* Timeframe Selector Dropdown */}
              <div className="relative">
                <select
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
            </div>

            {/* Dynamic Line SVG Graphic */}
            <div className="relative w-full h-56 pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="0" y="25" className="text-[10px] fill-gray-400 font-semibold">40K</text>
                <text x="0" y="75" className="text-[10px] fill-gray-400 font-semibold">30K</text>
                <text x="0" y="125" className="text-[10px] fill-gray-400 font-semibold">20K</text>
                <text x="0" y="175" className="text-[10px] fill-gray-400 font-semibold">10K</text>

                {/* Filled Area */}
                <path
                  d="M 30,140 Q 110,170 190,120 T 350,60 T 470,40 L 470,180 L 30,180 Z"
                  fill="url(#revenueGradient)"
                />

                {/* Curve Line */}
                <path
                  d="M 30,140 Q 110,170 190,120 T 350,60 T 470,40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data point tooltips */}
                <circle cx="350" cy="60" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                {/* Tooltip Box */}
                <g transform="translate(305, 15)">
                  <rect width="90" height="32" rx="8" fill="#1e293b" className="shadow-lg" />
                  <text x="45" y="14" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                    Jun 10, 2025
                  </text>
                  <text x="45" y="25" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="extrabold">
                    ₹32,450
                  </text>
                </g>
              </svg>
            </div>

            {/* X-Axis dates */}
            <div className="flex justify-between text-[11px] text-gray-400 font-bold px-4 pt-1">
              <span>May 20</span>
              <span>May 27</span>
              <span>Jun 3</span>
              <span>Jun 10</span>
              <span>Jun 17</span>
            </div>
          </div>

          {/* Chart 2: Payment Status (Donut Chart - 5 Cols on desktop) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Payment Status</h3>
                <p className="text-[11px] text-gray-400 font-medium">Distribution by completion status</p>
              </div>
              <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer">
                <option>This Month</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Donut Canvas */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-gray-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  {/* Successful Segment (84%) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="84, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  {/* Refunded Segment (10%) */}
                  <path
                    className="text-purple-500"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-84"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  {/* Pending Segment (3%) */}
                  <path
                    className="text-amber-400"
                    strokeDasharray="3, 100"
                    strokeDashoffset="-94"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Donut Center Counter Text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-gray-900 leading-tight">2,842</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-2.5 text-xs font-semibold w-full sm:w-auto">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-gray-700">Successful</span>
                  </div>
                  <span className="text-gray-500 font-bold">84% <span className="text-gray-400 font-medium">(2,458)</span></span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-gray-700">Pending</span>
                  </div>
                  <span className="text-gray-500 font-bold">3% <span className="text-gray-400 font-medium">(84)</span></span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-gray-700">Failed</span>
                  </div>
                  <span className="text-gray-500 font-bold">1% <span className="text-gray-400 font-medium">(16)</span></span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-gray-700">Refunded</span>
                  </div>
                  <span className="text-gray-500 font-bold">12% <span className="text-gray-400 font-medium">(284)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 4. FILTER BAR & CONTROLS                   */}
        {/* ========================================== */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Payment ID, Booking ID, Customer, Provider..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Filter Dropdowns */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Status Select */}
              <select
                value={filters.status}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* Provider Select */}
              <select
                value={filters.providerId}
                onChange={(e) => dispatch(setProviderFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[150px] truncate"
              >
                <option value="ALL">All Providers</option>
                <option value="p1">Rakesh Sharma</option>
                <option value="p2">QuickFix Plumbing</option>
                <option value="p3">Sparkle Cleaners</option>
                <option value="p4">PowerLine Electricians</option>
              </select>

              {/* Method Select */}
              <select
                value={filters.method}
                onChange={(e) => dispatch(setMethodFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>

              {/* Date Range Selector */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700">
                <span>May 20 – Jun 20, 2025</span>
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Reset Filters CTA */}
              {(filters.status !== "ALL" ||
                filters.providerId !== "ALL" ||
                filters.method !== "ALL" ||
                filters.search !== "") && (
                <button
                  onClick={() => {
                    dispatch(resetFilters());
                    setSearchInput("");
                  }}
                  className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  title="Reset Filters"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button (opens Mobile Filter Sheet) */}
            <div className="flex lg:hidden items-center gap-2 justify-between">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </SheetTrigger>

                {/* MOBILE FILTER SHEET / DRAWER (Matching mock screenshot) */}
                <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white flex flex-col justify-between">
                  <div className="space-y-6 overflow-y-auto pr-1">
                    <SheetHeader className="p-0 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                      <SheetTitle className="text-lg font-extrabold text-gray-900">Filters</SheetTitle>
                      <button
                        onClick={handleResetMobileFilters}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Reset
                      </button>
                    </SheetHeader>

                    {/* Filter Field: Payment Status */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Payment Status</label>
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ALL">All Status</option>
                        <option value="Successful">Successful</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Filter Field: Provider */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Provider</label>
                      <select
                        value={tempProvider}
                        onChange={(e) => setTempProvider(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ALL">All Providers</option>
                        <option value="p1">Rakesh Sharma</option>
                        <option value="p2">QuickFix Plumbing</option>
                        <option value="p3">Sparkle Cleaners</option>
                        <option value="p4">PowerLine Electricians</option>
                      </select>
                    </div>

                    {/* Filter Field: Payment Method */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Payment Method</label>
                      <select
                        value={tempMethod}
                        onChange={(e) => setTempMethod(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ALL">All Methods</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Wallet">Wallet</option>
                      </select>
                    </div>

                    {/* Filter Field: Date Range */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Date Range</label>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-semibold text-gray-700">
                        <span>May 20 – Jun 20, 2025</span>
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Filter Field: Amount Range */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Amount Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Min Amount"
                          value={tempMinAmount}
                          onChange={(e) => setTempMinAmount(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          value={tempMaxAmount}
                          onChange={(e) => setTempMaxAmount(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Big Green CTA */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleApplyMobileFilters}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Apply Filters
                    </button>
                  </div>
                </SheetContent>
              </Sheet>

              <button
                onClick={handleExportCSV}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 5. PAYMENTS DATA TABLE (DESKTOP)           */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hidden md:block">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">All Payments</h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Showing {payments.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} to{" "}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
                {pagination.totalCount.toLocaleString()} payments
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold">Sort by:</span>
              <select className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer">
                <option>Latest First</option>
                <option>Oldest First</option>
                <option>Amount: High to Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Platform Fee</th>
                  <th className="py-3.5 px-4">Provider Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold">Loading payment records...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-400">
                      No payments found matching criteria.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Payment ID */}
                      <td className="py-3.5 px-4 font-extrabold text-gray-900 tracking-tight">
                        {p.paymentId}
                      </td>

                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-bold text-gray-500">{p.bookingId}</td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7 border border-gray-200">
                            <AvatarImage src={p.customer.avatar} />
                            <AvatarFallback>{p.customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-gray-900 truncate max-w-[110px]">
                            {p.customer.name}
                          </span>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7 border border-gray-200">
                            <AvatarImage src={p.provider.avatar} />
                            <AvatarFallback>{p.provider.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-gray-900 truncate max-w-[120px]">
                            {p.provider.name}
                          </span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 text-gray-600 truncate max-w-[130px]">
                        {p.service.title}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">{getMethodBadge(p.method)}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-extrabold text-gray-900">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Platform Fee */}
                      <td className="py-3.5 px-4 text-gray-500 font-semibold">
                        ₹{p.platformFee.toFixed(2)}
                      </td>

                      {/* Provider Amount */}
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ₹{p.providerAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        ,{" "}
                        {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => dispatch(setSelectedPayment(p))}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleExportCSV}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination Footer */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <span>Showing</span>
              <span className="font-bold text-gray-900">
                {payments.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
              </span>
              <span>to</span>
              <span className="font-bold text-gray-900">
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
              </span>
              <span>of</span>
              <span className="font-bold text-gray-900">{pagination.totalCount}</span>
              <span>entries</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => dispatch(setPage(pagination.currentPage - 1))}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => dispatch(setPage(pg))}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                    pg === pagination.currentPage
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => dispatch(setPage(pagination.currentPage + 1))}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={pagination.limit}
                onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
                className="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none ml-2"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 6. MOBILE PAYMENTS CARDS LIST              */}
        {/* ========================================== */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
            <span>Recent Payments</span>
            <span>Sort by: Latest</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500 font-bold">Loading payment records...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 text-xs font-medium">
              No payments found.
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p._id}
                onClick={() => dispatch(setSelectedPayment(p))}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block">{p.paymentId}</span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })},{" "}
                      {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-gray-900">₹{p.amount}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage src={p.customer.avatar} />
                      <AvatarFallback>{p.customer.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">{p.customer.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium truncate max-w-[160px]">
                        {p.service.title}
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>
                </div>
              </div>
            ))
          )}

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 text-xs">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => dispatch(setPage(pagination.currentPage - 1))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-bold text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => dispatch(setPage(pagination.currentPage + 1))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* 7. PAYMENT DETAILS MODAL                   */}
        {/* ========================================== */}
        <Dialog
          open={selectedPayment !== null}
          onOpenChange={(open) => {
            if (!open) dispatch(setSelectedPayment(null));
          }}
        >
          <DialogContent className="max-w-lg bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-extrabold text-gray-900">
                    Payment Transaction Receipt
                  </DialogTitle>
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedPayment?.paymentId} • {selectedPayment?.bookingId}
                  </p>
                </div>
                {selectedPayment && getStatusBadge(selectedPayment.status)}
              </div>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-5 pt-2 text-xs">
                {/* Total Paid Header Box */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Total Transaction Amount
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-900 block mt-0.5">
                      ₹{selectedPayment.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 block">Payment Method</span>
                    <div className="mt-1">{getMethodBadge(selectedPayment.method)}</div>
                  </div>
                </div>

                {/* Customer & Provider Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Customer</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border">
                        <AvatarImage src={selectedPayment.customer.avatar} />
                      </Avatar>
                      <span className="font-bold text-gray-900 truncate">{selectedPayment.customer.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{selectedPayment.customer.email}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Provider</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border">
                        <AvatarImage src={selectedPayment.provider.avatar} />
                      </Avatar>
                      <span className="font-bold text-gray-900 truncate">{selectedPayment.provider.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{selectedPayment.provider.email}</p>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs mb-2">Earnings & Fee Breakdown</h4>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Price</span>
                    <span className="font-bold text-gray-900">₹{selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Commission (10%)</span>
                    <span className="font-bold text-emerald-600">₹{selectedPayment.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200 font-bold">
                    <span>Provider Payout Amount</span>
                    <span className="text-gray-900">₹{selectedPayment.providerAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Timestamp & Meta */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Processed On:</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedPayment.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={() => dispatch(setSelectedPayment(null))}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
