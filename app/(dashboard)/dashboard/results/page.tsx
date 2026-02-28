"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getToken } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import {
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  Eye,
  Filter,
} from "lucide-react";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface ResultItem {
  sheet_id: number;
  exam_id: number;
  exam_name?: string;
  student_identifier?: string;
  set_label?: string;
  final_score: number;
  percentage: number;
}

export default function ResultsPageV1() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = session?.backendAccessToken || getToken();
      if (!token) return;
      try {
        const res = await fetch(`${baseUrl}/results`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data?.items) ? data.items : []);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [session]);

  const download = async (format: "csv" | "pdf") => {
    const token = session?.backendAccessToken || getToken();
    if (!token) return;
    try {
      addToast(`Preparing ${format.toUpperCase()} export...`, "info");
      const res = await fetch(`${baseUrl}/results/export.${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      addToast("Failed to export results", "error");
    }
  };

  const deleteResult = async (sheetId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this result? This action cannot be undone.",
      )
    )
      return;

    const token = session?.backendAccessToken || getToken();
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/results/${sheetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.sheet_id !== sheetId));
        addToast("Result deleted successfully", "success");
      } else {
        throw new Error("Failed to delete result");
      }
    } catch (e) {
      addToast("Failed to delete result", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-slate-500">
        Loading results...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OMR Results</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage evaluated exam results for all students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => download("csv")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => download("pdf")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white hover:bg-blue-900 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 px-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              No Results Found
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              You haven't saved any OMR evaluations yet. Head over to an exam's
              OMR Scanner to evaluate and save results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Student Roll</th>
                  <th className="px-6 py-4">Set</th>
                  <th className="px-6 py-4 text-right">Score</th>
                  <th className="px-6 py-4 text-right">%</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.sheet_id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                      {item.exam_name || `Exam #${item.exam_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {item.student_identifier || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Set {item.set_label || "A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                      {item.final_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`font-medium ${item.percentage >= 80 ? "text-green-600" : item.percentage >= 40 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/results/${item.sheet_id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteResult(item.sheet_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
