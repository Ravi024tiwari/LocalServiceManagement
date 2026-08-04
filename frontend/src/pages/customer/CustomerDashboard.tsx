import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  Search, MapPin, ChevronDown, Filter, Zap, Droplets, 
  Sparkles, Hammer, Paintbrush, Wrench, Heart, Clock, Star,
  CheckCircle2, CreditCard, Crosshair, Bell, User, Settings, LogOut,
  Calendar, ShieldCheck, LifeBuoy, X
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import { customerService } from "@/services/customer.service";
import { Button } from "@/components/ui/button";

// Shadcn UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CustomerAvatarMenu from "@/components/customer/CustomerAvatarMenu";

// Utility icon mapper
const getIcon = (name: string) => {
  switch(name) {
    case 'Zap': return <Zap className="w-6 h-6" />;
    case 'Droplets': return <Droplets className="w-6 h-6" />;
    case 'Sparkles': return <Sparkles className="w-6 h-6" />;
    case 'Hammer': return <Hammer className="w-6 h-6" />;
    case 'Paintbrush': return <Paintbrush className="w-6 h-6" />;
    case 'Wrench': return <Wrench className="w-6 h-6" />;
    default: return <Zap className="w-6 h-6" />;
  }
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<{ name?: string; fullName?: string; email?: string; location?: string; avatar?: string }>({
    name: "Rahul",
    location: "Bhopal, Madhya Pradesh",
    avatar: undefined,
  });
  const navigate = useNavigate();

  const syncUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser({
          name: parsed.fullName || parsed.name || "Rahul",
          email: parsed.email || "rahul.sharma@example.com",
          location: parsed.location || "Bhopal, Madhya Pradesh",
          avatar: parsed.avatar && typeof parsed.avatar === "string" && parsed.avatar.trim() !== "" ? parsed.avatar : undefined,
        });
      } catch (e) {
        console.error("Failed to parse user profile in dashboard", e);
      }
    }
  };

  useEffect(() => {
    // Fetch dashboard data on mount
    customerService.getDashboardData().then((res) => {
      setData(res);
      syncUser();
    });

    window.addEventListener("userProfileUpdated", syncUser);
    return () => window.removeEventListener("userProfileUpdated", syncUser);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-emerald-600 font-bold">Loading...</div>;

  const displayName = currentUser.name || data.user.name;
  const displayLocation = currentUser.location || data.user.location;

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* TOP HEADER ROW - Desktop Only */}
        <div className="hidden lg:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Good Morning, {displayName} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">What service do you need today?</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">{displayLocation}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer hover:text-emerald-600 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
              </div>
              
              {/* DESKTOP PROFILE DROPDOWN */}
              <CustomerAvatarMenu />

            </div>
          </div>
        </div>

        {/* MOBILE GREETING (Visible only on mobile) */}
        <div className="lg:hidden mb-6">
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
                placeholder="Search for services (e.g. AC Repair, Plumber, Electrician...)" 
                className="w-full pl-12 pr-24 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 font-medium"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-10 font-bold">
                Search
              </Button>
            </div>

            {/* Top Categories */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Top Categories</h2>
                <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {data.categories.map((cat: any, i: number) => (
                  <div key={i} className="snap-start flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
                    <div className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-sm`}>
                      <div className={cat.color}>{getIcon(cat.icon)}</div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <Button variant="outline" className="rounded-full bg-white border-gray-200 h-9 px-4 text-xs font-semibold gap-2 shadow-sm text-gray-700">
                <Filter className="w-3.5 h-3.5" /> Filters
              </Button>
              {['Price', 'Availability', 'Distance', 'Rating'].map(filter => (
                <Button key={filter} variant="outline" className="rounded-full bg-white border-gray-200 h-9 px-4 text-xs font-semibold gap-1 shadow-sm text-gray-700 whitespace-nowrap">
                  {filter} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              ))}
              <div className="ml-auto hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500">
                Sort by: <span className="font-bold text-gray-900 flex items-center cursor-pointer">Nearest <ChevronDown className="w-3.5 h-3.5 ml-1" /></span>
              </div>
            </div>

            {/* Popular Services Near You */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Popular Services Near You</h2>
                <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.popularServices.map((service: any) => (
                  <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative h-40 overflow-hidden">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        {service.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{service.title}</h3>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">Starting from</span>
                          <span className="font-bold text-gray-900">₹{service.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <img src={`https://i.pravatar.cc/150?u=${service.provider}`} alt="Provider" className="w-5 h-5 rounded-full" />
                        <span className="text-xs font-medium text-gray-600">{service.provider}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> <span className="text-gray-900 font-bold">{service.rating}</span> ({service.reviews})</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {service.distance}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.time}</div>
                      </div>

                      <Button 
                        onClick={() => setSelectedService(service)} 
                        variant="outline" 
                        className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
                      >
                        View Details ({service.images?.length || 1} Photos)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Upcoming, Quick Actions) */}
          <div className="space-y-6">
            
            {/* Upcoming Booking Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Upcoming Booking</h3>
                <button className="text-emerald-600 text-xs font-bold hover:underline">View All</button>
              </div>
              <div className="flex gap-4">
                <img src={data.popularServices[0].image} alt="Service" className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{data.upcomingBooking.service}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{data.upcomingBooking.provider}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {data.upcomingBooking.date} • {data.upcomingBooking.time}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                 <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Confirmed</span>
                 <button className="text-sm font-bold text-emerald-600 hover:underline">View Details</button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <ActionBtn icon={<Crosshair className="text-blue-500" />} label="Track Booking" bg="bg-blue-50" />
                <ActionBtn icon={<MapPin className="text-orange-500" />} label="My Addresses" bg="bg-orange-50" />
                <ActionBtn icon={<CreditCard className="text-purple-500" />} label="Wallet" bg="bg-purple-50" />
                <ActionBtn icon={<Heart className="text-red-500" />} label="Saved Services" bg="bg-red-50" />
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="space-y-4">
                <FeatureRow icon={<ShieldCheck />} title="Verified Professionals" desc="Background checked experts" />
                <FeatureRow icon={<CheckCircle2 />} title="Secure Payments" desc="100% safe & secure transactions" />
                <FeatureRow icon={<Zap />} title="Instant Booking" desc="Book services in just a few taps" />
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2">
                  {selectedService.category}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">{selectedService.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> <b className="text-gray-900">{selectedService.rating}</b> ({selectedService.reviews} reviews)</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {selectedService.distance}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedService.time}</span>
                </div>
              </div>

              {/* MAIN HERO IMAGE PREVIEW */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img 
                  src={(selectedService.images && selectedService.images[activeImageIndex]) || selectedService.image} 
                  alt={selectedService.title} 
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Image {activeImageIndex + 1} of {(selectedService.images?.length || 1)}
                </div>
              </div>

              {/* 4 IMAGES THUMBNAIL GALLERY */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Service Images ({selectedService.images.length} Max 4)
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
                  <img src={`https://i.pravatar.cc/150?u=${selectedService.provider}`} alt="Provider" className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {selectedService.provider} <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    </h4>
                    <p className="text-xs text-gray-500">Verified Service Expert</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Price</span>
                  <span className="text-2xl font-extrabold text-emerald-600">₹{selectedService.price}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => { setSelectedService(null); alert("Proceeding to booking..."); }} 
                  className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-200"
                >
                  Book Service Now (₹{selectedService.price})
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}

// Helper Components for Dashboard
function ActionBtn({ icon, label, bg }: { icon: React.ReactNode, label: string, bg: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer transition-all bg-white group">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
    </div>
  )
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-emerald-600 mt-0.5 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}