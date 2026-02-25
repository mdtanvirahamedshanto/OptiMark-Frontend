"use client";

import { SheetResultDetail } from "@/lib/api/types";

const OPTION_TO_BN: Record<string, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
  E: "ঙ",
};

function toBnOption(value?: string | null): string {
  if (!value) return "-";
  const key = value.toUpperCase();
  return OPTION_TO_BN[key] || value;
}

export function ResultViewer({ detail }: { detail: SheetResultDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="border border-slate-200 rounded-lg p-3">Correct: {detail.summary.correct}</div>
        <div className="border border-slate-200 rounded-lg p-3">Wrong: {detail.summary.wrong}</div>
        <div className="border border-slate-200 rounded-lg p-3">Score: {detail.summary.final_score}</div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Q</th>
              <th className="text-left px-3 py-2">Selected</th>
              <th className="text-left px-3 py-2">Correct</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Mark</th>
            </tr>
          </thead>
          <tbody>
            {detail.questions.map((q) => (
              <tr key={q.question_no} className="border-t border-slate-100">
                <td className="px-3 py-2">{q.question_no}</td>
                <td className="px-3 py-2">{toBnOption(q.selected_option)}</td>
                <td className="px-3 py-2">{toBnOption(q.correct_option)}</td>
                <td className="px-3 py-2">{q.status}</td>
                <td className="px-3 py-2">{q.mark_awarded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
