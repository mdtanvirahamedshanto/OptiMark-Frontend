"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileQuestion, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { AnswerKeyGrid } from "@/components/exam/AnswerKeyGrid";
import { useToast } from "@/components/ui/Toast";
import { api, getApiErrorMessage } from "@/lib/api";
import type { AnswerOption } from "@/lib/types";

const BANGLA_SETS = ["ক", "খ", "গ", "ঘ"];
const ENGLISH_SETS = ["A", "B", "C", "D"];

const STEPS = [
  { id: 1, title: "Exam Details", description: "Title, subject, set codes" },
  { id: 2, title: "Answer Key", description: "Define correct answers" },
];

export default function CreateExamPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subjectCode: "",
    totalQuestions: 60,
    setCodeType: "bangla" as "bangla" | "english",
    numberOfSets: 4,
  });
  const [selectedSetTab, setSelectedSetTab] = useState(0);
  const [isUploadingKey, setIsUploadingKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [answerKeyBySet, setAnswerKeyBySet] = useState<
    Record<string, Record<number, AnswerOption>>
  >({});

  const totalQuestions = Math.min(100, Math.max(1, formData.totalQuestions));
  const setCodes =
    formData.setCodeType === "bangla" ? BANGLA_SETS : ENGLISH_SETS;
  const activeSetCodes = setCodes.slice(
    0,
    Math.min(4, Math.max(1, formData.numberOfSets)),
  );
  const currentSetCode = activeSetCodes[selectedSetTab] ?? activeSetCodes[0];
  const currentAnswerKey = answerKeyBySet[currentSetCode] ?? {};

  const handleAnswerChange =
    (setCode: string) => (questionNumber: number, option: AnswerOption) => {
      setAnswerKeyBySet((prev) => ({
        ...prev,
        [setCode]: { ...(prev[setCode] ?? {}), [questionNumber]: option },
      }));
    };

  const canProceedStep1 =
    formData.title.trim().length > 0 &&
    formData.subjectCode.trim().length > 0 &&
    totalQuestions >= 1 &&
    totalQuestions <= 100;

  const requiredRange = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const allSetsComplete = activeSetCodes.every((sc) => {
    const ak = answerKeyBySet[sc] ?? {};
    return requiredRange.every((q) => ak[q] !== undefined);
  });
  const canProceedStep2 = allSetsComplete;

  const answeredCountBySet = activeSetCodes.map((sc) => {
    const ak = answerKeyBySet[sc] ?? {};
    return requiredRange.filter((q) => ak[q] !== undefined).length;
  });

  const handleNext = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
      setSelectedSetTab(0);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleUploadAnswerKey = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsUploadingKey(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/exams/parse-answer-key", formData);
      const answers = res.data?.answers ?? {};
      const mapped: Record<number, AnswerOption> = {};
      for (const [k, v] of Object.entries(answers)) {
        const q = parseInt(k, 10);
        if (
          q >= 1 &&
          q <= totalQuestions &&
          ["A", "B", "C", "D"].includes(String(v))
        ) {
          mapped[q] = v as AnswerOption;
        }
      }
      setAnswerKeyBySet((prev) => ({
        ...prev,
        [currentSetCode]: { ...(prev[currentSetCode] ?? {}), ...mapped },
      }));
      addToast(
        `Set ${currentSetCode}: ${Object.keys(mapped).length} উত্তর লোড হয়েছে। চেক করে এডিট করুন।`,
        "success",
      );
    } catch (err) {
      addToast(getApiErrorMessage(err, "Answer key parse failed"), "error");
    } finally {
      setIsUploadingKey(false);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedStep1 || !canProceedStep2) return;

    setIsSubmitting(true);
    try {
      const optMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      const answer_keys = activeSetCodes.map((setCode) => {
        const ak = answerKeyBySet[setCode] ?? {};
        const filtered = Object.fromEntries(
          Object.entries(ak).filter(
            ([k]) => parseInt(k, 10) >= 1 && parseInt(k, 10) <= totalQuestions,
          ),
        );
        const answersNumeric = Object.fromEntries(
          Object.entries(filtered).map(([k, v]) => [k, optMap[v] ?? 0]),
        );
        return { set_code: setCode, answers: answersNumeric };
      });
      const response = await api.post("/exams/create", {
        title: formData.title,
        subject_code: formData.subjectCode,
        total_questions: totalQuestions,
        answer_keys,
      });
      const examId = response.data?.id ?? response.data?.exam_id;
      addToast(
        "Exam created! Redirecting to generate OMR template...",
        "success",
      );
      // Add a slight delay before routing to allow the toast to be seen
      setTimeout(() => {
        router.push(`/omr/generator?qCount=${totalQuestions}`);
      }, 1500);
    } catch (error) {
      addToast(getApiErrorMessage(error, "Failed to create exam"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 hover:text-[#1e3a5f] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#1e3a5f]">
              Create Exam
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator */}
        <div className="flex gap-4 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 flex items-center gap-2 ${
                step >= s.id ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step === s.id ? "bg-[#1e3a5f] text-white" : "bg-slate-200 text-slate-600"}
                `}
              >
                {s.id}
              </div>
              <div>
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500">{s.description}</p>
              </div>
              {s.id < STEPS.length && (
                <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Exam Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
              <CardDescription>
                Enter the basic details for your exam. You can edit these later.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Exam Title"
                placeholder="e.g., Mid-Term Examination 2025"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Input
                label="Subject Code"
                placeholder="e.g., MATH101, PHYS201"
                value={formData.subjectCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjectCode: e.target.value.toUpperCase(),
                  }))
                }
                hint="Use a unique code to identify this subject"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Number of MCQs
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalQuestions: parseInt(e.target.value, 10) || 60,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  Set how many MCQ questions this exam will have (1–100)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Set Code Type (বাংলা / English)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="setCodeType"
                      checked={formData.setCodeType === "bangla"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          setCodeType: "bangla",
                        }))
                      }
                      className="text-[#1e3a5f]"
                    />
                    <span className="font-medium">বাংলা (ক, খ, গ, ঘ)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="setCodeType"
                      checked={formData.setCodeType === "english"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          setCodeType: "english",
                        }))
                      }
                      className="text-[#1e3a5f]"
                    />
                    <span className="font-medium">English (A, B, C, D)</span>
                  </label>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">
                  OMR sheet এ কোন সেট কোড ব্যবহার হবে (বাংলাদেশে বাংলা বেশি
                  ব্যবহৃত)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Number of Sets (কয়টি সেট)
                </label>
                <select
                  value={formData.numberOfSets}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      numberOfSets: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                >
                  <option value={1}>
                    {formData.setCodeType === "bangla"
                      ? "১ সেট (কোন সেট নেই)"
                      : "1 Set (No Set)"}
                  </option>
                  <option value={2}>
                    {formData.setCodeType === "bangla"
                      ? "২ সেট (ক, খ)"
                      : "2 Sets (A, B)"}
                  </option>
                  <option value={3}>
                    {formData.setCodeType === "bangla"
                      ? "৩ সেট (ক, খ, গ)"
                      : "3 Sets (A, B, C)"}
                  </option>
                  <option value={4}>
                    {formData.setCodeType === "bangla"
                      ? "৪ সেট (ক, খ, গ, ঘ)"
                      : "4 Sets (A, B, C, D)"}
                  </option>
                </select>
                <p className="mt-1.5 text-sm text-slate-500">
                  পরীক্ষার কয়টি সেট থাকবে (১, ২, ৩, বা ৪)
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Answer Key - per set (প্রতিটি সেটের প্রশ্ন সিরিয়াল আলাদা) */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  Answer Key{" "}
                  {activeSetCodes.length > 1
                    ? "(প্রতিটি সেটের জন্য আলাদা)"
                    : ""}
                </CardTitle>
                <CardDescription>
                  {activeSetCodes.length > 1
                    ? "প্রতিটি সেটের প্রশ্ন সিরিয়াল আলাদা হয় - তাই প্রতিটি সেটের জন্য আলাদা answer key দিন। "
                    : ""}
                  হাতে লেখা বা প্রিন্ট করা answer key (যেমন: ১. ক, 2. A) এর ছবি
                  আপলোড করুন, অথবা ম্যানুয়ালি সিলেক্ট করুন।
                </CardDescription>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadAnswerKey}
              />
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="h-4 w-4" />}
                  isLoading={isUploadingKey}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {activeSetCodes.length > 1 ? `Set ${currentSetCode} - ` : ""}
                  Upload Answer Key
                </Button>
                {activeSetCodes.map((sc, idx) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setSelectedSetTab(idx)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedSetTab === idx
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {activeSetCodes.length > 1 ? `Set ${sc}` : "Answer Key"} (
                    {answeredCountBySet[idx] ?? 0}/{totalQuestions})
                  </button>
                ))}
                {activeSetCodes.length > 1 && (
                  <span className="flex items-center gap-2 ml-2 text-sm text-slate-500">
                    | Copy from:
                    {activeSetCodes
                      .filter((sc) => sc !== currentSetCode)
                      .map((sc) => (
                        <button
                          key={`copy-${sc}`}
                          type="button"
                          onClick={() => {
                            const src = answerKeyBySet[sc];
                            if (src && Object.keys(src).length > 0) {
                              setAnswerKeyBySet((prev) => ({
                                ...prev,
                                [currentSetCode]: { ...src },
                              }));
                              addToast(`Copied from Set ${sc}`, "success");
                            }
                          }}
                          className="text-[#1e3a5f] hover:underline font-medium"
                        >
                          {sc}
                        </button>
                      ))}
                  </span>
                )}
              </div>
            </CardHeader>
            <AnswerKeyGrid
              totalQuestions={totalQuestions}
              answerKey={currentAnswerKey}
              onChange={handleAnswerChange(currentSetCode)}
            />
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className={step === 1 ? "invisible" : ""}
          >
            Back
          </Button>
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedStep1}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Next: Answer Key
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedStep2}
              isLoading={isSubmitting}
              leftIcon={<FileQuestion className="h-4 w-4" />}
            >
              Create Exam
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
