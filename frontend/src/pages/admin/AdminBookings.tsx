import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchAdminBookings,
  setSearchQuery,
  setStatusFilter,
  setProviderFilter,
  setServiceFilter,
  setPage,
  setLimit,
  setSelectedBooking,
  clearFilters,
} from "@/store/slices/adminBookingSlice";
import AdminLayout from "@/layout/AdminLayout";
import {
  Calendar, Search, Filter, Download, Eye, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, DollarSign,
  User, Phone, Mail, MapPin, RefreshCw, X, ShieldCheck, FileText, Loader2, ArrowUpRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminBookings() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, pagination, stats, filters, selectedBooking, isLoading } = useSelector(
    (state: RootState) => state.adminBooking
  );

  // Search input local state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search effect: Wait 400ms after user stops typing before dispatching API call
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, dispatch]);

  // Fetch bookings when filters or page/limit changes
  useEffect(() => {
    dispatch(
      fetchAdminBookings({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        providerId: filters.providerId,
        serviceId: filters.serviceId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    );
  }, [
    dispatch,
    pagination.currentPage,
    pagination.limit,
    filters.search,
    filters.status,
    filters.providerId,
    filters.serviceId,
    filters.startDate,
    filters.endDate,
  ]);

  // Extract unique Providers & Services for filter dropdowns
  const availableProviders = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    bookings.forEach((b) => {
      if (b.provider_id && b.provider_id._id) {
        map.set(b.provider_id._id, { id: b.provider_id._id, name: b.provider_id.name });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  const availableServices = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    bookings.forEach((b) => {
      if (b.service_id && b.service_id._id) {
        map.set(b.service_id._id, { id: b.service_id._id, title: b.service_id.title });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // CSV Export functionality
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "Booking ID", "Customer Name", "Customer Email", "Customer Phone",
      "Provider Name", "Provider Email", "Service Title", "Category",
      "Scheduled Date", "Time Slot", "Amount (INR)", "Status", "Payment Status"
    ];

    const rows = bookings.map((b) => [
      b._id,
      `"${b.customer_id?.name || 'N/A'}"`,
      `"${b.customer_id?.email || 'N/A'}"`,
      `"${b.customer_id?.phone || 'N/A'}"`,
      `"${b.provider_id?.name || 'N/A'}"`,
      `"${b.provider_id?.email || 'N/A'}"`,
      `"${b.service_id?.title || 'N/A'}"`,
      `"${b.service_id?.category || 'N/A'}"`,
      new Date(b.scheduled_date).toLocaleDateString(),
      `"${b.time_slot}"`,
      b.service_id?.price || 499,
      b.status,
      b.payment_status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ServiceHub_Bookings_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ACCEPTED":
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formattedTotalRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(stats.totalRevenue || 0);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* ========================================== */}
        {/* PAGE HEADER & TOP TITLES                   */}
        {/* ========================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <span>Dashboard</span>
              <span>&gt;</span>
              <span className="text-emerald-700 font-bold">Bookings</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Bookings Overview</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Monitor, filter, and manage all customer service appointments across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchAdminBookings({ page: pagination.currentPage, limit: pagination.limit }))}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-emerald-600 shadow-sm transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
              title="Refresh Bookings Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={bookings.length === 0}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* TOP KPI ANALYTICS SUMMARY CARDS            */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Bookings Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Total Bookings</span>
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.total.toLocaleString()}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+23.4%</span>
                <span className="text-gray-400 font-normal text-[10px]">vs last 30 days</span>
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Completed</span>
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.completed.toLocaleString()}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.7%</span>
                <span className="text-gray-400 font-normal text-[10px]">vs last 30 days</span>
              </div>
            </div>
          </div>

          {/* Ongoing Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Ongoing</span>
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.ongoing.toLocaleString()}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.3%</span>
                <span className="text-gray-400 font-normal text-[10px]">vs last 30 days</span>
              </div>
            </div>
          </div>

          {/* Cancelled Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Cancelled</span>
              <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stats.cancelled.toLocaleString()}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-red-600">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-4.2%</span>
                <span className="text-gray-400 font-normal text-[10px]">vs last 30 days</span>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Total Revenue</span>
              <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formattedTotalRevenue}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+27.8%</span>
                <span className="text-gray-400 font-normal text-[10px]">vs last 30 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* CONTROLS HEADER: SEARCH & FILTERS          */}
        {/* ========================================== */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input with 400ms Debounce */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by booking ID, customer name, provider name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Provider Filter */}
              <select
                value={filters.providerId}
                onChange={(e) => dispatch(setProviderFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Providers</option>
                {availableProviders.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Service Filter */}
              <select
                value={filters.serviceId}
                onChange={(e) => dispatch(setServiceFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Services</option>
                {availableServices.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>

              {/* Status Select Filter */}
              <select
                value={filters.status}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Reset Filters */}
              {(filters.search || filters.status !== "ALL" || filters.providerId !== "ALL" || filters.serviceId !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    dispatch(clearFilters());
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Quick Status Pill Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-t border-gray-100 pt-3">
            {[
              { label: "All", value: "ALL", count: stats.total },
              { label: "Pending", value: "PENDING", count: stats.pending },
              { label: "Confirmed", value: "ACCEPTED", count: stats.confirmed },
              { label: "In Progress", value: "IN_PROGRESS", count: stats.ongoing },
              { label: "Completed", value: "COMPLETED", count: stats.completed },
              { label: "Cancelled", value: "CANCELLED", count: stats.cancelled },
            ].map((tab) => {
              const isActive = filters.status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => dispatch(setStatusFilter(tab.value))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white text-emerald-800" : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* BOOKINGS TABLE / DATA CONTAINER           */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-sm font-semibold text-gray-500">Loading bookings payload...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">No Bookings Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No appointment records matched your search query or status filter. Try clearing filters.
              </p>
              <button
                onClick={() => {
                  setSearchInput("");
                  dispatch(clearFilters());
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP HIGH-DENSITY TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Booking</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Provider</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {bookings.map((booking) => {
                      const customer = booking.customer_id;
                      const provider = booking.provider_id;
                      const service = booking.service_id;
                      const price = service?.price || 499;
                      const shortBookingId = `#BK-${booking._id.slice(-6).toUpperCase()}`;

                      return (
                        <tr key={booking._id} className="hover:bg-gray-50/80 transition-colors">
                          {/* Booking Ref */}
                          <td className="py-4 px-4 font-bold text-gray-900">
                            <div className="font-extrabold text-gray-900">{shortBookingId}</div>
                            <div className="text-[10px] text-gray-400 font-medium">
                              {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-8 h-8 border border-gray-200">
                                <AvatarImage src={customer?.avatar} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                  {customer?.name?.slice(0, 2).toUpperCase() || "CU"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-extrabold text-gray-900">{customer?.name || "N/A"}</div>
                                <div className="text-[10px] text-gray-500">{customer?.email || "N/A"}</div>
                                <div className="text-[10px] text-emerald-700 font-semibold">{customer?.phone || ""}</div>
                              </div>
                            </div>
                          </td>

                          {/* Provider */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-8 h-8 border border-gray-200">
                                <AvatarImage src={provider?.avatar} />
                                <AvatarFallback className="bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                                  {provider?.name?.slice(0, 2).toUpperCase() || "PR"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-extrabold text-gray-900">{provider?.name || "Unassigned"}</div>
                                <div className="text-[10px] text-gray-500">{provider?.email || "N/A"}</div>
                                <div className="text-[10px] text-purple-700 font-semibold">{provider?.phone || ""}</div>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-extrabold text-gray-900 max-w-[180px] truncate">
                                {service?.title || "Requested Service"}
                              </div>
                              <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-extrabold uppercase">
                                {service?.category || "General"}
                              </span>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-900">
                              {new Date(booking.scheduled_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </div>
                            <div className="text-[10px] font-semibold text-gray-500">{booking.time_slot}</div>
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4 font-black text-gray-900 text-sm">
                            ₹{price}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(booking.status)}`}>
                              {booking.status === "ACCEPTED" ? "CONFIRMED" : booking.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => dispatch(setSelectedBooking(booking))}
                              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                              title="View Booking Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="lg:hidden divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const customer = booking.customer_id;
                  const provider = booking.provider_id;
                  const service = booking.service_id;
                  const price = service?.price || 499;

                  return (
                    <div key={booking._id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-gray-900">#BK-{booking._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(booking.status)}`}>
                          {booking.status === "ACCEPTED" ? "CONFIRMED" : booking.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">{service?.title || "Requested Service"}</h4>
                          <span className="text-[10px] text-gray-500 font-semibold">{service?.category}</span>
                        </div>
                        <span className="text-base font-black text-emerald-700">₹{price}</span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-gray-700 font-bold">
                          <span>Customer:</span>
                          <span className="text-gray-900">{customer?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700 font-bold">
                          <span>Provider:</span>
                          <span className="text-emerald-700">{provider?.name || "Unassigned"}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500 font-medium pt-1 border-t border-gray-200/60">
                          <span>Date & Time:</span>
                          <span>{new Date(booking.scheduled_date).toLocaleDateString()} ({booking.time_slot})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => dispatch(setSelectedBooking(booking))}
                        className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Detailed Booking Info
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ========================================== */}
          {/* PAGINATION FOOTER                          */}
          {/* ========================================== */}
          {bookings.length > 0 && (
            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-600">
              <div>
                Showing <span className="font-bold text-gray-900">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{" "}
                <span className="font-bold text-gray-900">{Math.min(pagination.currentPage * pagination.limit, pagination.totalBookings)}</span> of{" "}
                <span className="font-bold text-gray-900">{pagination.totalBookings}</span> bookings
              </div>

              <div className="flex items-center gap-4">
                {/* Limit Selector */}
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
                    className="bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dispatch(setPage(pagination.currentPage - 1))}
                    disabled={pagination.currentPage <= 1}
                    className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (pagination.totalPages > 5 && pagination.currentPage > 3) {
                        pageNum = pagination.currentPage - 2 + i;
                        if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => dispatch(setPage(pageNum))}
                          className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                            pagination.currentPage === pageNum
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => dispatch(setPage(pagination.currentPage + 1))}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* BOOKING DETAILS DIALOG / MODAL             */}
        {/* ========================================== */}
        <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && dispatch(setSelectedBooking(null))}>
          <DialogContent className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5">
            {selectedBooking && (
              <>
                <DialogHeader className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Booking Breakdown</span>
                    <DialogTitle className="text-xl font-black text-gray-900">
                      #BK-{selectedBooking._id.slice(-6).toUpperCase()}
                    </DialogTitle>
                    <span className="text-xs font-semibold text-gray-500">
                      {new Date(selectedBooking.scheduled_date).toLocaleDateString("en-IN", { dateStyle: "full" })} &bull; {selectedBooking.time_slot}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status === "ACCEPTED" ? "CONFIRMED" : selectedBooking.status.replace("_", " ")}
                  </span>
                </DialogHeader>

                {/* Customer Section */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Customer Details</span>
                  <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-gray-200">
                        <AvatarImage src={selectedBooking.customer_id?.avatar} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                          {selectedBooking.customer_id?.name?.slice(0, 2).toUpperCase() || "CU"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{selectedBooking.customer_id?.name || "N/A"}</h4>
                        <p className="text-xs text-gray-500 font-medium">{selectedBooking.customer_id?.email}</p>
                        <p className="text-xs text-emerald-700 font-bold">{selectedBooking.customer_id?.phone}</p>
                      </div>
                    </div>
                    {selectedBooking.customer_id?.phone && (
                      <a href={`tel:${selectedBooking.customer_id?.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Provider Section */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Assigned Provider</span>
                  <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-gray-200">
                        <AvatarImage src={selectedBooking.provider_id?.avatar} />
                        <AvatarFallback className="bg-purple-100 text-purple-800 text-xs font-extrabold">
                          {selectedBooking.provider_id?.name?.slice(0, 2).toUpperCase() || "PR"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{selectedBooking.provider_id?.name || "Unassigned"}</h4>
                        <p className="text-xs text-gray-500 font-medium">{selectedBooking.provider_id?.email}</p>
                        <p className="text-xs text-purple-700 font-bold">{selectedBooking.provider_id?.phone}</p>
                      </div>
                    </div>
                    {selectedBooking.provider_id?.phone && (
                      <a href={`tel:${selectedBooking.provider_id?.phone}`} className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Service</span>
                  <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{selectedBooking.service_id?.title || "Service"}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {selectedBooking.service_id?.category}
                      </span>
                    </div>
                    <span className="text-base font-black text-gray-900">₹{selectedBooking.service_id?.price || 499}</span>
                  </div>
                </div>

                {/* Booking Address */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Booking Location</span>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{selectedBooking.booking_address}</span>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-semibold">
                    <span>Service Amount</span>
                    <span>₹{selectedBooking.service_id?.price || 499}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-semibold">
                    <span>Platform Fee</span>
                    <span>₹25</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-semibold">
                    <span>GST (18%)</span>
                    <span>₹{Math.round((selectedBooking.service_id?.price || 499) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total Paid / Payable</span>
                    <span className="text-emerald-700">
                      ₹{(selectedBooking.service_id?.price || 499) + 25 + Math.round((selectedBooking.service_id?.price || 499) * 0.18)}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      alert(`Invoice generated for Booking #${selectedBooking._id.slice(-6).toUpperCase()}`);
                    }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-gray-600" /> View Invoice
                  </button>
                  <button
                    onClick={() => dispatch(setSelectedBooking(null))}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
