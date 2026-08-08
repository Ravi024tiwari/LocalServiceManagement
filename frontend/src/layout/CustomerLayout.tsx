import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, Calendar, MapPin, Wallet, Star, 
  Bookmark, Bell, LifeBuoy, Settings, ShieldCheck,
  Menu, Home, User, Compass,
  Heart
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import BecomeProviderModal from "@/components/provider/BecomeProviderModal";
import CustomerAvatarMenu from "@/components/customer/CustomerAvatarMenu";

export interface NavItem {
  name: string;
  icon: ReactNode;
  path: string;
  badge?: string | number;
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isBecomeProviderOpen, setIsBecomeProviderOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { name: "Nearby Services", icon: <Compass size={20} />, path: "/nearby-services" },
    { name: "Bookings", icon: <Calendar size={20} />, path: "/bookings" },
    { name: "Liked Services", icon: <Heart size={20} />, path: "/liked-services" },
    { name: "Support", icon: <LifeBuoy size={20} />, path: "/support" },
    { name: "Settings", icon: <Settings size={20} />, path: "/profile" },
  ];

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/": return "Dashboard";
      case "/profile": return "My Profile & Settings";
      case "/bookings": return "My Bookings";
      case "/nearby-services": return "Nearby Services";
      case "/addresses": return "Saved Addresses";
      case "/wallet": return "My Wallet";
      case "/liked-services":
      case "/saved": return "Liked Services";
      case "/notifications": return "Notifications";
      case "/support": return "Support & Help";
      default: return "ServiceHub";
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto custom-scrollbar p-4 z-10">
        <div className="flex items-center gap-2 px-2 mb-8 mt-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">ServiceHub</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"}`}>
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Promo Box */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-[#e6f5ea] p-4 rounded-2xl border border-emerald-100">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900 text-sm">Become a Provider</h4>
            <span className="bg-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">Turn your skills into earnings. Join thousands of trusted professionals.</p>
          <button 
            onClick={() => setIsBecomeProviderOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
          >
            Start as Provider →
          </button>
        </div>
      </aside>

      <BecomeProviderModal
        isOpen={isBecomeProviderOpen}
        onClose={() => setIsBecomeProviderOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* DESKTOP HEADER BAR FOR NON-DASHBOARD PAGES */}
        {location.pathname !== "/" && (
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <span className="text-gray-400 font-normal">Customer Portal</span>
              <span className="text-gray-300">/</span>
              <span className="text-emerald-700 font-extrabold">{getPageTitle(location.pathname)}</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer hover:text-emerald-600 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
              </div>
              <CustomerAvatarMenu />
            </div>
          </header>
        )}

        {/* MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* INTERACTIVE MOBILE HAMBURGER MENU */}
            <Sheet>
              <SheetTrigger className="p-1 -ml-1 text-gray-700 focus:outline-none hover:bg-gray-50 rounded-lg">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
                <div className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </div>
                
                <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                  <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-extrabold text-gray-900 tracking-tight">ServiceHub</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetTrigger key={item.name} className="w-full text-left">
                        <Link to={item.path} className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"}`}>
                          <div className="flex items-center gap-3">
                            <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                          )}
                        </Link>
                      </SheetTrigger>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-lg font-extrabold text-gray-900">ServiceHub</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            
            {/* REUSABLE CUSTOMER AVATAR MENU */}
            <CustomerAvatarMenu />

          </div>
        </header>

        {/* DASHBOARD CONTENT INJECTED HERE */}
        <div className="flex-1 pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-2.5 z-30 pb-safe">
        <NavItem onClick={() => navigate("/")} icon={<Home />} label="Home" active={location.pathname === "/"} />
        <NavItem onClick={() => navigate("/bookings")} icon={<Calendar />} label="Bookings" active={location.pathname === "/bookings"} />
        <NavItem onClick={() => navigate("/liked-services")} icon={<Heart />} label="Liked" active={location.pathname === "/liked-services" || location.pathname === "/saved"} />
        <NavItem onClick={() => navigate("/wallet")} icon={<Wallet />} label="Wallet" active={location.pathname === "/wallet"} />
        <NavItem onClick={() => navigate("/profile")} icon={<User />} label="Profile" active={location.pathname === "/profile"} />
      </div>
    </div>
  );
}


function NavItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer ${active ? "text-emerald-600" : "text-gray-400"}`}>
      <div className={`[&>svg]:w-5 [&>svg]:h-5 ${active ? "fill-emerald-100" : ""}`}>{icon}</div>
      <span className={`text-[10px] font-semibold ${active ? "text-emerald-700" : "text-gray-500"}`}>{label}</span>
    </div>
  );
}
