import type { FC } from "react";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export const NewsletterSection: FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <section className="py-14 bg-emerald-50/70 border-b border-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Stay Updated with Our Latest Offers
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Subscribe to get exclusive deals, discount codes, and seasonal updates.
          </p>
        </div>

        {isSubscribed ? (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center gap-2 max-w-md mx-auto animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-semibold">Thank you for subscribing! Check your inbox soon.</span>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
          >
            <div className="relative w-full">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        )}

      </div>
    </section>
  );
};
