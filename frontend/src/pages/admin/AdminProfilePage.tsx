import AdminLayout from "@/layout/AdminLayout";
import { BaseUserProfileForm } from "@/components/profile/BaseUserProfileForm";
import { ShieldCheck, UserCheck } from "lucide-react";

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* PAGE HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrator Profile</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your system admin credentials, contact info, and security settings.
              </p>
            </div>
          </div>

          <div className="bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> Super Admin Credentials
          </div>
        </div>

        {/* PROFILE FORM WITH ADMIN BADGING */}
        <BaseUserProfileForm isAdmin={true} />
      </div>
    </AdminLayout>
  );
}
