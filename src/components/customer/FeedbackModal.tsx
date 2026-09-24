'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { Star, X, CheckCircle2, MessageSquareHeart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (orderId: string, rating: number, note: string) => Promise<void>;
}

const RATING_LABELS = [
  'Rất không hài lòng 😞',
  'Chưa hài lòng 🙁',
  'Bình thường 😐',
  'Hài lòng 😊',
  'Rất tuyệt vời! 😍',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    try {
      await onSubmit(order.id, rating, note.trim());
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setNote('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Submit feedback failed:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Cảm ơn bạn!</h3>
            <p className="text-sm text-stone-500">
              Đánh giá của bạn giúp chúng tôi cải thiện chất lượng phục vụ ngày càng tốt hơn.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <MessageSquareHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Đánh giá món ăn</h3>
                  <p className="text-xs text-stone-500">
                    Đơn #{order.id.slice(-5).toUpperCase()} - Đã phục vụ
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold text-stone-600">
                  Bạn cảm thấy món ăn &amp; dịch vụ như thế nào?
                </p>

                {/* Star rating picker */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform duration-150 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="h-6">
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {RATING_LABELS[activeRating - 1]}
                  </span>
                </div>
              </div>

              {/* Note input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Chia sẻ thêm ý kiến (không bắt buộc)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hương vị, độ ngọt, thời gian phục vụ..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none placeholder:text-stone-400"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-100 transition active:scale-95"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-wide shadow-xs shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
