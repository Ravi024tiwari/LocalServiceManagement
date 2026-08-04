import { useEffect, useState } from "react";
import { 
  Calendar, Clock, MapPin, CheckCircle2, 
  Loader2, RefreshCw, ArrowRight, Play, UserCheck
} from "lucide-react";

import ProviderLayout from "@/layout/ProviderLayout";
import { bookingApi } from "@/services/booking.service";

interface BookingItem {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  scheduled_date: string;
  time_slot: string;
  booking_address: string;
  service_id?: {
    _id?: string;
    name?: string;
    title?: string;
    category?: string;
    price?: number;
  };
  customer_id?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  createdAt?: string;
}

const STATUS_TABS = ["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export default function ProviderBookings() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProviderBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingApi.getProviderBookings(activeTab === "ALL" ? undefined : activeTab);
      if (res && res.data) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch provider bookings:", err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderBookings();
  }, [activeTab]);

  // Provider Accepts Request -> ACCEPTED
  const handleAcceptJob = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingApi.updateBookingStatus(bookingId, "ACCEPTED");
      fetchProviderBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to accept booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Provider Enters Customer OTP to Start Job -> IN_PROGRESS
  const handleStartJobWithOtp = async (bookingId: string) => {
    const otp = otpInputs[bookingId];
    if (!otp || otp.trim().length !== 4) {
      alert("Please enter the valid 4-digit OTP provided by the customer.");
      return;
    }

    try {
      setUpdatingId(bookingId);
      await bookingApi.startJob(bookingId, otp.trim());
      setOtpInputs((prev) => ({ ...prev, [bookingId]: "" }));
      fetchProviderBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid OTP. Please verify with the customer.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Provider Marks Job as Completed -> COMPLETED
  const handleCompleteJob = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingApi.updateBookingStatus(bookingId, "COMPLETED");
      fetchProviderBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark job as completed.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ProviderLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" /> Received Job Requests
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              Accept new service requests, input customer OTPs to start jobs, and manage job completions.
            </p>
          </div>

          <button
            onClick={fetchProviderBookings}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Requests
          </button>
        </div>

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

        {/* Job Requests List */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-gray-500">Loading received job requests...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3 shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No Job Requests Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              No booking requests are currently in <span className="font-bold">{activeTab.replace("_", " ")}</span> status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const serviceName = booking.service_id?.name || booking.service_id?.title || "Requested Service";
              const price = booking.service_id?.price || 499;
              const customerName = booking.customer_id?.name || "Customer";
              const customerPhone = booking.customer_id?.phone || "N/A";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    {/* Status & Payment Badge */}
                    <div className="flex items-center justify-between gap-2">
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
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">Earnings: ₹{price}</p>
                    </div>

                    {/* Customer & Location */}
                    <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-900 font-bold">
                        <span>Customer: {customerName}</span>
                        <span className="text-emerald-700">{customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold pt-1 border-t border-gray-200/50">
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
                  </div>

                  {/* Actions Section */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {/* Action 1: Accept Pending Request */}
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => handleAcceptJob(booking._id)}
                        disabled={updatingId === booking._id}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {updatingId === booking._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Accept Job Request <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    {/* Action 2: Enter Customer OTP to Start Accepted Job */}
                    {booking.status === "ACCEPTED" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-digit OTP"
                            value={otpInputs[booking._id] || ""}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [booking._id]: e.target.value })}
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-center tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleStartJobWithOtp(booking._id)}
                            disabled={updatingId === booking._id}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            {updatingId === booking._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-3.5 h-3.5 fill-white" /> Start</>}
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold block text-center">
                          Ask customer for the 4-digit OTP shown in their booking.
                        </span>
                      </div>
                    )}

                    {/* Action 3: Mark In-Progress Job as Completed */}
                    {booking.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleCompleteJob(booking._id)}
                        disabled={updatingId === booking._id}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {updatingId === booking._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Mark Job Completed
                          </>
                        )}
                      </button>
                    )}

                    {/* Completed Badge */}
                    {booking.status === "COMPLETED" && (
                      <div className="bg-emerald-50 text-emerald-800 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Job Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ProviderLayout>
  );
}
