"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  LayoutDashboard,
  Users,
  CreditCard,
  FileQuestion,
  Settings,
  LogOut,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { signOut } from "next-auth/react";
import { useAuth } from "@/components/ui/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: "/login" });
  };

  const nav = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/payments", label: "Pending Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/exams", label: "Exams", icon: FileQuestion },
    { href: "/admin/plans", label: "Subscription Plans", icon: Settings },
  ];

  return (
    <ProtectedRoute allowAdminOnly={true}>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <Link
              href="/admin/dashboard"
              className="text-xl font-bold text-[#1e3a5f]"
            >
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-[#1e3a5f] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors mb-4"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
              <span>লগআউট</span>
            </button>
            <div className="text-[10px] text-slate-400 font-medium">
              Developed by{" "}
              <a
                href="https://mdtanvirahamedshanto.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e3a5f] hover:underline"
              >
                Md Tanvir Ahamed Shanto
              </a>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
