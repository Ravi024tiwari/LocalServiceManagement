import { api } from "./api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpaySDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentApi = {
  // Create Razorpay Order
  createOrder: async (bookingId: string) => {
    const response = await api.post("/payment/create-order", { bookingId });
    return response.data;
  },

  // Verify Payment Signature
  verifyPayment: async (payload: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }) => {
    const response = await api.post("/payment/verify-payment", payload);
    return response.data;
  },

  // Launch Razorpay Payment Modal
  checkout: async (bookingId: string, onSuccess: (result: any) => void, onError: (errMessage: string) => void) => {
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      onError("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    try {
      const orderRes = await paymentApi.createOrder(bookingId);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Failed to create payment order.");
      }

      const { orderId, amount, currency, keyId, serviceName } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "ServiceHub",
        description: `Payment for ${serviceName}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentApi.verifyPayment({
              bookingId,
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "mock_sig",
            });
            onSuccess(verifyRes);
          } catch (err: any) {
            onError(err.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@servicehub.com",
          contact: "9876543210",
        },
        theme: {
          color: "#059669",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        onError(response.error?.description || "Payment failed.");
      });
      razorpayInstance.open();
    } catch (err: any) {
      onError(err.response?.data?.message || err.message || "Razorpay checkout error.");
    }
  },
};
