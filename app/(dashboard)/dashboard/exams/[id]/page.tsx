"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getToken } from "@/lib/auth";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface ExamDetail {
  exam_name: string;
  subject_name: string;
}

export default function ExamDetailsV1Page() {
  const params = useParams();
  const examId = params.id as string;
  const { data: session } = useSession();
  const [exam, setExam] = useState<ExamDetail | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = session?.backendAccessToken || getToken();
      if (!token || !examId) return;
      const res = await fetch(`${baseUrl}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        setExam(await res.json());
      }
    };
    run();
  }, [session, examId]);

  const downloadTemplate = async () => {
    const token = session?.backendAccessToken || getToken();
    if (!token) return;
    const res = await fetch(`${baseUrl}/exams/${examId}/template.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-${examId}-template.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">{exam?.exam_name || "Exam"}</h1>
      <p className="text-sm text-slate-500">{exam?.subject_name || ""}</p>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
        >
          Download OMR Template
        </button>
        <Link
          href={`/dashboard/exams/${examId}/answer-key`}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm"
        >
          Setup Answer Key
        </Link>
        <Link
          href={`/dashboard/exams/${examId}/scan`}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm"
        >
          Upload & Scan
        </Link>
      </div>
    </div>
  );
}
