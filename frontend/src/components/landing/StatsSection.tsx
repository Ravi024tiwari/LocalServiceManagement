import type { FC } from "react";
import { Users, ShieldCheck, CheckCircle2, Star } from "lucide-react";

export const StatsSection: FC = () => {
  const stats = [
    {
      value: "50K+",
      label: "Happy Customers",
      icon: <Users className="w-6 h-6 text-emerald-600" />
    },
    {
      value: "10K+",
      label: "Verified Professionals",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      value: "1L+",
      label: "Services Completed",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />
    },
    {
      value: "4.7/5",
      label: "Average Rating",
      icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
    }
  ];

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              <div className="mb-2 p-2 rounded-xl bg-white shadow-xs">
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
