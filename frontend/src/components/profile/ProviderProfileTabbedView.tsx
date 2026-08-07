import React, { useState, useEffect } from "react";
import { 
  User, Briefcase, Clock, FileText, CheckCircle2, AlertTriangle, XCircle, 
  Save, Loader2, Calendar, ShieldCheck, Sparkles, Plus, Trash2, ExternalLink
} from "lucide-react";
import { BaseUserProfileForm } from "./BaseUserProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile, updateProviderProfileDetails } from "@/store/slices/providerProfileSlice";
import {type TimeSlot } from "@/services/providerProfile.service";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const DEFAULT_SCHEDULE: TimeSlot[] = DAYS_OF_WEEK.map((day) => ({
  day: day as TimeSlot["day"],
  start_time: "09:00",
  end_time: "18:00",
  is_closed: day === "Sunday",
}));

export const ProviderProfileTabbedView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, verification_status } = useAppSelector((state) => state.providerProfile);

  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "availability">("personal");
  
  // Professional Details State
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [providerBio, setProviderBio] = useState<string>("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [newDocUrl, setNewDocUrl] = useState<string>("");

  // Availability State
  const [availability, setAvailability] = useState<TimeSlot[]>(DEFAULT_SCHEDULE);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProviderProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      if (profile.experience_years !== undefined) setExperienceYears(profile.experience_years);
      if (profile.bio) setProviderBio(profile.bio);
      if (profile.documents) setDocuments(profile.documents);
      if (profile.availability && profile.availability.length > 0) {
        // Merge fetched availability with default days to ensure all 7 days exist
        const merged = DAYS_OF_WEEK.map((day) => {
          const found = profile.availability.find((a) => a.day === day);
          return found || { day: day as TimeSlot["day"], start_time: "09:00", end_time: "18:00", is_closed: false };
        });
        setAvailability(merged);
      }
    }
  }, [profile]);

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setLocalError(null);
    setSavedSuccess(null);

    try {
      await dispatch(
        updateProviderProfileDetails({
          experience_years: Number(experienceYears),
          bio: providerBio,
        })
      ).unwrap();

      setSavedSuccess("Professional details updated successfully!");
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to update professional details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setLocalError(null);
    setSavedSuccess(null);

    try {
      await dispatch(
        updateProviderProfileDetails({
          availability,
        })
      ).unwrap();

      setSavedSuccess("Working hours & availability updated successfully!");
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to update availability schedule");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDayClosed = (dayName: string) => {
    setAvailability((prev) =>
      prev.map((slot) => (slot.day === dayName ? { ...slot, is_closed: !slot.is_closed } : slot))
    );
  };

  const handleTimeChange = (dayName: string, field: "start_time" | "end_time", value: string) => {
    setAvailability((prev) =>
      prev.map((slot) => (slot.day === dayName ? { ...slot, [field]: value } : slot))
    );
  };

  const handleApplyNineToFiveAll = () => {
    setAvailability((prev) =>
      prev.map((slot) => ({
        ...slot,
        start_time: "09:00",
        end_time: "18:00",
        is_closed: slot.day === "Sunday",
      }))
    );
  };

  const handleAddDocumentLink = () => {
    if (!newDocUrl.trim()) return;
    setDocuments((prev) => [...prev, newDocUrl.trim()]);
    setNewDocUrl("");
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* VERIFICATION STATUS BADGE HEADER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Service Provider Portal</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                Provider Account
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your personal info, verification credentials, and weekly availability schedule.
            </p>
          </div>
        </div>

        {/* VERIFICATION BADGE */}
        <div>
          {verification_status === "APPROVED" && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified & Approved Provider
            </div>
          )}
          {verification_status === "PENDING" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Verification Under Review
            </div>
          )}
          {verification_status === "REJECTED" && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <XCircle className="w-4 h-4 text-red-600" />
              Verification Action Required
            </div>
          )}
          {verification_status === "UNAPPLIED" && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              Application Not Submitted
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS / ERROR TOAST ALERTS */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{savedSuccess}</p>
        </div>
      )}

      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-semibold">{localError}</p>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 space-x-2 sm:space-x-8 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`pb-4 pt-1 px-2 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "personal"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-4 h-4" /> Personal Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("professional")}
          className={`pb-4 pt-1 px-2 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "professional"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Professional & Credentials
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`pb-4 pt-1 px-2 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "availability"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock className="w-4 h-4" /> Working Hours & Schedule
        </button>
      </div>

      {/* TAB CONTENTS */}
      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === "personal" && (
        <div className="animate-in fade-in duration-200">
          <BaseUserProfileForm onSuccess={() => dispatch(fetchProviderProfile())} />
        </div>
      )}

      {/* TAB 2: PROFESSIONAL & DOCUMENTS */}
      {activeTab === "professional" && (
        <form onSubmit={handleSaveProfessional} className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> Work Experience & Business Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Years */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Years of Professional Experience</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5"
                  className="rounded-xl border-gray-200 focus:ring-indigo-500"
                />
              </div>

              {/* Verification Status Read-only info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Verification Status</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm flex items-center justify-between text-gray-700">
                  <span className="font-semibold">{verification_status}</span>
                  <span className="text-xs text-gray-400">Admin Managed</span>
                </div>
              </div>
            </div>

            {/* Business Bio / Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Professional Bio & Service Description</label>
              <textarea
                rows={4}
                value={providerBio}
                onChange={(e) => setProviderBio(e.target.value)}
                placeholder="Describe your expertise, certifications, specialities, and equipment..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* DOCUMENTS & CERTIFICATIONS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Identity & Verification Documents
            </h3>
            <p className="text-xs text-gray-500">
              Government ID, Trade Licenses, or Business Certificates submitted for account verification.
            </p>

            {/* Document List */}
            <div className="space-y-3 pt-2">
              {documents.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                  No verification documents uploaded yet.
                </div>
              ) : (
                documents.map((docUrl, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <a 
                        href={docUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-medium text-indigo-600 hover:underline truncate flex items-center gap-1"
                      >
                        Document #{idx + 1} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove document link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Document URL */}
            <div className="pt-2 flex items-center gap-2">
              <Input
                type="url"
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                placeholder="Paste document cloud URL (e.g., https://...)"
                className="rounded-xl border-gray-200 text-xs"
              />
              <Button
                type="button"
                onClick={handleAddDocumentLink}
                variant="outline"
                className="rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Document
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Professional Profile
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: WORKING HOURS & AVAILABILITY */}
      {activeTab === "availability" && (
        <form onSubmit={handleSaveAvailability} className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Weekly Availability Schedule
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Customers can only book services during your active working hours.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleApplyNineToFiveAll}
                variant="outline"
                className="rounded-xl text-xs font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Standard 9 AM - 6 PM Schedule
              </Button>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="space-y-3">
              {availability.map((slot) => (
                <div 
                  key={slot.day}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    slot.is_closed 
                      ? "bg-gray-50/70 border-gray-200 opacity-70" 
                      : "bg-white border-gray-200 shadow-2xs hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-center gap-3 w-36">
                    <span className="font-semibold text-sm text-gray-900">{slot.day}</span>
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    {!slot.is_closed ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">From:</span>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => handleTimeChange(slot.day, "start_time", e.target.value)}
                            className="w-28 text-xs rounded-lg border-gray-200 py-1"
                          />
                        </div>
                        <span className="text-gray-400 text-xs">to</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">To:</span>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => handleTimeChange(slot.day, "end_time", e.target.value)}
                            className="w-28 text-xs rounded-lg border-gray-200 py-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        Closed / Day Off
                      </span>
                    )}
                  </div>

                  {/* Closed Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!slot.is_closed} 
                        onChange={() => handleToggleDayClosed(slot.day)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ml-2 text-xs font-medium text-gray-600">
                        {slot.is_closed ? "Off" : "Open"}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Availability Schedule
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
