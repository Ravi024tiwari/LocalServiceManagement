import React, { useState } from "react";
import { 
  X, Briefcase, FileText, Upload, Clock, CheckCircle2, 
  AlertCircle, Loader2, ArrowRight, ArrowLeft, ShieldCheck
} from "lucide-react";
import { type TimeSlot } from "@/services/providerProfile.service";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch } from "@/store/hooks";
import { submitProviderApplication } from "@/store/slices/providerProfileSlice";

interface BecomeProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK: TimeSlot['day'][] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function BecomeProviderModal({ isOpen, onClose, onSuccess }: BecomeProviderModalProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [availability, setAvailability] = useState<TimeSlot[]>(
    DAYS_OF_WEEK.map((day) => ({
      day,
      start_time: "09:00",
      end_time: "18:00",
      is_closed: day === 'Sunday', // default Sunday closed
    }))
  );

  // State statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  // Handle document file selection
  const handleDocumentAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...documentFiles, ...selectedFiles].slice(0, 4);
    setDocumentFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setDocumentPreviews(newPreviews);
  };

  const handleDocumentRemove = (index: number) => {
    const newFiles = documentFiles.filter((_, i) => i !== index);
    const newPreviews = documentPreviews.filter((_, i) => i !== index);
    setDocumentFiles(newFiles);
    setDocumentPreviews(newPreviews);
  };

  // Toggle availability slot
  const handleTimeSlotChange = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  // Submit Application
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!bio.trim()) {
      setStep(1);
      return setErrorMessage("Please enter a professional bio.");
    }
    if (documentFiles.length === 0) {
      setStep(2);
      return setErrorMessage("Please upload at least one verification identity document.");
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        submitProviderApplication({
          bio,
          experience_years: experienceYears,
          availability,
          documents: documentFiles,
        })
      ).unwrap();

      setSuccessMessage("Application submitted successfully! Redirecting to Provider Portal...");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        window.location.href = "/provider";
      }, 1200);
    } catch (err: any) {
      console.error("Become Provider Error:", err);
      setErrorMessage(
        typeof err === "string" ? err : err.message || "Failed to submit provider application."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold leading-tight">Become a Service Provider</h2>
              <p className="text-emerald-100 text-xs mt-0.5">Join ServiceHub and start earning by offering services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-emerald-50/60 border-b border-emerald-100 px-6 py-3 flex items-center justify-around text-xs font-bold shrink-0">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-emerald-700" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>1</span>
            <span>Profile Info</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-emerald-600 transition-all ${step >= 2 ? "w-full" : "w-0"}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-emerald-700" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>2</span>
            <span>Documents</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-emerald-600 transition-all ${step === 3 ? "w-full" : "w-0"}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 3 ? "text-emerald-700" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>3</span>
            <span>Availability</span>
          </div>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Error / Success Alerts */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: PROFILE INFO */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Professional Bio & Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Describe your skills, qualifications, and the services you specialize in..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
                <span className="text-[11px] font-semibold text-gray-400 block text-right mt-1">
                  {bio.length}/500
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    placeholder="Enter years of experience"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS UPLOAD */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Upload Identity & Verification Proof <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload Govt ID (Aadhaar/PAN/Passport), certifications, or business license proof.
                </p>

                {/* Document Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {documentPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl border-2 border-emerald-300 overflow-hidden bg-gray-50 group shadow-sm">
                      <img src={preview} alt={`Doc ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full opacity-90 hover:opacity-100 shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {documentFiles.length < 4 && (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-all p-3 text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        multiple
                        onChange={handleDocumentAdd}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-gray-800">Upload File</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, PDF</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Documents are encrypted and kept confidential for verification purposes only.</span>
              </div>
            </div>
          )}

          {/* STEP 3: WORK AVAILABILITY SCHEDULE */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Weekly Work Availability Schedule
                </label>
                <p className="text-xs text-gray-500 mb-3">Set your operating hours for customer bookings.</p>

                <div className="space-y-2.5">
                  {availability.map((slot, idx) => (
                    <div key={slot.day} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs">
                      <div className="w-24 font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {slot.day}
                      </div>

                      <div className="flex items-center gap-2">
                        {slot.is_closed ? (
                          <span className="text-gray-400 font-bold px-3 py-1 bg-gray-200/60 rounded-lg">Day Off / Closed</span>
                        ) : (
                          <>
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => handleTimeSlotChange(idx, "start_time", e.target.value)}
                              className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => handleTimeSlotChange(idx, "end_time", e.target.value)}
                              className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold"
                            />
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[10px] text-gray-500 font-medium">Closed</span>
                        <Switch
                          checked={slot.is_closed}
                          onCheckedChange={(val) => handleTimeSlotChange(idx, "is_closed", val)}
                          className="data-[state=checked]:bg-emerald-600 scale-90"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl bg-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !bio.trim()) return setErrorMessage("Please enter a bio.");
                setErrorMessage("");
                setStep((s) => (s + 1) as any);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submit Application
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
