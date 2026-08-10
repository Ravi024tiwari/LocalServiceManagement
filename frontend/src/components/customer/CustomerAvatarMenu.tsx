import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  User, Settings, LogOut, Calendar, MapPin, Wallet, 
  Sparkles, ChevronRight, ShieldCheck 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function getFirstLetter(name?: string): string {
  if (!name || !name.trim()) return "U";
  return name.trim().charAt(0).toUpperCase();
}

export default function CustomerAvatarMenu() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [imgError, setImgError] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  }>({
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    avatar: undefined,
    role: "Customer",
  });

  const loadUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const name = parsed.fullName || parsed.name || "Rahul Sharma";
        const email = parsed.email || "rahul.sharma@example.com";
        // ONLY set avatar if it's a valid non-empty string
        const avatar = parsed.avatar && typeof parsed.avatar === "string" && parsed.avatar.trim() !== ""
          ? parsed.avatar.trim()
          : undefined;

        setUser({
          name,
          email,
          avatar,
          role: parsed.role || "Customer",
        });
        setImgError(false);
      } catch (e) {
        console.error("Error parsing user in CustomerAvatarMenu", e);
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("userProfileUpdated", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("userProfileUpdated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const firstLetter = getFirstLetter(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User profile menu"
        className="relative flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-transform active:scale-95 cursor-pointer group"
      >
        <Avatar className="w-10 h-10 border-2 border-emerald-100 shadow-sm group-hover:border-emerald-500 transition-colors">
          {user.avatar && !imgError ? (
            <AvatarImage
              src={user.avatar}
              alt={user.name || "User Avatar"}
              onError={() => setImgError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-base shadow-inner">
            {firstLetter}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 sm:w-80 p-2 font-sans rounded-2xl shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 z-50"
      >
        {/* User Card Header */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-3 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white rounded-xl mb-1 border border-emerald-100/60">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0">
                {user.avatar && !imgError ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-lg">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-extrabold text-gray-900 truncate">{user.name}</p>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                <div className="mt-1.5 inline-flex items-center self-start px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {user.role || "Customer"} Account
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {/* Update Profile Banner/CTA */}
        <div
          onClick={() => navigate("/profile")}
          className="mx-1 my-1.5 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Update Profile</p>
              <p className="text-[10px] text-emerald-100 leading-tight">Edit photo, address & details</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <DropdownMenuSeparator className="my-1 bg-gray-100" />

        {/* Interactive Menu Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <User className="h-4 w-4 text-emerald-600" />
              <span>Edit Profile & Details</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("/bookings")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>My Bookings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("/addresses")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("/wallet")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <Wallet className="h-4 w-4 text-purple-500" />
              <span>Wallet & Payments</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Account Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-gray-100" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer py-2.5 px-3 rounded-xl text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors flex items-center gap-3 font-bold text-xs"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
