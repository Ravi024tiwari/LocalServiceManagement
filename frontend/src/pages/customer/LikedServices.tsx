import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Bookmark,
  Clock,
  Sparkles,
  Search,
  ChevronDown,
  MapPin,
  Loader2,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchLikedServices,
  fetchLikedStats,
  setSearchFilter,
  setCategoryFilter,
  setPriceFilter,
  setSortBy,
} from "@/store/slices/likedServiceSlice";
import LikedServiceCard from "@/components/customer/LikedServiceCard";
import { type LikedServiceItem } from "@/services/likedService.api";
import { bookingApi } from "@/services/booking.service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  "All Categories",
  "Appliance Repair",
  "Plumbing",
  "Cleaning",
  "Electrical",
  "Painting",
  "Carpentry",
  "Vehicle Repair",
  "Pest Control",
];

const PRICE_RANGES = [
  "All Prices",
  "Under ₹300",
  "₹300 - ₹500",
  "₹500 - ₹1000",
  "Above ₹1000",
];

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
];

export default function LikedServices() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Store State
  const { likedServices, stats, filters, isLoading, error } = useAppSelector(
    (state) => state.likedService
  );

  // User location state
  const [currentLocationText, setCurrentLocationText] = useState("Bilaspur, Chhattisgarh");

  // Booking Modal State
  const [selectedBookingItem, setSelectedBookingItem] = useState<LikedServiceItem | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [bookingAddressInput, setBookingAddressInput] = useState<string>("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [slotConflictError, setSlotConflictError] = useState<string>("");
  const [createdBookingResult, setCreatedBookingResult] = useState<any>(null);

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchLikedServices());
    dispatch(fetchLikedStats());
  }, [dispatch]);

  // Filter & Sort Logic
  const filteredServices = useMemo(() => {
    return likedServices.filter((item) => {
      const s = item.service;
      // Search Filter
      const matchesSearch =
        !filters.search ||
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.provider?.name?.toLowerCase().includes(filters.search.toLowerCase());

      // Category Filter
      const matchesCategory =
        filters.category === "ALL" ||
        filters.category === "All Categories" ||
        s.category.toLowerCase() === filters.category.toLowerCase();

      // Price Filter
      let matchesPrice = true;
      if (filters.priceRange === "Under ₹300") matchesPrice = s.price < 300;
      else if (filters.priceRange === "₹300 - ₹500") matchesPrice = s.price >= 300 && s.price <= 500;
      else if (filters.priceRange === "₹500 - ₹1000") matchesPrice = s.price >= 500 && s.price <= 1000;
      else if (filters.priceRange === "Above ₹1000") matchesPrice = s.price > 1000;

      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (filters.sortBy === "PRICE_LOW_HIGH") return a.service.price - b.service.price;
      if (filters.sortBy === "PRICE_HIGH_LOW") return b.service.price - a.service.price;
      if (filters.sortBy === "DISTANCE") return a.distanceKm - b.distanceKm;
      // Default: RECENTLY_LIKED
      return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
    });
  }, [likedServices, filters]);

  // Handle Booking Submit
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingItem) return;

    setIsSubmittingBooking(true);
    setSlotConflictError("");

    try {
      // 1. Double check availability
      const availRes = await bookingApi.checkAvailability({
        service_id: selectedBookingItem.service_id,
        scheduled_date: scheduledDate,
        time_slot: selectedTimeSlot,
      });

      if (!availRes.available) {
        setSlotConflictError(
          availRes.message || "Selected time slot is already booked for this service. Please choose another time."
        );
        setIsSubmittingBooking(false);
        return;
      }

      // 2. Create Booking
      const payload = {
        service_id: selectedBookingItem.service_id,
        provider_id: selectedBookingItem.service.provider?._id || "",
        scheduled_date: scheduledDate,
        time_slot: selectedTimeSlot,
        booking_address: bookingAddressInput || currentLocationText,
      };

      const bookingRes = await bookingApi.createBooking(payload);
      setCreatedBookingResult(bookingRes.data);
    } catch (err: any) {
      setSlotConflictError(err.response?.data?.message || "Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* TOP HEADER LOCATION ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full w-fit shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-gray-800">{currentLocationText}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* PAGE TITLE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="bg-red-50 p-2 rounded-xl text-red-500">
                <Heart className="w-6 h-6 fill-red-500" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                Liked Services
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              All the services you've liked. Book anytime when you need them.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:border-gray-300 shadow-sm focus:outline-none">
                <span>
                  {filters.sortBy === "PRICE_LOW_HIGH"
                    ? "Price: Low to High"
                    : filters.sortBy === "PRICE_HIGH_LOW"
                    ? "Price: High to Low"
                    : filters.sortBy === "DISTANCE"
                    ? "Nearest First"
                    : "Recently Liked"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1">
                <DropdownMenuItem
                  onClick={() => dispatch(setSortBy("RECENTLY_LIKED"))}
                  className="text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  Recently Liked
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setSortBy("PRICE_LOW_HIGH"))}
                  className="text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setSortBy("PRICE_HIGH_LOW"))}
                  className="text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setSortBy("DISTANCE"))}
                  className="text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  Nearest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* METRICS & STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Liked */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 fill-emerald-100" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Total Liked
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.totalLiked || likedServices.length}
                </span>
                <span className="text-xs font-semibold text-gray-500">Services</span>
              </div>
            </div>
          </div>

          {/* Card 2: Categories */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6 fill-amber-100" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Categories
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.totalCategories || 8}
                </span>
                <span className="text-xs font-semibold text-gray-500">Different</span>
              </div>
            </div>
          </div>

          {/* Card 3: Last Liked */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Last Liked
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  {stats.lastLikedText?.replace(" Days ago", "") || 2}
                </span>
                <span className="text-xs font-semibold text-gray-500">Days ago</span>
              </div>
            </div>
          </div>

          {/* Card 4: Potential Savings */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Potential Savings
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl lg:text-2xl font-black text-gray-900">
                  ₹{(stats.potentialSavings || 2340).toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium block -mt-0.5">If booked together</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-3 lg:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search liked services..."
              value={filters.search}
              onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all focus:outline-none">
                <span>{filters.category === "ALL" ? "All Categories" : filters.category}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 w-48">
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => dispatch(setCategoryFilter(cat === "All Categories" ? "ALL" : cat))}
                    className="text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all focus:outline-none">
                <span>{filters.priceRange === "ALL" ? "All Prices" : filters.priceRange}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 w-44">
                {PRICE_RANGES.map((pr) => (
                  <DropdownMenuItem
                    key={pr}
                    onClick={() => dispatch(setPriceFilter(pr === "All Prices" ? "ALL" : pr))}
                    className="text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    {pr}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filters Button */}
            <button
              type="button"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* LIKED SERVICES GRID */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading your saved services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">No Liked Services Found</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {likedServices.length === 0
                ? "You haven't saved any services yet. Explore available services in your area and click the heart button to save them!"
                : "No services match your active search or filter criteria. Try resetting your filters."}
            </p>
            <button
              onClick={() => navigate("/nearby-services")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all"
            >
              Explore Nearby Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredServices.map((item) => (
              <LikedServiceCard
                key={item._id}
                item={item}
                onBookNow={(selectedItem) => {
                  setSelectedBookingItem(selectedItem);
                  setCreatedBookingResult(null);
                  setSlotConflictError("");
                }}
              />
            ))}
          </div>
        )}

        {/* BOTTOM PROMO BANNER */}
        <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-200 text-emerald-800 p-2.5 rounded-xl">
              <Bookmark className="w-5 h-5 fill-emerald-800" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Save more services you like</h4>
              <p className="text-xs text-gray-600">
                Keep adding services to your list and book them whenever you need.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/nearby-services")}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Explore More Services
          </button>
        </div>
      </div>

      {/* BOOKING CONFIRMATION MODAL */}
      {selectedBookingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-gray-900 text-base">Book Saved Service</h3>
              </div>
              <button
                onClick={() => setSelectedBookingItem(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {createdBookingResult ? (
                /* Success View */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-extrabold text-gray-900">Booking Confirmed!</h4>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    Your job request for <strong>{selectedBookingItem.service.name}</strong> has been sent to the service provider.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-2xl text-left text-xs space-y-2 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Booking ID:</span>
                      <span className="font-mono font-bold text-gray-900">{createdBookingResult._id || "CONFIRMED"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Scheduled Date:</span>
                      <span className="font-bold text-gray-900">{scheduledDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time Slot:</span>
                      <span className="font-bold text-gray-900">{selectedTimeSlot}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBookingItem(null);
                      navigate("/bookings");
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all"
                  >
                    View My Bookings →
                  </button>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Service Summary Card */}
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <img
                      src={selectedBookingItem.service.images?.[0] || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=300&q=80"}
                      alt={selectedBookingItem.service.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{selectedBookingItem.service.name}</h4>
                      <span className="text-xs font-extrabold text-emerald-700">
                        ₹{selectedBookingItem.service.price}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Provider: {selectedBookingItem.service.provider?.name || "Verified Professional"}
                      </span>
                    </div>
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Booking Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Preferred Time Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            selectedTimeSlot === slot
                              ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-bold"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Location Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Delivery / Service Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter address details (e.g., Street, Flat No, Landmark)"
                      value={bookingAddressInput}
                      onChange={(e) => setBookingAddressInput(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Slot Conflict Error */}
                  {slotConflictError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{slotConflictError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingBooking && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm Booking
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
