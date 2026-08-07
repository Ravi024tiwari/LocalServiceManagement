import { api } from "./api";

export interface AdminReviewCustomer {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AdminReviewProvider {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AdminReviewService {
  _id: string;
  name: string;
  category: string;
  price: number;
  images?: string[];
}

export interface AdminReviewItem {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  booking_id?: string;
  customer?: AdminReviewCustomer;
  provider?: AdminReviewProvider;
  service?: AdminReviewService;
}

export interface AdminReviewKPIs {
  totalReviews: number;
  averageRating: number;
}

export interface AdminReviewPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAdminReviewsResponse {
  success: boolean;
  data: {
    kpis: AdminReviewKPIs;
    reviews: AdminReviewItem[];
    pagination: AdminReviewPagination;
  };
}

export interface GetAdminReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  category?: string;
  providerId?: string;
  sortBy?: "newest" | "oldest" | "rating_high" | "rating_low";
}

export const adminReviewApi = {
  getReviews: async (params?: GetAdminReviewsParams): Promise<GetAdminReviewsResponse> => {
    const response = await api.get("/admin/reviews", { params });
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },
};
