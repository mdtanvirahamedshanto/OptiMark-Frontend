"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, FileQuestion, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mcqscanner_token") : null;
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    api
      .get("/auth/me")
      .then((r) => {
        if (r.data?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setIsAdmin(true);
      })
      .catch(() => router.replace("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const nav = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/payments", label: "Pending Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/exams", label: "Exams", icon: FileQuestion },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link href="/admin/dashboard" className="text-xl font-bold text-[#1e3a5f]">
            MCQ Scanner Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? "bg-[#1e3a5f] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <Link href="/dashboard" className="text-sm text-slate-600 hover:text-[#1e3a5f]">
            ← Back to User Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
