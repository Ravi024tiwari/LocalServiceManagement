import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  MapPin, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Award, 
  Star,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { ImageWithSkeleton } from "../common/ImageWithSkeleton";

export const HeroSection: FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Bangalore, Karnataka");
  const [selectedService, setSelectedService] = useState("");

  const serviceOptions = [
    "Home Cleaning",
    "Plumbing",
    "Electrical Repair",
    "Pest Control",
    "AC Repair & Service",
    "Home Painting",
    "Appliance Repair",
    "Carpentry"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (location) queryParams.set("location", location);
    if (selectedService) queryParams.set("category", selectedService);
    
    navigate(`/nearby-services?${queryParams.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-white py-12 lg:py-20">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Your Home, Our Priority
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Reliable Home Services <br />
              <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Just a Click Away
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Book trusted professionals for all your home needs. Quality service, on time, every time.
            </p>

            {/* Interactive Search Bar Box */}
            <form 
              onSubmit={handleSearch}
              className="mt-8 p-3 sm:p-4 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
            >
              {/* Location Input */}
              <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location..."
                  className="w-full bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>

              {/* Service Select Dropdown */}
              <div className="flex-1 relative flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                <LayoutGrid className="w-5 h-5 text-emerald-600 shrink-0" />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 focus:outline-none appearance-none cursor-pointer font-medium pr-6"
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
              </div>

              {/* Search Services CTA Button */}
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Services</span>
              </button>
            </form>

            {/* Value Proposition Badges */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              
              <div className="flex items-start gap-3 p-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Verified Professionals</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Background verified & trained</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2">
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Secure Payments</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">100% safe & secure online</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Satisfaction Guaranteed</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Quality service or money back</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Hero Image Column with Skeleton Shimmer */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Hero Container */}
            <div className="relative w-full max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-emerald-600 to-teal-800">
              
              <ImageWithSkeleton
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop"
                alt="Service Hub Professional Technician"
                containerClassName="w-full h-[420px] lg:h-[480px]"
                className="w-full h-full object-cover object-center mix-blend-overlay opacity-90 hover:scale-105 transition-transform duration-700"
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none" />

              {/* In-Image Tag */}
              <div className="absolute bottom-6 left-6 text-white space-y-1 z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Expert Technician</p>
                <p className="text-xl font-bold">100+ Verified Specialists Ready</p>
              </div>

              {/* Floating Customer Rating Card */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-10 animate-bounce-slow">
                <div className="flex -space-x-2 overflow-hidden">
                  <ImageWithSkeleton
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                    alt="User"
                    containerClassName="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    className="w-full h-full object-cover"
                  />
                  <ImageWithSkeleton
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop"
                    alt="User"
                    containerClassName="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    className="w-full h-full object-cover"
                  />
                  <ImageWithSkeleton
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop"
                    alt="User"
                    containerClassName="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-extrabold text-gray-900">4.7/5</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500">Based on 250+ reviews</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
