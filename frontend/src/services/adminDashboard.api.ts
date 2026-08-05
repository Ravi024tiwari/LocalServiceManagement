import { api } from "./api";

export interface AdminMetrics {
  totalUsers: number;
  totalUsersGrowth: string;
  totalProviders: number;
  totalProvidersGrowth: string;
  totalServices: number;
  totalServicesGrowth: string;
  totalBookings: number;
  totalBookingsGrowth: string;
  totalRevenue: number;
  totalRevenueGrowth: string;
}

export interface BookingsOverviewItem {
  date: string;
  bookings: number;
}

export interface ServiceCategoryItem {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface RevenueOverviewItem {
  date: string;
  revenue: number;
}

export interface UserGrowthItem {
  date: string;
  users: number;
}

export interface TopServiceReviewItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  price: number;
}

export interface PendingProviderItem {
  providerProfileId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  category: string;
  appliedDate: string;
  verificationStatus: string;
}

export interface ProviderVerificationStats {
  pending: number;
  verified: number;
  rejected: number;
  suspended: number;
}

export interface PlatformSummary {
  activeServices: number;
  activeProviders: number;
  completedBookings: number;
  totalCustomers: number;
  averageRating: number;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  charts: {
    bookingsOverview: BookingsOverviewItem[];
    servicesByCategory: ServiceCategoryItem[];
    revenueOverview: RevenueOverviewItem[];
    userGrowth: UserGrowthItem[];
  };
  topServices: TopServiceReviewItem[];
  providerVerification: {
    stats: ProviderVerificationStats;
    pendingProviders: PendingProviderItem[];
  };
  platformSummary: PlatformSummary;
}

export const adminDashboardApi = {
  // Fetch full admin dashboard data payload
  getDashboardMetrics: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  // Verify / approve a provider profile
  verifyProvider: async (providerProfileId: string, status: "APPROVED" | "REJECTED" = "APPROVED") => {
    const response = await api.patch(`/admin/dashboard/verify-provider/${providerProfileId}`, { status });
    return response.data;
  },
};
