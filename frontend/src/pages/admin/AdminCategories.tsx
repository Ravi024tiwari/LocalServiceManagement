import { useEffect, useState } from "react";
import {
  Grid,
  Search,
  RotateCcw,
  Loader2,
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  Briefcase,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Wrench,
  Home,
  Sparkles,
  Zap,
  Paintbrush,
  Hammer,
  ShieldAlert,
  X,
  Plus,
  ArrowRight,
} from "lucide-react";

import AdminLayout from "@/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchAdminCategories,
  fetchCategoryDetail,
  setSearchQuery,
  setStatusFilter,
  setSortBy,
  setPage,
  setSelectedCategoryDetail,
  resetFilters,
} from "@/store/slices/adminCategorySlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Shadcn UI Table Primitives
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper function to pick dynamic icon based on category name
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("clean")) return <Home className="w-5 h-5 text-emerald-600" />;
  if (lower.includes("plumb")) return <Wrench className="w-5 h-5 text-blue-600" />;
  if (lower.includes("electr") || lower.includes("ac")) return <Zap className="w-5 h-5 text-amber-500" />;
  if (lower.includes("paint")) return <Paintbrush className="w-5 h-5 text-rose-500" />;
  if (lower.includes("carpent") || lower.includes("wood")) return <Hammer className="w-5 h-5 text-orange-600" />;
  if (lower.includes("repair")) return <Sparkles className="w-5 h-5 text-purple-600" />;
  return <Grid className="w-5 h-5 text-emerald-600" />;
};

