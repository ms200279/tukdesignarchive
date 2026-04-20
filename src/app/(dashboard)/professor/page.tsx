import { Suspense } from "react";
import {
  ProfessorWorksTable,
  ProfessorWorksTableSkeleton,
} from "@/components/professor/professor-works-table";

/**
 * `/professor` dashboard.
 *
 * Thin shell: header renders immediately from zero data, the works table
 * (which joins `works` + `profiles`) streams in behind `<Suspense>`.
 */
export default function ProfessorDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">전체 작품</h1>
        <p className="text-sm text-slate-600">
          학생이 제출한 메타데이터와 원본 파일을 열람할 수 있습니다.
        </p>
      </div>

      <Suspense fallback={<ProfessorWorksTableSkeleton />}>
        <ProfessorWorksTable />
      </Suspense>
    </div>
  );
}
