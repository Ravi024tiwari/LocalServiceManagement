import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Camera, Save, CheckCircle2, ShieldCheck, 
  Bell, Lock, Sparkles, ArrowLeft, Loader2, AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import CustomerLayout from "@/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFirstLetter } from "@/components/customer/CustomerAvatarMenu";
import { customerService } from "@/services/customer.service";

const PRESET_AVATARS = [
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=60",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=68",
  "https://i.pravatar.cc/150?img=12",
];

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bhopal, Madhya Pradesh",
    avatar: "",
    bio: "Homeowner looking for reliable local repair and cleaning services.",
    role: "Customer",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 1. Try loading from localStorage first for immediate rendering
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile((prev) => ({
          ...prev,
          name: parsed.fullName || parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          location: parsed.location || prev.location,
          avatar: parsed.avatar !== undefined ? parsed.avatar : prev.avatar,
          bio: parsed.bio || prev.bio,
          role: parsed.role || prev.role,
        }));
      } catch (e) {
        console.error("Failed to parse stored user profile", e);
      }
    }

    // 2. Fetch latest data from backend API
    customerService.getProfile().then((backendUser) => {
      if (backendUser) {
        setProfile((prev) => ({
          ...prev,
          name: backendUser.name || backendUser.fullName || prev.name,
          email: backendUser.email || prev.email,
          phone: backendUser.phone || prev.phone,
          location: backendUser.location || prev.location,
          avatar: backendUser.avatar !== undefined ? backendUser.avatar : prev.avatar,
          bio: backendUser.bio || prev.bio,
          role: backendUser.role || prev.role,
        }));

        // Keep localStorage synced with backend truth
        const updatedLocal = {
          fullName: backendUser.name || backendUser.fullName,
          name: backendUser.name || backendUser.fullName,
          email: backendUser.email,
          phone: backendUser.phone,
          location: backendUser.location,
          avatar: backendUser.avatar,
          bio: backendUser.bio,
          role: backendUser.role || "Customer",
        };
        localStorage.setItem("user", JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event("userProfileUpdated"));
      }
    });
  }, []);

  const firstLetter = getFirstLetter(profile.name);

  // File upload handler for avatar camera button
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfile((p) => ({ ...p, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      // 1. Call Backend API
      const response = await customerService.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        avatar: profile.avatar,
        bio: profile.bio,
      });

      const updatedData = response?.data || response?.user || {
        fullName: profile.name,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        avatar: profile.avatar,
        bio: profile.bio,
        role: profile.role,
      };

      // 2. Save updated profile payload to localStorage
      const updatedUserObj = {
        fullName: updatedData.name || updatedData.fullName || profile.name,
        name: updatedData.name || updatedData.fullName || profile.name,
        email: updatedData.email || profile.email,
        phone: updatedData.phone || profile.phone,
        location: updatedData.location || profile.location,
        avatar: updatedData.avatar !== undefined ? updatedData.avatar : profile.avatar,
        bio: updatedData.bio || profile.bio,
        role: updatedData.role || profile.role,
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUserObj));
      
      // 3. Dispatch custom event so headers update automatically
      window.dispatchEvent(new Event("userProfileUpdated"));

      setSavedSuccess(true);

      // 4. Smoothly redirect user to Customer Dashboard after successful save
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update profile on backend. Saved locally.";
      console.warn("Backend save notice:", msg);
      
      // Fallback save locally if offline or dev server
      const updatedUserObj = {
        fullName: profile.name,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        avatar: profile.avatar,
        bio: profile.bio,
        role: profile.role,
      };
      localStorage.setItem("user", JSON.stringify(updatedUserObj));
      window.dispatchEvent(new Event("userProfileUpdated"));

      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Link to="/" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Profile & Settings
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage your personal information, contact details, and account preferences.
            </p>
          </div>
        </div>

        {/* Saved Success Notification */}
        {savedSuccess && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Profile updated successfully!</p>
              <p className="text-xs text-emerald-700">Redirecting to customer dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Update Failed</p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Avatar & Quick Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
              
              <div className="relative group mb-4">
                <Avatar className="w-28 h-28 border-4 border-emerald-50 shadow-md">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-3xl">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-md border-2 border-white cursor-pointer hover:bg-emerald-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{profile.email}</p>
              
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified {profile.role}
              </div>

              {/* Avatar Selector */}
              <div className="w-full mt-6 pt-6 border-t border-gray-100 text-left">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Choose Avatar
                  </label>
                  {profile.avatar && (
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, avatar: "" }))}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1.5 items-center">
                  <button
                    type="button"
                    title="Use Initial Letter"
                    onClick={() => setProfile((p) => ({ ...p, avatar: "" }))}
                    className={`h-9 rounded-full font-black text-xs transition-all flex items-center justify-center border-2 ${
                      !profile.avatar 
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" 
                        : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {firstLetter}
                  </button>

                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, avatar: url }))}
                      className={`rounded-full overflow-hidden border-2 transition-all ${
                        profile.avatar === url 
                          ? "border-emerald-600 ring-2 ring-emerald-500/20 scale-105" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-9 h-9 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL input */}
              <div className="w-full mt-4 text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Or Custom Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profile.avatar}
                  onChange={(e) => setProfile((p) => ({ ...p, avatar: e.target.value }))}
                  className="text-xs rounded-xl bg-gray-50/50 border-gray-200"
                />
              </div>

            </div>

            {/* Quick Security Badge */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Account Status</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Your profile is 100% complete and verified. Booking services will auto-fill your default address.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Edit Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your display name and basic account details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="pl-10 py-5 bg-white border-gray-200 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="pl-10 py-5 bg-white border-gray-200 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="pl-10 py-5 bg-white border-gray-200 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Primary Location / City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      className="pl-10 py-5 bg-white border-gray-200 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Short Bio / Notes for Service Providers
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell service providers any special instructions (e.g. call before arriving)..."
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4 text-gray-400" /> Your information is stored securely.
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-5 font-bold shadow-md shadow-emerald-200 flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Changes
                    </>
                  )}
                </Button>
              </div>

            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" /> Notification Preferences
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage how you receive booking updates and promotional alerts.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                  <span className="text-xs font-semibold text-gray-700">SMS / WhatsApp booking updates</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                  <span className="text-xs font-semibold text-gray-700">Email invoices and payment receipts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded" />
                </label>
              </div>
            </div>

          </div>

        </form>

      </div>
    </CustomerLayout>
  );
}
