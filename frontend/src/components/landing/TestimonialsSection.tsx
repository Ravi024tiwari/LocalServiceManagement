import type { FC } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { Star, ArrowRight, Quote } from "lucide-react";
import { ImageWithSkeleton } from "../common/ImageWithSkeleton";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
}

export const TestimonialsSection: FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ravi Sharma",
      location: "Bengaluru",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
      rating: 5,
      comment: "Excellent service! The plumber was on time and fixed the leak quickly."
    },
    {
      id: 2,
      name: "Neha Iyer",
      location: "Bengaluru",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
      rating: 5,
      comment: "Booked cleaning service and was amazed by the quality. Very professional team!"
    },
    {
      id: 3,
      name: "Arjun Patel",
      location: "Bengaluru",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
      rating: 5,
      comment: "Best experience so far. Easy booking and great customer support."
    }
  ];

  return (
    <section className="py-16 bg-gray-50/60 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Real reviews from real homeowners who trust ServiceHub
            </p>
          </div>

          <Link
            to="/service/1/reviews"
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            <span>View all reviews</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group"
            >
              <Quote className="w-8 h-8 text-emerald-100 absolute top-5 right-5 pointer-events-none group-hover:text-emerald-200 transition-colors" />

              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <ImageWithSkeleton
                    src={item.avatar}
                    alt={item.name}
                    containerClassName="w-12 h-12 rounded-full ring-2 ring-emerald-100 shrink-0"
                    className="w-full h-full object-cover"
                  />
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{item.location}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Card Footer accent line */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span>Verified Booking</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[0, 1, 2].map((dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveSlide(dotIdx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSlide === dotIdx ? "w-8 bg-emerald-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
