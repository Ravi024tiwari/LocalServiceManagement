import { api } from "./api";
import type { LoginFormValues, RegisterFormValues } from "@/schemas/auth.schema";

export const authService = {
  // Register a new user
  register: async (data: RegisterFormValues) => {
    // We omit confirmPassword and termsAccepted since the backend doesn't need them
    const payload = {
      name: data.fullName,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
    };
    
    const response = await api.post("/auth/register", payload);
    return response.data;
  },

  // Login existing user
  login: async (data: LoginFormValues) => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data; // Usually contains { user, token }
  },
};