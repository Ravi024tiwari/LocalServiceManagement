import { api } from "./api";

export interface AdminProviderItem {
  providerProfileId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  location: string;
  bio: string;
  experience_years: number;
  documents: string[];
  verification_status: "PENDING" | "APPROVED" | "REJECTED";
  isApproved: boolean;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  appliedDate: string;
  availability?: Array<{ day: string; start_time: string; end_time: string; is_closed: boolean }>;
}

export interface AdminProviderStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminProviderPagination {
  currentPage: number;
  totalPages: number;
  totalProviders: number;
  limit: number;
}

export interface GetAdminProvidersResponse {
  providers: AdminProviderItem[];
  pagination: AdminProviderPagination;
  stats: AdminProviderStats;
}

export const adminProviderApi = {
  // Fetch paginated provider verification list
  getProviders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) => {
    const response = await api.get("/admin/providers", { params });
    return response.data;
  },

  // Update provider verification status (APPROVED | REJECTED | PENDING)
  updateStatus: async (providerProfileId: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    const response = await api.patch(`/admin/providers/${providerProfileId}/status`, { status });
    return response.data;
  },
};
