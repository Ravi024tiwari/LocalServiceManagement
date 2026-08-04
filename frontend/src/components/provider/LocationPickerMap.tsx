import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { serviceApi } from "@/services/service.service";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  onLocateMe: () => void;
  isLocating?: boolean;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  address,
  onLocationChange,
  onLocateMe,
  isLocating = false,
}: LocationPickerMapProps) {
  const [searchQuery, setSearchQuery] = useState(address);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: number; lon: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Sync address changes from props
  useEffect(() => {
    setSearchQuery(address);
  }, [address]);

  // Handle address input change & debounced Nominatim search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setShowDropdown(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await serviceApi.searchLocation(val);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  };

  const handleSelectResult = async (item: { display_name: string; lat: number; lon: number }) => {
    setShowDropdown(false);
    const shortAddress = item.display_name.split(",").slice(0, 3).join(",");
    setSearchQuery(shortAddress);
    onLocationChange(item.lat, item.lon, shortAddress);
  };

  // Convert lat/lng to tile numbers for OpenStreetMap static canvas/tile preview
  const tileX = Math.floor(((longitude + 180) / 360) * Math.pow(2, 14));
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, 14)
  );

  return (
    <div className="space-y-4">
      {/* Search Location Input with Target button */}
      <div className="relative">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Search Location
        </label>
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowDropdown(true)}
            placeholder="Enter your service location..."
            className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            title="Use current location"
            className="absolute right-2 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && (searchResults.length > 0 || isSearching) && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Searching location...
              </div>
            ) : (
              searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{res.display_name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Longitude and Latitude Display Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Longitude
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="number"
              step="any"
              value={longitude || ""}
              onChange={(e) => {
                const lngVal = parseFloat(e.target.value) || 0;
                onLocationChange(latitude, lngVal, address);
              }}
              placeholder="Enter longitude"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Latitude
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="number"
              step="any"
              value={latitude || ""}
              onChange={(e) => {
                const latVal = parseFloat(e.target.value) || 0;
                onLocationChange(latVal, longitude, address);
              }}
              placeholder="Enter latitude"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Interactive OpenStreetMap Canvas / Visual Map Display */}
      <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
        {/* OpenStreetMap Tile Images */}
        <div className="absolute inset-0 bg-[#e5e3df] overflow-hidden flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-3 w-[600px] h-[600px] opacity-90 transition-all duration-300">
            {[-1, 0, 1].map((dy) =>
              [-1, 0, 1].map((dx) => (
                <img
                  key={`${dx}-${dy}`}
                  src={`https://tile.openstreetmap.org/14/${tileX + dx}/${tileY + dy}.png`}
                  alt="map tile"
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = "0.5";
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Custom Green Location Pin Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative flex flex-col items-center -mt-6 animate-bounce">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white">
              <MapPin className="w-6 h-6 fill-white text-emerald-600" />
            </div>
            <div className="w-3 h-1.5 bg-gray-900/30 rounded-full blur-[1px] mt-1"></div>
          </div>
        </div>

        {/* Map Overlay Controls */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/60 shadow-md flex items-center gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[11px] font-semibold text-emerald-800 flex-1 line-clamp-1">
            {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
          </p>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
            Live Location
          </span>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="flex items-center gap-2.5 p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium">
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
          ✓
        </div>
        <span>Move the pin on map or use location search to set your exact service location.</span>
      </div>
    </div>
  );
}
