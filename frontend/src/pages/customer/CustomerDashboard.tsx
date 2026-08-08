import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { 
  Search, MapPin, ChevronDown, Filter, Zap, Droplets, 
  Sparkles, Hammer, Paintbrush, Wrench, Clock, Star,
  CheckCircle2, CreditCard, Crosshair, Bell, ShieldCheck, LifeBuoy, X,
  Calendar, Loader2, AlertCircle, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";

import CustomerLayout from "@/layout/CustomerLayout";
import CustomerAvatarMenu from "@/components/customer/CustomerAvatarMenu";
import LikeButton from "@/components/customer/LikeButton";
import { serviceApi } from "@/services/service.service";
import { bookingApi } from "@/services/booking.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLikedServices } from "@/store/slices/likedServiceSlice";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";
import { useLocationDetector } from "@/hooks/useLocationDetector";

interface BackendServiceItem {
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
    coordinates: number[]; // [lng, lat]
  };
  provider_id?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    rating?: number;
    experience_years?: number;
  };
  rating?: number;
  reviewsCount?: number;
  averageRating?: number;
  totalReviews?: number;
}

// Icon mapper for categories
const getIcon = (name: string) => {
  switch (name?.toLowerCase()) {
    case 'electrical': return <Zap className="w-6 h-6" />;
    case 'plumbing': return <Droplets className="w-6 h-6" />;
    case 'cleaning': return <Sparkles className="w-6 h-6" />;
    case 'carpentry': return <Hammer className="w-6 h-6" />;
    case 'painting': return <Paintbrush className="w-6 h-6" />;
    case 'appliance repair':
    case 'appliance': return <Wrench className="w-6 h-6" />;
    default: return <Zap className="w-6 h-6" />;
  }
};

