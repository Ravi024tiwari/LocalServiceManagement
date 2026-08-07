import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Camera, Save, CheckCircle2, ShieldCheck, 
  Lock, Sparkles, Loader2, AlertCircle, Navigation, KeyRound, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFirstLetter } from "@/components/customer/CustomerAvatarMenu";
import { customerService } from "@/services/customer.service";
import { useAppDispatch } from "@/store/hooks";
import { updateUserProfile } from "@/store/slices/authSlice";

const PRESET_AVATARS = [
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=60",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=68",
  "https://i.pravatar.cc/150?img=12",
];

interface BaseUserProfileFormProps {
  initialProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export const BaseUserProfileForm: React.FC<BaseUserProfileFormProps> = ({
  initialProfile,
  isAdmin = false,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState({
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    location: initialProfile?.location || "",
    avatar: initialProfile?.avatar || "",
    bio: initialProfile?.bio || "",
    role: initialProfile?.role || "CUSTOMER",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  // Password Change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync initial profile prop or localStorage data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let currentData = initialProfile;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        currentData = { ...parsed, ...initialProfile };
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    if (currentData) {
      setProfile({
        name: currentData.name || (currentData as any).fullName || "",
        email: currentData.email || "",
        phone: currentData.phone || "",
        location: currentData.location || "",
        avatar: currentData.avatar || "",
        bio: currentData.bio || "",
        role: currentData.role || "CUSTOMER",
      });
    }

    // Fetch fresh backend data
    customerService.getProfile().then((backendUser) => {
      if (backendUser) {
        const updated = {
          name: backendUser.name || backendUser.fullName || "",
          email: backendUser.email || "",
          phone: backendUser.phone || "",
          location: backendUser.location || "",
          avatar: backendUser.avatar || "",
          bio: backendUser.bio || "",
          role: backendUser.role || "CUSTOMER",
        };
        setProfile(updated);
        dispatch(updateUserProfile(updated));
      }
    });
  }, [dispatch, initialProfile]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handlePresetAvatarSelect = (url: string) => {
    setAvatarFile(null);
    setPreviewUrl(url);
    setProfile((prev) => ({ ...prev, avatar: url }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Geocode using Nominatim reverse lookup
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state || "Detected Location";
          const state = data.address?.state ? `, ${data.address.state}` : "";
          setProfile((prev) => ({ ...prev, location: `${city}${state}` }));
        } catch {
          setProfile((prev) => ({ ...prev, location: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}` }));
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setErrorMessage("Unable to retrieve location. Please type manually.");
        setIsDetectingLocation(false);
      }
    );
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      let avatarToPayload = profile.avatar;
      if (previewUrl && !avatarFile) {
        avatarToPayload = previewUrl;
      }
      // Never pass blob: URL string to server payload
      if (avatarToPayload && avatarToPayload.startsWith("blob:")) {
        avatarToPayload = "";
      }

      const updatePayload: any = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      };

      if (avatarToPayload) {
        updatePayload.avatar = avatarToPayload;
      }

      const updatedUser = await customerService.updateProfile(updatePayload, avatarFile || undefined);

      if (updatedUser) {
        const savedAvatar = updatedUser.avatar || (avatarToPayload && !avatarToPayload.startsWith("blob:") ? avatarToPayload : profile.avatar);

        const freshProfile = {
          name: updatedUser.name || updatedUser.fullName || profile.name,
          email: updatedUser.email || profile.email,
          phone: updatedUser.phone || profile.phone,
          location: updatedUser.location || profile.location,
          avatar: savedAvatar,
          bio: updatedUser.bio || profile.bio,
          role: updatedUser.role || profile.role,
        };

        setProfile(freshProfile);
        setPreviewUrl("");
        setAvatarFile(null);
        dispatch(updateUserProfile(freshProfile));
        window.dispatchEvent(new Event("userProfileUpdated"));

        setSavedSuccess(true);
        if (onSuccess) onSuccess();

        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    if (!passwords.current || !passwords.newPass || !passwords.confirmPass) {
      setPassMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPassMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPassMessage({ type: 'success', text: 'Password security updated successfully!' });
    setPasswords({ current: "", newPass: "", confirmPass: "" });
    setTimeout(() => setPassMessage(null), 4000);
  };

  const currentDisplayAvatar = previewUrl || profile.avatar;
  const firstLetter = getFirstLetter(profile.name || "User");

  return (
    <div className="space-y-8">
      {/* Toast Alert Messages */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Profile Updated Successfully</p>
            <p className="text-xs text-emerald-600">Your profile changes have been saved to your account.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmitProfile} className="space-y-8">
        {/* AVATAR SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-indigo-50 shadow-md">
                <AvatarImage src={currentDisplayAvatar} alt={profile.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-3xl">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>

              <label 
                htmlFor="avatar-upload-input" 
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 border-2 border-white"
                title="Upload profile picture"
              >
                <Camera className="w-4 h-4" />
                <input 
                  id="avatar-upload-input" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarFileSelect}
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-gray-900">{profile.name || "Your Name"}</h3>
                {isAdmin ? (
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin User
                  </span>
                ) : (
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {profile.role || "CUSTOMER"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG or WEBP (Max 5MB). Click camera icon to upload or choose a preset below.
              </p>

              {/* Preset Avatars Selection */}
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Choose Quick Avatar:
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetAvatarSelect(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-150 ${
                        currentDisplayAvatar === url 
                          ? "border-indigo-600 scale-110 shadow-sm ring-2 ring-indigo-200" 
                          : "border-transparent opacity-75 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL DETAILS FIELDS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" /> Full Name
              </label>
              <Input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your full name"
                required
                className="rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-500" /> Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="bg-gray-50/70 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Verified
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-500" /> Phone Number
              </label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Location with Geolocation Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-500" /> City & Location
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                  ) : (
                    <Navigation className="w-3 h-3 text-indigo-600" />
                  )}
                  Detect City
                </button>
              </label>
              <Input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Bhopal, Madhya Pradesh"
                className="rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio / About Me */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Bio / About Yourself</span>
              <span className="text-xs text-gray-400">{profile.bio.length}/300</span>
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 300) })}
              placeholder="Tell service providers or customers a little about yourself..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </Button>
        </div>
      </form>

      {/* SECURITY & PASSWORD CHANGE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Account Security</h4>
              <p className="text-xs text-gray-500">Update your password and login security</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
          >
            {showPasswordSection ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
            {passMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {passMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPass ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="••••••••"
                    className="rounded-xl border-gray-200 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Min 6 characters"
                    className="rounded-xl border-gray-200 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwords.confirmPass}
                  onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                  placeholder="Re-enter new password"
                  className="rounded-xl border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
