"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { AnswerKeyEditor } from "@/components/exam/AnswerKeyEditor";
import { useToast } from "@/components/ui/Toast";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

interface ExamSetItem {
  set_label: string;
}

interface ExamDetail {
  total_questions: number;
  options_per_question: number;
  set_labels: ExamSetItem[];
}

interface AnswerKeyItem {
  set_label: string;
  mapping: Record<string, string>;
}

export default function AnswerKeyPageV1() {
  const params = useParams();
  const examId = params.id as string;
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [keysBySet, setKeysBySet] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const run = async () => {
      if (!session?.backendAccessToken) return;
      try {
        const [examRes, keyRes] = await Promise.all([
          fetch(`${baseUrl}/exams/${examId}`, {
            headers: { Authorization: `Bearer ${session.backendAccessToken}` },
          }),
          fetch(`${baseUrl}/exams/${examId}/answer-keys`, {
            headers: { Authorization: `Bearer ${session.backendAccessToken}` },
          }),
        ]);

        if (examRes.ok) {
          setExam(await examRes.json());
        }
        if (keyRes.ok) {
          const rows = await keyRes.json();
          const grouped: Record<string, Record<string, string>> = {};
          if (Array.isArray(rows)) {
            rows.forEach((row: AnswerKeyItem) => {
              grouped[row.set_label || "A"] = row.mapping || {};
            });
          }
          setKeysBySet(grouped);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [session, examId]);

  const handleSave = async (setLabel: string, mapping: Record<string, string>) => {
    if (!session?.backendAccessToken) return;

    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/exams/${examId}/answer-keys/${encodeURIComponent(setLabel)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        body: JSON.stringify({ mapping }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to save answer key");
      }
      setKeysBySet((prev) => ({ ...prev, [setLabel]: mapping }));
      addToast(`Saved set ${setLabel}`, "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to save answer key", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!exam) return <div>Exam not found</div>;

  const setLabels = Array.isArray(exam?.set_labels)
    ? exam.set_labels.map((s: ExamSetItem) => s.set_label)
    : ["ক"];
  const editorKey = `${examId}-${setLabels.join(",")}-${Object.keys(keysBySet).length}`;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Answer Key Setup</h1>
      <AnswerKeyEditor
        key={editorKey}
        totalQuestions={exam.total_questions}
        optionsPerQuestion={exam.options_per_question}
        setLabels={setLabels}
        initial={keysBySet}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
}
