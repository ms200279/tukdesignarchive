import { createWork } from "../actions";

export default function NewWorkPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">새 작품</h1>
      <p className="mt-1 text-sm text-slate-600">
        빈 작품 레코드를 만든 뒤 메타데이터와 원본 파일을 추가합니다.
      </p>
      <form action={createWork} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          작품 만들기
        </button>
      </form>
    </div>
  );
}
