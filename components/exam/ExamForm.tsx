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
  template_type: string;
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
    set_count: initial?.set_count || 1,
    set_labels: initial?.set_labels || DEFAULT_BENGALI_SET_LABELS.slice(0, 1),
    total_questions: initial?.total_questions || 20,
    negative_marking: initial?.negative_marking ?? false,
    negative_value: initial?.negative_value ?? 0.25,
    options_per_question: initial?.options_per_question || 4,
    template_type: initial?.template_type || "auto",
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
        onChange={(e) =>
          setForm((p) => ({ ...p, subject_name: e.target.value }))
        }
        required
      />
      <Input
        label="Subject Code"
        value={form.subject_code || ""}
        onChange={(e) =>
          setForm((p) => ({ ...p, subject_code: e.target.value }))
        }
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          Template Type
        </label>
        <select
          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
          value={form.template_type}
          onChange={(e) =>
            setForm((p) => ({ ...p, template_type: e.target.value }))
          }
        >
          <option value="auto">Auto (Standard Layout)</option>
          <option value="20q_mcq_png">Custom 20Q Hand-written Sheet</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.has_set}
          onChange={(e) =>
            setForm((p) => ({ ...p, has_set: e.target.checked }))
          }
        />
        This exam has multiple sets
      </label>

      {form.has_set && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Set Count
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              value={form.set_count}
              onChange={(e) => {
                const count = Math.max(
                  1,
                  Math.min(4, Number(e.target.value) || 1),
                );
                setForm((p) => ({
                  ...p,
                  set_count: count,
                  set_labels: Array.from(
                    { length: count },
                    (_, i) =>
                      p.set_labels[i] ||
                      DEFAULT_BENGALI_SET_LABELS[i] ||
                      `সেট-${i + 1}`,
                  ),
                }));
              }}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Set" : "Sets"}
                </option>
              ))}
            </select>
          </div>

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

      <div className="grid sm:grid-cols-1 gap-4">
        <Input
          label="Total Questions"
          type="number"
          min={1}
          max={200}
          value={form.total_questions === 0 ? "" : form.total_questions}
          onChange={(e) => {
            const val = e.target.value;
            setForm((p) => ({
              ...p,
              total_questions: val === "" ? 0 : Number(val),
            }));
          }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.negative_marking}
          onChange={(e) =>
            setForm((p) => ({ ...p, negative_marking: e.target.checked }))
          }
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
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              negative_value: Number(e.target.value) || 0,
            }))
          }
        />
      )}

      <Button type="submit" className="w-full" isLoading={loading}>
        Save Exam
      </Button>
    </form>
  );
}
