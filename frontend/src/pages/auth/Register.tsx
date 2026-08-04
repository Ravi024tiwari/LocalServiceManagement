import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle, Briefcase, CheckCircle2, UserPlus } from "lucide-react";

import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/layout/authLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "CUSTOMER" },
  });

  const selectedRole = watch("role");
  const termsAccepted = watch("termsAccepted");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);
      navigate("/login"); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong during registration.";
      if (error.response?.data?.field === "email") {
        setError("email", { type: "manual", message: "This email is already in use." });
      } else {
        setError("root", { type: "manual", message: errorMessage });
      }
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <div className="mx-auto bg-emerald-100 text-emerald-600 rounded-full w-14 h-14 flex items-center justify-center mb-4 shadow-sm">
          <UserPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Create Your <span className="text-emerald-600">Account</span>
        </h2>
        <p className="text-gray-500 text-sm">Join ServiceHub and experience hassle-free booking.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("fullName")} placeholder="John Doe" className={`pl-9 py-3 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 ${errors.fullName ? "border-red-500" : ""}`} />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("email")} placeholder="john@example.com" className={`pl-9 py-3 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 ${errors.email ? "border-red-500" : ""}`} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Phone Number</label>
          <div className={`flex items-center border rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent ${errors.phone ? "border-red-500" : "border-gray-200"}`}>
            <div className="flex items-center pl-3 pr-2 py-3 border-r border-gray-100 bg-gray-50/50">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">🇮🇳 +91</span>
            </div>
            <Input {...register("phone")} placeholder="98765 43210" className="border-0 focus-visible:ring-0 py-3 rounded-none flex-1 bg-transparent shadow-none" />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`pl-9 pr-10 py-3 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 ${errors.password ? "border-red-500" : ""}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className={`pl-9 pr-10 py-3 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 ${errors.confirmPassword ? "border-red-500" : ""}`} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Register As</label>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => setValue("role", "CUSTOMER", { shouldValidate: true })} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRole === "CUSTOMER" ? "border-emerald-500 bg-emerald-50 shadow-sm scale-[1.02]" : "border-gray-100 hover:border-emerald-200 bg-white"}`}>
              {selectedRole === "CUSTOMER" && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-600 animate-in zoom-in" />}
              <UserCircle className={`h-6 w-6 mb-1 transition-colors ${selectedRole === "CUSTOMER" ? "text-emerald-600" : "text-gray-400"}`} />
              <span className={`font-bold text-sm ${selectedRole === "CUSTOMER" ? "text-emerald-900" : "text-gray-600"}`}>Customer</span>
            </div>
            <div onClick={() => setValue("role", "PROVIDER", { shouldValidate: true })} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRole === "PROVIDER" ? "border-emerald-500 bg-emerald-50 shadow-sm scale-[1.02]" : "border-gray-100 hover:border-emerald-200 bg-white"}`}>
              {selectedRole === "PROVIDER" && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-600 animate-in zoom-in" />}
              <Briefcase className={`h-6 w-6 mb-1 transition-colors ${selectedRole === "PROVIDER" ? "text-emerald-600" : "text-gray-400"}`} />
              <span className={`font-bold text-sm ${selectedRole === "PROVIDER" ? "text-emerald-900" : "text-gray-600"}`}>Provider</span>
            </div>
          </div>
          {errors.role && <p className="mt-1 text-xs text-red-500 font-medium">{errors.role.message}</p>}
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setValue("termsAccepted", checked as true, { shouldValidate: true })} className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="terms" className="text-xs font-medium text-gray-600 leading-snug cursor-pointer">
              I agree to the <Link to="/terms" className="text-emerald-600 font-semibold hover:underline">Terms</Link> & <Link to="/privacy" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link>
            </label>
            {errors.termsAccepted && <p className="text-xs text-red-500 font-medium">{errors.termsAccepted.message}</p>}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-base font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="text-center text-sm text-gray-600 font-medium pt-2">
          Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Login here</Link>
        </div>
      </form>
    </AuthLayout>
  );
}