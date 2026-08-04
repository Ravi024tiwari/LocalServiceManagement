import { useEffect, useState } from "react";
import { 
  Calendar, Clock, MapPin, CheckCircle2, AlertCircle, 
  CreditCard, Loader2, RefreshCw, Key, ShieldCheck, XCircle
} from "lucide-react";

import CustomerLayout from "@/layout/CustomerLayout";
import { bookingApi } from "@/services/booking.service";
import { paymentApi } from "@/services/payment.service";

interface BookingItem {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  scheduled_date: string;
  time_slot: string;
  booking_address: string;
  start_otp?: string;
  service_id?: {
    _id?: string;
    name?: string;
    title?: string;
    category?: string;
    price?: number;
    images?: string[];
  };
  provider_id?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  createdAt?: string;
}

const STATUS_TABS = ["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function CustomerBookings() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomerBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingApi.getCustomerBookings(activeTab === "ALL" ? undefined : activeTab);
      if (res && res.data) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch customer bookings:", err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerBookings();
  }, [activeTab]);

  // Launch Razorpay Payment Modal
  const handlePayNow = (booking: BookingItem) => {
    setPayingBookingId(booking._id);
    setPaymentMessage(null);

    paymentApi.checkout(
      booking._id,
      (result) => {
        setPayingBookingId(null);
        setPaymentMessage({
          type: "success",
          text: result.message || "Payment verified successfully via Razorpay!",
        });
        fetchCustomerBookings();
      },
      (errMessage) => {
        setPayingBookingId(null);
        setPaymentMessage({
          type: "error",
          text: errMessage || "Payment failed. Please try again.",
        });
      }
    );
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancelBooking(bookingId, "Customer requested cancellation");
      fetchCustomerBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" /> My Service Bookings
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              Track status, view job start OTPs, and pay securely via Razorpay.
            </p>
          </div>

          <button
            onClick={fetchCustomerBookings}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Payment Toast Notification */}
        {paymentMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all ${
              paymentMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {paymentMessage.type === "success" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{paymentMessage.text}</span>
            </div>
            <button onClick={() => setPaymentMessage(null)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-gray-500">Loading your service bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3 shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No Bookings Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              You don't have any bookings in <span className="font-bold">{activeTab.replace("_", " ")}</span> status right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const serviceName = booking.service_id?.name || booking.service_id?.title || "Local Service";
              const price = booking.service_id?.price || 499;
              const providerName = booking.provider_id?.name || "Assigned Provider";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    {/* Top Status & Payment Badge Header */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          booking.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : booking.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : booking.status === "IN_PROGRESS"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : booking.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>

                      {/* Payment Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                          booking.payment_status === "PAID"
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {booking.payment_status === "PAID" ? "PAID ✓" : "PAYMENT PENDING"}
                      </span>
                    </div>

                    {/* Service Info */}
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">{serviceName}</h3>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">₹{price}</p>
                    </div>

                    {/* Schedule & Address Details */}
                    <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{new Date(booking.scheduled_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{booking.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 truncate font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{booking.booking_address}</span>
                      </div>
                    </div>

                    {/* Provider Info */}
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pt-1">
                      <span className="text-gray-400">Provider:</span>
                      <span className="font-bold text-gray-900">{providerName}</span>
                    </div>

                    {/* Customer Start OTP (If ACCEPTED or IN_PROGRESS) */}
                    {booking.start_otp && (booking.status === "ACCEPTED" || booking.status === "IN_PROGRESS") && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900">Job Start OTP:</span>
                        </div>
                        <span className="text-base font-extrabold tracking-widest text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                          {booking.start_otp}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Section (Pay Now or Cancel) */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {/* Pay Now Button (If Completed & Payment Pending) */}
                    {booking.status === "COMPLETED" && booking.payment_status !== "PAID" && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        disabled={payingBookingId === booking._id}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {payingBookingId === booking._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Processing Razorpay...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" /> Pay ₹{price} via Razorpay
                          </>
                        )}
                      </button>
                    )}

                    {/* Paid Receipt Confirmation */}
                    {booking.payment_status === "PAID" && (
                      <div className="bg-emerald-50 text-emerald-800 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Complete & Verified
                      </div>
                    )}

                    {/* Cancel Button (If Pending or Accepted) */}
                    {(booking.status === "PENDING" || booking.status === "ACCEPTED") && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full py-2 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}
