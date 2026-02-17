"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("optimark_token") : null;
    const isAuthPage = pathname?.startsWith("/auth/");
    const isPublicPage = pathname === "/" || pathname === "";

    if (!token && !isAuthPage && !isPublicPage) {
      router.replace("/auth/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
