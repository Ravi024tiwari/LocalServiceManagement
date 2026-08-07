import React from "react";
import { useNavigate } from "react-router";
import { Star, MapPin, AlertCircle, ShieldCheck } from "lucide-react";
import LikeButton from "./LikeButton";
import { type LikedServiceItem } from "@/services/likedService.api";

interface LikedServiceCardProps {
  item: LikedServiceItem;
  onBookNow: (item: LikedServiceItem) => void;
}

export const LikedServiceCard: React.FC<LikedServiceCardProps> = ({ item, onBookNow }) => {
  const navigate = useNavigate();
  const { service, distanceKm, isWithinRange } = item;
  const provider = service.provider;

  // Fallback image based on category
  const getFallbackImage = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "appliance repair":
        return "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80";
      case "plumbing":
        return "https://images.unsplash.com/photo-1505798577917-a671540f0afe?auto=format&fit=crop&w=600&q=80";
      case "cleaning":
        return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
      case "electrical":
        return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80";
      case "painting":
        return "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80";
      case "carpentry":
        return "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80";
      case "vehicle repair":
        return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80";
      case "pest control":
        return "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80";
    }
  };

  const imageSrc =
    service.images && service.images.length > 0 ? service.images[0] : getFallbackImage(service.category);

  return (
    <div
      onClick={() => navigate(`/service/${item.service_id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 z-10">
          {isWithinRange ? (
            <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {distanceKm} km away
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <AlertCircle className="w-3 h-3 text-amber-200" />
              {distanceKm} km away • Out of Range
            </span>
          )}
        </div>

        {/* Like Button */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <LikeButton serviceId={item.service_id} />
        </div>

        {/* Category Pill on Image Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-emerald-100/95 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
            {service.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title & Price Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {service.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-black text-gray-900 text-base">₹{service.price}</span>
              <span className="block text-[10px] text-gray-400 font-medium -mt-1">Starting from</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-800">{provider?.rating || 4.8}</span>
            <span className="text-gray-400">(126)</span>
          </div>

          {/* Provider Metadata */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0 overflow-hidden">
              {provider?.avatar ? (
                <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
              ) : (
                provider?.name?.charAt(0) || "P"
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-800 truncate">{provider?.name || "Service Professional"}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {provider?.experience_years || 5} yrs experience
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div onClick={(e) => e.stopPropagation()}>
          {isWithinRange ? (
            <button
              type="button"
              onClick={() => onBookNow(item)}
              className="w-full py-2.5 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-600 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Book Now
            </button>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                disabled
                className="w-full py-2.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-xl font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Out of Service Region
              </button>
              <p className="text-[10px] text-amber-600 text-center font-medium">
                Too far from your current location ({distanceKm} km)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedServiceCard;
