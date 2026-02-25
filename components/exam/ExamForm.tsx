"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DEFAULT_BENGALI_SET_LABELS = ["ক", "খ", "গ", "ঘ"];

export interface ExamFormValues {
  exam_name: string;
  subject_name: string;
  subject_code?: string;
  has_set: boolean;
  set_count: number;
  set_labels: string[];
  total_questions: number;
  negative_marking: boolean;
  negative_value: number;
  options_per_question: number;
}

export function ExamForm({
  initial,
  onSubmit,
  loading = false,
}: {
  initial?: Partial<ExamFormValues>;
  onSubmit: (values: ExamFormValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<ExamFormValues>({
    exam_name: initial?.exam_name || "",
    subject_name: initial?.subject_name || "",
    subject_code: initial?.subject_code || "",
    has_set: initial?.has_set ?? true,
    set_count: initial?.set_count || 2,
    set_labels: initial?.set_labels || DEFAULT_BENGALI_SET_LABELS.slice(0, 2),
    total_questions: initial?.total_questions || 60,
    negative_marking: initial?.negative_marking ?? false,
    negative_value: initial?.negative_value ?? 0.25,
    options_per_question: initial?.options_per_question || 4,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      set_labels: form.has_set
        ? form.set_labels.slice(0, form.set_count)
        : [form.set_labels[0] || "ক"],
      set_count: form.has_set ? form.set_count : 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Exam Name"
        value={form.exam_name}
        onChange={(e) => setForm((p) => ({ ...p, exam_name: e.target.value }))}
        required
      />
      <Input
        label="Subject Name"
        value={form.subject_name}
        onChange={(e) => setForm((p) => ({ ...p, subject_name: e.target.value }))}
        required
      />
      <Input
        label="Subject Code"
        value={form.subject_code || ""}
        onChange={(e) => setForm((p) => ({ ...p, subject_code: e.target.value }))}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.has_set}
          onChange={(e) => setForm((p) => ({ ...p, has_set: e.target.checked }))}
        />
        This exam has multiple sets
      </label>

      {form.has_set && (
        <>
          <Input
            label="Set Count"
            type="number"
            min={1}
            max={4}
            value={form.set_count}
            onChange={(e) => {
              const count = Math.max(1, Math.min(4, Number(e.target.value) || 1));
              setForm((p) => ({
                ...p,
                set_count: count,
                set_labels: Array.from(
                  { length: count },
                  (_, i) => p.set_labels[i] || DEFAULT_BENGALI_SET_LABELS[i] || `সেট-${i + 1}`,
                ),
              }));
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            {form.set_labels.slice(0, form.set_count).map((label, idx) => (
              <Input
                key={idx}
                label={`Set ${idx + 1}`}
                value={label}
                onChange={(e) =>
                  setForm((p) => {
                    const next = [...p.set_labels];
                    next[idx] = e.target.value.toUpperCase();
                    return { ...p, set_labels: next };
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Total Questions"
          type="number"
          min={1}
          max={200}
          value={form.total_questions}
          onChange={(e) => setForm((p) => ({ ...p, total_questions: Number(e.target.value) || 1 }))}
        />
        <Input
          label="Options per Question"
          type="number"
          min={4}
          max={5}
          value={form.options_per_question}
          onChange={(e) => setForm((p) => ({ ...p, options_per_question: Number(e.target.value) || 4 }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.negative_marking}
          onChange={(e) => setForm((p) => ({ ...p, negative_marking: e.target.checked }))}
        />
        Enable negative marking
      </label>

      {form.negative_marking && (
        <Input
          label="Negative value"
          type="number"
          step="0.01"
          min={0}
          value={form.negative_value}
          onChange={(e) => setForm((p) => ({ ...p, negative_value: Number(e.target.value) || 0 }))}
        />
      )}

      <Button type="submit" className="w-full" isLoading={loading}>
        Save Exam
      </Button>
    </form>
  );
}
