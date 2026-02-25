"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";

const ALL_OPTIONS = ["A", "B", "C", "D", "E"];
const BENGALI_LABELS: Record<string, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
  E: "ঙ",
};

export function AnswerKeyEditor({
  totalQuestions,
  optionsPerQuestion,
  setLabels,
  initial,
  onSave,
  loading = false,
}: {
  totalQuestions: number;
  optionsPerQuestion: number;
  setLabels: string[];
  initial?: Record<string, Record<string, string>>;
  onSave: (setLabel: string, mapping: Record<string, string>) => Promise<void> | void;
  loading?: boolean;
}) {
  const labels = useMemo(() => (setLabels.length ? setLabels : ["A"]), [setLabels]);
  const options = useMemo(
    () => ALL_OPTIONS.slice(0, Math.max(4, Math.min(5, optionsPerQuestion))),
    [optionsPerQuestion],
  );

  const [activeSet, setActiveSet] = useState(labels[0]);
  const [state, setState] = useState<Record<string, Record<string, string>>>(initial || {});

  const mapping = state[activeSet] || {};

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveSet(label)}
            className={`px-3 py-1.5 rounded-md text-sm ${activeSet === label ? "bg-slate-900 text-white" : "bg-slate-100"}`}
          >
            Set {label}
          </button>
        ))}
      </div>

      <div className="max-h-[480px] overflow-auto border border-slate-200 rounded-lg p-3 space-y-2">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNo) => (
          <div key={qNo} className="grid grid-cols-[60px_1fr] gap-3 items-center">
            <span className="text-sm text-slate-600">Q{qNo}</span>
            <div className="flex gap-2">
              {options.map((opt) => {
                const selected = mapping[String(qNo)] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        [activeSet]: {
                          ...(prev[activeSet] || {}),
                          [String(qNo)]: opt,
                        },
                      }))
                    }
                    className={`h-9 px-2 rounded-full text-xs border ${selected ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
                  >
                    {BENGALI_LABELS[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={() => onSave(activeSet, mapping)} isLoading={loading}>
        Save Set {activeSet} Answer Key
      </Button>
    </div>
  );
}
