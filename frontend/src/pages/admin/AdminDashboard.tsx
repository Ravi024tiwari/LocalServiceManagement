import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Briefcase,
  Calendar,
  Wallet,
  Star,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  Loader2,
  TrendingUp,
  Award,
  Zap,
  Droplets,
  Sparkles,
  Hammer,
  Paintbrush,
  Wrench,
} from "lucide-react";

import AdminLayout from "@/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminDashboard,
  verifyProviderThunk,
} from "@/store/slices/adminDashboardSlice";

// Icon helper
const getServiceIcon = (name: string) => {
  switch (name?.toLowerCase()) {
    case "home cleaning":
    case "cleaning":
      return <Sparkles className="w-4 h-4 text-emerald-600" />;
    case "ac repair & service":
    case "appliance repair":
      return <Wrench className="w-4 h-4 text-purple-600" />;
    case "plumbing services":
    case "plumbing":
      return <Droplets className="w-4 h-4 text-blue-600" />;
    case "electrical work":
    case "electrical":
      return <Zap className="w-4 h-4 text-amber-600" />;
    case "painting services":
    case "painting":
      return <Paintbrush className="w-4 h-4 text-red-600" />;
    default:
      return <Hammer className="w-4 h-4 text-teal-600" />;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Store State
  const { data, isLoading, isVerifying } = useAppSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const handleQuickVerify = (providerProfileId: string) => {
    dispatch(verifyProviderThunk({ providerProfileId, status: "APPROVED" }));
  };

  const metrics = data?.metrics || {
    totalUsers: 0,
    totalUsersGrowth: "0%",
    totalProviders: 0,
    totalProvidersGrowth: "0%",
    totalServices: 0,
    totalServicesGrowth: "0%",
    totalBookings: 0,
    totalBookingsGrowth: "0%",
    totalRevenue: 0,
    totalRevenueGrowth: "0%",
  };

  const verificationStats = data?.providerVerification?.stats || {
    pending: 0,
    verified: 0,
    rejected: 0,
    suspended: 0,
  };

  const pendingProviders = data?.providerVerification?.pendingProviders || [];

  const topServices = data?.topServices || [];

  const platformSummary = data?.platformSummary || {
    activeServices: metrics.totalServices,
    activeProviders: metrics.totalProviders,
    completedBookings: metrics.totalBookings,
    totalCustomers: metrics.totalUsers,
    averageRating: 5.0,
  };

  // 1. Bookings Overview Chart Data Calculation
  const bookingsChartData = data?.charts?.bookingsOverview || [];
  const maxBookings = Math.max(...bookingsChartData.map((b) => b.bookings), 1);
  const bookingsPoints = bookingsChartData.map((item, index) => {
    const x = bookingsChartData.length > 1 ? (index / (bookingsChartData.length - 1)) * 380 + 10 : 200;
    const y = 100 - (item.bookings / maxBookings) * 80;
    return { x, y, ...item };
  });
  const bookingsLinePath = bookingsPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const bookingsAreaPath = bookingsPoints.length > 0
    ? `${bookingsLinePath} L ${bookingsPoints[bookingsPoints.length - 1].x},110 L ${bookingsPoints[0].x},110 Z`
    : "";

  // 2. Services By Category Donut Chart Calculation
  const categoryBreakdown = data?.charts?.servicesByCategory || [];

  let accumulatedDash = 0;
  const donutSlices = categoryBreakdown.map((cat) => {
    const dashArray = `${cat.percentage} ${100 - cat.percentage}`;
    const dashOffset = -accumulatedDash;
    accumulatedDash += cat.percentage;
    return { ...cat, dashArray, dashOffset };
  });

  // 3. Revenue Overview Bar Chart Calculation
  const revenueChartData = data?.charts?.revenueOverview || [];
  const maxRevenue = Math.max(...revenueChartData.map((r) => r.revenue), 1);

  // 4. User Growth Trend Calculation
  const userGrowthChartData = data?.charts?.userGrowth || [];
  const maxUsers = Math.max(...userGrowthChartData.map((u) => u.users), 1);
  const userPoints = userGrowthChartData.map((item, index) => {
    const x = userGrowthChartData.length > 1 ? (index / (userGrowthChartData.length - 1)) * 380 + 10 : 200;
    const y = 100 - (item.users / maxUsers) * 80;
    return { x, y, ...item };
  });
  const userLinePath = userPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const userAreaPath = userPoints.length > 0
    ? `${userLinePath} L ${userPoints[userPoints.length - 1].x},110 L ${userPoints[0].x},110 Z`
    : "";

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* TOP 5 METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-black text-gray-900 block leading-tight">
                {metrics.totalUsers.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {metrics.totalUsersGrowth} <span className="text-gray-400 font-normal ml-0.5">vs last 30 days</span>
              </span>
            </div>
          </div>

          {/* Card 2: Total Providers */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Providers</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-black text-gray-900 block leading-tight">
                {metrics.totalProviders.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {metrics.totalProvidersGrowth} <span className="text-gray-400 font-normal ml-0.5">vs last 30 days</span>
              </span>
            </div>
          </div>

          {/* Card 3: Total Services */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Services</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-black text-gray-900 block leading-tight">
                {metrics.totalServices.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {metrics.totalServicesGrowth} <span className="text-gray-400 font-normal ml-0.5">vs last 30 days</span>
              </span>
            </div>
          </div>

          {/* Card 4: Total Bookings */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-black text-gray-900 block leading-tight">
                {metrics.totalBookings.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {metrics.totalBookingsGrowth} <span className="text-gray-400 font-normal ml-0.5">vs last 30 days</span>
              </span>
            </div>
          </div>

          {/* Card 5: Total Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3 col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-black text-gray-900 block leading-tight">
                ₹{metrics.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {metrics.totalRevenueGrowth} <span className="text-gray-400 font-normal ml-0.5">vs last 30 days</span>
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: ANALYTICS CHARTS GRID (3 WIDGETS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget 1: Bookings Overview Chart */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Bookings Overview</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-gray-900">{metrics.totalBookings.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-gray-400">Total Bookings</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {metrics.totalBookingsGrowth} <span className="text-gray-400 font-normal">vs last month</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Area/Line SVG Chart */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={bookingsAreaPath} fill="url(#emeraldGradient)" />
                <path d={bookingsLinePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                {bookingsPoints.map((pt, idx) => (
                  <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-2">
                {bookingsChartData.map((item, i) => (
                  <span key={i}>{item.date}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Services by Category (Doughnut Chart) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-sm">Services by Category</h3>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  {donutSlices.map((cat, idx) => (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="5"
                      strokeDasharray={cat.dashArray}
                      strokeDashoffset={cat.dashOffset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-gray-900 leading-none">{metrics.totalServices.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 w-full">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-700 text-[11px] truncate max-w-[90px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold text-[11px]">{cat.percentage}%</span>
                      <span className="text-gray-400 text-[10px]">({cat.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 3: Revenue Overview (Bar Chart) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Revenue Overview</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-gray-900">₹{metrics.totalRevenue.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-gray-400">Total Revenue</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {metrics.totalRevenueGrowth} <span className="text-gray-400 font-normal">vs last month</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="flex items-end justify-between h-40 pt-4 px-2">
              {revenueChartData.map((bar, i) => {
                const heightPercent = Math.max(10, Math.round((bar.revenue / maxRevenue) * 100));
                return (
                  <div key={i} className="flex flex-col items-center gap-2 group flex-1 relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-gray-900 text-white text-[9px] font-bold py-1 px-1.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                      ₹{bar.revenue.toLocaleString()}
                    </div>
                    <div className="w-6 bg-emerald-100 rounded-t-lg group-hover:bg-emerald-600 transition-colors relative overflow-hidden h-32 flex items-end">
                      <div className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300" style={{ height: `${heightPercent}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">{bar.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: CONTENT WIDGETS GRID (3 CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget 1: Top Services by Reviews Leaderboard */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="font-extrabold text-gray-900 text-sm">Top Services by Reviews</h3>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              {topServices.map((service, idx) => (
                <div key={service.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-gray-400 w-4 text-center">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      {getServiceIcon(service.name)}
                    </div>
                    <span className="font-bold text-gray-900 text-xs truncate max-w-[140px]">{service.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-900">{service.rating}</span>
                    <span className="text-gray-400 text-[10px]">({service.reviewsCount.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Provider Verification Widget & Pending List */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="font-extrabold text-gray-900 text-sm">Provider Verification</h3>
              <button onClick={() => navigate("/admin/providers")} className="text-emerald-600 text-xs font-bold hover:underline">
                View All
              </button>
            </div>

            {/* Verification Metric Badges Row */}
            <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Pending</span>
                <span className="font-black text-amber-600 text-base">{verificationStats.pending}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Verified</span>
                <span className="font-black text-emerald-600 text-base">{verificationStats.verified.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Rejected</span>
                <span className="font-black text-red-600 text-base">{verificationStats.rejected}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Suspended</span>
                <span className="font-black text-gray-500 text-base">{verificationStats.suspended}</span>
              </div>
            </div>

            {/* Pending Applicants Quick Verify List */}
            <div className="space-y-3">
              {pendingProviders.map((p) => (
                <div key={p.providerProfileId} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar || "https://i.pravatar.cc/150?img=33"} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{p.name}</h4>
                      <span className="text-[10px] text-gray-400 block -mt-0.5">{p.category}</span>
                      <span className="text-[9px] text-emerald-700 font-semibold block">{p.appliedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate("/admin/providers")}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleQuickVerify(p.providerProfileId)}
                      disabled={isVerifying}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: User Growth Trend */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">User Growth</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-gray-900">{metrics.totalUsers.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-gray-400">Total Users</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {metrics.totalUsersGrowth} <span className="text-gray-400 font-normal">vs last month</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Growth Wave SVG */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={userAreaPath} fill="url(#userGrowthGradient)" />
                <path d={userLinePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                {userPoints.map((pt, idx) => (
                  <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-2">
                {userGrowthChartData.map((item, i) => (
                  <span key={i}>{item.date}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER PLATFORM SUMMARY BANNER */}
        <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-3xl shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Services</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">{(platformSummary.activeServices || metrics.totalServices).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Providers</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">{(platformSummary.activeProviders || metrics.totalProviders).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Completed Bookings</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">{(platformSummary.completedBookings || metrics.totalBookings).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Total Customers</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">{(platformSummary.totalCustomers || metrics.totalUsers).toLocaleString()}</span>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Average Rating</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block flex items-center justify-center gap-1">
              {platformSummary.averageRating || 4.8} <span className="text-emerald-700 text-sm font-normal">/ 5</span>
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
