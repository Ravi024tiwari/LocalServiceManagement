import type { FC } from "react";
import { 
  ShieldCheck, 
  CalendarCheck, 
  Receipt, 
  Clock, 
  Headphones 
} from "lucide-react";

export const WhyChooseUs: FC = () => {
  const features = [
    {
      title: "Trusted Professionals",
      description: "All providers are verified, trained & experienced.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Easy Booking",
      description: "Book services in just a few taps.",
      icon: <CalendarCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Transparent Pricing",
      description: "No hidden charges. Pay what you see.",
      icon: <Receipt className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "On-time Service",
      description: "We value your time. Always on schedule.",
      icon: <Clock className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "24/7 Support",
      description: "Our support team is always here to help.",
      icon: <Headphones className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/70 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Choose ServiceHub?
          </h2>
          <p className="text-base text-gray-600 mt-2">
            We deliver high-quality, transparent, and hassle-free home care solutions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center sm:text-left flex flex-col items-center sm:items-start group"
            >
              {/* Feature Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <div className="group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
