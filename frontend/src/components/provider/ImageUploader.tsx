import React from "react";
import { Upload, Plus, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  files: File[];
  previewUrls: string[];
  onChange: (files: File[], previewUrls: string[]) => void;
}

export default function ImageUploader({ files, previewUrls, onChange }: ImageUploaderProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    const newFiles = [...files];
    const newPreviews = [...previewUrls];

    const objectUrl = URL.createObjectURL(selectedFile);

    if (slotIndex < newFiles.length) {
      // Replace existing slot
      newFiles[slotIndex] = selectedFile;
      newPreviews[slotIndex] = objectUrl;
    } else {
      // Add new file
      newFiles.push(selectedFile);
      newPreviews.push(objectUrl);
    }

    onChange(newFiles.slice(0, 4), newPreviews.slice(0, 4));
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    onChange(newFiles, newPreviews);
  };

  return (
    <div className="space-y-4">
      {/* 4 Image Upload Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((index) => {
          const hasImage = index < previewUrls.length;
          const previewUrl = previewUrls[index];

          if (hasImage) {
            return (
              <div
                key={index}
                className="relative group aspect-square rounded-2xl border-2 border-emerald-500/30 overflow-hidden bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <img
                  src={previewUrl}
                  alt={`Service image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Primary Cover Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                    Cover Image
                  </div>
                )}

                {/* Delete overlay button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md opacity-90 transition-all group-hover:opacity-100"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          // Slot is empty
          const isMainSlot = index === 0 && previewUrls.length === 0;

          return (
            <label
              key={index}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                isMainSlot
                  ? "border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500"
                  : "border-gray-200 bg-gray-50/50 hover:border-emerald-400 hover:bg-emerald-50/20"
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelect(e, index)}
              />

              {isMainSlot ? (
                <div className="flex flex-col items-center text-center p-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Upload Image</span>
                  <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
                    JPG, PNG up to 5MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-1 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Add Image</span>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Helper Banner matching design */}
      <div className="flex items-center gap-2.5 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium">
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <ImageIcon className="w-3 h-3" />
        </div>
        <span>You can upload up to 4 images. First image will be your service cover.</span>
      </div>
    </div>
  );
}
