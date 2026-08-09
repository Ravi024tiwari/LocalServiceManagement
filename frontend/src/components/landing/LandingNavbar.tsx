import type { FC } from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  MapPin, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Wrench, 
  LogOut, 
  LayoutDashboard, 
  Sparkles,
  HelpCircle,
  Tag
} from "lucide-react";

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export const LandingNavbar: FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bangalore, Karnataka");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }
  }, []);

  const cities = [
    "Bangalore, Karnataka",
    "Delhi, NCR",
    "Mumbai, Maharashtra",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Chennai, Tamil Nadu"
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (!user || !user.role) return "/";
    const role = user.role.toUpperCase();
    if (role === "PROVIDER") return "/provider";
    if (role === "ADMIN") return "/admin";
    return "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Service<span className="text-emerald-600">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              Home
            </a>
            <a href="#services" className="hover:text-emerald-600 transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <Link to="/register?role=PROVIDER" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Become a Provider
            </Link>
            <a href="#offers" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Tag className="w-4 h-4 text-amber-500" />
              Offers
            </a>
            <Link to="/support" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              Help
            </Link>
          </nav>

          {/* Right Action Controls: Location Selector + Auth CTA */}
          <div className="hidden sm:flex items-center space-x-4">
            
            {/* Location Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Select Your City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-between ${
                        selectedCity === city ? "text-emerald-600 font-semibold bg-emerald-50/50" : "text-gray-700"
                      }`}
                    >
                      {city}
                      {selectedCity === city && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth / Profile Area */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-300">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                    {user.name || "My Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full uppercase">
                        {user.role || "Customer"}
                      </span>
                    </div>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all font-semibold text-sm shadow-xs"
              >
                <User className="w-4 h-4" />
                Log in / Sign up
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-4">
          
          {/* Mobile Location Selector */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md p-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <nav className="flex flex-col space-y-3 font-medium text-gray-700">
            <a 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600 font-semibold"
            >
              Home
            </a>
            <a 
              href="#services" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600"
            >
              Services
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600"
            >
              How It Works
            </a>
            <Link 
              to="/register?role=PROVIDER" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Become a Provider
            </Link>
            <a 
              href="#offers" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-amber-500" />
              Offers
            </a>
            <Link 
              to="/support" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              Help
            </Link>
          </nav>

          <div className="pt-2 border-t border-gray-100">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md"
              >
                <User className="w-4 h-4" />
                Log in / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
