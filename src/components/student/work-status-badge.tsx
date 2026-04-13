import type { WorkStatusTone } from "@/lib/student/work-status";

const toneClass: Record<WorkStatusTone, string> = {
  neutral:
    "border-slate-200 bg-slate-50 text-slate-600",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function WorkStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: WorkStatusTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}
