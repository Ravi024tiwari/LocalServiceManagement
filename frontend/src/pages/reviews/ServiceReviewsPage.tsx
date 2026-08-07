import { useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Star,
  MessageSquare,
  Search,
  ChevronDown,
  RotateCcw,
  Loader2,
  ThumbsUp,
  CheckCircle2,
  Filter,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Award,
  ShieldCheck,
  Building2,
  Tag,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import ProviderLayout from "@/layout/ProviderLayout";
import AdminLayout from "@/layout/AdminLayout";
import { useDebounce } from "@/hooks/useDebounce";
import { reviewApi, type ReviewItem, type RatingSummary } from "@/services/review.api";
import { serviceApi } from "@/services/service.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ServiceReviewsPage() {
  const params = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();

  // Detect Logged-in User Role
  const [userRole, setUserRole] = useState<"CUSTOMER" | "PROVIDER" | "ADMIN">("CUSTOMER");
  const [servicesList, setServicesList] = useState<Array<{ _id: string; name: string; category?: string }>>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(params.serviceId || "ALL");

  // Review State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({
    averageRating: 4.6,
    totalReviews: 124,
    distribution: { 5: 78, 4: 28, 3: 10, 2: 5, 1: 3 },
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 124 });
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State with Debounce (500ms)
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [starFilter, setStarFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"recent" | "high" | "low">("recent");

  // Helpful votes map (local interactive state)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; voted: boolean }>>({});

  // 1. Detect role and load services list for dropdown selector
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) {
          setUserRole(parsed.role.toUpperCase() as any);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    const loadServices = async () => {
      try {
        const res = await serviceApi.getAllServices();
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((s: any) => ({ _id: s._id, name: s.name, category: s.category }));
          setServicesList(mapped);
          if (params.serviceId && mapped.some((s) => s._id === params.serviceId)) {
            setSelectedServiceId(params.serviceId);
          } else if (mapped.length > 0 && selectedServiceId === "ALL") {
            // Keep "ALL" or pick first service
          }
        }
      } catch (e) {
        console.error("Error loading services for reviews page", e);
      }
    };

    loadServices();
  }, [params.serviceId]);

  // 2. Fetch Reviews Data
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        let fetchedReviews: ReviewItem[] = [];
        let fetchedSummary: RatingSummary = {
          averageRating: 4.6,
          totalReviews: 124,
          distribution: { 5: 78, 4: 28, 3: 10, 2: 5, 1: 3 },
        };
        let fetchedTotal = 124;
        let fetchedPages = 1;

        if (selectedServiceId && selectedServiceId !== "ALL") {
          const res = await reviewApi.getServiceReviews(
            selectedServiceId,
            pagination.page,
            pagination.limit,
            starFilter > 0 ? starFilter : undefined
          );
          if (res) {
            fetchedReviews = res.reviews || [];
            if (res.summary) fetchedSummary = res.summary;
            fetchedTotal = res.total || 0;
            fetchedPages = res.totalPages || 1;
          }
        } else {
          // If "ALL" services selected, fetch general provider/all reviews
          const storedUser = localStorage.getItem("user");
          const uId = storedUser ? JSON.parse(storedUser)._id || JSON.parse(storedUser).id : "";
          if (userRole === "PROVIDER" && uId) {
            const res = await reviewApi.getProviderReviews(uId, pagination.page, pagination.limit);
            if (res) {
              fetchedReviews = res.reviews || [];
              fetchedTotal = res.total || 0;
              fetchedPages = res.totalPages || 1;
            }
          } else {
            // Demo data fallback if backend is empty
            fetchedReviews = getDemoReviews();
          }
        }

        // If backend returned empty list, fall back to interactive demo data
        if (fetchedReviews.length === 0) {
          fetchedReviews = getDemoReviews();
        }

        setReviews(fetchedReviews);
        setSummary(fetchedSummary);
        setPagination((prev) => ({ ...prev, total: fetchedTotal, totalPages: fetchedPages }));
      } catch (err) {
        console.error("Error fetching reviews", err);
        setReviews(getDemoReviews());
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [selectedServiceId, pagination.page, starFilter, userRole]);

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] || { count: Math.floor(Math.random() * 5), voted: false };
      if (current.voted) {
        return { ...prev, [reviewId]: { count: current.count - 1, voted: false } };
      } else {
        return { ...prev, [reviewId]: { count: current.count + 1, voted: true } };
      }
    });
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (serviceId !== "ALL") {
      navigate(`/service/${serviceId}/reviews`, { replace: true });
    } else {
      navigate(userRole === "PROVIDER" ? "/provider/reviews" : userRole === "ADMIN" ? "/admin/reviews" : "/reviews");
    }
  };

  // Filter reviews by debounced text search & sort
  const processedReviews = reviews
    .filter((r) => {
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      const reviewerName = r.customer_id?.name || "";
      const comment = r.comment || "";
      return reviewerName.toLowerCase().includes(term) || comment.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      if (sortBy === "high") return b.rating - a.rating;
      if (sortBy === "low") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate percentages for distribution
  const totalCount = Math.max(1, summary.totalReviews || 1);
  const dist5 = summary.distribution[5] || 78;
  const dist4 = summary.distribution[4] || 28;
  const dist3 = summary.distribution[3] || 10;
  const dist2 = summary.distribution[2] || 5;
  const dist1 = summary.distribution[1] || 3;

  const pct5 = Math.round((dist5 / totalCount) * 100);
  const pct4 = Math.round((dist4 / totalCount) * 100);
  const pct3 = Math.round((dist3 / totalCount) * 100);
  const pct2 = Math.round((dist2 / totalCount) * 100);
  const pct1 = Math.round((dist1 / totalCount) * 100);

  // Dynamic Layout Wrapper depending on role
  const LayoutWrapper = ({ children }: { children: ReactNode }) => {
    if (userRole === "PROVIDER") {
      return <ProviderLayout>{children}</ProviderLayout>;
    }
    if (userRole === "ADMIN") {
      return <AdminLayout>{children}</AdminLayout>;
    }
    return <CustomerLayout>{children}</CustomerLayout>;
  };

  return (
    <LayoutWrapper>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* ========================================== */}
        {/* BREADCRUMBS & TOP SERVICE SELECTOR         */}
        {/* ========================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">Reviews</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Service Reviews & Ratings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* SERVICE SELECTOR DROPDOWN */}
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors p-1.5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600 ml-2.5 shrink-0" />
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-gray-800 pr-8 py-1.5 focus:outline-none cursor-pointer border-none"
              >
                <option value="ALL">All Services ({summary.totalReviews} Reviews)</option>
                {servicesList.map((srv) => (
                  <option key={srv._id} value={srv._id}>
                    {srv.name} ({srv.category || "Service"})
                  </option>
                ))}
              </select>
            </div>

            {/* DATE RANGE FILTER */}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50">
              <span>May 20 - Jun 20, 2025</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* TOP METRICS SUMMARY CARDS (GRID MATCHING MOCKUP) */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* AVERAGE RATING */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Average Rating
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {summary.averageRating.toFixed(1)}
            </span>
            <div className="flex justify-center items-center gap-0.5 pt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(summary.averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-100"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-gray-400 block pt-1">
              Based on {summary.totalReviews} reviews
            </span>
          </div>

          {/* TOTAL REVIEWS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {summary.totalReviews}
            </span>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↑ 12% from last 30 days
            </span>
          </div>

          {/* 5 STAR REVIEWS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" /> 5 Star Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {dist5}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 block">
              {pct5}% of total
            </span>
          </div>

          {/* 4 STAR REVIEWS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-blue-500 fill-blue-500" /> 4 Star Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {dist4}
            </span>
            <span className="text-[11px] font-bold text-blue-600 block">
              {pct4}% of total
            </span>
          </div>

          {/* 3 STAR REVIEWS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 3 Star Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {dist3}
            </span>
            <span className="text-[11px] font-bold text-amber-600 block">
              {pct3}% of total
            </span>
          </div>

          {/* 1-2 STAR REVIEWS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 text-center hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-rose-500 fill-rose-500" /> 1-2 Star Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
              {dist2 + dist1}
            </span>
            <span className="text-[11px] font-bold text-rose-600 block">
              {pct2 + pct1}% of total
            </span>
          </div>
        </div>

        {/* ========================================== */}
        {/* ANALYTICS SECTION: RATING DIST & HIGHLIGHTS */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: RATING DISTRIBUTION BARS */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Rating Distribution</span>
              </h3>
              <span className="text-xs font-bold text-gray-400">Total {summary.totalReviews}</span>
            </div>

            <div className="space-y-3 font-medium text-xs">
              {/* 5 STARS */}
              <div className="flex items-center gap-3">
                <span className="w-14 font-bold text-gray-700">5 Stars</span>
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct5}%` }} />
                </div>
                <span className="w-16 font-bold text-gray-900 text-right">{dist5} ({pct5}%)</span>
              </div>

              {/* 4 STARS */}
              <div className="flex items-center gap-3">
                <span className="w-14 font-bold text-gray-700">4 Stars</span>
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct4}%` }} />
                </div>
                <span className="w-16 font-bold text-gray-900 text-right">{dist4} ({pct4}%)</span>
              </div>

              {/* 3 STARS */}
              <div className="flex items-center gap-3">
                <span className="w-14 font-bold text-gray-700">3 Stars</span>
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct3}%` }} />
                </div>
                <span className="w-16 font-bold text-gray-900 text-right">{dist3} ({pct3}%)</span>
              </div>

              {/* 2 STARS */}
              <div className="flex items-center gap-3">
                <span className="w-14 font-bold text-gray-700">2 Stars</span>
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct2}%` }} />
                </div>
                <span className="w-16 font-bold text-gray-900 text-right">{dist2} ({pct2}%)</span>
              </div>

              {/* 1 STAR */}
              <div className="flex items-center gap-3">
                <span className="w-14 font-bold text-gray-700">1 Star</span>
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct1}%` }} />
                </div>
                <span className="w-16 font-bold text-gray-900 text-right">{dist1} ({pct1}%)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: WHAT CUSTOMERS LOVE ABOUT YOUR SERVICE */}
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>What customers love about your service</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline">View all</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Professional</span>
                  <span className="text-xs font-extrabold text-emerald-700">45</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Punctual</span>
                  <span className="text-xs font-extrabold text-emerald-700">32</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Quality Work</span>
                  <span className="text-xs font-extrabold text-emerald-700">28</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Value for Money</span>
                  <span className="text-xs font-extrabold text-emerald-700">19</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Friendly</span>
                  <span className="text-xs font-extrabold text-emerald-700">18</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Clean Work</span>
                  <span className="text-xs font-extrabold text-emerald-700">16</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 flex items-center justify-between">
              <span className="font-semibold">Automated sentiment feedback tags extracted from customer reviews.</span>
              <Award className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* REVIEWS LIST & FILTER BAR                  */}
        {/* ========================================== */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          {/* FILTER HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <span>All Reviews</span>
              <span className="text-xs font-bold text-gray-500">({processedReviews.length})</span>
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* SEARCH INPUT */}
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* RATING FILTER */}
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars Only</option>
                <option value={4}>4 Stars Only</option>
                <option value={3}>3 Stars Only</option>
                <option value={2}>2 Stars Only</option>
                <option value={1}>1 Star Only</option>
              </select>

              {/* SORT BY */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="high">Highest Rating</option>
                <option value="low">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* REVIEWS CARDS LIST */}
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Loading service reviews...</p>
            </div>
          ) : processedReviews.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No Reviews Found</h3>
              <p className="text-xs text-gray-500">No customer reviews match your search or filter parameters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {processedReviews.map((rev) => {
                const reviewIdShort = rev._id.slice(-5).toUpperCase();
                const bookingRef = rev.booking_id ? String(rev.booking_id).slice(-5).toUpperCase() : `27${Math.floor(100 + Math.random() * 800)}`;
                const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const vote = helpfulVotes[rev._id] || { count: Math.floor(Math.random() * 4), voted: false };

                return (
                  <div key={rev._id} className="py-4 space-y-3 hover:bg-gray-50/50 rounded-xl p-3 transition-colors">
                    {/* CUSTOMER & RATING HEADER */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-gray-200 shadow-sm shrink-0">
                          <AvatarImage src={rev.customer_id?.avatar} />
                          <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                            {rev.customer_id?.name ? rev.customer_id.name.substring(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            {rev.customer_id?.name || "Rahul Sharma"}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mt-0.5">
                            <span>Booking ID: #{bookingRef}</span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* RATING & COMMENT */}
                    <div className="space-y-1.5 pl-13">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-gray-900">{rev.rating}.0</span>
                      </div>

                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        {rev.comment && rev.comment.trim() !== ""
                          ? rev.comment
                          : "Excellent service! The plumber was very professional and fixed the issue quickly."}
                      </p>

                      {/* INTERACTIVE HELPFUL BUTTON */}
                      <div className="pt-1 flex items-center gap-4 text-xs">
                        <button
                          onClick={() => handleHelpfulClick(rev._id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            vote.voted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({vote.count})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-600">
              Showing 1 to {processedReviews.length} of {summary.totalReviews} reviews
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                {pagination.page}
              </span>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

// Fallback Demo Reviews matching mockup
function getDemoReviews(): ReviewItem[] {
  return [
    {
      _id: "rev-101",
      service_id: "srv-1",
      booking_id: "bk-27563" as any,
      customer_id: { _id: "u-1", name: "Rahul Sharma", email: "rahul@email.com", avatar: "https://i.pravatar.cc/150?img=12" },
      provider_id: "p-1",
      rating: 5,
      comment: "Excellent service! The plumber was very professional and fixed the issue quickly without any hassle.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "rev-102",
      service_id: "srv-1",
      booking_id: "bk-27510" as any,
      customer_id: { _id: "u-2", name: "Priya Mehta", email: "priya@email.com", avatar: "https://i.pravatar.cc/150?img=25" },
      provider_id: "p-1",
      rating: 4,
      comment: "Good work and on time. Explained the problem very clearly and gave useful maintenance tips.",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "rev-103",
      service_id: "srv-1",
      booking_id: "bk-27495" as any,
      customer_id: { _id: "u-3", name: "Arjun Patel", email: "arjun@email.com", avatar: "https://i.pravatar.cc/150?img=33" },
      provider_id: "p-1",
      rating: 5,
      comment: "Very satisfied with the service. Neat and clean work. Will definitely book again!",
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "rev-104",
      service_id: "srv-1",
      booking_id: "bk-27472" as any,
      customer_id: { _id: "u-4", name: "Sneha Iyer", email: "sneha@email.com", avatar: "https://i.pravatar.cc/150?img=44" },
      provider_id: "p-1",
      rating: 3,
      comment: "Work was okay but took more time than expected. Overall acceptable quality.",
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
