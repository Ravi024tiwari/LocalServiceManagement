import CustomerLayout from "@/layout/CustomerLayout";
import { BaseUserProfileForm } from "@/components/profile/BaseUserProfileForm";
import { User, ShieldCheck } from "lucide-react";

export default function CustomerProfile() {
  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* PAGE HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account Profile</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your personal information, contact details, and account security.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Customer Account
          </div>
        </div>

        {/* PROFILE FORM */}
        <BaseUserProfileForm />
      </div>
    </CustomerLayout>
  );
}
