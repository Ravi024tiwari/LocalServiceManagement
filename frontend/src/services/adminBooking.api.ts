import { api } from "./api";

export interface UserRef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface ServiceRef {
  _id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  description?: string;
}

export interface AdminBookingItem {
  _id: string;
  customer_id: UserRef;
  provider_id: UserRef;
  service_id: ServiceRef;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduled_date: string;
  time_slot: string;
  booking_address: string;
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  start_otp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingStats {
  total: number;
  pending: number;
  confirmed: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface AdminBookingPagination {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  limit: number;
}

export interface GetAdminBookingsResponse {
  bookings: AdminBookingItem[];
  pagination: AdminBookingPagination;
  stats: AdminBookingStats;
}

export const adminBookingApi = {
  // Fetch paginated bookings for admin with filters
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    providerId?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get("/admin/bookings", { params });
    return response.data;
  },

  // Fetch individual booking details
  getBookingById: async (id: string) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },
};
