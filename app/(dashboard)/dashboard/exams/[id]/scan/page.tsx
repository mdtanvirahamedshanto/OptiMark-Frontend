"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { getToken } from "@/lib/auth";
import {
  Trash2,
  Camera,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

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

export default function AdvancedOMREvaluator() {
  const params = useParams();
  const examId = params.id as string;
  const { data: session } = useSession();
  const { addToast } = useToast();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const [sheets, setSheets] = useState<SheetItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
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

    setSheets((prev) => {
      const updated = [...prev, ...newSheets];
      // If this is the first upload, select the first image
      if (prev.length === 0 && newSheets.length > 0) {
        setSelectedIndex(0);
      }
      return updated;
    });
  }, []);

  const removeSheet = useCallback(
    (indexToRemove: number) => {
      setSheets((prev) => {
        const newSheets = prev.filter((_, i) => i !== indexToRemove);
        // Adjust selected index if needed
        if (newSheets.length === 0) {
          setSelectedIndex(0);
        } else if (selectedIndex >= newSheets.length) {
          setSelectedIndex(newSheets.length - 1);
        } else if (indexToRemove < selectedIndex) {
          setSelectedIndex((prevIndex) => prevIndex - 1);
        }
        return newSheets;
      });
    },
    [selectedIndex],
  );

  const clearAll = useCallback(() => {
    setSheets([]);
    setSelectedIndex(0);
  }, []);

  const evaluateSingle = useCallback(
    async (index: number) => {
      const token = session?.backendAccessToken || getToken();
      if (!token) {
        addToast("Authentication token missing. Please log in again.", "error");
        return;
      }
      if (!hasAnswerKey) {
        addToast("আগে উত্তরপত্র সেট আপ করুন!", "error");
        return;
      }

      setSheets((prev) =>
        prev.map((s, idx) =>
          idx === index ? { ...s, status: "processing" } : s,
        ),
      );
      setEvaluating(true);

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
        addToast(
          result.success
            ? "Sheet evaluated successfully!"
            : "OMR Evaluation failed. See status.",
          result.success ? "success" : "error",
        );
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
        addToast(`Evaluation error: ${message}`, "error");
      } finally {
        setEvaluating(false);
      }
    },
    [sheets, session, examId, addToast, hasAnswerKey],
  );

  const evaluateAll = useCallback(async () => {
    const token = session?.backendAccessToken || getToken();
    if (!token) {
      addToast("Authentication token missing. Please log in again.", "error");
      return;
    }
    if (sheets.length === 0) return;
    if (!hasAnswerKey) {
      addToast("আগে উত্তরপত্র সেট আপ করুন!", "error");
      return;
    }

    setEvaluating(true);

    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].status === "done") continue;

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
    addToast("All sheets evaluated!", "success");
  }, [sheets, session, examId, addToast, hasAnswerKey]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = 200;
      thumbnailContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const completedCount = sheets.filter((s) => s.status === "done").length;
  const pendingCount = sheets.filter((s) => s.status === "pending").length;
  const totalMarks = sheets
    .filter((s) => s.result?.success)
    .reduce((sum, s) => sum + (s.result?.marks_obtained || 0), 0);

  const activeSheet = sheets[selectedIndex];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href={`/dashboard/exams/${examId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
        >
          ← পরীক্ষায় ফিরে যান
        </Link>
      </div>

      {hasAnswerKey === false && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <p className="text-red-700 font-medium text-sm">
            ⚠️ উত্তরপত্র সেট আপ করা হয়নি। মূল্যায়ন করতে আগে উত্তরপত্র সেট আপ
            করুন।
          </p>
          <Link
            href={`/dashboard/exams/${examId}/answer-key`}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shrink-0 transition"
          >
            উত্তরপত্র সেট আপ করুন
          </Link>
        </div>
      )}

      {/* Main UI Container */}
      <div className="bg-[#fcfcfc] border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
            <span className="font-semibold text-purple-600 text-[15px]">
              Advanced OMR Evaluator 3.0
            </span>
          </div>
          <button
            onClick={() => {
              if (sheets.length > 0) {
                removeSheet(selectedIndex);
              }
            }}
            disabled={sheets.length === 0 || evaluating}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Selected Image"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Main Preview Area */}
        <div className="p-6 bg-[#f8f9fa] flex flex-col items-center justify-center min-h-[400px]">
          {activeSheet ? (
            <div className="relative w-full max-w-2xl bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={activeSheet.preview}
                alt={`Preview ${selectedIndex + 1}`}
                className="w-full h-auto object-contain max-h-[600px]"
              />
              {/* Optional Status Overlay */}
              {activeSheet.status !== "pending" && (
                <div
                  className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg font-bold text-sm shadow-md backdrop-blur-md ${
                    activeSheet.status === "processing"
                      ? "bg-blue-500/80 text-white animate-pulse"
                      : activeSheet.status === "error" ||
                          (activeSheet.status === "done" &&
                            !activeSheet.result?.success)
                        ? "bg-red-500/80 text-white"
                        : "bg-green-500/80 text-white"
                  }`}
                >
                  {activeSheet.status === "processing" && "Processing..."}
                  {activeSheet.status === "error" && "Evaluation Failed"}
                  {activeSheet.status === "done" &&
                    activeSheet.result?.success &&
                    `Result: ${activeSheet.result.marks_obtained} Marks`}
                  {activeSheet.status === "done" &&
                    !activeSheet.result?.success &&
                    "Error: " + activeSheet.result?.message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImagePlus className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-gray-500">No image selected</p>
              <p className="text-sm mt-1">
                Upload or take photos using the options below
              </p>
            </div>
          )}
        </div>

        {/* Action Controls Section */}
        <div className="p-5 border-t border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {pendingCount > 1 && (
              <button
                onClick={evaluateAll}
                disabled={evaluating}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[15px] transition-colors disabled:opacity-50 shadow-sm"
              >
                Evaluate All ({pendingCount})
              </button>
            )}
          </div>
        </div>

        {/* Bottom Thumbnails Strip */}
        <div className="flex bg-[#fcfcfc] border-t border-gray-100 h-28 relative">
          {/* Left Navigation */}
          <button
            onClick={() => scrollThumbnails("left")}
            className="w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10 border-r border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Upload Buttons */}
          <div className="flex gap-2 p-3 items-center flex-shrink-0">
            {/* Camera Button */}
            <label className="w-[70px] h-[85px] rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-500 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 shadow-sm relative group">
              <Camera className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {/* Gallery Button */}
            <label className="w-[70px] h-[85px] rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-500 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 shadow-sm relative group">
              <ImagePlus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <div className="w-[1px] h-16 self-center bg-gray-200 mx-1 flex-shrink-0"></div>

          {/* Scrollable Thumbnails */}
          <div
            ref={thumbnailContainerRef}
            className="flex-1 overflow-x-auto flex items-center gap-3 px-3 scrollbar-hide no-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {sheets.map((sheet, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-[65px] h-[85px] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all block p-0 bg-white shadow-sm ${
                  selectedIndex === index
                    ? "border-purple-600 ring-2 ring-purple-100 scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={sheet.preview}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Status Indicator on Thumbnail */}
                {sheet.status !== "pending" && (
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg flex items-center justify-center ${
                      sheet.status === "done" && sheet.result?.success
                        ? "bg-green-500"
                        : sheet.status === "error" ||
                            (sheet.status === "done" && !sheet.result?.success)
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
            {sheets.length === 0 && (
              <div className="text-sm text-gray-400 font-medium px-4 flex items-center text-center h-full">
                No images added yet. Click camera or gallery to begin.
              </div>
            )}
          </div>

          {/* Right Navigation */}
          <button
            onClick={() => scrollThumbnails("right")}
            className="w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10 border-l border-gray-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Table (Kept below to easily view processing log) */}
      {completedCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-6">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">ফলাফল (Results)</h2>
            <div className="flex gap-4">
              <span className="text-sm text-gray-500">
                Processed: {completedCount}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                Total Score: {totalMarks}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 bg-white">
                  <th className="px-5 py-3 text-left font-medium">#</th>
                  <th className="px-5 py-3 text-left font-medium">
                    রোল (Roll)
                  </th>
                  <th className="px-5 py-3 text-left font-medium">সেট (Set)</th>
                  <th className="px-5 py-3 text-right font-medium">
                    নম্বর (Score)
                  </th>
                  <th className="px-5 py-3 text-right font-medium">%</th>
                  <th className="px-5 py-3 text-right font-medium">
                    ভুল (Wrong)
                  </th>
                  <th className="px-5 py-3 text-center font-medium">
                    স্ট্যাটাস
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheets
                  .map((s, i) => ({ ...s, originalIndex: i }))
                  .filter((s) => s.status === "done" || s.status === "error")
                  .map((sheet) => (
                    <tr
                      key={sheet.originalIndex}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors bg-white"
                    >
                      <td className="px-5 py-3 text-gray-400">
                        {sheet.originalIndex + 1}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {sheet.result?.roll_number || "-"}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {sheet.result?.set_code || "-"}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-gray-800">
                        {sheet.result?.marks_obtained ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {sheet.result?.percentage ?? 0}%
                      </td>
                      <td className="px-5 py-3 text-right text-red-500 font-medium">
                        {sheet.result?.wrong_answers?.length ?? 0}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {sheet.result?.success ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 cursor-help"
                            title={sheet.result?.message}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span
                            className="inline-flex px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-md border border-red-200 cursor-help"
                            title={sheet.result?.message}
                          >
                            Error
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
