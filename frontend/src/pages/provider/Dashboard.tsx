import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  MapPin, ChevronDown, Bell, Briefcase, Calendar, 
  CheckCircle2, IndianRupee, Star, PlusCircle, Settings, User, LogOut, ArrowUpRight, Lock
} from "lucide-react";
import ProviderLayout from "../../layout/ProviderLayout";
import { providerService } from "@/services/provider.service";
import VerificationPendingBanner from "@/components/provider/VerificationPendingBanner";
import ProviderAvatarMenu from "@/components/provider/ProviderAvatarMenu";
import { Switch } from "@/components/ui/switch";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import { fetchMyServices } from "@/store/slices/serviceSlice";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Selectors
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isApproved, status } = useAppSelector((state) => state.providerProfile);
  const { myServices, stats } = useAppSelector((state) => state.service);

  const [data, setData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  const handleRefreshStatus = () => {
    dispatch(fetchProviderProfile());
    dispatch(fetchMyServices());
  };

  useEffect(() => {
    providerService.getDashboardData().then(setData);
    dispatch(fetchProviderProfile());
    dispatch(fetchMyServices());
  }, [dispatch]);

  const isLoadingProfile = status === "loading";

  if (!data || isLoadingProfile) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">Loading Provider Dashboard...</div>;
  }

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Good Morning, {user?.name || data.user.name}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your services and grow your business</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            {/* Location Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">{data.user.location}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {/* Notification */}
            <div className="relative cursor-pointer bg-white p-2.5 rounded-full border border-gray-200 shadow-sm hover:text-emerald-600">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>

            {/* Profile Dropdown */}
            <ProviderAvatarMenu />

            {/* Top Online Status */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Your Status</span>
              <span className={`text-xs font-bold ${isOnline ? "text-emerald-600" : "text-gray-400"}`}>{isOnline ? "Online" : "Offline"}</span>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="data-[state=checked]:bg-emerald-600 h-5 w-9 [&_span]:h-4 [&_span]:w-4" />
            </div>
          </div>
        </div>

        {/* VERIFICATION PENDING GATE BANNER STATE */}
        {!isApproved && (
          <VerificationPendingBanner profile={profile} onRefresh={handleRefreshStatus} />
        )}

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard icon={<Briefcase />} title="Total Services" value={stats?.totalServices ?? myServices?.length ?? data.stats.totalServices.value} trend={data.stats.totalServices.trend} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={<Calendar />} title="Active Bookings" value={data.stats.activeBookings.value} trend={data.stats.activeBookings.trend} color="text-orange-500" bg="bg-orange-50" />
          <StatCard icon={<CheckCircle2 />} title="Completed Bookings" value={data.stats.completedBookings.value} trend={data.stats.completedBookings.trend} color="text-blue-500" bg="bg-blue-50" />
          <StatCard icon={<IndianRupee />} title="Total Earnings" value={data.stats.totalEarnings.value} trend={data.stats.totalEarnings.trend} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={<Star />} title="Average Rating" value={data.stats.averageRating.value} trend={data.stats.averageRating.trend} color="text-purple-500" bg="bg-purple-50" />
        </div>

        {/* MIDDLE ROW (Chart, Today's Bookings, Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Earnings Chart (Placeholder) */}
          <div className="lg:col-span-6 xl:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Earnings Overview</h3>
              <select className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            
            {/* Chart Graphic Placeholder */}
            <div className="h-48 w-full bg-gradient-to-t from-emerald-50 to-white border-b-2 border-emerald-500 relative flex items-end mb-6">
               <div className="absolute top-4 right-1/4 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex flex-col items-center">
                 <span>15 May</span>
                 <span className="text-xs text-emerald-400">₹12,450</span>
                 <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1"></div>
               </div>
               {/* Simulating graph line points */}
               <div className="absolute w-full h-full flex justify-between items-end px-2">
                 {[10, 20, 15, 30, 45, 35, 60].map((h, i) => (
                   <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 mb-[-4px] relative z-10 ring-4 ring-white" style={{ bottom: `${h}%` }}></div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Total Earnings</p>
                <p className="font-bold text-gray-900">₹48,560</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">This Month</p>
                <p className="font-bold text-emerald-600 flex items-center text-sm"><ArrowUpRight className="w-3 h-3" /> 18%</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Last Month</p>
                <p className="font-bold text-gray-900">₹41,120</p>
              </div>
            </div>
          </div>

          {/* Today's Bookings */}
          <div className="lg:col-span-6 xl:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Today's Bookings</h3>
              <button className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {data.todaysBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="text-xs font-bold text-gray-500 w-16 text-right">{booking.time}</div>
                  <div className="w-1 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{booking.service}</h4>
                    <p className="text-[11px] text-gray-500 font-medium">{booking.customer}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-12 xl:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
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
                <QuickActionBtn icon={<Calendar className="text-blue-600" />} label="Manage Bookings" bg="bg-blue-50" />
                <QuickActionBtn icon={<IndianRupee className="text-red-600" />} label="View Earnings" bg="bg-red-50" />
                <QuickActionBtn icon={<User className="text-purple-600" />} label="Update Profile" bg="bg-purple-50" />
              </div>
            </div>
            
            {/* Upcoming Booking */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Upcoming Bookings</h3>
                <button className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
              </div>
               <div className="flex gap-3">
                <img src={data.myServices[0].image} alt="Service" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{data.todaysBookings[0].service}</h4>
                  <p className="text-[10px] text-gray-500">{data.todaysBookings[0].customer}</p>
                  <p className="text-[10px] font-semibold text-emerald-600 mt-1">Tomorrow, 11:30 AM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW (My Services Grid) */}
        <div>
          <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-xl font-bold text-gray-900">My Services</h2>
            <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.myServices.map((service: any) => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                <div className="relative h-36 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {service.status}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{service.title}</h3>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-gray-900 text-sm">₹{service.price}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{service.category}</span>
                    <span className="text-[9px] text-gray-500">Starting from</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 pt-3 border-t border-gray-100">
                    <div><span className="font-bold text-gray-900">{service.bookings}</span> Bookings</div>
                    <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> <span className="text-gray-900 font-bold">{service.rating}</span> ({service.reviews})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProviderLayout>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ icon, title, value, trend, color, bg }: { icon: React.ReactNode, title: string, value: string | number, trend: string, color: string, bg: string }) {
  return (
    <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
          <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div> 
        </div>
        <h3 className="text-xs font-bold text-gray-500">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-extrabold text-gray-900">{value}</span>
      </div>
      <span className="text-[10px] font-bold text-emerald-600 mt-2">{trend}</span>
    </div>
  )
}

function QuickActionBtn({ icon, label, bg, onClick }: { icon: React.ReactNode, label: string, bg: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer transition-all bg-white group">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
    </div>
  )
}