import { api } from "./api";
import { serviceApi } from "./service.service";
import { bookingApi } from "./booking.service";

export const customerService = {
  getProfile: async () => {
    try {
      const response = await api.get("/user/profile");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.warn("Could not fetch user profile from backend:", err);
      return null;
    }
  },

  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
  }) => {
    try {
      const response = await api.patch("/user/profile", profileData);
      return response.data;
    } catch (err: any) {
      console.error("Profile update backend API error:", err);
      throw err;
    }
  },

  // Real production backend dashboard data fetcher
  getDashboardData: async () => {
    try {
      // 1. Fetch real nearby active services from backend (defaulting to regional coordinates)
      const servicesRes = await serviceApi.getNearbyServices(82.1409, 22.0797, 50);
      let realServices: any[] = [];
      if (servicesRes && servicesRes.data && Array.isArray(servicesRes.data)) {
        realServices = servicesRes.data;
      } else if (Array.isArray(servicesRes)) {
        realServices = servicesRes;
      }

      // 2. Fetch real upcoming booking for customer
      let upcomingBooking: any = null;
      try {
        const bookingRes = await bookingApi.getCustomerBookings();
        if (bookingRes && bookingRes.data && Array.isArray(bookingRes.data) && bookingRes.data.length > 0) {
          const active = bookingRes.data.find(
            (b: any) => b.status === "PENDING" || b.status === "ACCEPTED" || b.status === "IN_PROGRESS"
          );
          upcomingBooking = active || null;
        }
      } catch (err) {
        // Fallback gracefully if no bookings exist
      }

      return {
        user: { name: "Customer", location: "Bilaspur, Chhattisgarh" },
        upcomingBooking,
        categories: [
          { name: "Electrical", icon: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
          { name: "Plumbing", icon: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
          { name: "Cleaning", icon: "Sparkles", color: "text-pink-500", bg: "bg-pink-50" },
          { name: "Carpentry", icon: "Hammer", color: "text-orange-500", bg: "bg-orange-50" },
          { name: "Painting", icon: "Paintbrush", color: "text-purple-500", bg: "bg-purple-50" },
          { name: "Appliance", icon: "Wrench", color: "text-teal-500", bg: "bg-teal-50" },
        ],
        popularServices: realServices,
      };
    } catch (error) {
      console.warn("Failed to fetch backend dashboard data:", error);
      return {
        user: { name: "Customer", location: "Bilaspur, Chhattisgarh" },
        upcomingBooking: null,
        categories: [
          { name: "Electrical", icon: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
          { name: "Plumbing", icon: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
          { name: "Cleaning", icon: "Sparkles", color: "text-pink-500", bg: "bg-pink-50" },
          { name: "Carpentry", icon: "Hammer", color: "text-orange-500", bg: "bg-orange-50" },
          { name: "Painting", icon: "Paintbrush", color: "text-purple-500", bg: "bg-purple-50" },
          { name: "Appliance", icon: "Wrench", color: "text-teal-500", bg: "bg-teal-50" },
        ],
        popularServices: [],
      };
    }
  },
};