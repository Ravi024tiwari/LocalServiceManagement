import { api } from "./api";

export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

export interface ProviderProfileData {
  _id?: string;
  user_id?: string;
  bio: string;
  experience_years: number;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isApproved: boolean;
  is_active: boolean;
  documents: string[];
  availability: TimeSlot[];
  createdAt?: string;
}

export const providerProfileApi = {
  // Apply to become a provider
  apply: async (data: {
    bio: string;
    experience_years: number;
    availability: TimeSlot[];
    documents: File[];
  }) => {
    const formData = new FormData();
    formData.append("bio", data.bio);
    formData.append("experience_years", data.experience_years.toString());
    formData.append("availability", JSON.stringify(data.availability));

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });
    }

    const response = await api.post("/provider-profile/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Update stored user & re-issued JWT token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userObj.role = "PROVIDER";
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch {
          // ignore
        }
      }
    }

    return response.data;
  },

  // Fetch current user's provider profile status
  getMyProfile: async () => {
    try {
      const response = await api.get("/provider-profile/me");
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  // Update current user's provider profile details (bio, experience_years, availability)
  updateMyProfile: async (data: {
    bio?: string;
    experience_years?: number;
    availability?: TimeSlot[];
  }) => {
    const response = await api.patch("/provider-profile/me", data);
    return response.data?.data || response.data;
  },
};
