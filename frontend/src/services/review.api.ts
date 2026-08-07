import { api } from './api';

export interface ReviewUser {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface ReviewItem {
    _id: string;
    service_id: string;
    booking_id?: string;
    customer_id: ReviewUser;
    provider_id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RatingDistribution {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
}

export interface RatingSummary {
    averageRating: number;
    totalReviews: number;
    distribution: RatingDistribution;
}

export interface ServiceReviewsResponse {
    success: boolean;
    data: {
        reviews: ReviewItem[];
        total: number;
        page: number;
        totalPages: number;
        summary: RatingSummary;
    };
}

export interface UserReviewResponse {
    success: boolean;
    data: ReviewItem | null;
}

export const reviewApi = {
    // Get all reviews & rating summary for a service
    getServiceReviews: async (serviceId: string, page = 1, limit = 10, star?: number) => {
        const params: any = { page, limit };
        if (star) params.star = star;
        const response = await api.get<ServiceReviewsResponse>(`/reviews/service/${serviceId}`, { params });
        return response.data.data;
    },

    // Get current user's review for a service
    getUserReviewForService: async (serviceId: string) => {
        const response = await api.get<UserReviewResponse>(`/reviews/service/${serviceId}/user-review`);
        return response.data.data;
    },

    // Upsert (submit or update) a service review
    submitServiceReview: async (data: { serviceId: string; rating: number; comment?: string; bookingId?: string }) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    // Delete a review
    deleteReview: async (reviewId: string) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },

    // Get reviews for a provider
    getProviderReviews: async (providerId: string, page = 1, limit = 10) => {
        const response = await api.get(`/reviews/provider/${providerId}`, { params: { page, limit } });
        return response.data.data;
    }
};
