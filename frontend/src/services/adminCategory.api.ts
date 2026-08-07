import { api } from "./api";

export interface AdminCategoryItem {
  category: string;
  serviceCount: number;
  activeServicesCount: number;
  bookingCount: number;
  status: "Active" | "Inactive";
  averageRating: number;
  totalReviews: number;
}

export interface AdminCategoryKPIs {
  totalCategories: number;
  activeCategories: number;
  totalServices: number;
  totalBookings: number;
  averageRating: number;
}

export interface TopCategoryHighlight {
  category: string;
  serviceCount: number;
  bookingCount: number;
}

export interface AdminCategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAdminCategoriesResponse {
  success: boolean;
  data: {
    kpis: AdminCategoryKPIs;
    topCategories: TopCategoryHighlight[];
    categories: AdminCategoryItem[];
    pagination: AdminCategoryPagination;
  };
}

export interface CategoryDetailServiceItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  is_available: boolean;
  averageRating: number;
  totalReviews: number;
  images: string[];
  provider_id?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface GetCategoryDetailResponse {
  success: boolean;
  data: {
    category: string;
    totalServices: number;
    activeServices: number;
    bookingCount: number;
    services: CategoryDetailServiceItem[];
  };
}

export interface GetAdminCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: "services_desc" | "services_asc" | "bookings_desc" | "name_asc" | "rating_desc";
}

export const adminCategoryApi = {
  getCategories: async (params?: GetAdminCategoriesParams): Promise<GetAdminCategoriesResponse> => {
    const response = await api.get("/admin/categories", { params });
    return response.data;
  },

  getCategoryDetail: async (categoryName: string): Promise<GetCategoryDetailResponse> => {
    const response = await api.get(`/admin/categories/${encodeURIComponent(categoryName)}`);
    return response.data;
  },
};
