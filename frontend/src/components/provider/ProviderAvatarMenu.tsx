import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Briefcase,
  Users,
  Star,
  IndianRupee,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
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

export function getFirstLetter(name?: string): string {
  if (!name || !name.trim()) return "P";
  return name.trim().charAt(0).toUpperCase();
}

export default function ProviderAvatarMenu() {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [providerUser, setProviderUser] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    isApproved?: boolean;
  }>({
    name: "Service Provider",
    email: "provider@servicehub.com",
    avatar: undefined,
    role: "PROVIDER",
    isApproved: true,
  });

  const loadProviderUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const name = parsed.fullName || parsed.name || "Service Provider";
        const email = parsed.email || "provider@servicehub.com";
        const avatar =
          parsed.avatar &&
          typeof parsed.avatar === "string" &&
          parsed.avatar.trim() !== "" &&
          !parsed.avatar.startsWith("blob:")
            ? parsed.avatar.trim()
            : undefined;

        setProviderUser({
          name,
          email,
          avatar,
          role: parsed.role || "PROVIDER",
          isApproved: parsed.isApproved !== false,
        });
        setImgError(false);
      } catch (e) {
        console.error("Error parsing user in ProviderAvatarMenu", e);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const firstLetter = getFirstLetter(providerUser.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Provider profile menu"
        className="relative flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-transform active:scale-95 cursor-pointer group"
      >
        <Avatar className="w-9 h-9 border-2 border-emerald-200 shadow-sm group-hover:border-emerald-500 transition-colors">
          {providerUser.avatar && !imgError ? (
            <AvatarImage
              src={providerUser.avatar}
              alt={providerUser.name || "Provider Avatar"}
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-inner">
            {firstLetter}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 sm:w-80 p-2 font-sans rounded-2xl shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 z-50"
      >
        {/* User Card Header */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-3 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white rounded-xl mb-1 border border-emerald-100/60">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0">
                {providerUser.avatar && !imgError ? (
                  <AvatarImage src={providerUser.avatar} alt={providerUser.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-base">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                    {providerUser.name}
                  </p>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{providerUser.email}</p>
                <div className="mt-1.5 inline-flex items-center self-start px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Verified Provider
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {/* Update Profile Banner/CTA */}
        <div
          onClick={() => navigate("/provider/profile")}
          className="mx-1 my-1.5 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Provider Profile</p>
              <p className="text-[10px] text-emerald-100 leading-tight">Edit services, bio & details</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <DropdownMenuSeparator className="my-1 bg-gray-100" />

        {/* Interactive Menu Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => navigate("/provider/profile")}
            className="cursor-pointer py-2.5 px-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 font-semibold text-xs text-gray-700">
              <User className="h-4 w-4 text-emerald-600" />
              <span>Edit Provider Profile</span>
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
