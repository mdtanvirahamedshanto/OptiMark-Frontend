"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileQuestion,
  Users,
  CreditCard,
  Loader2,
  Shield,
  Grid3X3,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Coins,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuth } from "@/components/ui/AuthContext";

interface Exam {
  id: number;
  title: string;
  subject_code: string;
  total_questions: number;
}

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { tokens } = useAuth();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setIsAdmin(r.data?.role === "admin"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/exams");
        const examList = Array.isArray(res.data) ? res.data : [];
        setExams(examList);
        let count = 0;
        for (const exam of examList) {
          try {
            const rRes = await api.get(`/exams/${exam.id}/results`);
            count += rRes.data?.total_count ?? 0;
          } catch {
            // ignore
          }
        }
        setTotalStudents(count);
      } catch {
        setExams([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড</h1>
          <p className="text-gray-500 mt-1">
            আপনার পরীক্ষা ও OMR পরিচালনা করুন
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#0f2744] transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileQuestion className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {exams.length}
                </p>
              )}
              <p className="text-sm text-gray-500">পরীক্ষা তৈরী</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudents}
                </p>
              )}
              <p className="text-sm text-gray-500">শিক্ষার্থী স্ক্যান</p>
            </div>
          </div>
        </div>

        <Link href="/subscription">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-[#1e3a5f]/40 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Coins className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tokens}</p>
                <p className="text-sm text-gray-500">স্ক্যান টোকেন</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* OMR Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">OMR টুলস</h2>
          <p className="text-sm text-gray-500">
            OMR Sheet তৈরী করুন, মূল্যায়ন করুন
          </p>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <Link
            href="/omr/generator"
            className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid3X3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">OMR তৈরী</p>
              <p className="text-xs text-gray-500">Sheet জেনারেট করুন</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
          </Link>

          <Link
            href="/omr/evaluator"
            className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">OMR মূল্যায়ন</p>
              <p className="text-xs text-gray-500">Sheet স্ক্যান ও ফলাফল</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
          </Link>

          <Link
            href="/omr/token"
            className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <KeyRound className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">OMR টোকেন</p>
              <p className="text-xs text-gray-500">Answer key তৈরী</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Exams Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">আমার পরীক্ষা</h2>
            <p className="text-sm text-gray-500">আপনার তৈরী পরীক্ষাসমূহ</p>
          </div>
          <Link
            href="/exams/create"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#0f2744] text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            নতুন পরীক্ষা
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">কোনো পরীক্ষা তৈরী হয়নি</p>
              <p className="text-gray-400 text-sm mt-1">
                নতুন পরীক্ষা তৈরী করতে উপরের বাটনে ক্লিক করুন
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.id}`}
                  className="px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-[#1e3a5f]/5 border border-gray-200 hover:border-[#1e3a5f]/30 text-gray-700 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
                >
                  {exam.title} ({exam.subject_code})
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
