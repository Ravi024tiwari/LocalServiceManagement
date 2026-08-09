import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  MapPin, ChevronDown, Bell, Briefcase, Calendar, 
  CheckCircle2, IndianRupee, Star, PlusCircle, User, ArrowUpRight, Lock,
  Clock, Loader2, Eye, Edit3, Trash2, X, AlertCircle
} from "lucide-react";
import ProviderLayout from "../../layout/ProviderLayout";
import { providerService } from "@/services/provider.service";
import { serviceApi } from "@/services/service.service";
import VerificationPendingBanner from "@/components/provider/VerificationPendingBanner";
import ProviderAvatarMenu from "@/components/provider/ProviderAvatarMenu";
import { Switch } from "@/components/ui/switch";

import { useLocationDetector } from "@/hooks/useLocationDetector";
import { api } from "@/services/api";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import { fetchMyServices } from "@/store/slices/serviceSlice";
import { setOnlineStatus } from "@/store/slices/authSlice";
import type { ServiceItem } from "@/store/slices/serviceSlice";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Selectors
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isApproved, status } = useAppSelector((state) => state.providerProfile);
  const { myServices, stats, isLoading: isLoadingServices } = useAppSelector((state) => state.service);

  const [data, setData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(user?.isOnline ?? true);
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceItem | null>(null);

  // Sync isOnline with Redux user state
  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setIsOnline(user.isOnline);
    }
  }, [user?.isOnline]);

  // Dynamic Location Detector Hook (Must be called unconditionally at top level)
  const { locationName: dynamicLocation, detectLocation, isDetecting } = useLocationDetector();

  const handleToggleOnline = async (checked: boolean) => {
    try {
      setIsOnline(checked);
      dispatch(setOnlineStatus(checked));
      await api.patch('/user/online-status', { isOnline: checked });
    } catch (e) {
      console.error("Failed to update online status:", e);
      setIsOnline(!checked);
      dispatch(setOnlineStatus(!checked));
    }
  };

  const handleRefreshStatus = () => {
    dispatch(fetchProviderProfile());
    dispatch(fetchMyServices());
    providerService.getDashboardData().then(setData).catch(console.error);
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingDashboard(true);
    providerService.getDashboardData()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error("Error fetching provider dashboard data:", err))
      .finally(() => {
        if (isMounted) setLoadingDashboard(false);
      });

    dispatch(fetchProviderProfile());
    dispatch(fetchMyServices());

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await serviceApi.toggleServiceStatus(serviceId, !currentStatus);
      dispatch(fetchMyServices());
    } catch (e) {
      console.error("Toggle service status error:", e);
    }
  };

  const isLoadingProfile = status === "loading";

  if (loadingDashboard || isLoadingProfile) {
    return (
      <ProviderLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold text-gray-600">Loading Provider Dashboard...</p>
        </div>
      </ProviderLayout>
    );
  }

  // Extracted live values
  const totalServicesCount = stats?.totalServices ?? myServices?.length ?? data?.stats?.totalServices ?? 0;
  const activeBookingsCount = data?.stats?.activeBookings ?? 0;
  const completedBookingsCount = data?.stats?.completedJobs ?? 0;
  const totalRevenue = data?.stats?.totalRevenue ?? 0;
  const averageRating = data?.stats?.averageRating ?? 5.0;
  const totalReviews = data?.stats?.totalReviews ?? 0;
  const upcomingJobs = data?.upcomingJobs || [];
  const displayLocation = dynamicLocation || user?.location || data?.user?.location || "Bhopal, Madhya Pradesh";

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Welcome Back, {user?.name || data?.user?.name || "Provider"}! 👋
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage your services, track earnings, and service customer bookings in real-time.</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Location Dropdown */}
            <div 
              onClick={detectLocation}
              title="Click to detect current location dynamically"
              className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <MapPin className={`w-4 h-4 text-emerald-600 ${isDetecting ? "animate-bounce" : ""}`} />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">{displayLocation}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Profile Menu */}
            <ProviderAvatarMenu />

            {/* Top Online Status Switch */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-3.5 py-2 rounded-full shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                <span className={`text-xs font-bold ${isOnline ? "text-emerald-700" : "text-gray-500"}`}>{isOnline ? "Online" : "Offline"}</span>
              </div>
              <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="data-[state=checked]:bg-emerald-600 h-5 w-9 [&_span]:h-4 [&_span]:w-4" />
            </div>
          </div>
        </div>

        {/* VERIFICATION PENDING GATE BANNER STATE */}
        {!isApproved && (
          <VerificationPendingBanner profile={profile} onRefresh={handleRefreshStatus} />
        )}

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
          <StatCard 
            icon={<Briefcase />} 
            title="Total Services" 
            value={totalServicesCount} 
            trend={`${myServices?.filter(s => s.is_available).length || 0} Active`} 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
          />
          <StatCard 
            icon={<Calendar />} 
            title="Active Bookings" 
            value={activeBookingsCount} 
            trend={activeBookingsCount > 0 ? `${activeBookingsCount} pending action` : "No pending jobs"} 
            color="text-orange-500" 
            bg="bg-orange-50" 
          />
          <StatCard 
            icon={<CheckCircle2 />} 
            title="Completed Jobs" 
            value={completedBookingsCount} 
            trend={completedBookingsCount > 0 ? `${completedBookingsCount} jobs delivered` : "0 completed"} 
            color="text-blue-500" 
            bg="bg-blue-50" 
          />
          <StatCard 
            icon={<IndianRupee />} 
            title="Total Earnings" 
            value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
            trend="Lifetime Revenue" 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
          />
          <StatCard 
            icon={<Star />} 
            title="Average Rating" 
            value={averageRating} 
            trend={`(${totalReviews} reviews)`} 
            color="text-amber-500" 
            bg="bg-amber-50" 
          />
        </div>

        {/* MIDDLE ROW (Earnings Summary, Upcoming Bookings, Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Earnings & Revenue Card */}
          <div className="lg:col-span-6 xl:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-900 text-base">Earnings Overview</h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Live Sync
                </span>
              </div>
              
              {/* Earnings Breakdown */}
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider block">Total Net Revenue</span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-emerald-200 border-t border-emerald-800/80">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Calculated from {completedBookingsCount} completed bookings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100 mt-4 text-center">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Jobs</p>
                <p className="font-extrabold text-gray-900 text-sm mt-0.5">{data?.stats?.totalJobsReceived || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Active</p>
                <p className="font-extrabold text-orange-600 text-sm mt-0.5">{activeBookingsCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Completed</p>
                <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{completedBookingsCount}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings List */}
          <div className="lg:col-span-6 xl:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
             <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-900 text-base">Upcoming Bookings</h3>
                <button 
                  onClick={() => navigate("/provider/bookings")}
                  className="text-emerald-600 text-xs font-bold hover:underline"
                >
                  View All ({upcomingJobs.length})
                </button>
              </div>

              {upcomingJobs.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">No Upcoming Bookings</p>
                  <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">New job requests from customers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {upcomingJobs.map((booking: any) => {
                    const customerName = booking.customer_id?.name || "Customer";
                    const serviceTitle = booking.service_id?.name || booking.service_id?.title || "Service";
                    const formattedDate = booking.scheduled_date 
                      ? new Date(booking.scheduled_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                      : "Today";
                    
                    return (
                      <div 
                        key={booking._id} 
                        onClick={() => navigate("/provider/bookings")}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                          {booking.time_slot ? booking.time_slot.split(' ')[0] : "Slot"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{serviceTitle}</h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">{customerName} • {formattedDate}</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                          booking.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate("/provider/bookings")}
              className="w-full mt-4 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Manage All Customer Jobs &rarr;
            </button>
          </div>

          {/* Quick Actions & Next Booking */}
          <div className="lg:col-span-12 xl:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-gray-900 text-base mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionBtn 
                  icon={isApproved ? <PlusCircle className="text-emerald-600" /> : <Lock className="text-gray-400" />} 
                  label="Create Service" 
                  bg={isApproved ? "bg-emerald-50" : "bg-gray-100"} 
                  onClick={() => {
                    if (!isApproved) {
                      alert("Your provider account is currently pending admin verification. Service creation will be unlocked once approved.");
                    } else {
                      navigate("/provider/create-service");
                    }
                  }} 
                />
                <QuickActionBtn 
                  icon={<Calendar className="text-blue-600" />} 
                  label="Manage Jobs" 
                  bg="bg-blue-50" 
                  onClick={() => navigate("/provider/bookings")}
                />
                <QuickActionBtn 
                  icon={<IndianRupee className="text-amber-600" />} 
                  label="My Customers" 
                  bg="bg-amber-50" 
                  onClick={() => navigate("/provider/customers")}
                />
                <QuickActionBtn 
                  icon={<User className="text-purple-600" />} 
                  label="Update Profile" 
                  bg="bg-purple-50" 
                  onClick={() => navigate("/provider/profile")}
                />
              </div>
            </div>
            
            {/* Next Immediate Booking Card */}
            {upcomingJobs.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">Next Immediate Job</span>
                  <span className="text-[10px] font-bold text-emerald-700">{upcomingJobs[0].time_slot || "Upcoming"}</span>
                </div>
                <h4 className="text-xs font-extrabold text-gray-900 truncate">
                  {upcomingJobs[0].service_id?.name || upcomingJobs[0].service_id?.title || "Service"}
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Customer: {upcomingJobs[0].customer_id?.name || "Customer"}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM ROW - MY SERVICES CARD GRID */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">My Services</h2>
              <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                {myServices.length} Total
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button 
                onClick={() => navigate("/provider/my-services")}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-extrabold hover:underline px-2 py-1"
              >
                Manage All Services &rarr;
              </button>
              <button
                onClick={() => {
                  if (!isApproved) {
                    alert("Your account is pending admin approval.");
                  } else {
                    navigate("/provider/create-service");
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Service
              </button>
            </div>
          </div>

          {isLoadingServices ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold text-gray-500">Loading services...</span>
            </div>
          ) : myServices.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">No Services Created Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                You haven't listed any services on your profile yet. Create your first service to start getting customer bookings in your area.
              </p>
              <button
                onClick={() => navigate("/provider/create-service")}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Create Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {myServices.map((service: ServiceItem) => {
                const statusLabel = service.status || (service.is_available ? "Active" : "Inactive");
                const coverImage = service.images?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80";

                return (
                  <div 
                    key={service._id} 
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Image & Status Badge */}
                      <div className="relative h-36 overflow-hidden bg-gray-100">
                        <img 
                          src={coverImage} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service._id, service.is_available)}
                          title="Click to toggle status"
                          className={`absolute top-2.5 right-2.5 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer ${
                            statusLabel === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"
                          }`}
                        >
                          {statusLabel}
                        </button>
                      </div>

                      {/* Details Content */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {service.name}
                          </h3>
                          <span className="font-black text-gray-900 text-sm shrink-0 ml-2">₹{service.price}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                            {service.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{service.duration || "60 mins"}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
                          <div><span className="font-extrabold text-gray-900">{service.bookingsCount || 0}</span> Bookings</div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-gray-900 font-bold">{service.rating || 5.0}</span>
                            <span className="text-gray-400 text-[10px]">({service.reviewsCount || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedDetailService(service)}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/provider/edit-service/${service._id}`, { state: { service } })}
                        className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedDetailService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            <div className="relative h-48 overflow-hidden bg-gray-100">
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
                  <span>Bookings: {selectedDetailService.bookingsCount || 0}</span>
                </div>
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

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ icon, title, value, trend, color, bg }: { icon: React.ReactNode, title: string, value: string | number, trend: string, color: string, bg: string }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
          <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div> 
        </div>
        <h3 className="text-xs font-bold text-gray-500 leading-tight">{title}</h3>
      </div>
      <div>
        <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</span>
        <p className="text-[11px] font-semibold text-emerald-600 mt-1">{trend}</p>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, bg, onClick }: { icon: React.ReactNode, label: string, bg: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm cursor-pointer transition-all bg-white group">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      </div>
      <span className="text-xs font-bold text-gray-700 text-center leading-tight">{label}</span>
    </div>
  );
}