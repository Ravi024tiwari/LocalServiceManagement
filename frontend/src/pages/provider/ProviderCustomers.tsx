import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Wallet,
  Star,
  Search,
  ChevronDown,
  Filter,
  Download,
  Eye,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

import ProviderLayout from "@/layout/ProviderLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchProviderCustomers,
  fetchCustomerDetails,
  setSearchQuery,
  setServiceCategoryFilter,
  setBookingCountFilter,
  setTimeRangeFilter,
  setPage,
  clearSelectedCustomerDetails,
} from "@/store/slices/providerCustomerSlice";

// Shadcn UI Table Primitives
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Shadcn UI Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SERVICE_CATEGORIES = [
  "All Services",
  "AC Repair",
  "Plumbing",
  "Cleaning",
  "Electrical Work",
  "Painting",
  "Carpentry",
  "Vehicle Repair",
];

const BOOKING_COUNT_OPTIONS = [
  "All Bookings",
  "1-3 Bookings",
  "4-6 Bookings",
  "7+ Bookings",
];

const TIME_RANGE_OPTIONS = [
  "All Time",
  "This Month",
  "Last 3 Months",
  "This Year",
];

export default function ProviderCustomers() {
  const dispatch = useAppDispatch();

  // Redux Store State
  const {
    customers,
    pagination,
    stats,
    filters,
    selectedCustomerDetails,
    isLoading,
    isLoadingDetails,
  } = useAppSelector((state) => state.providerCustomer);

  // Local Search Input State
  const [searchInput, setSearchInput] = useState(filters.search);

  // 500ms Debounce Hook
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to Redux and trigger Backend Fetch
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(
      fetchProviderCustomers({
        page: 1, // Reset to page 1 on search change
        limit: pagination.limit,
        search: debouncedSearch,
        serviceCategory: filters.serviceCategory,
        timeRange: filters.timeRange,
      })
    );
  }, [debouncedSearch, dispatch]);

  // Fetch data when Page or Filters change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    dispatch(
      fetchProviderCustomers({
        page: newPage,
        limit: pagination.limit,
        search: debouncedSearch,
        serviceCategory: filters.serviceCategory,
        timeRange: filters.timeRange,
      })
    );
  };

  const handleCategorySelect = (cat: string) => {
    dispatch(setServiceCategoryFilter(cat));
    dispatch(
      fetchProviderCustomers({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        serviceCategory: cat,
        timeRange: filters.timeRange,
      })
    );
  };

  const handleTimeRangeSelect = (range: string) => {
    dispatch(setTimeRangeFilter(range));
    dispatch(
      fetchProviderCustomers({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        serviceCategory: filters.serviceCategory,
        timeRange: range,
      })
    );
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = "Customer Name,Email,Phone,Total Bookings,Total Spent (INR),Last Booking Date,Rating\n";
    const rows = customers
      .map(
        (c) =>
          `"${c.name}","${c.email}","${c.phone}",${c.totalBookings},${c.totalSpent},"${c.lastBookingDate}",${c.rating}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `provider_customers_page_${pagination.currentPage}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER LOCATION ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              Customers
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              All customers who have booked your services in the past.
            </p>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full w-fit shadow-sm text-xs font-semibold text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bhopal, Madhya Pradesh</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* METRICS & STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Customers
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.totalCustomers || 128}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +12 this mo
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.totalBookings || 346}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +18 this mo
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Spent */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Spent
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  ₹{(stats.totalSpent || 124560).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +22%
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Avg. Rating */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-purple-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Avg. Rating
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.averageRating || 4.8}
                </span>
                <span className="text-amber-500 font-bold text-xs">★</span>
              </div>
              <span className="text-[9px] text-gray-400 font-medium block">
                (Based on {stats.totalCustomers || 128} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR (WITH 500MS DEBOUNCE) */}
        <div className="bg-white p-3 lg:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Debounced Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customers by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
            {/* Category Dropdown Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shrink-0 focus:outline-none">
                <span>{filters.serviceCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 w-44">
                {SERVICE_CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="text-xs font-medium cursor-pointer rounded-lg py-1.5"
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Booking Count Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shrink-0 focus:outline-none">
                <span>{filters.bookingCountFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 w-40">
                {BOOKING_COUNT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => dispatch(setBookingCountFilter(opt))}
                    className="text-xs font-medium cursor-pointer rounded-lg py-1.5"
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Range Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shrink-0 focus:outline-none">
                <span>{filters.timeRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 w-36">
                {TIME_RANGE_OPTIONS.map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => handleTimeRangeSelect(t)}
                    className="text-xs font-medium cursor-pointer rounded-lg py-1.5"
                  >
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Button */}
            <button
              type="button"
              className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* TABLE TITLE & EXPORT HEADER */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Customer History</h2>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Showing{" "}
                {pagination.totalCustomers === 0
                  ? 0
                  : (pagination.currentPage - 1) * pagination.limit + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCustomers
                )}{" "}
                of {pagination.totalCustomers} customers
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={customers.length === 0}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all w-fit cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Export
            </button>
          </div>

          {/* DESKTOP SHADCN UI TABLE VIEW */}
          <div className="hidden lg:block overflow-x-auto">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-gray-500 font-semibold">Loading customer history records...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">No Customers Found</h3>
                <p className="text-xs text-gray-500">
                  {searchInput
                    ? "No customers match your active debounced search query."
                    : "No customers have booked your services yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-gray-100">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5 pl-6">
                      CUSTOMER
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      SERVICES BOOKED
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center py-3.5">
                      TOTAL BOOKINGS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      TOTAL SPENT
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      LAST BOOKING
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      RATING
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right pr-6 py-3.5">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.customerId} className="hover:bg-gray-50/60 border-gray-100 transition-colors">
                      {/* CUSTOMER */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              c.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block leading-tight">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block -mt-0.5">
                              {c.email}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              {c.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* SERVICES BOOKED */}
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.servicesBooked.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100"
                            >
                              {s}
                            </span>
                          ))}
                          {c.servicesBooked.length > 2 && (
                            <span className="text-[10px] font-bold text-gray-400 self-center">
                              +{c.servicesBooked.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* TOTAL BOOKINGS */}
                      <TableCell className="text-center font-extrabold text-gray-900 text-xs py-4">
                        {c.totalBookings}
                      </TableCell>

                      {/* TOTAL SPENT */}
                      <TableCell className="font-black text-gray-900 text-xs py-4">
                        ₹{c.totalSpent.toLocaleString()}
                      </TableCell>

                      {/* LAST BOOKING */}
                      <TableCell className="py-4">
                        <span className="text-xs font-bold text-gray-900 block leading-tight">
                          {c.lastBookingDate}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium block">
                          {c.lastBookingService}
                        </span>
                      </TableCell>

                      {/* RATING */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-bold text-gray-900">{c.rating}</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] text-gray-400">({c.totalReviews} reviews)</span>
                        </div>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="pr-6 text-right py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => dispatch(fetchCustomerDetails(c.customerId))}
                            title="View Customer Booking Details"
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Starting conversation with ${c.name} (${c.phone})...`)}
                            title="Contact Customer"
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* MOBILE RESPONSIVE CUSTOMER CARD LIST VIEW */}
          <div className="lg:hidden divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Loading customer records...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 p-4">
                No customer records found.
              </div>
            ) : (
              customers.map((c) => (
                <div key={c.customerId} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                        <span className="text-[11px] text-gray-400 block">{c.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(fetchCustomerDetails(c.customerId))}
                      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Bookings</span>
                      <span className="font-bold text-gray-900">{c.totalBookings}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Spent</span>
                      <span className="font-bold text-emerald-700">₹{c.totalSpent}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Rating</span>
                      <span className="font-bold text-gray-900 flex items-center justify-center gap-0.5">
                        {c.rating} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2 bg-white">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pagination.currentPage === pageNum
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER DETAILS SLIDE-OVER / MODAL */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                  {selectedCustomerDetails.customer.avatar ? (
                    <img
                      src={selectedCustomerDetails.customer.avatar}
                      alt={selectedCustomerDetails.customer.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    selectedCustomerDetails.customer.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {selectedCustomerDetails.customer.name}
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    {selectedCustomerDetails.customer.email} • {selectedCustomerDetails.customer.phone}
                  </span>
                </div>
              </div>

              <button
                onClick={() => dispatch(clearSelectedCustomerDetails())}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stats */}
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Bookings</span>
                  <span className="text-base font-extrabold text-gray-900">
                    {selectedCustomerDetails.customer.totalBookings}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Spent</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{selectedCustomerDetails.customer.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Rating</span>
                  <span className="text-base font-extrabold text-gray-900 flex items-center justify-center gap-1">
                    {selectedCustomerDetails.customer.rating}{" "}
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </span>
                </div>
              </div>

              {/* Booking History Timeline */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Booking History Timeline
                </h4>
                {selectedCustomerDetails.bookingHistory.length === 0 ? (
                  <p className="text-xs text-gray-500">No booking history recorded.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCustomerDetails.bookingHistory.map((b) => (
                      <div
                        key={b.bookingId}
                        className="p-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between text-xs hover:border-emerald-200 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-gray-900 block">{b.serviceName}</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400" /> {b.date} • {b.timeSlot}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 block">₹{b.price}</span>
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