export default function AdminCategories() {
  const dispatch = useAppDispatch();

  // Redux Store State
  const {
    categories,
    topCategories,
    kpis,
    pagination,
    filters,
    selectedCategoryDetail,
    isLoading,
    isLoadingDetail,
    error,
  } = useAppSelector((state) => state.adminCategory);

  // Local Search State with 500ms Debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to Redux and fetch API
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(
      fetchAdminCategories({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        status: filters.status,
        sortBy: filters.sortBy,
      })
    );
  }, [debouncedSearch, dispatch]);

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status));
    dispatch(
      fetchAdminCategories({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        status,
        sortBy: filters.sortBy,
      })
    );
  };

  const handleSortChange = (
    sortBy: "bookings_desc" | "services_desc" | "services_asc" | "name_asc" | "rating_desc"
  ) => {
    dispatch(setSortBy(sortBy));
    dispatch(
      fetchAdminCategories({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        status: filters.status,
        sortBy,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    dispatch(
      fetchAdminCategories({
        page: newPage,
        limit: pagination.limit,
        search: debouncedSearch,
        status: filters.status,
        sortBy: filters.sortBy,
      })
    );
  };

  const handleResetFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
    dispatch(
      fetchAdminCategories({
        page: 1,
        limit: pagination.limit,
        search: "",
        status: "ALL",
        sortBy: "bookings_desc",
      })
    );
  };

  const handleViewCategoryDetail = (categoryName: string) => {
    dispatch(fetchCategoryDetail(categoryName));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-100"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* ========================================== */}
        {/* PAGE HEADER                                */}
        {/* ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Categories
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Service Catalog
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Manage all service categories present on the platform. View category performance and counts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* TOP KPIS (5 SUMMARY CARDS MATCHING DESIGN) */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: TOTAL CATEGORIES */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Categories
              </span>
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                <Grid className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {kpis.totalCategories}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 block">
              Unique Service Clusters
            </span>
          </div>

          {/* KPI 2: ACTIVE CATEGORIES */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Active Categories
              </span>
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {kpis.activeCategories}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 block">
              {kpis.totalCategories > 0
                ? `${Math.round((kpis.activeCategories / kpis.totalCategories) * 100)}% of total`
                : "0% of total"}
            </span>
          </div>

          {/* KPI 3: TOTAL SERVICES */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Services
              </span>
              <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {kpis.totalServices.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 block">
              All categories combined
            </span>
          </div>

          {/* KPI 4: TOTAL BOOKINGS */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Bookings
              </span>
              <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {kpis.totalBookings.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 block">
              Across all categories
            </span>
          </div>

          {/* KPI 5: AVG. CATEGORY RATING */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Avg. Rating
              </span>
              <div className="bg-amber-50 p-2 rounded-xl text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {kpis.averageRating > 0 ? kpis.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs font-bold text-gray-400">/ 5.0</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 block">
              Platform rating score
            </span>
          </div>
        </div>

        {/* ========================================== */}
        {/* HIGHLIGHTS & CATEGORY PERFORMANCE SECTION  */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* TOP CATEGORIES BY BOOKINGS */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Categories by Bookings</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600">Leaderboard</span>
            </div>

            <div className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No category data available yet.</p>
              ) : (
                topCategories.map((cat, idx) => {
                  const maxBookings = topCategories[0]?.bookingCount || 1;
                  const percentage = Math.round((cat.bookingCount / Math.max(1, maxBookings)) * 100);

                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-black text-gray-400 text-center">{idx + 1}</span>
                      <div className="p-1.5 bg-gray-50 rounded-lg">{getCategoryIcon(cat.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold text-gray-900 truncate">{cat.category}</span>
                          <span className="font-mono font-bold text-gray-700">
                            {cat.bookingCount.toLocaleString()} bookings
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CATEGORY STATUS DISTRIBUTION & SUMMARY */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Category Status Distribution</span>
                </h3>
              </div>

              <div className="flex items-center justify-around py-4">
                {/* Active Circle Badge */}
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                    <span className="text-base font-extrabold text-emerald-700">
                      {kpis.activeCategories}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-700 block">Active</span>
                </div>

                {/* Inactive Circle Badge */}
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <span className="text-base font-extrabold text-amber-700">
                      {Math.max(0, kpis.totalCategories - kpis.activeCategories)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-700 block">Inactive</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Dynamic Provider Catalog
              </p>
              <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                Categories are dynamically derived from services created by service providers across the platform.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SEARCH & FILTERS BAR                       */}
        {/* ========================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* DEBOUNCE SEARCH INPUT */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories by name or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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

            {/* STATUS FILTER */}
            <div className="md:col-span-3">
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Status (Active & Inactive)</option>
                <option value="Active">Active Categories Only</option>
                <option value="Inactive">Inactive Categories Only</option>
              </select>
            </div>

            {/* SORT BY */}
            <div className="md:col-span-3">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value as
                      | "bookings_desc"
                      | "services_desc"
                      | "services_asc"
                      | "name_asc"
                      | "rating_desc"
                  )
                }
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="bookings_desc">Most Bookings</option>
                <option value="services_desc">Most Services</option>
                <option value="services_asc">Least Services</option>
                <option value="name_asc">Category Name (A-Z)</option>
                <option value="rating_desc">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* CATEGORIES TABLE                           */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Loading category details...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Grid className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Categories Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No categories match your search query or status filter.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-gray-100">
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Category
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Services Count
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Total Bookings
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Avg. Rating
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100">
                  {categories.map((cat) => {
                    const slug = cat.category.toLowerCase().replace(/[^a-z0-9]/g, "-");

                    return (
                      <TableRow key={cat.category} className="hover:bg-gray-50/60 transition-colors">
                        {/* CATEGORY NAME & SLUG */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                              {getCategoryIcon(cat.category)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-900 block">
                                {cat.category}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 block">
                                slug: {slug}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* SERVICES COUNT */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-gray-900">
                              {cat.serviceCount} services
                            </span>
                            {cat.activeServicesCount > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {cat.activeServicesCount} active
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* TOTAL BOOKINGS */}
                        <TableCell className="py-4">
                          <span className="text-xs font-mono font-bold text-gray-800">
                            {cat.bookingCount.toLocaleString()} bookings
                          </span>
                        </TableCell>

                        {/* AVG RATING */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {cat.averageRating > 0 ? cat.averageRating.toFixed(1) : "0.0"} ★
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">
                              ({cat.totalReviews} reviews)
                            </span>
                          </div>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="py-4">
                          {cat.status === "Active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Inactive
                            </span>
                          )}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="py-4 text-right">
                          <button
                            onClick={() => handleViewCategoryDetail(cat.category)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Services</span>
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ========================================== */}
          {/* PAGINATION FOOTER                          */}
          {/* ========================================== */}
          {categories.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-bold text-gray-900">{pagination.total}</span> categories
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => {
                  if (
                    pg === 1 ||
                    pg === pagination.totalPages ||
                    (pg >= pagination.page - 1 && pg <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pg === pagination.page
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  if (pg === pagination.page - 2 || pg === pagination.page + 2) {
                    return (
                      <span key={pg} className="px-1 text-xs text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* CATEGORY DETAILS MODAL                     */}
        {/* ========================================== */}
        {selectedCategoryDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    {getCategoryIcon(selectedCategoryDetail.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      {selectedCategoryDetail.category} Services
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Detailed view of services registered under this category
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(setSelectedCategoryDetail(null))}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Total Services
                  </span>
                  <span className="text-base font-extrabold text-gray-900">
                    {selectedCategoryDetail.totalServices}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Active Services
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {selectedCategoryDetail.activeServices}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Total Bookings
                  </span>
                  <span className="text-base font-extrabold text-purple-600">
                    {selectedCategoryDetail.bookingCount}
                  </span>
                </div>
              </div>

              {/* Service Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-700 block">
                  Registered Services ({selectedCategoryDetail.services.length})
                </span>

                {isLoadingDetail ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs text-gray-500">Loading category services...</p>
                  </div>
                ) : selectedCategoryDetail.services.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No active services listed in this category.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedCategoryDetail.services.map((srv) => (
                      <div
                        key={srv._id}
                        className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-9 h-9 border border-gray-200 shadow-sm shrink-0">
                            <AvatarImage src={srv.provider_id?.avatar} />
                            <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                              {srv.name ? srv.name.substring(0, 2).toUpperCase() : "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{srv.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              Provider: {srv.provider_id?.name || "Provider"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-gray-900 block">
                            ₹{srv.price}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              srv.is_available ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {srv.is_available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => dispatch(setSelectedCategoryDetail(null))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
