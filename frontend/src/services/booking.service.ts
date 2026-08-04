import { api } from "./api";

export interface BookingPayload {
  service_id: string;
  provider_id: string;
  scheduled_date: string;
  time_slot: string;
  booking_address: string;
}

export const bookingApi = {
  // Check if slot is available or already booked
  checkAvailability: async (payload: { service_id: string; scheduled_date: string; time_slot: string }) => {
    const response = await api.post("/booking/check-availability", payload);
    return response.data;
  },

  // Create new customer booking
  createBooking: async (payload: BookingPayload) => {
    const response = await api.post("/booking", payload);
    return response.data;
  },

  // Fetch all customer bookings
  getCustomerBookings: async (status?: string) => {
    const response = await api.get("/booking/customer", {
      params: { status },
    });
    return response.data;
  },

  // Fetch all provider job requests
  getProviderBookings: async (status?: string) => {
    const response = await api.get("/booking/provider", {
      params: { status },
    });
    return response.data;
  },

  // Get single booking detail
  getBookingDetails: async (bookingId: string) => {
    const response = await api.get(`/booking/${bookingId}`);
    return response.data;
  },

  // Provider accepts or completes job
  updateBookingStatus: async (bookingId: string, status: "ACCEPTED" | "COMPLETED") => {
    const response = await api.patch(`/booking/${bookingId}/status`, { status });
    return response.data;
  },

  // Provider inputs customer OTP to start job -> IN_PROGRESS
  startJob: async (bookingId: string, otp: string) => {
    const response = await api.post(`/booking/${bookingId}/start`, { otp });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    const response = await api.patch(`/booking/${bookingId}/cancel`, { reason });
    return response.data;
  },
};
