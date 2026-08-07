import React, { useState, useEffect } from 'react';
import { X, Loader2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { StarRating } from './StarRating';

interface ReviewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    existingRating?: number;
    existingComment?: string;
    serviceName?: string;
    isSubmitting?: boolean;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    existingRating = 0,
    existingComment = '',
    serviceName = 'Service',
    isSubmitting = false,
}) => {
    const [rating, setRating] = useState<number>(existingRating || 5);
    const [comment, setComment] = useState<string>(existingComment || '');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setRating(existingRating || 5);
            setComment(existingComment || '');
            setError('');
        }
    }, [isOpen, existingRating, existingComment]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating < 1 || rating > 5) {
            setError('Please select a star rating (1 to 5).');
            return;
        }

        try {
            setError('');
            await onSubmit(rating, comment);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Failed to submit review.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-900">
                            {existingRating ? 'Edit Your Review' : 'Rate & Review Service'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-xs">
                            {serviceName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Star Selection */}
                    <div className="flex flex-col items-center justify-center space-y-2 py-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Your Overall Rating
                        </label>
                        <StarRating
                            value={rating}
                            onChange={(r) => setRating(r)}
                            size="xl"
                        />
                        <span className="text-xs font-black text-amber-600">
                            {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
                            {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
                            {rating === 3 && 'Average ⭐⭐⭐'}
                            {rating === 2 && 'Poor ⭐⭐'}
                            {rating === 1 && 'Terrible ⭐'}
                        </span>
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            Your Feedback & Comment (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details of your experience with this service..."
                            rows={4}
                            maxLength={1000}
                            className="w-full p-3.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        />
                        <div className="text-right text-[11px] text-gray-400 font-medium">
                            {comment.length} / 1000 characters
                        </div>
                    </div>

                    {/* Notice */}
                    <p className="text-[11px] text-gray-400 text-center font-medium">
                        🔒 One review per verified customer. You can edit your review at any time.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>{existingRating ? 'Update Review' : 'Submit Review'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
