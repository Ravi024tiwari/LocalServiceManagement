import { Clock, ShieldAlert, Lock, ArrowRight, RefreshCw } from "lucide-react";
import { type ProviderProfileData } from "@/services/providerProfile.service";

interface VerificationPendingBannerProps {
  profile: ProviderProfileData | null;
  onRefresh?: () => void;
}

export default function VerificationPendingBanner({ profile, onRefresh }: VerificationPendingBannerProps) {
  const isRejected = profile?.verification_status === "REJECTED";

  return (
    <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md p-6 md:p-8 space-y-6 animate-fadeIn">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 rounded-2xl border border-orange-200/60">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
            {isRejected ? <ShieldAlert className="w-7 h-7" /> : <Clock className="w-7 h-7 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                isRejected ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-800"
              }`}>
                {isRejected ? "Verification Rejected" : "Pending Admin Verification"}
              </span>
              <span className="text-xs text-gray-400 font-semibold">• Standard Review (24-48 Hours)</span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
              {isRejected ? "Your Profile Requires Action" : "Your Provider Profile is Under Review ⏳"}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              {isRejected
                ? "Your document verification request was rejected by admin. Please contact support or update your profile details to re-apply."
                : "Thank you for applying to become a provider on ServiceHub! Our admin team is reviewing your uploaded identity documents and availability schedule."}
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:border-orange-300 text-gray-800 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0 self-start md:self-center"
          >
            <RefreshCw className="w-4 h-4 text-orange-600" /> Refresh Status
          </button>
        )}
      </div>

      {/* VERIFICATION TIMELINE STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">1. Application Submitted</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">Bio, experience, and availability recorded.</p>
          </div>
        </div>

        <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-bounce">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-950">2. Document Review in Progress</h4>
            <p className="text-[11px] text-orange-800 mt-0.5">Identity proofs being verified by compliance team.</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3 opacity-60">
          <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-700">3. Dashboard & Bookings Unlocked</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Start accepting customer service requests.</p>
          </div>
        </div>
      </div>

      {/* LOCKED ACTIONS NOTICE */}
      <div className="p-5 bg-gray-50 border border-gray-200/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200/80 text-gray-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">Service Creation Locked</h4>
            <p className="text-xs text-gray-500">
              You will be able to create services and receive customer bookings as soon as your account is verified.
            </p>
          </div>
        </div>

        <a
          href="/"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
        >
          Return to Customer Portal <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
