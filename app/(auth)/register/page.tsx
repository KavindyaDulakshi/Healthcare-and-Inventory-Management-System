"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { HeartPulse, User, Mail, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    name: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type RegisterFields = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useHealthcare();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFields>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      // Mock onboarding success
      setSuccess(true);
      setTimeout(() => {
        loginUser(data.email, data.name);
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      
      {/* Left Column: Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
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
            className="inline-flex items-center gap-2 bg-blue-500/40 border border-blue-400/20 px-3 py-1 rounded-full text-xs font-semibold text-cyan-200 self-start"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Onboarding Portal</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight leading-tight"
          >
            Get started in under 2 minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-sm leading-relaxed"
          >
            Create an administrator profile to deploy a centralized hospital warehouse, connect pharmacy stock with medical practitioners, and manage medical visits.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 mt-4 shadow-lg flex flex-col gap-3"
          >
            <div className="text-xs font-bold text-cyan-200">QUICK ONBOARDING STEPS</div>
            <div className="flex flex-col gap-2.5 text-xs text-blue-100">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                <span>Create Administrator Profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center font-bold text-[10px]">2</div>
                <span>Populate Local Medical Roster</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center font-bold text-[10px]">3</div>
                <span>Load Live Inventory Catalogs</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-xs text-blue-200 z-10 border-t border-blue-500/30 pt-6">
          <span>Enterprise Hospital Standard</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            256-bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create your workspace</h2>
            <p className="text-sm text-muted-foreground">
              Register a new administrative clinic account.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl p-6 flex flex-col items-center text-center gap-3"
            >
              <div className="bg-emerald-500 text-white rounded-full p-2.5">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-base text-foreground">Account Created Successfully!</h3>
              <p className="text-xs text-muted-foreground">Setting up your medical dashboard files. Redirecting now...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="relative">
                <User className="absolute left-3 top-9.5 h-4.5 w-4.5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="Dr. John Watson"
                  className="pl-10"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-9.5 h-4.5 w-4.5 text-muted-foreground z-10" />
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="john.watson@medicare.com"
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

              <div className="relative">
                <Lock className="absolute left-3 top-9.5 h-4.5 w-4.5 text-muted-foreground z-10" />
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>

              <Button type="submit" className="w-full mt-2 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Creating workspace..." : "Register Clinic"}
              </Button>
            </form>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Registered?</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an admin key? </span>
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
