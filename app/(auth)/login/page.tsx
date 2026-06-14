"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { HeartPulse, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Let's use standard zod validation:
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters")
});

type LoginFields = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser } = useHealthcare();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "sarah.chen@medicare.com",
      password: "password123"
    }
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const onSubmit = async (data: LoginFields) => {
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Invalid credentials");
      }
      
      loginUser(body.user.email, body.user.name, body.user.role, body.user.id);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Try email 'sarah.chen@medicare.com' and password 'password123'.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      
      {/* Left Column: Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/30 blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-400/20 blur-3xl -ml-20 -mb-20" />

        <div className="flex items-center gap-2.5 z-10">
          <HeartPulse className="h-8 w-8 text-cyan-300 animate-pulse" />
          <span className="font-bold text-xl tracking-tight">MediCare</span>
        </div>

        <div className="flex flex-col gap-6 z-10 max-w-md my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-500/40 border border-blue-400/20 px-3 py-1 rounded-full text-xs font-semibold text-cyan-200 self-start"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Clinic Suite v2.0</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold tracking-tight leading-tight"
          >
            Smart Healthcare Inventory & Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-blue-100 text-sm leading-relaxed"
          >
            Streamline your inventory pipelines, coordinate patient history timelines, schedule appointments, and query medicine forecasting details through our clinical virtual assistant.
          </motion.p>
          
          {/* Card Mock widget inside illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 mt-4 shadow-lg flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-200">INVENTORY FORECAST</span>
              <span className="text-[10px] bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">Stable</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-black">98.2%</span>
                <span className="text-[10px] text-blue-200">Stock Availability Index</span>
              </div>
              <div className="flex gap-1 items-end h-8">
                <div className="w-1.5 bg-white/20 rounded-t-sm h-4" />
                <div className="w-1.5 bg-white/40 rounded-t-sm h-6" />
                <div className="w-1.5 bg-white/30 rounded-t-sm h-5" />
                <div className="w-1.5 bg-cyan-300 rounded-t-sm h-8" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-xs text-blue-200 z-10 border-t border-blue-500/30 pt-6">
          <span>Enterprise Hospital Standard</span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            HIPAA Compliant
          </span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your inventory and clinical workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="bg-danger/10 border border-danger/25 text-danger rounded-xl p-3 flex items-start gap-2 text-xs font-semibold leading-relaxed">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-9.5 h-4.5 w-4.5 text-muted-foreground z-10" />
              <Input
                type="email"
                label="Email Address"
                placeholder="name@medicare.com"
                className="pl-10"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-9.5 h-4.5 w-4.5 text-muted-foreground z-10" />
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                className="pl-10"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary h-4 w-4" defaultChecked />
                <span>Remember this computer</span>
              </label>
              <button
                type="button"
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
                onClick={() => setErrorMsg("Reset link has been mock-sent to your clinical address.")}
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full mt-2 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">New Staff?</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Need to set up a new clinic? </span>
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
