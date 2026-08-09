import type { FC } from "react";
import { 
  Search, 
  Calendar, 
  UserCheck, 
  CheckCircle2 
} from "lucide-react";

export const HowItWorks: FC = () => {
  const steps = [
    {
      number: 1,
      title: "Choose a Service",
      description: "Select the service you need from our wide range.",
      icon: <Search className="w-6 h-6 text-emerald-600" />
    },
    {
      number: 2,
      title: "Book Instantly",
      description: "Pick a date and time that works for you.",
      icon: <Calendar className="w-6 h-6 text-emerald-600" />
    },
    {
      number: 3,
      title: "Professional at Work",
      description: "Our expert arrives on time and gets the job done.",
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      number: 4,
      title: "Pay & Relax",
      description: "Pay securely and enjoy quality service.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            How it Works
          </h2>
          <p className="text-base text-gray-600 mt-2">
            Get your home services done in 4 simple and effortless steps
          </p>
        </div>

        {/* Desktop Layout (Horizontal Stepper with connector lines) */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8 relative">
          
          {/* Subtle Connecting Line */}
          <div className="absolute top-10 left-[12%] right-[12%] h-0.5 bg-dashed border-t-2 border-dashed border-emerald-200 -z-0" />

          {steps.map((step) => (
            <div key={step.number} className="relative z-10 text-center flex flex-col items-center group">
              
              {/* Step Circle Badge */}
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <div className="group-hover:text-white transition-colors">
                  {step.icon}
                </div>
              </div>

              {/* Step Number Tag */}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                Step 0{step.number}
              </span>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs">
                {step.description}
              </p>

            </div>
          ))}
        </div>

        {/* Mobile & Tablet Layout (Vertical Stepper Timeline) */}
        <div className="lg:hidden space-y-8 max-w-md mx-auto relative">
          
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-emerald-200" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex items-start gap-5 pl-2">
              
              {/* Step Number Badge */}
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-md">
                {step.number}
              </div>

              {/* Card Details */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-100">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};
