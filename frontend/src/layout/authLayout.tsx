import { type ReactNode } from "react";
import { ShieldCheck, Zap, Lock, MapPin, Quote } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* LEFT PANEL - Branding & Trust Signals */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-10 xl:p-14 bg-gradient-to-b from-[#f2faf5] to-[#e6f5ea] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">ServiceHub</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Trusted by 10,000+ happy customers
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Find Trusted <br />
            Local <span className="text-emerald-600">Services</span> <br />
            Near You
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed">
            Book verified professionals for your home and business needs. Fast, reliable, and hassle-free.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-lg mb-8">
            <Feature icon={<ShieldCheck />} title="Verified Professionals" desc="Background checked" />
            <Feature icon={<Zap />} title="Instant Booking" desc="Book in just a few taps" />
            <Feature icon={<Lock />} title="Secure Payments" desc="100% safe transactions" />
            <Feature icon={<MapPin />} title="Nearby Services" desc="Professionals near you" />
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl max-w-md border border-white transition-transform hover:-translate-y-1 duration-300">
          <Quote className="text-emerald-200 h-8 w-8 mb-2 absolute top-3 left-3 opacity-50" />
          <p className="text-gray-700 italic relative z-10 pl-5 text-sm font-medium mb-3">
            "ServiceHub made it so easy to find trusted professionals near me."
          </p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
              <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
              <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs font-bold text-gray-700 ml-1">4.8/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Forms injected here */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-gray-50/30">
        <div className="w-full max-w-md transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Helper component for the left panel features
function Feature({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
  return (
    <div className="group">
      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 text-emerald-600 transition-transform group-hover:scale-110 duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}