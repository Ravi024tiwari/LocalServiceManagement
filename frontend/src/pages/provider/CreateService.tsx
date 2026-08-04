import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { 
  ChevronDown, MapPin, Bell, CheckCircle2, User, Settings, LogOut,
  Briefcase, IndianRupee, Clock, AlertCircle, Loader2, Check
} from "lucide-react";

import ProviderLayout from "@/layout/ProviderLayout";
import LocationPickerMap from "@/components/provider/LocationPickerMap";
import ImageUploader from "@/components/provider/ImageUploader";
import { serviceApi } from "@/services/service.service";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  "Appliance Repair",
  "Plumbing",
  "Home Cleaning",
  "Electrical",
  "AC Repair & Service",
  "Beauty & Wellness",
  "Painting",
  "Carpentry",
  "Vehicle Repair",
  "Pest Control",
];

export default function CreateService() {
  const navigate = useNavigate();
  const { id: serviceId } = useParams<{ id?: string }>();
  const routerLocation = useLocation();

  const isEditMode = Boolean(serviceId);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Geo Location State
  const [latitude, setLatitude] = useState<number>(23.2599);
  const [longitude, setLongitude] = useState<number>(77.4126);
  const [address, setAddress] = useState<string>("Bhopal, Madhya Pradesh");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Images State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // UI status state
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Helper to populate form fields from service object
  const populateForm = async (service: any) => {
    if (!service) return;
    setName(service.name || "");
    setCategory(service.category || "");
    setDescription(service.description || "");
    setPrice(service.price ? service.price.toString() : "");
    setDuration(service.duration || "60 mins");
    setIsAvailable(service.is_available !== undefined ? service.is_available : true);
    setIsConfirmed(true);

    if (service.images && Array.isArray(service.images)) {
      setPreviewUrls(service.images);
    }

    if (service.service_location?.coordinates && Array.isArray(service.service_location.coordinates)) {
      const [lng, lat] = service.service_location.coordinates;
      setLongitude(lng);
      setLatitude(lat);
      const resolvedAddress = await serviceApi.reverseGeocode(lat, lng);
      setAddress(resolvedAddress);
    }
  };

  // --------------------------------------------------------------------------
  // Auto-fill Data: Fetch/Prefill in Edit Mode OR Detect Location in Create Mode
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isEditMode && serviceId) {
      // 1. Prefill immediately from router state if available
      const passedService = routerLocation.state?.service;
      if (passedService) {
        populateForm(passedService);
      } else {
        // 2. Otherwise fetch from API
        setIsLoadingDetails(true);
        serviceApi.getServiceById(serviceId)
          .then((res) => {
            if (res?.data) {
              populateForm(res.data);
            }
          })
          .catch((err) => {
            console.error("Failed to load service details:", err);
            setErrorMessage("Failed to load existing service details.");
          })
          .finally(() => setIsLoadingDetails(false));
      }
    } else {
      // Create Mode: Detect current geolocation
      detectLiveLocation();
    }
  }, [serviceId]);

  const detectLiveLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          const resolvedAddress = await serviceApi.reverseGeocode(lat, lng);
          setAddress(resolvedAddress);
          setIsLocating(false);
        },
        async (error) => {
          console.warn("Geolocation position error:", error.message);
          const resolvedAddress = await serviceApi.reverseGeocode(23.2599, 77.4126);
          setAddress(resolvedAddress);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleLocationChange = (lat: number, lng: number, newAddress: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(newAddress);
  };

  // --------------------------------------------------------------------------
  // Handle Form Submission
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validations
    if (!name.trim()) return setErrorMessage("Please enter a service name.");
    if (!category) return setErrorMessage("Please select a category.");
    if (!description.trim()) return setErrorMessage("Please provide a service description.");
    if (!price || parseFloat(price) <= 0) return setErrorMessage("Please enter a valid price.");
    if (!latitude || !longitude) return setErrorMessage("Location coordinates are required.");
    if (!isConfirmed) return setErrorMessage("Please confirm that all information provided is accurate.");

    try {
      setIsSubmitting(true);

      if (isEditMode && serviceId) {
        // UPDATE Existing Service
        await serviceApi.updateService(serviceId, {
          name,
          category,
          description,
          price: parseFloat(price),
          duration: duration || "60 mins",
          longitude,
          latitude,
          is_available: isAvailable,
          images: imageFiles,
        });

        setSuccessMessage("Service updated successfully!");
        setTimeout(() => {
          navigate("/provider/services");
        }, 1200);
      } else {
        // CREATE New Service
        await serviceApi.createService({
          name,
          category,
          description,
          price: parseFloat(price),
          duration: duration || "60 mins",
          longitude,
          latitude,
          is_available: isAvailable,
          images: imageFiles,
        });

        setSuccessMessage("Service created successfully!");
        setTimeout(() => {
          navigate("/provider/services");
        }, 1200);
      }
    } catch (err: any) {
      console.error("Submit Service Error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to save service. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
        
        {/* ================================================================== */}
        {/* HEADER SECTION (Breadcrumb & Top Navigation Bar)                   */}
        {/* ================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <span className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => navigate("/provider")}>
                Dashboard
              </span>
              <span>&gt;</span>
              <span className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => navigate("/provider/services")}>
                My Services
              </span>
              <span>&gt;</span>
              <span className="text-emerald-600 font-bold">{isEditMode ? "Edit Service" : "Create Service"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEditMode ? `Edit Service` : `Create New Service`}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {isEditMode 
                ? `Update details and availability for your existing service.` 
                : `Add a new service to your profile and start getting more bookings.`}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {/* Active Location Dropdown Badge */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 max-w-[180px] truncate">{address}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {/* Notifications */}
            <div className="relative cursor-pointer bg-white p-2.5 rounded-full border border-gray-200 shadow-sm hover:text-emerald-600">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute 0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                6
              </span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-all">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                    <AvatarFallback>RH</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-900 leading-tight">Rahul Sharma</span>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Provider
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {isLoadingDetails && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
            <span>Loading service details...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* ================================================================== */}
        {/* SERVICE FORM                                                       */}
        {/* ================================================================== */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---------------------------------------------------------------- */}
          {/* SECTION 1: BASIC INFORMATION                                    */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-200">
                1
              </div>
              <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter service name"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-gray-400">
                  {description.length}/500
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Describe your service in detail..."
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm custom-scrollbar"
              />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SECTION 2: PRICING                                               */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-200">
                2
              </div>
              <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter service price"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Duration (Approx.)
                </label>
                <div className="relative flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration (e.g. 60 mins)"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SECTION 3: SERVICE IMAGES                                        */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-200">
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900">Service Images</h2>
              </div>
              <span className="text-xs font-medium text-gray-500 pl-11 sm:pl-0">
                Upload up to 4 images of your service
              </span>
            </div>

            <ImageUploader
              files={imageFiles}
              previewUrls={previewUrls}
              onChange={(files, urls) => {
                setImageFiles(files);
                setPreviewUrls(urls);
              }}
            />
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SECTION 4: SERVICE LOCATION                                      */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-200">
                4
              </div>
              <h2 className="text-lg font-bold text-gray-900">Service Location</h2>
            </div>

            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              address={address}
              onLocationChange={handleLocationChange}
              onLocateMe={detectLiveLocation}
              isLocating={isLocating}
            />
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SECTION 5: AVAILABILITY & CONFIRMATION                          */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-200">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Availability</h2>
                  <p className="text-xs text-gray-500 font-medium">Set your service availability status</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-700">
                  {isAvailable ? "Service Available" : "Service Unavailable"}
                </span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                I confirm that all the information provided is accurate and true.
              </span>
            </label>

            {/* Submit & Cancel Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/provider/services")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> {isEditMode ? "Update Service" : "Create Service"}
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </ProviderLayout>
  );
}
