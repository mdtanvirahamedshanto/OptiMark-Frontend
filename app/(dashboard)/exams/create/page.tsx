"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { AnswerKeyGrid } from "@/components/exam/AnswerKeyGrid";
import { useToast } from "@/components/ui/Toast";
import { api, getApiErrorMessage } from "@/lib/api";
import type { AnswerOption } from "@/lib/types";

const STEPS = [
  { id: 1, title: "Exam Details", description: "Title and subject" },
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
  });
  const [answerKey, setAnswerKey] = useState<Record<number, AnswerOption>>({});

  const handleAnswerChange = (questionNumber: number, option: AnswerOption) => {
    setAnswerKey((prev) => ({ ...prev, [questionNumber]: option }));
  };

  const canProceedStep1 =
    formData.title.trim().length > 0 && formData.subjectCode.trim().length > 0;

  const answeredCount = Object.keys(answerKey).length;
  const canProceedStep2 = answeredCount === 60;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    if (!canProceedStep1 || !canProceedStep2) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/exams/create", {
        title: formData.title,
        subject_code: formData.subjectCode,
        total_questions: 60,
        answer_key: Object.fromEntries(
          Object.entries(answerKey).map(([k, v]) => [k, v])
        ),
      });
      const examId = response.data?.id ?? response.data?.exam_id;
      addToast("Exam created! Download OMR template, then upload scanned sheets.", "success");
      router.push(examId ? `/exams/${String(examId)}` : "/dashboard");
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
            </div>
          </Card>
        )}

        {/* Step 2: Answer Key */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Answer Key</CardTitle>
                  <CardDescription>
                    Select the correct option (A, B, C, or D) for each of the 60
                    questions. This will be used to grade the OMR sheets.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`font-medium ${
                      canProceedStep2 ? "text-green-600" : "text-slate-500"
                    }`}
                  >
                    {answeredCount}/60 completed
                  </span>
                </div>
              </div>
            </CardHeader>
            <AnswerKeyGrid
              answerKey={answerKey}
              onChange={handleAnswerChange}
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
