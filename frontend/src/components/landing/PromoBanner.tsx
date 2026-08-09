import type { FC } from "react";
import { useNavigate } from "react-router";
import { Ticket, ArrowRight } from "lucide-react";
import { ImageWithSkeleton } from "../common/ImageWithSkeleton";

export const PromoBanner: FC = () => {
  const navigate = useNavigate();

  return (
    <section id="offers" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Outer Container */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white overflow-hidden shadow-xl border border-emerald-600/30">
          
          {/* Decorative SVG Patterns */}
          <div className="absolute top-0 right-0 -z-0 w-96 h-96 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold tracking-wide">
                <Ticket className="w-3.5 h-3.5 text-amber-300" />
                Special New Customer Offer
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Get 20% OFF on Your First Booking!
              </h2>

              {/* Coupon Code Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <p className="text-sm sm:text-base text-emerald-100 font-medium">
                  Use code:
                </p>
                <span className="px-4 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-amber-300 font-mono font-bold tracking-widest text-base sm:text-lg shadow-inner">
                  WELCOME20
                </span>
              </div>

              {/* Book Now Action Button */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/nearby-services")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-lg cursor-pointer group"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Right Banner Image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-xs sm:max-w-sm w-full rounded-2xl overflow-hidden border-2 border-emerald-400/30 shadow-2xl">
                <ImageWithSkeleton
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
                  alt="Happy Service Customer"
                  containerClassName="w-full h-48 sm:h-56"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-emerald-200 z-10">
                  Instant savings applied at checkout
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
