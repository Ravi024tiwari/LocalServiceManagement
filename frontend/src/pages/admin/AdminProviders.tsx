import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  ChevronDown,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  Clock,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

import AdminLayout from "@/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchAdminProviders,
  updateProviderStatusThunk,
  setSearchQuery,
  setStatusFilter,
  setPage,
  setSelectedProviderDetail,
} from "@/store/slices/adminProviderSlice";

// Shadcn UI Table Primitives
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminProviders() {
  const dispatch = useAppDispatch();

  // Redux Store State
  const {
    providers,
    pagination,
    stats,
    filters,
    selectedProviderDetail,
    isLoading,
    isSubmitting,
  } = useAppSelector((state) => state.adminProvider);

  // Local Search State
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to Redux and fetch API
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(
      fetchAdminProviders({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        status: filters.status,
      })
    );
  }, [debouncedSearch, dispatch]);

  const handleTabChange = (statusKey: string) => {
    dispatch(setStatusFilter(statusKey));
    dispatch(
      fetchAdminProviders({
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusKey,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPage(newPage));
    dispatch(
      fetchAdminProviders({
        page: newPage,
        limit: pagination.limit,
        search: debouncedSearch,
        status: filters.status,
      })
    );
  };

  const handleUpdateStatus = (providerProfileId: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    dispatch(updateProviderStatusThunk({ providerProfileId, status }));
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* HEADER TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              Provider Verification & Management
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Review documents, verify provider applications, and manage active platform providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Access
            </span>
          </div>
        </div>

        {/* METRICS & STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Providers */}
          <div
            onClick={() => handleTabChange("ALL")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              filters.status === "ALL"
                ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Providers
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-gray-900 block mt-2">
              {stats.total.toLocaleString()}
            </span>
          </div>

          {/* Card 2: Pending Verification */}
          <div
            onClick={() => handleTabChange("PENDING")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              filters.status === "PENDING"
                ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20"
                : "bg-white border-gray-100 hover:border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Pending Verification
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-amber-600">{stats.pending}</span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Needs Review
              </span>
            </div>
          </div>

          {/* Card 3: Verified & Active */}
          <div
            onClick={() => handleTabChange("APPROVED")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              filters.status === "APPROVED"
                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-white border-gray-100 hover:border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Verified & Active
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-600 block mt-2">
              {stats.approved.toLocaleString()}
            </span>
          </div>

          {/* Card 4: Rejected / Suspended */}
          <div
            onClick={() => handleTabChange("REJECTED")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              filters.status === "REJECTED"
                ? "bg-red-50/80 border-red-300 ring-2 ring-red-500/20"
                : "bg-white border-gray-100 hover:border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Rejected / Suspended
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-red-600 block mt-2">
              {stats.rejected}
            </span>
          </div>
        </div>

        {/* STATUS FILTER TABS & SEARCH BAR */}
        <div className="bg-white p-3 lg:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Providers", count: stats.total },
              { id: "PENDING", label: "Pending Verification", count: stats.pending, badgeColor: "bg-amber-500 text-white" },
              { id: "APPROVED", label: "Verified & Active", count: stats.approved, badgeColor: "bg-emerald-100 text-emerald-800" },
              { id: "REJECTED", label: "Rejected", count: stats.rejected, badgeColor: "bg-red-100 text-red-800" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  filters.status === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      filters.status === tab.id
                        ? "bg-white/20 text-white"
                        : tab.badgeColor || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search provider by name, email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* PROVIDER HISTORY TABLE CARD CONTAINER */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Provider Applications</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Showing {providers.length} of {pagination.totalProviders} providers
              </p>
            </div>
          </div>

          {/* DESKTOP SHADCN UI TABLE VIEW */}
          <div className="hidden lg:block overflow-x-auto">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-gray-500 font-semibold">Loading provider applications...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">No Providers Found</h3>
                <p className="text-xs text-gray-500">
                  No provider profiles match the selected status filter or search query.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-gray-100">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5 pl-6">
                      PROVIDER
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      EXPERIENCE
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      DOCUMENTS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      APPLIED DATE
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 py-3.5">
                      STATUS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right pr-6 py-3.5">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {providers.map((p) => (
                    <TableRow key={p.providerProfileId} className="hover:bg-gray-50/60 border-gray-100 transition-colors">
                      {/* PROVIDER */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar || "https://i.pravatar.cc/150?img=11"}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                          />
                          <div>
                            <span className="font-bold text-gray-900 text-xs block leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block -mt-0.5">
                              {p.email}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              {p.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* EXPERIENCE */}
                      <TableCell className="py-4 font-bold text-xs text-gray-700">
                        {p.experience_years} Years Exp.
                      </TableCell>

                      {/* DOCUMENTS */}
                      <TableCell className="py-4">
                        {p.documents && p.documents.length > 0 ? (
                          <span
                            onClick={() => dispatch(setSelectedProviderDetail(p))}
                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            {p.documents.length} Docs Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium italic">
                            No docs submitted
                          </span>
                        )}
                      </TableCell>

                      {/* APPLIED DATE */}
                      <TableCell className="py-4 text-xs font-semibold text-gray-600">
                        {p.appliedDate}
                      </TableCell>

                      {/* STATUS BADGE */}
                      <TableCell className="py-4">
                        {p.verification_status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : p.verification_status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                            <XCircle className="w-3 h-3 text-red-600" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                          </span>
                        )}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="pr-6 text-right py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => dispatch(setSelectedProviderDetail(p))}
                            title="View Profile & Documents"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {p.verification_status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(p.providerProfileId, "APPROVED")}
                              disabled={isSubmitting}
                              title="Approve Provider"
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          )}

                          {p.verification_status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(p.providerProfileId, "REJECTED")}
                              disabled={isSubmitting}
                              title="Reject Provider"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* MOBILE RESPONSIVE CARD VIEW */}
          <div className="lg:hidden divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-gray-500">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                Loading provider applications...
              </div>
            ) : providers.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 p-4">
                No providers match the selected tab filter.
              </div>
            ) : (
              providers.map((p) => (
                <div key={p.providerProfileId} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar || "https://i.pravatar.cc/150?img=11"}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                        <span className="text-[11px] text-gray-400 block">{p.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(setSelectedProviderDetail(p))}
                      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs">
                    <span className="font-medium text-gray-600">{p.experience_years} Yrs Experience</span>
                    {p.verification_status === "APPROVED" ? (
                      <span className="text-emerald-700 font-extrabold text-[10px] uppercase">APPROVED</span>
                    ) : p.verification_status === "REJECTED" ? (
                      <span className="text-red-700 font-extrabold text-[10px] uppercase">REJECTED</span>
                    ) : (
                      <span className="text-amber-700 font-extrabold text-[10px] uppercase">PENDING</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {p.verification_status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.providerProfileId, "APPROVED")}
                        className="w-1/2 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    {p.verification_status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.providerProfileId, "REJECTED")}
                        className="w-1/2 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2 bg-white">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pagination.currentPage === pageNum
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED PROVIDER PROFILE & DOCUMENTS PREVIEW MODAL */}
      {selectedProviderDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProviderDetail.avatar || "https://i.pravatar.cc/150?img=11"}
                  alt={selectedProviderDetail.name}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-200 shadow-sm"
                />
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {selectedProviderDetail.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedProviderDetail.email} • {selectedProviderDetail.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dispatch(setSelectedProviderDetail(null))}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Status & Experience Bar */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Status</span>
                  <span className="text-xs font-black text-emerald-700 block mt-0.5">
                    {selectedProviderDetail.verification_status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Experience</span>
                  <span className="text-xs font-black text-gray-900 block mt-0.5">
                    {selectedProviderDetail.experience_years} Years
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Applied On</span>
                  <span className="text-xs font-bold text-gray-700 block mt-0.5">
                    {selectedProviderDetail.appliedDate}
                  </span>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  About Provider & Bio
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  {selectedProviderDetail.bio || "No custom bio provided."}
                </p>
              </div>

              {/* Uploaded Documents Preview Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Uploaded Verification Documents ({selectedProviderDetail.documents?.length || 0})</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Identity Proof / Certification</span>
                </h4>

                {selectedProviderDetail.documents && selectedProviderDetail.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProviderDetail.documents.map((docUrl, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2 relative group overflow-hidden"
                      >
                        <div className="h-32 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                          <img
                            src={docUrl}
                            alt={`Document ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              // Fallback display if URL is document file rather than image
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <FileText className="w-8 h-8 text-gray-400 absolute" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-gray-700">Document #{idx + 1}</span>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                          >
                            <span>View Full</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 font-medium">
                    No verification documents have been uploaded by this provider yet.
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => dispatch(setSelectedProviderDetail(null))}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                {selectedProviderDetail.verification_status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedProviderDetail.providerProfileId, "REJECTED");
                      dispatch(setSelectedProviderDetail(null));
                    }}
                    className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold"
                  >
                    Reject Application
                  </button>
                )}

                {selectedProviderDetail.verification_status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedProviderDetail.providerProfileId, "APPROVED");
                      dispatch(setSelectedProviderDetail(null));
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Approve Provider
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