const CATEGORIES = [
  { name: "Electrical", icon: "Electrical", color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Plumbing", icon: "Plumbing", color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Cleaning", icon: "Cleaning", color: "text-pink-500", bg: "bg-pink-50" },
  { name: "Carpentry", icon: "Carpentry", color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Painting", icon: "Painting", color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Appliance Repair", icon: "Appliance", color: "text-teal-500", bg: "bg-teal-50" },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Location State
  const [userLat, setUserLat] = useState<number>(22.0797); // Default Bilaspur/Regional coords
  const [userLng, setUserLng] = useState<number>(82.1409);
  const [userAddress, setUserAddress] = useState<string>("Bilaspur, Chhattisgarh");

  // Services State (Real backend data)
  const [nearbyServices, setNearbyServices] = useState<BackendServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Upcoming Booking State
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);

  // Selected Service Detail Modal State
  const [selectedService, setSelectedService] = useState<BackendServiceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Current User Info State
  const [currentUser, setCurrentUser] = useState<{ name?: string; location?: string }>({
    name: "Customer",
    location: "Bilaspur, Chhattisgarh",
  });

  const syncUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser({
          name: parsed.fullName || parsed.name || "Customer",
          location: parsed.location || "Bilaspur, Chhattisgarh",
        });
        if (parsed.location) {
          setUserAddress(parsed.location);
        }
      } catch (e) {
        console.error("Failed to parse user profile in dashboard", e);
      }
    }
  };

  // 1. Initial Load: Fetch Liked Services for Redux sync + Real Nearby Services + Real Bookings
  useEffect(() => {
    syncUser();

    // Fetch user liked services into Redux store so heart buttons know liked state
    dispatch(fetchLikedServices());

    // Fetch real nearby services from backend
    loadRealNearbyServices();

    // Fetch real upcoming booking from backend
    loadRealUpcomingBooking();

    window.addEventListener("userProfileUpdated", syncUser);
    return () => window.removeEventListener("userProfileUpdated", syncUser);
  }, [dispatch]);

  const loadRealNearbyServices = async () => {
    setIsLoadingServices(true);
    try {
      const res = await serviceApi.getNearbyServices(userLng, userLat, 50);
      if (res && res.data && Array.isArray(res.data)) {
        setNearbyServices(res.data);
      } else if (Array.isArray(res)) {
        setNearbyServices(res);
      } else {
        setNearbyServices([]);
      }
    } catch (err) {
      console.warn("Could not fetch nearby services from backend:", err);
      setNearbyServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadRealUpcomingBooking = async () => {
    try {
      const res = await bookingApi.getCustomerBookings();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Get first non-cancelled upcoming booking
        const active = res.data.find(
          (b: any) => b.status === "PENDING" || b.status === "ACCEPTED" || b.status === "IN_PROGRESS"
        );
        setUpcomingBooking(active || null);
      }
    } catch (err) {
      console.warn("Could not fetch customer bookings:", err);
    }
  };

  // Filtered Services based on Category and Search Query
  const filteredServices = useMemo(() => {
    return nearbyServices.filter((service) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        service.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [nearbyServices, selectedCategory, searchQuery]);

  const { locationName: dynamicLocation, detectLocation, isDetecting } = useLocationDetector();

  const displayName = currentUser.name;
  const displayLocation = dynamicLocation || currentUser.location || userAddress;

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER ROW - Desktop Only */}
        <div className="hidden lg:flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Good Morning, {displayName} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">What service do you need today in your region?</p>
          </div>
          <div className="flex items-center gap-6">
            <div 
              onClick={detectLocation}
              title="Click to refresh current location dynamically"
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <MapPin className={`w-4 h-4 text-emerald-600 ${isDetecting ? "animate-bounce" : ""}`} />
              <span className="text-sm font-medium text-gray-700">{displayLocation}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer hover:text-emerald-600 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
              </div>
              <CustomerAvatarMenu />
            </div>
          </div>
        </div>

        {/* MOBILE GREETING */}
        <div className="lg:hidden">
          <h1 className="text-xl font-extrabold text-gray-900">Good Morning, {displayName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">What service do you need today?</p>
          <div className="flex items-center gap-1 mt-3 text-emerald-600 text-sm font-medium">
             <MapPin className="w-4 h-4" /> {displayLocation} <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT CONTENT (Spans 2 columns on XL) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services in your area (e.g. AC Repair, Plumber, Electrician...)" 
                className="w-full pl-12 pr-24 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 font-medium text-sm"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-10 font-bold text-xs">
                Search
              </Button>
            </div>

            {/* Top Categories */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Categories in Your Region</h2>
                {selectedCategory !== "ALL" && (
                  <button 
                    onClick={() => setSelectedCategory("ALL")}
                    className="text-emerald-600 text-xs font-bold hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                <div 
                  onClick={() => setSelectedCategory("ALL")}
                  className={`snap-start flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${selectedCategory === "ALL" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"} flex items-center justify-center transition-all shadow-sm`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold ${selectedCategory === "ALL" ? "text-emerald-700 font-bold" : "text-gray-700"}`}>All</span>
                </div>

                {CATEGORIES.map((cat, i) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedCategory(isSelected ? "ALL" : cat.name)}
                      className="snap-start flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                    >
                      <div className={`w-16 h-16 rounded-2xl ${isSelected ? "bg-emerald-600 text-white ring-2 ring-emerald-500/30" : cat.bg} flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
                        <div className={isSelected ? "text-white" : cat.color}>{getIcon(cat.icon)}</div>
                      </div>
                      <span className={`text-xs font-semibold text-center line-clamp-1 ${isSelected ? "text-emerald-700 font-bold" : "text-gray-700"}`}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* POPULAR SERVICES NEAR YOU (REAL DATA & REDUX LIKED TOGGLE) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Services Near You</h2>
                <button 
                  onClick={() => navigate("/nearby-services")} 
                  className="text-emerald-600 text-sm font-bold hover:underline"
                >
                  Explore All →
                </button>
              </div>
              
              {isLoadingServices ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Fetching active services in your region...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Services Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {searchQuery || selectedCategory !== "ALL"
                      ? "No services match your active search or category filter. Try clearing filters."
                      : "There are currently no provider services published in your area."}
                  </p>
                  {(searchQuery || selectedCategory !== "ALL") && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("ALL");
                      }}
                      variant="outline"
                      className="text-xs font-bold text-emerald-700 border-emerald-200"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredServices.map((service) => {
                    const providerName = service.provider_id?.name || "Verified Provider";
                    const providerAvatar = service.provider_id?.avatar;
                    const rating = service.provider_id?.rating || service.rating || 4.8;
                    const fallbackImage =
                      service.images && service.images.length > 0
                        ? service.images[0]
                        : "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80";

                    return (
                      <div key={service._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          {/* Image Container */}
                          <div className="relative h-44 overflow-hidden bg-gray-100">
                            <img 
                              src={fallbackImage} 
                              alt={service.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />

                            {/* REUSABLE REDUX CONNECTED LIKE BUTTON */}
                            <div className="absolute top-3 right-3 z-10">
                              <LikeButton serviceId={service._id} />
                            </div>

                            {/* Category Pill */}
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700 uppercase">
                              {service.category}
                            </div>
                          </div>

                          {/* Card Info */}
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {service.name}
                              </h3>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-gray-400 block -mb-1">Starting from</span>
                                <span className="font-extrabold text-gray-900 text-base">₹{service.price}</span>
                              </div>
                            </div>
                            
                            {/* Provider Info */}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-[10px] shrink-0 overflow-hidden">
                                {providerAvatar ? (
                                  <img src={providerAvatar} alt={providerName} className="w-full h-full object-cover" />
                                ) : (
                                  providerName.charAt(0)
                                )}
                              </div>
                              <span className="text-xs font-semibold text-gray-700 truncate">{providerName}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </div>

                            {/* Distance & Rating Info */}
                            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 bg-gray-50 p-2 rounded-xl">
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-gray-900 font-bold">{service.averageRating ? service.averageRating.toFixed(1) : (rating || "New")}</span>
                                <span className="text-gray-400">({service.totalReviews ?? 0})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span>0.8 km away</span>
                              </div>
                              {service.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{service.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* View Details Action -> Redirects to Full-Page Service Details */}
                        <div className="p-4 pt-0">
                          <Button 
                            onClick={() => navigate(`/service/${service._id}`)} 
                            variant="outline" 
                            className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold text-xs cursor-pointer"
                          >
                            View Details ({service.images?.length || 1} Photos)
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR (Upcoming Booking, Quick Actions) */}
          <div className="space-y-6">
            
            {/* Upcoming Booking Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">Upcoming Booking</h3>
                <button 
                  onClick={() => navigate("/bookings")}
                  className="text-emerald-600 text-xs font-bold hover:underline"
                >
                  View All
                </button>
              </div>

              {upcomingBooking ? (
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {upcomingBooking.service_id?.name || "Service Booking"}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {upcomingBooking.provider_id?.name || "Service Professional"}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700">
                        <Clock className="w-3 h-3" />
                        <span>{upcomingBooking.time_slot || "Scheduled"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {upcomingBooking.status}
                    </span>
                    <button 
                      onClick={() => navigate("/bookings")}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Track Job →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">No upcoming active bookings</p>
                  <button 
                    onClick={() => navigate("/nearby-services")}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Book a Service Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div onClick={() => navigate("/bookings")} className="cursor-pointer">
                  <ActionBtn icon={<Crosshair className="text-blue-500" />} label="Track Bookings" bg="bg-blue-50" />
                </div>
                <div onClick={() => navigate("/addresses")} className="cursor-pointer">
                  <ActionBtn icon={<MapPin className="text-orange-500" />} label="My Addresses" bg="bg-orange-50" />
                </div>
                <div onClick={() => navigate("/wallet")} className="cursor-pointer">
                  <ActionBtn icon={<CreditCard className="text-purple-500" />} label="Wallet" bg="bg-purple-50" />
                </div>
                <div onClick={() => navigate("/liked-services")} className="cursor-pointer">
                  <ActionBtn icon={<Bookmark className="text-red-500 fill-red-500" />} label="Liked Services" bg="bg-red-50" />
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Why Choose ServiceHub?</h3>
              <div className="space-y-4">
                <FeatureRow icon={<ShieldCheck />} title="Verified Professionals" desc="Background checked experts" />
                <FeatureRow icon={<CheckCircle2 />} title="Secure Transactions" desc="100% safe & protected payments" />
                <FeatureRow icon={<Zap />} title="Instant Confirmation" desc="Book services in just a few taps" />
                <FeatureRow icon={<LifeBuoy />} title="24/7 Support" desc="We're here to help anytime" />
              </div>
            </div>

          </div>
        </div>

        {/* SERVICE DETAILS & IMAGE GALLERY MODAL */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 relative">
              
              {/* Close Button */}
              <button 
                onClick={() => { setSelectedService(null); setActiveImageIndex(0); }}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2 uppercase">
                  {selectedService.category}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">{selectedService.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedService.description}</p>
              </div>

              {/* MAIN HERO IMAGE PREVIEW */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img 
                  src={
                    (selectedService.images && selectedService.images[activeImageIndex]) ||
                    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
                  } 
                  alt={selectedService.name} 
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* LIKE BUTTON INSIDE MODAL */}
                <div className="absolute top-3 right-3 z-10">
                  <LikeButton serviceId={selectedService._id} />
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Image {activeImageIndex + 1} of {(selectedService.images?.length || 1)}
                </div>
              </div>

              {/* IMAGES THUMBNAIL GALLERY */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Service Photos ({selectedService.images.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedService.images.slice(0, 4).map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx 
                            ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-[1.02]" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info & Pricing */}
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm overflow-hidden">
                    {selectedService.provider_id?.avatar ? (
                      <img src={selectedService.provider_id.avatar} alt="Provider" className="w-full h-full object-cover" />
                    ) : (
                      selectedService.provider_id?.name?.charAt(0) || "P"
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {selectedService.provider_id?.name || "Verified Professional"}{" "}
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </h4>
                    <p className="text-xs text-gray-500">Service Professional Expert</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Price</span>
                  <span className="text-2xl font-extrabold text-emerald-600">₹{selectedService.price}</span>
                </div>
              </div>

              {/* REAL-TIME REVIEWS & RATINGS SECTION */}
              <div className="pt-4 border-t border-gray-100">
                <ServiceReviewsSection
                  serviceId={selectedService._id}
                  serviceName={selectedService.name}
                  currentUserId={auth.user?.id || auth.user?._id}
                  currentUserRole={auth.role || auth.user?.role}
                  isLoggedIn={auth.isAuthenticated}
                />
              </div>

              {/* Book Now Button */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    navigate("/liked-services");
                  }} 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-200 transition-all cursor-pointer"
                >
                  Book Service Now (₹{selectedService.price})
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}

// Helper Components for Dashboard
function ActionBtn({ icon, label, bg }: { icon: React.ReactNode; label: string; bg: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer transition-all bg-white group">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-emerald-600 mt-0.5 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}