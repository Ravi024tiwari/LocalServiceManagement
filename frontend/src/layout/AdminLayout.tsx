import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Briefcase, Calendar, Star,
  Grid, CreditCard, Bell, Settings, User, ShieldCheck,
  Menu, ChevronDown, Calendar as CalendarIcon, HelpCircle, ArrowRight
} from "lucide-react";
import type { NavItem } from "./CustomerLayout";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useLocationDetector } from "@/hooks/useLocationDetector";
import { MapPin } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { locationName: dynamicLocation, detectLocation, isDetecting } = useLocationDetector();

  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string; avatar?: string }>({
    name: "Super Admin",
    email: "admin@servicehub.com",
    avatar: "https://i.pravatar.cc/150?img=68",
  });

  const loadAdminUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAdminUser({
          name: parsed.name || parsed.fullName || "Super Admin",
          email: parsed.email || "admin@servicehub.com",
          avatar: parsed.avatar && typeof parsed.avatar === "string" && parsed.avatar.trim() !== "" && !parsed.avatar.startsWith("blob:")
            ? parsed.avatar
            : "https://i.pravatar.cc/150?img=68",
        });
      } catch (e) {
        console.error("Failed to parse user in AdminLayout", e);
      }
    }
  };

  useEffect(() => {
    loadAdminUser();
    window.addEventListener("userProfileUpdated", loadAdminUser);
    window.addEventListener("storage", loadAdminUser);
    return () => {
      window.removeEventListener("userProfileUpdated", loadAdminUser);
      window.removeEventListener("storage", loadAdminUser);
    };
  }, []);

  const navItems:NavItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { name: "Providers", icon: <Users size={20} />, path: "/admin/providers" },
    { name: "Services", icon: <Briefcase size={20} />, path: "/admin/services" },
    { name: "Bookings", icon: <Calendar size={20} />, path: "/admin/bookings" },
    { name: "Reviews", icon: <Star size={20} />, path: "/admin/reviews" },
    { name: "Categories", icon: <Grid size={20} />, path: "/admin/categories" },
    { name: "Payments", icon: <CreditCard size={20} />, path: "/admin/payments" },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
    { name: "Admin Profile", icon: <User size={20} />, path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR                            */}
      {/* ========================================== */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto custom-scrollbar p-4 z-10 shadow-sm">
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-2 mb-6 mt-1 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">ServiceHub</h2>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block -mt-0.5">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Super Admin Badge & Profile Promo Card */}
        <div className="mt-6 space-y-3">
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 text-center space-y-2">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm mx-auto">
              <AvatarImage src={adminUser.avatar} alt={adminUser.name} className="object-cover" />
              <AvatarFallback className="bg-emerald-600 text-white font-bold">SA</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-gray-900 text-xs truncate">{adminUser.name || "Super Admin"}</h4>
              <p className="text-[10px] text-gray-500 font-medium truncate">{adminUser.email || "admin@servicehub.com"}</p>
            </div>
            <button
              onClick={() => navigate("/admin/profile")}
              className="w-full py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer"
            >
              View Profile
            </button>
          </div>

          {/* Need Help CTA */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-[11px]">Need Help?</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <span>Support</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                          */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* DESKTOP HEADER BAR */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 font-medium">
              Welcome back, {adminUser.name || "Super Admin"}! Here's what's happening on ServiceHub.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Location Badge */}
            <div 
              onClick={detectLocation}
              title="Click to detect admin location dynamically"
              className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <MapPin className={`w-3.5 h-3.5 text-emerald-600 ${isDetecting ? "animate-bounce" : ""}`} />
              <span>{dynamicLocation || "Bhopal, Madhya Pradesh"}</span>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer">
              <span>May 20 - Jun 20, 2025</span>
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Notification Bell */}
            <div className="relative cursor-pointer hover:text-emerald-600 transition-colors p-2 bg-gray-50 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                6
              </span>
            </div>

            {/* Super Admin Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 focus:outline-none cursor-pointer">
                <Avatar className="w-9 h-9 border border-gray-200 shadow-sm">
                  <AvatarImage src={adminUser.avatar} alt={adminUser.name} className="object-cover" />
                  <AvatarFallback className="bg-emerald-600 text-white font-bold">SA</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <span className="text-xs font-bold text-gray-900 block leading-tight">{adminUser.name || "Super Admin"}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 block">System Administrator</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
                <DropdownMenuItem onClick={() => navigate("/admin/profile")} className="text-xs font-medium cursor-pointer rounded-lg py-2">
                  My Admin Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="text-xs font-medium cursor-pointer rounded-lg py-2">
                  Platform Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="text-xs font-bold text-red-600 cursor-pointer rounded-lg py-2">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="p-1 -ml-1 text-gray-700 focus:outline-none hover:bg-gray-50 rounded-lg">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
                <div className="sr-only">
                  <SheetTitle>Admin Navigation Menu</SheetTitle>
                </div>
                <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                  <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">ServiceHub</h2>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Admin Panel</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetTrigger key={item.name} className="w-full text-left">
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isActive ? "text-emerald-600" : "text-gray-400"}>{item.icon}</span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SheetTrigger>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-lg font-extrabold text-gray-900">ServiceHub Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative p-1.5 bg-gray-50 rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                6
              </span>
            </div>
            <Avatar 
              onClick={() => navigate("/admin/profile")}
              className="w-8 h-8 border border-gray-200 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <AvatarImage src={adminUser.avatar} alt={adminUser.name} className="object-cover" />
              <AvatarFallback className="bg-emerald-600 text-white font-bold">SA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* DASHBOARD PAGE CONTENT INJECTED HERE */}
        <div className="flex-1 pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-2.5 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavItem onClick={() => navigate("/admin")} icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === "/admin"} />
        <NavItem onClick={() => navigate("/admin/providers")} icon={<Users />} label="Providers" active={location.pathname === "/admin/providers"} />
        <NavItem onClick={() => navigate("/admin/services")} icon={<Briefcase />} label="Services" active={location.pathname === "/admin/services"} />
        <NavItem onClick={() => navigate("/admin/bookings")} icon={<Calendar />} label="Bookings" active={location.pathname === "/admin/bookings"} />
        <NavItem onClick={() => navigate("/admin/profile")} icon={<User />} label="More" active={location.pathname === "/admin/profile"} />
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
