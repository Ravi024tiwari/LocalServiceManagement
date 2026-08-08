import { api } from "./api";

export const providerService = {
  getDashboardData: async () => {
    const response = await api.get("/dashboard/provider");
    return response.data?.data || response.data;
  }
};