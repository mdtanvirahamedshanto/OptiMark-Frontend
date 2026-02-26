"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getToken } from "@/lib/auth";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface ExamItem {
  id: number;
  exam_name: string;
  subject_name: string;
  total_questions: number;
}

export default function DashboardExamsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = session?.backendAccessToken || getToken();
      if (!token) return;
      try {
        const res = await fetch(`${baseUrl}/exams`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [session]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exams</h1>
        <Link
          href="/dashboard/exams/new"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm"
        >
          New Exam
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No exams found.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((exam) => (
            <Link
              key={exam.id}
              href={`/dashboard/exams/${exam.id}`}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
            >
              <p className="font-medium">{exam.exam_name}</p>
              <p className="text-sm text-slate-500">
                {exam.subject_name} · {exam.total_questions} questions
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
