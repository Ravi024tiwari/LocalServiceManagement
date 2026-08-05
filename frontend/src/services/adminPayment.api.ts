import { api } from "./api";

export interface PaymentUserRef {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface PaymentServiceRef {
  title: string;
  category: string;
  price: number;
}

export interface PaymentItem {
  _id: string;
  paymentId: string;
  bookingId: string;
  customer: PaymentUserRef;
  provider: PaymentUserRef;
  service: PaymentServiceRef;
  method: string;
  amount: number;
  platformFee: number;
  providerAmount: number;
  status: "Successful" | "Pending" | "Failed" | "Refunded";
  rawStatus?: string;
  createdAt: string;
}

export interface KpiMetric {
  value: number;
  growth: string;
  period: string;
}

export interface RevenueSeriesPoint {
  label: string;
  amount: number;
}

export interface StatusDistributionItem {
  status: string;
  percentage: number;
  count: number;
  color: string;
}

export interface AdminPaymentStats {
  kpiMetrics: {
    totalRevenue: KpiMetric;
    successfulPayments: KpiMetric;
    pendingPayments: KpiMetric;
    failedPayments: KpiMetric;
    refundedAmount: KpiMetric;
    platformCommission: KpiMetric;
  };
  revenueOverviewSeries: RevenueSeriesPoint[];
  statusDistribution: StatusDistributionItem[];
}

export interface AdminPaymentPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export interface GetAdminPaymentsResponse {
  payments: PaymentItem[];
  pagination: AdminPaymentPagination;
}

export const adminPaymentApi = {
  getStats: async () => {
    const response = await api.get("/admin/payments/stats");
    return response.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    providerId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const response = await api.get("/admin/payments", { params });
    return response.data;
  },

  getPaymentById: async (id: string) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },
};
