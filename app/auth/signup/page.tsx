"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/ui/AuthContext";
import { api, getApiErrorMessage } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (formData.password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/signup", {
        institution_name: formData.institutionName,
        address: formData.address,
        email: formData.email,
        password: formData.password,
      });

      const loginResponse = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      const token = loginResponse.data?.access_token ?? loginResponse.data?.token;
      const role = loginResponse.data?.role;

      if (!token) {
        throw new Error("Login token not received after signup");
      }
      login(token, role);

      addToast("Account created successfully!", "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 50);
    } catch (error) {
      addToast(getApiErrorMessage(error, "Failed to create account"), "error");
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
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Get started with MCQ Scanner in under a minute
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institution / School Name"
              type="text"
              placeholder="e.g., Dhaka Residential Model College"
              value={formData.institutionName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  institutionName: e.target.value,
                }))
              }
              required
            />
            <Input
              label="Address / District"
              type="text"
              placeholder="e.g., Mohammadpur, Dhaka"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              required
            />
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
              autoComplete="new-password"
              hint="At least 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              autoComplete="new-password"
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              leftIcon={<UserPlus className="h-5 w-5" />}
            >
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#1e3a5f] hover:underline"
            >
              Log in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
