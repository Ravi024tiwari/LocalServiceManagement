import { api } from "./api";

export interface CreateServicePayload {
  name: string;
  category: string;
  description: string;
  price: number;
  duration?: string;
  longitude: number;
  latitude: number;
  is_available: boolean;
  images?: File[];
}

export const serviceApi = {
  // Fetch service details by ID
  getServiceById: async (serviceId: string) => {
    const response = await api.get(`/service/${serviceId}`);
    return response.data;
  },

  // Create a new service (supports FormData with up to 4 images)
  createService: async (payload: CreateServicePayload) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    formData.append("price", payload.price.toString());
    if (payload.duration) {
      formData.append("duration", payload.duration);
    }
    formData.append("is_available", payload.is_available.toString());
    
    // GeoJSON point format expected by backend: { type: 'Point', coordinates: [lng, lat] }
    const serviceLocation = {
      type: "Point",
      coordinates: [payload.longitude, payload.latitude],
    };
    formData.append("service_location", JSON.stringify(serviceLocation));

    // Append images
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await api.post("/service/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Update an existing service by ID
  updateService: async (serviceId: string, payload: Partial<CreateServicePayload> & { existingImages?: string[] }) => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.category) formData.append("category", payload.category);
    if (payload.description) formData.append("description", payload.description);
    if (payload.price !== undefined) formData.append("price", payload.price.toString());
    if (payload.duration !== undefined) formData.append("duration", payload.duration);
    if (payload.is_available !== undefined) formData.append("is_available", payload.is_available.toString());

    if (payload.longitude !== undefined && payload.latitude !== undefined) {
      const serviceLocation = {
        type: "Point",
        coordinates: [payload.longitude, payload.latitude],
      };
      formData.append("service_location", JSON.stringify(serviceLocation));
    }

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await api.put(`/service/${serviceId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Reverse geocoding via OpenStreetMap Nominatim
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const data = await res.json();
      if (data && data.display_name) {
        // Format concise location string e.g. "Maharana Pratap Nagar, Bhopal, Madhya Pradesh"
        const address = data.address || {};
        const parts = [
          address.suburb || address.neighbourhood || address.road || address.quarter,
          address.city || address.town || address.village || address.county,
          address.state
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(",");
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  },

  // Fetch provider's created services
  getMyServices: async (params?: { category?: string; is_available?: boolean }) => {
    const response = await api.get("/service/provider/my-services", { params });
    return response.data;
  },

  // Fetch services in geospatial distance range (e.g. 20 km radius)
  getNearbyServices: async (lng: number, lat: number, distanceKm: number = 20) => {
    const response = await api.get("/service/nearby", {
      params: { lng, lat, distance: distanceKm },
    });
    return response.data;
  },

  // Toggle active/inactive status
  toggleServiceStatus: async (serviceId: string, isActive: boolean) => {
    const response = await api.patch(`/service/${serviceId}/status`, { isActive });
    return response.data;
  },

  // Delete service
  deleteService: async (serviceId: string) => {
    const response = await api.delete(`/service/${serviceId}`);
    return response.data;
  },

  // Search address locations via Nominatim
  searchLocation: async (query: string): Promise<Array<{ display_name: string; lat: number; lon: number }>> => {
    if (!query || query.trim().length < 3) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    } catch {
      return [];
    }
  }
};
