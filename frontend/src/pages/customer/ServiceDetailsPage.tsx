import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, MapPin, Calendar, Clock, Star,
  ShieldCheck, CheckCircle2, AlertCircle, Loader2,
  Share2, Heart, Wrench, ChevronRight
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import LikeButton from "@/components/customer/LikeButton";
import { serviceApi } from "@/services/service.service";
import { bookingApi } from "@/services/booking.service";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchLikedServices } from "@/store/slices/likedServiceSlice";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
];

export default function ServiceDetailsPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Booking Form State
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [bookingAddress, setBookingAddress] = useState<string>("Bhopal, Madhya Pradesh");
  
  const [isCheckingSlot, setIsCheckingSlot] = useState<boolean>(false);
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [createdBookingResult, setCreatedBookingResult] = useState<any>(null);

  // 1. Fetch service details
  useEffect(() => {
    dispatch(fetchLikedServices());

    // Sync address from stored user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.location) setBookingAddress(parsed.location);
      } catch (e) {
        console.error(e);
      }
    }

    if (serviceId) {
      loadServiceDetails(serviceId);
    }
  }, [serviceId, dispatch]);

  const loadServiceDetails = async (id: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await serviceApi.getServiceById(id);
      if (res && (res.data || res.service)) {
        setService(res.data || res.service);
      } else if (res && res._id) {
        setService(res);
      } else {
        setError("Service details could not be found.");
      }
    } catch (err: any) {
      console.error("Failed to load service detail:", err);
      setError(err.response?.data?.message || err.message || "Failed to load service details.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Check slot conflict whenever date/slot/serviceId changes
  useEffect(() => {
    if (!serviceId || !scheduledDate || !selectedTimeSlot) return;

    const checkConflict = async () => {
      setIsCheckingSlot(true);
      setSlotConflictError(null);
      try {
        const isAvailable = await bookingApi.checkSlotAvailability(serviceId, scheduledDate, selectedTimeSlot);
        if (!isAvailable) {
          setSlotConflictError("This slot is already booked. Please choose a different date or time.");
        }
      } catch (err: any) {
        if (err.response?.data?.message?.toLowerCase().includes("conflict") || err.response?.status === 409) {
          setSlotConflictError("Slot conflict: Provider is busy during this time slot.");
        }
      } finally {
        setIsCheckingSlot(false);
      }
    };

    checkConflict();
  }, [serviceId, scheduledDate, selectedTimeSlot]);

  // 3. Confirm Booking Handler
  const handleConfirmBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !service) return;
    if (!bookingAddress.trim()) {
      alert("Please enter a valid service location address.");
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const payload = {
        service_id: serviceId,
        scheduled_date: scheduledDate,
        time_slot: selectedTimeSlot,
        booking_address: bookingAddress,
      };

      const res = await bookingApi.createBooking(payload);
      setCreatedBookingResult(res.data || res);
    } catch (err: any) {
      console.error("Booking error:", err);
      alert(err.response?.data?.message || err.message || "Failed to create booking.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold text-slate-500">Loading service details...</span>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !service) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Service Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error || "The requested service could not be loaded."}</p>
          <button
            onClick={() => navigate("/nearby-services")}
            className="px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
          >
            Browse Nearby Services
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const provider = service.provider_id || {};
  const providerName = provider.name || "Verified Professional";
  const coverImage = (service.images && service.images[activeImageIndex]) ||
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80";

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span onClick={() => navigate("/")} className="hover:text-emerald-600 cursor-pointer">Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span onClick={() => navigate("/nearby-services")} className="hover:text-emerald-600 cursor-pointer">Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 dark:text-zinc-200 font-bold truncate max-w-[150px]">{service.name}</span>
          </div>
        </div>

        {/* Main Grid: Left Details Gallery & Right Booking Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTENT COLUMN (Photos, Info, Reviews) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header & Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-black rounded-full uppercase tracking-wider shadow-2xs">
                  {service.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {service.averageRating ? service.averageRating.toFixed(1) : (service.rating || "New")}
                  <span className="text-slate-500 font-normal">
                    ({service.totalReviews ?? service.reviewsCount ?? 0} reviews)
                  </span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {service.name}
              </h1>
            </div>

            {/* MAIN IMAGE GALLERY */}
            <div className="space-y-4">
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-md">
                <img
                  src={coverImage}
                  alt={service.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* LIKE & SHARE BUTTONS */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <div className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-md">
                    <LikeButton serviceId={service._id} />
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Photo {activeImageIndex + 1} of {(service.images?.length || 1)}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {service.images && service.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {service.images.slice(0, 4).map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-[1.02]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Description */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Service Overview</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
              {service.duration && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Duration: {service.duration}</span>
                </div>
              )}
            </div>

            {/* Provider Profile Info Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-emerald-500/20 shadow-sm">
                  <AvatarImage src={provider.avatar || `https://i.pravatar.cc/150?u=${service._id}`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                    {providerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{providerName}</h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Verified Professional Expert • {provider.experience_years || 5} Years Experience
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Expert
                </span>
              </div>
            </div>

            {/* REAL-TIME REVIEWS & RATINGS SECTION */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
              <ServiceReviewsSection
                serviceId={service._id}
                serviceName={service.name}
                currentUserId={auth.user?.id || auth.user?._id}
                currentUserRole={auth.role || auth.user?.role}
                isLoggedIn={auth.isAuthenticated}
              />
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY RESPONSIVE BOOKING WIDGET */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
              
              {createdBookingResult ? (
                <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Booking Requested!</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Your request for <span className="font-bold text-slate-800 dark:text-zinc-200">{service.name}</span> on{" "}
                    <span className="font-bold text-emerald-600">{scheduledDate} ({selectedTimeSlot})</span> has been submitted and is <span className="font-bold text-amber-600 uppercase">Pending Approval</span>.
                  </p>

                  <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl text-xs space-y-2 text-left border border-slate-100 dark:border-zinc-700">
                    <div className="flex justify-between font-bold">
                      <span>Status:</span>
                      <span className="text-amber-600 uppercase">PENDING</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Price:</span>
                      <span className="text-emerald-600 font-bold">₹{service.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="truncate max-w-[200px]">{bookingAddress}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => setCreatedBookingResult(null)}
                      className="w-full py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Book Another Slot
                    </button>
                    <button
                      onClick={() => navigate("/bookings")}
                      className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      View My Bookings
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmBookingSubmit} className="space-y-6">
                  
                  {/* Price & Guarantee Header */}
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block">Total Service Price</span>
                      <span className="text-3xl font-extrabold text-emerald-600">₹{service.price}</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                      Best Price Guarantee
                    </span>
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" /> Select Service Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Time Slot Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" /> Select Time Slot
                    </label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Address Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Service Location Address
                    </label>
                    <input
                      type="text"
                      value={bookingAddress}
                      onChange={(e) => setBookingAddress(e.target.value)}
                      placeholder="Enter full address for home service..."
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Conflict Alert */}
                  {isCheckingSlot ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 p-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Checking slot availability...
                    </div>
                  ) : slotConflictError ? (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{slotConflictError}</span>
                    </div>
                  ) : null}

                  {/* Confirm Booking CTA */}
                  <button
                    type="submit"
                    disabled={Boolean(slotConflictError) || isCheckingSlot || isSubmittingBooking}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingBooking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting Booking...
                      </>
                    ) : (
                      `Confirm Booking (₹${service.price})`
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 Payment is required only after booking confirmation. Free cancellation available.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </CustomerLayout>
  );
}
