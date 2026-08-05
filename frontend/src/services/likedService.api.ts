import { api } from "./api";

export interface LikedServiceItem {
  _id: string; // LikedService record ID
  service_id: string;
  service: {
    _id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    duration?: string;
    images: string[];
    is_available: boolean;
    provider?: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
      rating?: number;
      experience_years?: number;
    };
  };
  likedAt: string;
  distanceKm: number;
  isWithinRange: boolean;
}

export interface LikedStats {
  totalLiked: number;
  totalCategories: number;
  lastLikedText: string;
  potentialSavings: number;
}

export const likedServiceApi = {
  // Toggle like status for a service
  toggleLike: async (serviceId: string) => {
    const response = await api.post(`/liked-services/toggle/${serviceId}`);
    return response.data;
  },

  // Get user's liked services list
  getLikedServices: async (params?: { lat?: number; lng?: number; radius?: number }) => {
    const response = await api.get("/liked-services", { params });
    return response.data;
  },

  // Get stats summary
  getStats: async () => {
    const response = await api.get("/liked-services/stats");
    return response.data;
  },

  // Check specific service liked status
  checkStatus: async (serviceId: string) => {
    const response = await api.get(`/liked-services/check/${serviceId}`);
    return response.data;
  },
};
