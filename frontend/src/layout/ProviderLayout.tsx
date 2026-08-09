import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Briefcase, PlusCircle, Calendar, Users, Star,
  IndianRupee, Bell, User, Settings, ShieldCheck,
  Menu, Power
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import ProviderAvatarMenu from "@/components/provider/ProviderAvatarMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOnlineStatus } from "@/store/slices/authSlice";
import { api } from "@/services/api";

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isOnline, setIsOnline] = useState<boolean>(user?.isOnline ?? true);

  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setIsOnline(user.isOnline);
    }
  }, [user?.isOnline]);

  const handleToggleOnline = async (checked: boolean) => {
    try {
      setIsOnline(checked);
      dispatch(setOnlineStatus(checked));
      await api.patch("/user/online-status", { isOnline: checked });
    } catch (e) {
      console.error("Failed to update online status in layout:", e);
      setIsOnline(!checked);
      dispatch(setOnlineStatus(!checked));
    }
  };

  const [providerUser, setProviderUser] = useState<{ name?: string; avatar?: string }>({
    name: "Provider",
    avatar: "https://i.pravatar.cc/150?img=11",
  });

  const loadProviderUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProviderUser({
          name: parsed.name || parsed.fullName || "Provider",
          avatar: parsed.avatar && typeof parsed.avatar === "string" && parsed.avatar.trim() !== "" && !parsed.avatar.startsWith("blob:")
            ? parsed.avatar
            : "https://i.pravatar.cc/150?img=11",
        });
      } catch (e) {
        console.error("Failed to parse user in ProviderLayout", e);
      }
    }
  };

  useEffect(() => {
    loadProviderUser();
    window.addEventListener("userProfileUpdated", loadProviderUser);
    window.addEventListener("storage", loadProviderUser);
    return () => {
      window.removeEventListener("userProfileUpdated", loadProviderUser);
      window.removeEventListener("storage", loadProviderUser);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/provider" },
    { name: "My Services", icon: <Briefcase size={20} />, path: "/provider/services" },
    { name: "Create Service", icon: <PlusCircle size={20} />, path: "/provider/create-service" },
    { name: "Bookings", icon: <Calendar size={20} />, path: "/provider/bookings" },
    { name: "Customers", icon: <Users size={20} />, path: "/provider/customers" },
    { name: "Earnings", icon: <IndianRupee size={20} />, path: "/provider/earnings" },
    { name: "Profile", icon: <User size={20} />, path: "/provider/profile" },
    { name: "Settings", icon: <Settings size={20} />, path: "/provider/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR                            */}
      {/* ========================================== */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 overflow-hidden z-10 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">ServiceHub</h2>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Provider Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"}`}>
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-200 text-emerald-800" : "bg-emerald-50 text-emerald-600"}`}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Online Status & Promo */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-br from-emerald-50 to-[#e6f5ea] p-4 rounded-2xl border border-emerald-100 mb-4">
            <h4 className="font-bold text-emerald-900 text-sm mb-1">Grow Your Business</h4>
            <p className="text-[11px] text-emerald-700 mb-3 leading-relaxed">Become a Top Rated Provider and get more customers daily.</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm w-full">
              View Tips
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${isOnline ? "text-emerald-500" : "text-red-500"}`} />
              <span className={`text-xs font-bold ${isOnline ? "text-emerald-700" : "text-red-600"}`}>
                {isOnline ? "You are Online" : "Go Offline"}
              </span>
            </div>
            <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="data-[state=checked]:bg-emerald-600" />
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                          */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* MOBILE HEADER & HAMBURGER MENU */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="p-1 -ml-1 text-gray-700 focus:outline-none hover:bg-gray-50 rounded-lg">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
                <div className="sr-only"><SheetTitle>Provider Navigation</SheetTitle></div>

                {/* Mobile Sidebar Header */}
                <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">ServiceHub</h2>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Provider Panel</span>
                  </div>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetTrigger key={item.name} className="w-full text-left">
                        <Link to={item.path} className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"}`}>
                          <div className="flex items-center gap-3">
                            <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-200 text-emerald-800" : "bg-emerald-50 text-emerald-600"}`}>{item.badge}</span>
                          )}
                        </Link>
                      </SheetTrigger>
                    );
                  })}
                </nav>

                {/* Mobile Online Status */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Power className={`w-4 h-4 ${isOnline ? "text-emerald-500" : "text-red-500"}`} />
                      <span className={`text-xs font-bold ${isOnline ? "text-emerald-700" : "text-red-600"}`}>
                        {isOnline ? "You are Online" : "Go Offline"}
                      </span>
                    </div>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} className="data-[state=checked]:bg-emerald-600" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-lg font-extrabold text-gray-900">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">6</span>
            </div>
            <ProviderAvatarMenu />
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAV                          */}
      {/* ========================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-3 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavItem onClick={() => navigate("/provider")} icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === "/provider"} />
        <NavItem onClick={() => navigate("/provider/bookings")} icon={<Calendar />} label="Bookings" active={location.pathname === "/provider/bookings"} />
        <NavItem onClick={() => navigate("/provider/services")} icon={<Briefcase />} label="Services" active={location.pathname === "/provider/services"} />
        <NavItem onClick={() => navigate("/provider/earnings")} icon={<IndianRupee />} label="Earnings" active={location.pathname === "/provider/earnings"} />
        <NavItem onClick={() => navigate("/provider/profile")} icon={<User />} label="Profile" active={location.pathname === "/provider/profile"} />
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