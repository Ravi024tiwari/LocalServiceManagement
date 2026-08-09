import type { FC, ImgHTMLAttributes } from "react";
import { useState } from "react";
import { Sparkles } from "lucide-react";

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const ImageWithSkeleton: FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Animated Skeleton Shimmer Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-emerald-100/70 to-gray-200 bg-[length:200%_100%] animate-pulse flex flex-col items-center justify-center z-10">
          <Sparkles className="w-5 h-5 text-emerald-600/60 animate-bounce mb-1" />
          <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">
            Loading...
          </span>
        </div>
      )}

      {/* Fallback image placeholder if image fails to load */}
      {hasError ? (
        <div className="w-full h-full bg-emerald-100/80 flex items-center justify-center p-4 text-xs font-bold text-emerald-800">
          ServiceHub
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-700 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
