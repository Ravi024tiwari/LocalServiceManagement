import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { 
  Search, MapPin, ChevronDown, Bell, Plus, Star, 
  Briefcase, CheckCircle2, User, Settings, LogOut,
  Trash2, Loader2, Clock, ChevronLeft, ChevronRight, X, FileText
} from "lucide-react";

import ProviderLayout from "@/layout/ProviderLayout";
import { serviceApi } from "@/services/service.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyServices } from "@/store/slices/serviceSlice";
import type { ServiceItem } from "@/store/slices/serviceSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";

const CATEGORIES = [
  "All Categories",
  "Appliance Repair",
  "Plumbing",
  "Home Cleaning",
  "Electrical",
  "Carpentry",
  "Painting",
  "Vehicle Repair",
];

const STATUS_FILTERS = ["All Status", "Active", "Inactive", "Draft"];

import { useLocationDetector } from "@/hooks/useLocationDetector";

export default function MyServices() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { locationName: dynamicLocation, detectLocation, isDetecting } = useLocationDetector();

  // Redux State
  const { user } = useAppSelector((state) => state.auth);
  const displayLocation = dynamicLocation || user?.location || "Bhopal, Madhya Pradesh";
  const { myServices, stats, isLoading } = useAppSelector((state) => state.service);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Service for Details Modal
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceItem | null>(null);

  // Fetch Services from API on mount
  useEffect(() => {
    dispatch(fetchMyServices());
  }, [dispatch]);

  // Filtered Services List (fetched purely from Backend API)
  const filteredServices = useMemo(() => {
    return (myServices || []).filter((service) => {
      if (!service) return false;
      const serviceName = service.name || "";
      const serviceCat = service.category || "";

      // Search title/category matching
      const matchesSearch = serviceName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        serviceCat.toLowerCase().includes((searchQuery || "").toLowerCase());

      // Category matching
      const matchesCategory = selectedCategory === "All Categories" ||
        serviceCat.toLowerCase() === selectedCategory.toLowerCase();

      // Status matching
      const serviceStatus = service.status || (service.is_available ? "Active" : "Inactive");
      const matchesStatus = selectedStatus === "All Status" ||
        serviceStatus.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      const priceA = a?.price || 0;
      const priceB = b?.price || 0;
      if (sortBy === "Price: Low to High") return priceA - priceB;
      if (sortBy === "Price: High to Low") return priceB - priceA;
      if (sortBy === "Highest Rated") return (b?.rating || 0) - (a?.rating || 0);
      return 0; // Newest First default
    });
  }, [myServices, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Dynamic Stats Counters from backend
  const safeServices = myServices || [];
  const totalCount = stats?.totalServices ?? safeServices.length;
  const activeCount = stats?.activeServices ?? safeServices.filter((s) => s?.is_available).length;
  const inactiveCount = stats?.inactiveServices ?? Math.max(0, totalCount - activeCount);
  const draftCount = stats?.draftServices ?? 0;

  // Handle Toggle Status
  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await serviceApi.toggleServiceStatus(serviceId, !currentStatus);
      dispatch(fetchMyServices());
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  // Handle Delete Service
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await serviceApi.deleteService(serviceId);
      dispatch(fetchMyServices());
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* ================================================================== */}
        {/* TOP PAGE HEADER                                                    */}
        {/* ================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Services
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Manage your all services in one place.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {/* Location Selector Badge */}
            <div 
              onClick={detectLocation}
              title="Click to refresh current location dynamically"
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <MapPin className={`w-4 h-4 text-emerald-600 ${isDetecting ? "animate-bounce" : ""}`} />
              <span className="text-sm font-medium text-gray-700">{displayLocation}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {/* Notifications */}
            <div className="relative cursor-pointer bg-white p-2.5 rounded-full border border-gray-200 shadow-sm hover:text-emerald-600">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-all">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                    <AvatarFallback>RH</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-900 leading-tight">
                      {user?.name || "Rahul Sharma"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Provider
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ================================================================== */}
        {/* SEARCH, FILTERS & CREATE BUTTON CONTROL BAR                         */}
        {/* ================================================================== */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters & CTA Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                {STATUS_FILTERS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Create New Service Button */}
            <button
              onClick={() => navigate("/provider/create-service")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Service
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* STATS SUMMARY BAR & SORTING                                        */}
        {/* ================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 max-w-4xl">
            {/* Total Services */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Services</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{totalCount}</span>
              </div>
            </div>

            {/* Active Services */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Active Services</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{activeCount}</span>
              </div>
            </div>

            {/* Inactive Services */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Inactive Services</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{inactiveCount}</span>
              </div>
            </div>

            {/* Draft Services */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Draft Services</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{draftCount}</span>
              </div>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className="text-xs font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
            >
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>

        {/* ================================================================== */}
        {/* SERVICES CARDS GRID (4-Column Layout matching mockup)               */}
        {/* ================================================================== */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-gray-500">Loading your services from backend...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">No Services Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {myServices.length === 0
                  ? "You haven't created any services yet. Click below to add your first service and start receiving customer bookings."
                  : "No services match your selected search or filter criteria."}
              </p>
            </div>

            {myServices.length === 0 ? (
              <button
                onClick={() => navigate("/provider/create-service")}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Your First Service
              </button>
            ) : (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All Categories"); setSelectedStatus("All Status"); }}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredServices.map((service) => {
              const statusLabel = service.status || (service.is_available ? "Active" : "Inactive");
              const coverImage = service.images?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80";

              return (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Image Preview Container */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={coverImage}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Status Badge */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(service._id, service.is_available)}
                      title="Click to toggle status"
                      className={`absolute top-2.5 right-2.5 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer ${
                        statusLabel === "Active"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : statusLabel === "Inactive"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-gray-700"
                      }`}
                    >
                      {statusLabel}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Service Title */}
                      <h3 className="font-extrabold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {service.name}
                      </h3>

                      {/* Category & Price Row */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                          {service.category}
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 font-semibold block text-[10px]">Starting from</span>
                          <span className="font-extrabold text-gray-900 text-sm">₹{service.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Row (Rating & Bookings) */}
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-gray-900 font-bold">{service.rating || 5.0}</span>
                        <span className="text-gray-400 text-[11px]">({service.reviewsCount || 0})</span>
                      </div>
                      <div className="text-gray-700 font-bold text-[11px]">
                        {service.bookingsCount || 0} Bookings
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        onClick={() => setSelectedDetailService(service)}
                        className="py-1.5 px-2 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => navigate(`/provider/edit-service/${service._id}`, { state: { service } })}
                        className="py-1.5 px-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="py-1.5 px-2 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors flex items-center justify-center"
                        title="Delete service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================== */}
        {/* PAGINATION BAR                                                     */}
        {/* ================================================================== */}
        {filteredServices.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  currentPage === page
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ================================================================== */}
      {/* SERVICE DETAILS MODAL                                              */}
      {/* ================================================================== */}
      {selectedDetailService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            <div className="relative h-48 overflow-hidden">
              <img
                src={selectedDetailService.images?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80"}
                alt={selectedDetailService.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDetailService(null)}
                className="absolute top-3 right-3 bg-gray-900/60 hover:bg-gray-900 text-white p-1.5 rounded-full backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {selectedDetailService.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-900 mt-1">{selectedDetailService.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-600">₹{selectedDetailService.price}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block">{selectedDetailService.duration || "60 mins"}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedDetailService.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rating: {selectedDetailService.rating || 5.0} / 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Total Bookings: {selectedDetailService.bookingsCount || 0}</span>
                </div>
              </div>

              {/* REAL-TIME REVIEWS & RATINGS SECTION FOR PROVIDER */}
              <div className="pt-4 border-t border-gray-100 max-h-[300px] overflow-y-auto">
                <ServiceReviewsSection
                  serviceId={selectedDetailService._id}
                  serviceName={selectedDetailService.name}
                  currentUserId={user?._id || user?.id}
                  currentUserRole="PROVIDER"
                  isLoggedIn={true}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedDetailService(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
