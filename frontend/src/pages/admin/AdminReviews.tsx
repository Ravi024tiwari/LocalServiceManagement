import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  User,
  Briefcase,
  AlertTriangle,
  X,
  ShieldAlert,
} from "lucide-react";

import AdminLayout from "@/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchAdminReviews,
  deleteAdminReviewThunk,
  setSearchQuery,
  setRatingFilter,
  setCategoryFilter,
  setSortBy,
  setPage,
  setSelectedReviewDetail,
  resetFilters,
} from "@/store/slices/adminReviewSlice";
import { type AdminReviewItem } from "@/services/adminReview.api";

// Shadcn UI Table Primitives
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CATEGORIES = [
  "ALL",
  "Home Cleaning",
  "Plumbing",
  "Electrical",
  "Appliance Repair",
  "Painting",
  "Carpentry",
  "Pest Control",
  "Lawn Care",
  "AC Repair",
];

export default function AdminReviews() {
  const dispatch = useAppDispatch();

  // Redux Store State
  const {
    reviews,
    kpis,
    pagination,
    filters,
    selectedReviewDetail,
    isLoading,
    isDeleting,
    error,
  } = useAppSelector((state) => state.adminReview);

  // Local Search State with Debounce (500ms)
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Modal State for Review Deletion Confirmation
  const [reviewToDelete, setReviewToDelete] = useState<AdminReviewItem | null>(null);

  // Sync debounced search to Redux and fetch API
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(
      fetchAdminReviews({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        rating: filters.rating,
        category: filters.category,
        sortBy: filters.sortBy,
      })
    );
  }, [debouncedSearch, dispatch]);

  // Handle Filter Changes
  const handleRatingChange = (rating: number) => {
    dispatch(setRatingFilter(rating));
    dispatch(
      fetchAdminReviews({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        rating: rating,
        category: filters.category,
        sortBy: filters.sortBy,
      })
    );
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setCategoryFilter(category));
    dispatch(
      fetchAdminReviews({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        rating: filters.rating,
        category,
        sortBy: filters.sortBy,
      })
    );
  };

  const handleSortChange = (sortBy: "newest" | "oldest" | "rating_high" | "rating_low") => {
    dispatch(setSortBy(sortBy));
    dispatch(
      fetchAdminReviews({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        rating: filters.rating,
        category: filters.category,
        sortBy,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    dispatch(
      fetchAdminReviews({
        page: newPage,
        limit: pagination.limit,
        search: debouncedSearch,
        rating: filters.rating,
        category: filters.category,
        sortBy: filters.sortBy,
      })
    );
  };

  const handleResetFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
    dispatch(
      fetchAdminReviews({
        page: 1,
        limit: pagination.limit,
        search: "",
        rating: 0,
        category: "ALL",
        sortBy: "newest",
      })
    );
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    await dispatch(deleteAdminReviewThunk(reviewToDelete._id));
    setReviewToDelete(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
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
                Reviews
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Admin Moderation
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Monitor customer feedback, moderate ratings, and maintain platform quality.
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
        {/* TOP KPIS - EXPLICITLY TOTAL REVIEWS & AVG  */}
        {/* ONLY 2 KPIS RENDERED AT THE TOP            */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* KPI 1: TOTAL REVIEWS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total Reviews
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {kpis.totalReviews.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active Reviews
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Total verified ratings submitted by customers
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-600 shrink-0">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>

          {/* KPI 2: AVERAGE RATING */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Average Rating
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {kpis.averageRating > 0 ? kpis.averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm font-extrabold text-amber-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                {renderStars(Math.round(kpis.averageRating))}
                <span className="text-xs text-gray-500 font-bold ml-1">
                  Overall Score
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-500 shrink-0">
              <Star className="w-8 h-8 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SEARCH & FILTERS BAR                       */}
        {/* ========================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* SEARCH INPUT WITH DEBOUNCE */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user, customer email, service, provider..."
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

            {/* RATING FILTER */}
            <div className="md:col-span-3">
              <select
                value={filters.rating}
                onChange={(e) => handleRatingChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value={0}>All Ratings (1 - 5 Stars)</option>
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
                <option value={2}>2 Stars ★★☆☆☆</option>
                <option value={1}>1 Star ★☆☆☆☆</option>
              </select>
            </div>

            {/* CATEGORY FILTER */}
            <div className="md:col-span-2">
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "ALL" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT BY */}
            <div className="md:col-span-2">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value as "newest" | "oldest" | "rating_high" | "rating_low"
                  )
                }
                className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating_high">Highest Rating</option>
                <option value="rating_low">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* REVIEWS TABLE / DATA LIST                  */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Loading reviews data...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Reviews Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No customer reviews match your selected filter or search criteria.
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
                      Review ID & Date
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Customer (Reviewer)
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Provider & Service
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Rating
                    </TableHead>
                    <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Review Comment
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-gray-500 py-3.5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100">
                  {reviews.map((rev) => {
                    const reviewIdShort = rev._id.slice(-6).toUpperCase();
                    const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const formattedTime = new Date(rev.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <TableRow key={rev._id} className="hover:bg-gray-50/60 transition-colors">
                        {/* REVIEW ID & DATE */}
                        <TableCell className="py-4 font-mono text-xs font-semibold text-gray-900">
                          <div>
                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold text-[11px]">
                              #RV-{reviewIdShort}
                            </span>
                            <span className="text-[11px] text-gray-400 block font-sans mt-1">
                              {formattedDate}, {formattedTime}
                            </span>
                          </div>
                        </TableCell>

                        {/* CUSTOMER */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-gray-200 shadow-sm shrink-0">
                              <AvatarImage src={rev.customer?.avatar} alt={rev.customer?.name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                {rev.customer?.name ? rev.customer.name.substring(0, 2).toUpperCase() : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-900 block truncate">
                                {rev.customer?.name || "Anonymous User"}
                              </span>
                              <span className="text-[11px] text-gray-500 block truncate">
                                {rev.customer?.email || "No email available"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* PROVIDER & SERVICE */}
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-900 block truncate">
                              {rev.service?.name || "Service Item"}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                {rev.service?.category || "General"}
                              </span>
                              <span>• Provider: {rev.provider?.name || "Service Provider"}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* RATING */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {rev.rating}.0 ★
                            </span>
                            <div className="hidden sm:block">{renderStars(rev.rating)}</div>
                          </div>
                        </TableCell>

                        {/* COMMENT */}
                        <TableCell className="py-4 max-w-xs">
                          <p className="text-xs text-gray-700 font-medium line-clamp-2 italic">
                            "{rev.comment && rev.comment.trim() !== "" ? rev.comment : "No written review provided."}"
                          </p>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => dispatch(setSelectedReviewDetail(rev))}
                              title="View Full Review Details"
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setReviewToDelete(rev)}
                              title="Delete Review"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
          {reviews.length > 0 && (
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
                of <span className="font-bold text-gray-900">{pagination.total}</span> reviews
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
                  // Display page numbers cleanly
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
        {/* REVIEW DETAIL MODAL                        */}
        {/* ========================================== */}
        {selectedReviewDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">
                    Review Details
                  </h3>
                  <p className="text-xs text-gray-500 font-medium font-mono">
                    ID: #RV-{selectedReviewDetail._id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => dispatch(setSelectedReviewDetail(null))}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rating Highlight */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 block uppercase tracking-wider">
                    Customer Rating
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-amber-600">
                      {selectedReviewDetail.rating}.0 / 5.0
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(selectedReviewDetail.rating)}
                </div>
              </div>

              {/* Comment Content */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Feedback Comment
                </span>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-medium text-gray-800 leading-relaxed italic">
                  "{selectedReviewDetail.comment || "No written text provided for this review."}"
                </div>
              </div>

              {/* Reviewer & Provider Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Card */}
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold">Reviewer (Customer)</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <Avatar className="w-9 h-9 border border-white shadow-sm">
                      <AvatarImage src={selectedReviewDetail.customer?.avatar} />
                      <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                        {selectedReviewDetail.customer?.name
                          ? selectedReviewDetail.customer.name.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {selectedReviewDetail.customer?.name || "Customer User"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {selectedReviewDetail.customer?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Provider & Service Card */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs font-bold">Service & Provider</span>
                  </div>
                  <div className="pt-1 space-y-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {selectedReviewDetail.service?.name || "Service Item"}
                    </p>
                    <p className="text-[11px] text-gray-600 truncate">
                      Provider: {selectedReviewDetail.provider?.name || "Provider"}
                    </p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {selectedReviewDetail.service?.category || "Category"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>
                  Submitted:{" "}
                  {new Date(selectedReviewDetail.createdAt).toLocaleDateString()}
                </span>
                {selectedReviewDetail.booking_id && (
                  <span className="font-mono text-[11px]">
                    Booking Ref: #{String(selectedReviewDetail.booking_id).slice(-6).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => dispatch(setSelectedReviewDetail(null))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setReviewToDelete(selectedReviewDetail);
                    dispatch(setSelectedReviewDetail(null));
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Review</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DELETE CONFIRMATION MODAL                  */}
        {/* ========================================== */}
        {reviewToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Delete Customer Review?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Are you sure you want to remove this review by{" "}
                  <span className="font-bold text-gray-800">
                    {reviewToDelete.customer?.name || "Customer"}
                  </span>
                  ? This will automatically update overall service and provider ratings.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setReviewToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
