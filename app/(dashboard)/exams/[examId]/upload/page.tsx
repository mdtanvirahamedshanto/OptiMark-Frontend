"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  Edit3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ManualEditModal } from "@/components/upload/ManualEditModal";
import { useToast } from "@/components/ui/Toast";
import { api, getApiErrorMessage } from "@/lib/api";
import type { AnswerOption } from "@/lib/types";
import type { ScanResult } from "@/lib/types";

export default function OMRUploadPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const { addToast } = useToast();

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [editingResult, setEditingResult] = useState<ScanResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    } else {
      addToast("Please drop image files only (PNG, JPG, etc.)", "error");
    }
  }, [addToast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleScan = async () => {
    if (files.length === 0) {
      addToast("Please add at least one OMR image", "error");
      return;
    }

    setIsScanning(true);
    setResults([]);
    setScanProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      // Simulate progress for demo (replace with actual progress from backend if available)
      const progressInterval = setInterval(() => {
        setScanProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const response = await api.post(`/exams/${examId}/scan`, formData);

      clearInterval(progressInterval);
      setScanProgress(100);

      const rawResults = response.data?.results || response.data || [];
      const scanResults: ScanResult[] = Array.isArray(rawResults)
        ? rawResults.map((r: {
            roll_number?: string;
            marks_obtained?: number;
            wrong_answers?: number[];
            percentage?: number;
            answers?: number[];
          }) => {
            const opts: AnswerOption[] = ["A", "B", "C", "D"];
            const answers: Record<number, AnswerOption> = {};
            (r.answers || []).forEach((val, i) => {
              answers[i + 1] = opts[val] ?? "A";
            });
            return {
              rollNumber: r.roll_number ?? "?",
              marks: r.marks_obtained ?? 0,
              totalMarks: 60,
              answers,
            };
          })
        : [];
      setResults(scanResults);
      const successCount = rawResults.filter((r: { success?: boolean }) => r.success).length;
      addToast(
        successCount === files.length
          ? `Successfully scanned ${files.length} OMR sheet(s)`
          : `Scanned ${successCount} of ${files.length} sheet(s). Some failed - check results.`,
        successCount === files.length ? "success" : "info"
      );
    } catch (error) {
      setScanProgress(100);
      addToast(getApiErrorMessage(error, "Failed to scan OMR sheets"), "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEditSave = (rollNumber: string, updatedAnswers: Record<number, AnswerOption>) => {
    setResults((prev) =>
      prev.map((r) =>
        r.rollNumber === rollNumber
          ? {
              ...r,
              answers: updatedAnswers,
              marks: Object.values(updatedAnswers).filter(Boolean).length, // Simplified: count as marks
            }
          : r
      )
    );
    setEditingResult(null);
    addToast("Changes saved successfully", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
              Upload & Scan OMR
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Upload zone */}
        <Card>
          <CardHeader>
            <CardTitle>Upload OMR Images</CardTitle>
            <CardDescription>
              Drag and drop your OMR sheet images here, or click to browse.
              Supports PNG, JPG, and JPEG formats.
            </CardDescription>
          </CardHeader>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${isDragging ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-slate-300 hover:border-slate-400"}
            `}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="omr-upload"
            />
            <label
              htmlFor="omr-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="h-8 w-8 text-slate-500" />
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  {isDragging ? "Drop images here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  PNG, JPG, JPEG up to 10MB each
                </p>
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-700">
                {files.length} file(s) selected
              </p>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm"
                  >
                    <ImagePlus className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-500 hover:text-red-600"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Scan button & progress */}
        {files.length > 0 && (
          <Card>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                isLoading={isScanning}
                leftIcon={isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                size="lg"
                className="flex-1 sm:flex-initial"
              >
                {isScanning ? "Scanning..." : "Start Scanning"}
              </Button>
              {isScanning && (
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1e3a5f] transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Processing... {scanProgress}%
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Result preview */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Result Preview</CardTitle>
              <CardDescription>
                Scanned results. Click &quot;Edit&quot; to manually correct any
                misread answers before saving.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Roll Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Marks
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={`${result.rollNumber}-${idx}`}
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {result.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {result.marks}/{result.totalMarks}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit3 className="h-4 w-4" />}
                          onClick={() => setEditingResult(result)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => router.push(`/exams/${examId}/results`)}
                rightIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Save & View Results
              </Button>
            </div>
          </Card>
        )}
      </main>

      {/* Manual Edit Modal */}
      {editingResult && (
        <ManualEditModal
          isOpen={!!editingResult}
          onClose={() => setEditingResult(null)}
          rollNumber={editingResult.rollNumber}
          marks={editingResult.marks}
          answers={editingResult.answers || {}}
          onSave={(updatedAnswers) =>
            handleManualEditSave(editingResult.rollNumber, updatedAnswers)
          }
        />
      )}
    </div>
  );
}
