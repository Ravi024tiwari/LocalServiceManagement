import { api } from "./api";

export interface CustomerHistoryItem {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  location?: string;
  servicesBooked: string[];
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  lastBookingService: string;
  rating: number;
  totalReviews: number;
}

export interface ProviderCustomerPagination {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  limit: number;
}

export interface ProviderCustomerStats {
  totalCustomers: number;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
}

export interface GetProviderCustomersResponse {
  customers: CustomerHistoryItem[];
  pagination: ProviderCustomerPagination;
  stats: ProviderCustomerStats;
}

export interface BookingHistoryDetail {
  bookingId: string;
  serviceName: string;
  category: string;
  price: number;
  date: string;
  timeSlot: string;
  status: string;
}

export interface CustomerDetailsResponse {
  customer: CustomerHistoryItem;
  bookingHistory: BookingHistoryDetail[];
}

export const providerCustomerApi = {
  // Fetch paginated customer history
  getProviderCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    serviceCategory?: string;
    timeRange?: string;
  }) => {
    const response = await api.get("/provider-customers", { params });
    return response.data;
  },

  // Fetch detailed booking history for a specific customer
  getCustomerDetails: async (customerId: string) => {
    const response = await api.get(`/provider-customers/${customerId}/details`);
    return response.data;
  },
};
