import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { 
  MapPin, Search, Navigation, Star, 
  ShieldCheck, Calendar, Wallet, Heart,
  ChevronDown, Bell, Loader2, CheckCircle2, X, AlertCircle, Clock
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import LikeButton from "@/components/customer/LikeButton";
import { serviceApi } from "@/services/service.service";
import { bookingApi } from "@/services/booking.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLikedServices } from "@/store/slices/likedServiceSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";

interface ServiceItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration?: string;
  images: string[];
  is_available: boolean;
  service_location?: {
    type: string;
    coordinates: number[];
  };
  provider_id?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    rating?: number;
    experience_years?: number;
  };
  rating?: number;
  reviewsCount?: number;
  averageRating?: number;
  totalReviews?: number;
}

const DISTANCE_OPTIONS = [5, 10, 20, 50];

const CATEGORIES = [
  "All Categories",
  "Appliance Repair",
  "Plumbing",
  "Cleaning",
  "Electrical",
  "Painting",
  "Carpentry",
  "Vehicle Repair",
];

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function NearbyServices() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Customer Location State
  const [userLat, setUserLat] = useState<number>(23.2599);
  const [userLng, setUserLng] = useState<number>(77.4126);
  const [userAddress, setUserAddress] = useState<string>("Bhopal, Madhya Pradesh");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filters State
  const [selectedDistance, setSelectedDistance] = useState<number>(20);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Relevance");

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  // Location Search State
  const [locationSearchInput, setLocationSearchInput] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; lat: number; lon: number }>>([]);

  // Services Data State (Backend API)
  const [backendServices, setBackendServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Modal State
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceItem | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [bookingAddressInput, setBookingAddressInput] = useState<string>("");

  const [isCheckingSlot, setIsCheckingSlot] = useState<boolean>(false);
  const [slotConflictError, setSlotConflictError] = useState<string>("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [createdBookingResult, setCreatedBookingResult] = useState<any>(null);

  // Auto-detect geolocation
  const detectLiveLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);

          const resolved = await serviceApi.reverseGeocode(lat, lng);
          setUserAddress(resolved);
          setBookingAddressInput(resolved);
          setIsLocating(false);
        },
        async (err) => {
          console.warn("Geolocation error:", err.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    detectLiveLocation();
    dispatch(fetchLikedServices());
  }, [dispatch]);

  // Fetch Nearby Services from Backend API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await serviceApi.getNearbyServices(userLng, userLat, selectedDistance);
        if (res && res.data) {
          setBackendServices(res.data);
        } else {
          setBackendServices([]);
        }
      } catch (err) {
        console.error("Failed to fetch nearby services:", err);
        setBackendServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [userLat, userLng, selectedDistance]);

  // Check slot availability when service, date, or slot changes
  useEffect(() => {
    if (!selectedDetailService) return;

    const checkSlot = async () => {
      try {
        setIsCheckingSlot(true);
        setSlotConflictError("");
        const res = await bookingApi.checkAvailability({
          service_id: selectedDetailService._id,
          scheduled_date: scheduledDate,
          time_slot: selectedTimeSlot,
        });

        if (res && res.data && !res.data.isAvailable) {
          setSlotConflictError(res.data.message || "You have already booked this service for this slot.");
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "This slot is unavailable or already booked.";
        setSlotConflictError(errorMsg);
      } finally {
        setIsCheckingSlot(false);
      }
    };

    checkSlot();
  }, [selectedDetailService, scheduledDate, selectedTimeSlot]);

  // Open Service Modal
  const handleOpenDetailModal = (service: ServiceItem) => {
    setSelectedDetailService(service);
    setBookingAddressInput(userAddress);
    setSlotConflictError("");
    setCreatedBookingResult(null);
  };

  // Submit Booking Request
  const handleConfirmBookingSubmit = async () => {
    if (!selectedDetailService) return;
    if (slotConflictError) return;

    try {
      setIsSubmittingBooking(true);
      const payload = {
        service_id: selectedDetailService._id,
        provider_id: (selectedDetailService.provider_id as any)?._id || selectedDetailService.provider_id || "64f1a2b3c4d5e6f7a8b9c0d1",
        scheduled_date: scheduledDate,
        time_slot: selectedTimeSlot,
        booking_address: bookingAddressInput || userAddress,
      };

      const res = await bookingApi.createBooking(payload);
      if (res && res.data) {
        setCreatedBookingResult(res.data);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to create booking.";
      setSlotConflictError(errorMsg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return (backendServices || []).filter((s) => {
      if (!s) return false;
      const sName = s.name || "";
      const sCat = s.category || "";

      const matchesSearch = sName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        sCat.toLowerCase().includes((searchQuery || "").toLowerCase());

      const matchesCat = selectedCategory === "All Categories" ||
        sCat.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === "Price: Low to High") return (a.price || 0) - (b.price || 0);
      if (sortBy === "Price: High to Low") return (b.price || 0) - (a.price || 0);
      if (sortBy === "Rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [backendServices, searchQuery, selectedCategory, sortBy]);

  // Location Search Handler
  const handleLocationSearch = async (val: string) => {
    setLocationSearchInput(val);
    if (val.trim().length >= 3) {
      const results = await serviceApi.searchLocation(val);
      setLocationSuggestions(results);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleSelectLocationSuggestion = (item: { display_name: string; lat: number; lon: number }) => {
    setUserLat(item.lat);
    setUserLng(item.lon);
    setUserAddress(item.display_name.split(",").slice(0, 3).join(","));
    setBookingAddressInput(item.display_name.split(",").slice(0, 3).join(","));
    setLocationSearchInput("");
    setLocationSuggestions([]);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-sans">

        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={locationSearchInput || userAddress}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search city or neighborhood..."
                  className="bg-transparent text-sm font-semibold text-gray-800 outline-none w-48 sm:w-56"
                />
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
              </div>

              {locationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-56 overflow-y-auto text-gray-800">
                  {locationSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocationSuggestion(item)}
                      className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 text-xs font-medium flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={detectLiveLocation}
              disabled={isLocating}
              className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Navigation className="w-3.5 h-3.5 text-emerald-600" />}
              Locate Me
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="relative cursor-pointer bg-white p-2.5 rounded-full border border-gray-200 shadow-sm hover:text-emerald-600">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="w-9 h-9 border border-gray-200 shadow-sm cursor-pointer">
                  <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                  <AvatarFallback>RH</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search services like "AC Repair, Plumber, Electrician..."'
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Verified Professionals</h4>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">Trusted & background checked</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Instant Booking</h4>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">Book in less than a minute</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Live Tracking</h4>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">Track your service in real-time</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Secure Payments</h4>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">100% safe & secure</p>
            </div>
          </div>
        </div>

        {/* RADIUS SELECTOR & SORTING BAR */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto">
            <span className="text-xs font-bold text-gray-700 shrink-0 mr-1">Radius:</span>
            {DISTANCE_OPTIONS.map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setSelectedDistance(dist)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedDistance === dist
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Within {dist} km
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className="text-xs font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
            >
              <option>Relevance</option>
              <option>Rating</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === cat
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SERVICES CARDS GRID */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-gray-500">Finding nearby services within {selectedDistance} km...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No Services Found Nearby</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                No active service providers were found within {selectedDistance} km of {userAddress}. Try expanding the radius or changing your location.
              </p>
            </div>
            <button
              onClick={() => { setSelectedDistance(50); setSelectedCategory("All Categories"); setSearchQuery(""); }}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200"
            >
              Expand Radius to 50 km
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredServices.map((service) => {
              const coverImage = service.images?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80";
              const sLat = service.service_location?.coordinates?.[1] || 23.2599;
              const sLng = service.service_location?.coordinates?.[0] || 77.4126;
              const distanceKm = calculateDistanceKm(userLat, userLng, sLat, sLng);

              const providerName = service.provider_id?.name || "Verified Provider";
              const expYears = service.provider_id?.experience_years || 5;
              const isBookmarked = Boolean(bookmarkedIds[service._id]);

              return (
                <div
                  key={service._id}
                  onClick={() => navigate(`/service/${service._id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={coverImage}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute top-2.5 left-2.5 bg-gray-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{distanceKm} km away</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                      <LikeButton serviceId={service._id} />
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                      {service.category}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {service.name}
                      </h3>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-gray-900">{service.averageRating ? service.averageRating.toFixed(1) : (service.rating || "New")}</span>
                          <span className="text-gray-400 text-[10px]">({service.totalReviews ?? service.reviewsCount ?? 0})</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-sm">₹{service.price}</span>
                          <span className="text-[9px] text-gray-400 font-medium block leading-none">Starting from</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 border border-gray-200">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${service._id}`} />
                        <AvatarFallback>{providerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-800 truncate">{providerName}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 leading-none">
                          {expYears} yrs experience
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================================================================== */}
      {/* SERVICE DETAILS & BOOKING MODAL                                     */}
      {/* ================================================================== */}
      {selectedDetailService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="relative h-44 overflow-hidden shrink-0">
              <img
                src={selectedDetailService.images?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80"}
                alt={selectedDetailService.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDetailService(null)}
                className="absolute top-3 right-3 bg-gray-900/60 hover:bg-gray-900 text-white p-1.5 rounded-full backdrop-blur-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {createdBookingResult ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h3 className="text-xl font-bold text-gray-900">Booking Request Submitted!</h3>
                  <p className="text-xs text-gray-500">
                    Your request for <span className="font-bold text-gray-900">{selectedDetailService.name}</span> on{" "}
                    <span className="font-bold text-emerald-600">{scheduledDate} ({selectedTimeSlot})</span> is currently <span className="font-bold text-amber-600">PENDING APPROVAL</span>.
                  </p>

                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-left text-xs text-emerald-900 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Status:</span>
                      <span className="text-amber-600 font-extrabold uppercase">PENDING</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="truncate max-w-[220px]">{bookingAddressInput}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedDetailService(null); setCreatedBookingResult(null); }}
                      className="w-1/2 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigate("/bookings")}
                      className="w-1/2 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      View My Bookings
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {selectedDetailService.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedDetailService.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-emerald-600">₹{selectedDetailService.price}</span>
                      <span className="text-[10px] text-gray-400 font-semibold block">{selectedDetailService.duration || "60 mins"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedDetailService.description}
                  </p>

                  {/* REVIEWS & RATINGS COMPONENT */}
                  <div className="pt-2 border-t border-gray-100">
                    <ServiceReviewsSection
                      serviceId={selectedDetailService._id}
                      serviceName={selectedDetailService.name}
                      currentUserId={auth.user?.id || auth.user?._id}
                      currentUserRole={auth.role || auth.user?.role}
                      isLoggedIn={auth.isAuthenticated}
                    />
                  </div>

                  {/* SLOT & DATE SELECTION FORM */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Scheduled Date */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 mb-1 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Scheduled Date
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Time Slot Dropdown */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 mb-1 block flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> Time Slot
                        </label>
                        <select
                          value={selectedTimeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Booking Address Input */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 mb-1 block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Service Location Address
                      </label>
                      <input
                        type="text"
                        value={bookingAddressInput}
                        onChange={(e) => setBookingAddressInput(e.target.value)}
                        placeholder="Enter full address..."
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* SLOT CONFLICT WARNING ALERT */}
                  {isCheckingSlot ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Checking slot availability...
                    </div>
                  ) : slotConflictError ? (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Already Booked / Conflict:</span>
                        <span>{slotConflictError}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedDetailService(null)}
                      className="w-1/3 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(slotConflictError) || isCheckingSlot || isSubmittingBooking}
                      onClick={handleConfirmBookingSubmit}
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
