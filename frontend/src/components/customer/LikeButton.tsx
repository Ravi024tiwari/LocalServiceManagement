import React from "react";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleLikeServiceThunk, optimisticToggleLike } from "@/store/slices/likedServiceSlice";

interface LikeButtonProps {
  serviceId: string;
  className?: string;
  size?: number;
  onToggleComplete?: (isLiked: boolean) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  serviceId,
  className = "",
  size = 18,
  onToggleComplete,
}) => {
  const dispatch = useAppDispatch();
  const likedIds = useAppSelector((state) => state.likedService.likedIds);
  const isLiked = likedIds.includes(serviceId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Perform optimistic state mutation in Redux store for zero latency response
    dispatch(optimisticToggleLike(serviceId));

    try {
      const res = await dispatch(toggleLikeServiceThunk(serviceId)).unwrap();
      if (onToggleComplete) {
        onToggleComplete(res.isLiked);
      }
    } catch (err) {
      console.error("Failed to toggle like state:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isLiked ? "Remove from Liked" : "Save to Liked Services"}
      className={`p-2 rounded-full transition-all duration-200 shadow-sm flex items-center justify-center ${
        isLiked
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-white/90 hover:bg-white text-gray-400 hover:text-red-500"
      } ${className}`}
    >
      <Heart
        size={size}
        className={`transition-transform duration-200 ${
          isLiked ? "fill-white text-white scale-105" : "text-gray-500"
        }`}
      />
    </button>
  );
};

export default LikeButton;
