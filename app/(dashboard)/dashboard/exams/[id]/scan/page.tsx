"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { getToken } from "@/lib/auth";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface EvalResult {
  success: boolean;
  message: string;
  roll_number: string;
  set_code: string;
  marks_obtained: number;
  wrong_answers: number[];
  percentage: number;
  answers: number[];
  image_url: string;
}

interface SheetItem {
  file: File;
  preview: string;
  status: "pending" | "processing" | "done" | "error";
  result?: EvalResult;
}

export default function ScanPageV1() {
  const params = useParams();
  const examId = params.id as string;
  const { data: session } = useSession();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sheets, setSheets] = useState<SheetItem[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [hasAnswerKey, setHasAnswerKey] = useState<boolean | null>(null);

  // Check if answer key exists
  useEffect(() => {
    const check = async () => {
      const token = session?.backendAccessToken || getToken();
      if (!token || !examId) return;
      try {
        const res = await fetch(`${baseUrl}/exams/${examId}/answer-keys`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHasAnswerKey(Array.isArray(data) && data.length > 0);
        } else {
          setHasAnswerKey(false);
        }
      } catch {
        setHasAnswerKey(false);
      }
    };
    check();
  }, [session, examId]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    const newSheets: SheetItem[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setSheets((prev) => [...prev, ...newSheets]);
  }, []);

  const removeSheet = useCallback((index: number) => {
    setSheets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setSheets([]);
  }, []);

  const evaluateAll = useCallback(async () => {
    const token = session?.backendAccessToken || getToken();
    if (!token) {
      addToast("Authentication token missing. Please log in again.", "error");
      return;
    }
    if (sheets.length === 0) {
      addToast("Upload at least one OMR sheet image.", "error");
      return;
    }
    if (!hasAnswerKey) {
      addToast("আগে উত্তরপত্র সেট আপ করুন!", "error");
      return;
    }

    setEvaluating(true);

    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].status === "done") continue;

      // Mark as processing
      setSheets((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : s)),
      );

      try {
        const formData = new FormData();
        formData.append("file", sheets[i].file);

        const res = await fetch(`${baseUrl}/exams/${examId}/evaluate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || `HTTP ${res.status}`);
        }

        const result: EvalResult = await res.json();
        setSheets((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "done", result } : s,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Evaluation failed";
        setSheets((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error",
                  result: {
                    success: false,
                    message,
                    roll_number: "",
                    set_code: "",
                    marks_obtained: 0,
                    wrong_answers: [],
                    percentage: 0,
                    answers: [],
                    image_url: "",
                  },
                }
              : s,
          ),
        );
      }
    }

    setEvaluating(false);
    addToast("Evaluation complete!", "success");
  }, [sheets, session, examId, addToast]);

  const evaluateSingle = useCallback(
    async (index: number) => {
      const token = session?.backendAccessToken || getToken();
      if (!token) {
        addToast("Authentication token missing. Please log in again.", "error");
        return;
      }

      setSheets((prev) =>
        prev.map((s, idx) =>
          idx === index ? { ...s, status: "processing" } : s,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("file", sheets[index].file);

        const res = await fetch(`${baseUrl}/exams/${examId}/evaluate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || `HTTP ${res.status}`);
        }

        const result: EvalResult = await res.json();
        setSheets((prev) =>
          prev.map((s, idx) =>
            idx === index ? { ...s, status: "done", result } : s,
          ),
        );
        addToast(`Sheet #${index + 1} evaluated!`, "success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Evaluation failed";
        setSheets((prev) =>
          prev.map((s, idx) =>
            idx === index
              ? {
                  ...s,
                  status: "error",
                  result: {
                    success: false,
                    message,
                    roll_number: "",
                    set_code: "",
                    marks_obtained: 0,
                    wrong_answers: [],
                    percentage: 0,
                    answers: [],
                    image_url: "",
                  },
                }
              : s,
          ),
        );
        addToast(`Sheet #${index + 1}: ${message}`, "error");
      }
    },
    [sheets, session, examId, addToast],
  );

  const completedCount = sheets.filter((s) => s.status === "done").length;
  const totalMarks = sheets
    .filter((s) => s.result?.success)
    .reduce((sum, s) => sum + (s.result?.marks_obtained || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/exams/${examId}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← পরীক্ষায় ফিরে যান
          </Link>
          <h1 className="text-2xl font-semibold">OMR Evaluate</h1>
        </div>
        {sheets.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Answer Key Warning */}
      {hasAnswerKey === false && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-600 font-medium text-sm">
            ⚠️ উত্তরপত্র সেট আপ করা হয়নি। মূল্যায়ন করতে আগে উত্তরপত্র সেট আপ
            করুন।
          </p>
          <Link
            href={`/dashboard/exams/${examId}/answer-key`}
            className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 shrink-0"
          >
            উত্তরপত্র সেট আপ করুন
          </Link>
        </div>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-blue-400", "bg-blue-50/50");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50");
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-4xl mb-2">📄</div>
        <p className="text-slate-600 font-medium">
          OMR শিট ছবি এখানে ড্রপ করুন বা ক্লিক করুন
        </p>
        <p className="text-sm text-slate-400 mt-1">
          JPG, PNG, PDF — একসাথে অনেকগুলো আপলোড করা যাবে
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Image Thumbnails */}
      {sheets.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {sheets.map((sheet, i) => (
            <div key={i} className="relative group">
              <div
                className={`aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                  sheet.status === "done" && sheet.result?.success
                    ? "border-green-400"
                    : sheet.status === "done" && !sheet.result?.success
                      ? "border-yellow-400"
                      : sheet.status === "error"
                        ? "border-red-400"
                        : sheet.status === "processing"
                          ? "border-blue-400 animate-pulse"
                          : "border-slate-200"
                }`}
              >
                <img
                  src={sheet.preview}
                  alt={`Sheet ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Status badge */}
              <div className="absolute bottom-1 left-1 text-[10px] font-bold px-1 py-0.5 rounded bg-black/60 text-white">
                {sheet.status === "done" && sheet.result?.success
                  ? `✅ ${sheet.result.marks_obtained}`
                  : sheet.status === "done"
                    ? "⚠️"
                    : sheet.status === "error"
                      ? "❌"
                      : sheet.status === "processing"
                        ? "⏳"
                        : `#${i + 1}`}
              </div>
              {/* Remove / Evaluate button */}
              {sheet.status === "pending" && (
                <div className="absolute top-0 right-0 left-0 bottom-0 flex flex-col items-center justify-center gap-1 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      evaluateSingle(i);
                    }}
                    className="px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded"
                  >
                    মূল্যায়ন
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSheet(i);
                    }}
                    className="px-2 py-1 text-[10px] font-bold bg-red-500 text-white rounded"
                  >
                    মুছুন
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evaluate Button */}
      {sheets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {sheets.length} টি শিট · {completedCount} টি সম্পন্ন
          </p>
          <button
            onClick={evaluateAll}
            disabled={evaluating}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {evaluating
              ? "মূল্যায়ন চলছে..."
              : `সব মূল্যায়ন করুন (${sheets.filter((s) => s.status !== "done").length})`}
          </button>
        </div>
      )}

      {/* Results Table */}
      {completedCount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">ফলাফল</h2>
            <span className="text-sm text-slate-500">
              মোট নম্বর: {totalMarks}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">রোল</th>
                  <th className="px-4 py-2 text-left">সেট</th>
                  <th className="px-4 py-2 text-right">নম্বর</th>
                  <th className="px-4 py-2 text-right">%</th>
                  <th className="px-4 py-2 text-right">ভুল</th>
                  <th className="px-4 py-2 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {sheets
                  .map((s, i) => ({ ...s, originalIndex: i }))
                  .filter((s) => s.status === "done" || s.status === "error")
                  .map((sheet) => (
                    <tr
                      key={sheet.originalIndex}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2 text-slate-400">
                        {sheet.originalIndex + 1}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {sheet.result?.roll_number || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {sheet.result?.set_code || "-"}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {sheet.result?.marks_obtained ?? 0}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {sheet.result?.percentage ?? 0}%
                      </td>
                      <td className="px-4 py-2 text-right text-red-500">
                        {sheet.result?.wrong_answers?.length ?? 0}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {sheet.result?.success ? (
                          <span className="text-green-600 font-bold">✅</span>
                        ) : (
                          <span
                            className="text-yellow-600 text-xs"
                            title={sheet.result?.message}
                          >
                            ⚠️ {sheet.result?.message?.slice(0, 30)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
