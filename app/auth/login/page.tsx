"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { api, getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data?.access_token ?? response.data?.token;
      const role = response.data?.role;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("mcqscanner_token", token);
      }

      addToast("Welcome back!", "success");
      router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      addToast(getApiErrorMessage(error, "Invalid email or password"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-[#1e3a5f] hover:opacity-90"
          >
            MCQ Scanner
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              leftIcon={<LogIn className="h-5 w-5" />}
            >
              Log in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-[#1e3a5f] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
