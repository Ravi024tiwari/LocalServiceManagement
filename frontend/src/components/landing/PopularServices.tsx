import type { FC } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Sparkles, 
  Wrench, 
  Zap, 
  Bug, 
  Wind, 
  Paintbrush, 
  ArrowRight 
} from "lucide-react";

interface CategoryCard {
  id: string;
  name: string;
  price: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export const PopularServices: FC = () => {
  const navigate = useNavigate();

  const categories: CategoryCard[] = [
    {
      id: "cleaning",
      name: "Home Cleaning",
      price: "Starting at ₹399",
      icon: <Sparkles className="w-7 h-7" />,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "hover:border-emerald-300"
    },
    {
      id: "plumbing",
      name: "Plumbing",
      price: "Starting at ₹299",
      icon: <Wrench className="w-7 h-7" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "hover:border-blue-300"
    },
    {
      id: "electrical",
      name: "Electrical",
      price: "Starting at ₹299",
      icon: <Zap className="w-7 h-7" />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "hover:border-amber-300"
    },
    {
      id: "pest-control",
      name: "Pest Control",
      price: "Starting at ₹499",
      icon: <Bug className="w-7 h-7" />,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      borderColor: "hover:border-teal-300"
    },
    {
      id: "ac-repair",
      name: "AC Repair",
      price: "Starting at ₹499",
      icon: <Wind className="w-7 h-7" />,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "hover:border-purple-300"
    },
    {
      id: "painting",
      name: "Painting",
      price: "Starting at ₹399",
      icon: <Paintbrush className="w-7 h-7" />,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      borderColor: "hover:border-rose-300"
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/nearby-services?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="services" className="py-16 bg-gray-50/50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Popular Services
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Explore our most requested home repair & care solutions
            </p>
          </div>

          <Link
            to="/nearby-services"
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            <span>View all services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group relative p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center ${cat.borderColor}`}
            >
              {/* Category Icon Container */}
              <div className={`w-14 h-14 mx-auto rounded-2xl ${cat.bgColor} ${cat.iconColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                {cat.icon}
              </div>

              {/* Title & Pricing */}
              <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs font-medium text-gray-500 mt-1">
                {cat.price}
              </p>

              {/* Subtle hover indicator dot */}
              <div className="mt-3 w-1.5 h-1.5 mx-auto rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
