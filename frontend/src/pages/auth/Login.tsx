import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import { loginSchema,type LoginFormValues } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/layout/authLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const rememberMeValue = watch("rememberMe");

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);
      console.log("Login Success:", response);
      
      const userObj = response.user || response.data || {};
      dispatch(setCredentials({ user: userObj, token: response.token }));

      // Role-based navigation logic
      const role = (userObj.role || "CUSTOMER").toUpperCase();
      if (role === "PROVIDER") {
        navigate("/provider");
      } else if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
      setError("root", { type: "manual", message: errorMessage });
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <div className="mx-auto bg-emerald-100 text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mb-5 shadow-sm">
          <LogIn size={28} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome <span className="text-emerald-600">Back</span>
        </h2>
        <p className="text-gray-500 text-sm">Login to your account to continue.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("email")} placeholder="john@example.com" className={`pl-10 py-5 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 text-base ${errors.email ? "border-red-500" : ""}`} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`pl-10 pr-10 py-5 bg-white border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 text-base ${errors.password ? "border-red-500" : ""}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox id="rememberMe" checked={rememberMeValue} onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)} className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 font-medium cursor-pointer">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-emerald-600 font-bold hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full py-6 mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 transition-all">
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Button type="button" variant="outline" className="w-full py-6 rounded-xl border-gray-200 hover:bg-gray-50 active:scale-[0.98] font-bold text-gray-700 shadow-sm transition-all">
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        <div className="text-center mt-8 text-sm text-gray-600 font-medium">
          Don't have an account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Register now</Link>
        </div>
      </form>
    </AuthLayout>
  );
}