"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getToken } from "@/lib/auth";
import {
  Download,
  KeyRound,
  ScanLine,
  BookOpen,
  Hash,
  Layers,
} from "lucide-react";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface ExamDetail {
  exam_name: string;
  subject_name: string;
  subject_code: string;
  total_questions: number;
  options_per_question: number;
  has_set: boolean;
  set_count: number;
  set_labels: { set_label: string }[];
  negative_marking: boolean;
  negative_value: number;
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

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        Loading...
      </div>
    );
  }

  const infoCards = [
    {
      label: "মোট প্রশ্ন",
      value: exam.total_questions,
      icon: Hash,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "বিষয় কোড",
      value: exam.subject_code || "-",
      icon: BookOpen,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "সেট সংখ্যা",
      value: exam.has_set ? exam.set_count : "N/A",
      icon: Layers,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/exams"
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← পরীক্ষা তালিকা
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{exam.exam_name}</h1>
        <p className="text-slate-500 mt-1">{exam.subject_name}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {card.label}
                </p>
                <p className="text-lg font-bold text-slate-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">
          কার্যক্রম
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link
            href={`/omr/generator?qCount=${exam.total_questions}&type=normal&examId=${examId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex-shrink-0">
              <Download className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">OMR ডাউনলোড</p>
              <p className="text-xs text-slate-400">টেমপ্লেট তৈরি করুন</p>
            </div>
          </Link>
          <Link
            href={`/dashboard/exams/${examId}/answer-key`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
          >
            <div className="flex-shrink-0">
              <KeyRound className="w-5 h-5 text-amber-500 group-hover:text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">
                উত্তরপত্র সেটআপ
              </p>
              <p className="text-xs text-slate-400">সঠিক উত্তর নির্ধারণ</p>
            </div>
          </Link>
          <Link
            href={`/dashboard/exams/${examId}/scan`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group"
          >
            <div className="flex-shrink-0">
              <ScanLine className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-emerald-800 text-sm">
                OMR মূল্যায়ন
              </p>
              <p className="text-xs text-emerald-500">আপলোড ও স্ক্যান</p>
            </div>
          </Link>
          <Link
            href={`/dashboard/results?exam_id=${examId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all group"
          >
            <div className="flex-shrink-0">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-indigo-800 text-sm">ফলাফল দেখুন</p>
              <p className="text-xs text-indigo-500">সংরক্ষিত মার্কশিট</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Exam Settings */}
      {(exam.has_set || exam.negative_marking) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
            সেটিংস
          </h2>
          <div className="text-sm text-slate-600 space-y-2">
            {exam.has_set && (
              <p>
                <span className="text-slate-400">সেট:</span>{" "}
                {exam.set_labels?.map((s) => s.set_label).join(", ") || "-"}
              </p>
            )}
            {exam.negative_marking && (
              <p>
                <span className="text-slate-400">নেগেটিভ মার্কিং:</span>{" "}
                {exam.negative_value} নম্বর কর্তন
              </p>
            )}
            <p>
              <span className="text-slate-400">অপশন/প্রশ্ন:</span>{" "}
              {exam.options_per_question}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
