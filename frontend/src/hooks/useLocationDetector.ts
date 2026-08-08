import { useState, useEffect, useCallback } from "react";
import { serviceApi } from "@/services/service.service";
import { api } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export function useLocationDetector() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [locationName, setLocationName] = useState<string>(
    user?.location || localStorage.getItem("user_location") || "Bhopal, Madhya Pradesh"
  );
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocationInBackendAndStore = useCallback(
    async (formattedAddress: string, lat: number, lng: number) => {
      try {
        setLocationName(formattedAddress);
        localStorage.setItem("user_location", formattedAddress);
        localStorage.setItem("user_coords", JSON.stringify({ lat, lng }));

        // 1. Update user profile in backend database
        const res = await api.patch("/user/profile", {
          location: formattedAddress,
          coordinates: [lng, lat],
        });

        // 2. Update Redux store & localStorage user object
        const updatedUser = res.data?.data || res.data;
        if (updatedUser) {
          const storedUser = localStorage.getItem("user");
          const existingToken = localStorage.getItem("token") || "";
          let mergedUser = updatedUser;
          if (storedUser) {
            try {
              mergedUser = { ...JSON.parse(storedUser), ...updatedUser };
            } catch (e) {}
          }
          dispatch(setCredentials({ user: mergedUser, token: existingToken }));
          localStorage.setItem("user", JSON.stringify(mergedUser));
          window.dispatchEvent(new Event("userProfileUpdated"));
        }
      } catch (err: any) {
        console.warn("Could not save dynamic location to profile:", err);
      }
    },
    [dispatch]
  );

  const detectLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });

        try {
          // Reverse geocode coordinates via OpenStreetMap Nominatim API
          const formattedAddress = await serviceApi.reverseGeocode(lat, lng);
          if (formattedAddress) {
            await updateLocationInBackendAndStore(formattedAddress, lat, lng);
          }
        } catch (err: any) {
          console.error("Failed to reverse geocode position:", err);
          setError("Failed to resolve address");
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        console.warn("Geolocation position permission error:", err);
        setIsDetecting(false);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [updateLocationInBackendAndStore]);

  useEffect(() => {
    const currentLocationStr = user?.location || localStorage.getItem("user_location");
    if (!currentLocationStr || currentLocationStr === "Detecting location...") {
      detectLocation();
    } else {
      setLocationName(currentLocationStr);
    }
  }, [user?.location, detectLocation]);

  return {
    locationName: user?.location || locationName,
    coordinates,
    isDetecting,
    error,
    detectLocation,
    updateLocationInBackendAndStore,
  };
}
