"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Chrome } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/ui/AuthContext";
import { getErrorMessageFromPayload } from "@/lib/api/error";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function LoginContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const { login, isAuthenticated, isLoading, role } = useAuth();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const loginError = searchParams.get("error");
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === "admin" && nextPath === "/dashboard") {
        router.replace("/admin/dashboard");
      } else {
        router.replace(nextPath);
      }
      return;
    }
    if (status === "authenticated" && session?.backendAccessToken) {
      if (role === "admin" && nextPath === "/dashboard") {
        router.replace("/admin/dashboard");
      } else {
        router.replace(nextPath);
      }
      return;
    }
    if (status === "authenticated" && !session?.backendAccessToken) {
      signOut({ redirect: false });
    }
  }, [status, session, isLoading, isAuthenticated, router, nextPath, role]);

  const handleManualLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${LEGACY_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getErrorMessageFromPayload(data, "Login failed"));
      }
      if (!data?.access_token) {
        throw new Error("Login token missing");
      }
      const userRole = data.role || "teacher";
      login(data.access_token, userRole, "manual");
      addToast("Login successful", "success");

      if (userRole === "admin" && nextPath === "/dashboard") {
        router.replace("/admin/dashboard");
      } else {
        router.replace(nextPath);
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message === "Failed to fetch"
          ? "Cannot connect to server. Please check backend is running."
          : error instanceof Error
            ? error.message
            : "Login failed";
      setFormError(message);
      addToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Login to OptiMark
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Login with email/password or Google.
        </p>
        {loginError && (
          <p className="text-sm text-red-600 mt-3">
            Sign-in failed. Please try again.
          </p>
        )}

        <form className="space-y-4 mt-6" onSubmit={handleManualLogin}>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            required
          />
          <Button type="submit" className="w-full" isLoading={submitting}>
            Login
          </Button>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          className="w-full"
          size="lg"
          leftIcon={<Chrome className="h-5 w-5" />}
          onClick={() => signIn("google", { callbackUrl: nextPath })}
        >
          Login with Google
        </Button>

        <div className="mt-5 text-sm text-center text-slate-600">
          New user?{" "}
          <Link className="underline text-slate-700" href="/auth/signup">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
