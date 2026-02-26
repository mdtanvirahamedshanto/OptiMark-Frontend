"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { ExamForm, ExamFormValues } from "@/components/exam/ExamForm";
import { useToast } from "@/components/ui/Toast";
import { getToken } from "@/lib/auth";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

export default function NewExamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: ExamFormValues) => {
    const token = session?.backendAccessToken || getToken();

    if (!token) {
      addToast(
        "Authentication token is missing. Please log in again.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to create exam");
      }

      const data = await res.json();
      addToast("Exam created", "success");
      router.push(`/dashboard/exams/${data.id}`);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to create exam",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Exam</h1>
      <ExamForm onSubmit={handleCreate} loading={loading} />
    </div>
  );
}
