"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface ResultRow {
  id: number;
  roll_number: string;
  set_code: string;
  marks_obtained: number;
  wrong_answers: number[];
  percentage: number;
  created_at: string;
}

interface ResultsData {
  results: ResultRow[];
  total_count: number;
  average_percentage: number;
  highest_marks: number;
  lowest_marks: number;
  total_marks: number;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await api.get(`/exams/${examId}/results`);
        setData(response.data);
      } catch (err) {
        setError("Failed to load results");
        setData({
          results: [],
          total_count: 0,
          average_percentage: 0,
          highest_marks: 0,
          lowest_marks: 0,
          total_marks: 60,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [examId]);

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get(`/exams/${examId}/results/export?format=xlsx`, {
        responseType: "blob",
      });
      const contentDisposition = response.headers?.["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/);
      const filename = filenameMatch?.[1] || `exam-${examId}-results.xlsx`;
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: generate CSV client-side
      const rows = data?.results || [];
      const headers = ["Roll Number", "Set", "Marks", "Total", "Percentage", "Wrong Answers"];
      const lines = [
        headers.join(","),
        ...rows.map((r) =>
          [
            r.roll_number,
            r.set_code,
            r.marks_obtained,
            data?.total_marks ?? 60,
            r.percentage.toFixed(2),
            (r.wrong_answers || []).join(";"),
          ].join(",")
        ),
      ];
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam-${examId}-results.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/exams/${examId}/results/export?format=pdf`, {
        responseType: "blob",
      });
      const contentDisposition = response.headers?.["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/);
      const filename = filenameMatch?.[1] || `exam-${examId}-results.pdf`;
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export requires backend. Download CSV instead.");
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  const results = data?.results ?? [];
  const totalMarks = data?.total_marks ?? 60;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/exams/${examId}`}
              className="flex items-center gap-2 text-slate-600 hover:text-[#1e3a5f] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Exam</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#1e3a5f]">
              Results Analytics
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Analytics cards */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#1e3a5f]" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {data?.total_count ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {data?.highest_marks ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Highest</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {data?.lowest_marks ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Lowest</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">%</span>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {(data?.average_percentage ?? 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">Average</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Results</CardTitle>
                <CardDescription>
                  {results.length > 0
                    ? `View and download ${results.length} student result(s)`
                    : "No results yet. Upload and scan OMR sheets first."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                  onClick={handleDownloadExcel}
                >
                  Download Result Sheet (Excel)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileText className="h-4 w-4" />}
                  onClick={handleDownloadPDF}
                >
                  Download Result Sheet (PDF)
                </Button>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Roll Number
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Set
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Marks
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Percentage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">
                    Scanned At
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No results yet. Upload and scan OMR sheets to see results
                      here.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {r.roll_number}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.set_code}</td>
                      <td className="py-3 px-4">
                        {r.marks_obtained}/{totalMarks}
                      </td>
                      <td className="py-3 px-4">{r.percentage.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
