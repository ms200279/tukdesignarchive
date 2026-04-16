"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  uploadHints,
  validateBatchTotal,
  validateCoverFile,
  validateOriginalFile,
} from "@/lib/uploads/limits";
import {
  assignCoverSeriesForWork,
  signedUrlForCoverPreview,
  uploadWorkFileVersion,
} from "@/lib/storage/work-file-server-actions";
import type { StoredObjectRef, WorkFile } from "@/types/domain";
import { WorkFileDownload } from "@/components/works/work-file-download";

export type FileSeriesGroup = {
  seriesId: string;
  kind: "cover" | "original";
  versions: WorkFile[];
};

function groupFiles(files: WorkFile[]): FileSeriesGroup[] {
  const map = new Map<string, WorkFile[]>();
  for (const f of files) {
    const list = map.get(f.series_id) ?? [];
    list.push(f);
    map.set(f.series_id, list);
  }
  return [...map.entries()].map(([seriesId, versions]) => {
    const sorted = [...versions].sort((a, b) => b.version - a.version);
    const kind = sorted[0]?.kind ?? "original";
    return { seriesId, kind, versions: sorted };
  });
}

function CoverPreview({ objectRef }: { objectRef: StoredObjectRef }) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await signedUrlForCoverPreview(objectRef);
      if (cancelled) return;
      if ("error" in res) setErr(true);
      else setUrl(res.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bucket+path로 동일 객체 식별
  }, [objectRef.bucket, objectRef.path]);

  if (err) {
    return (
      <p className="text-xs text-slate-500">미리보기를 불러올 수 없습니다.</p>
    );
  }
  if (!url) {
    return (
      <div className="h-40 w-full max-w-md animate-pulse rounded-md bg-slate-100" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="대표 이미지"
      className="max-h-56 max-w-full rounded-md border border-slate-200 object-contain"
    />
  );
}

export function StudentWorkFilesPanel({
  workId,
  initialCoverSeriesId,
  files,
}: {
  workId: string;
  initialCoverSeriesId: string | null;
  files: WorkFile[];
}) {
  const router = useRouter();
  const hints = uploadHints();
  const [feedback, setFeedback] = useState<{
    tone: "ok" | "err";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [coverSeriesId, setCoverSeriesId] = useState<string | null>(
    initialCoverSeriesId,
  );
  const [targetSeriesForVersion, setTargetSeriesForVersion] = useState<
    string | null
  >(null);

  useEffect(() => {
    setCoverSeriesId(initialCoverSeriesId);
  }, [initialCoverSeriesId]);

  const groups = useMemo(() => groupFiles(files), [files]);
  const coverGroups = groups.filter((g) => g.kind === "cover");
  const originalGroups = groups.filter((g) => g.kind === "original");
  const latestCover = files.find((f) => f.kind === "cover" && f.is_latest);
  const primaryCoverGroup = coverGroups[0];

  const pushFeedback = useCallback((tone: "ok" | "err", text: string) => {
    setFeedback({ tone, text });
  }, []);

  const uploadNewVersion = useCallback(
    async (
      file: File,
      kind: "cover" | "original",
      seriesId: string,
    ): Promise<string | null> => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadWorkFileVersion(workId, kind, seriesId, fd);
      if (!res.ok) {
        return res.message;
      }
      return null;
    },
    [workId],
  );

  const onCoverFile = useCallback(
    async (file: File) => {
      const v = validateCoverFile(file);
      if (v) {
        pushFeedback("err", v);
        return;
      }
      setBusy(true);
      setFeedback(null);

      let sid = coverSeriesId;
      if (!sid) {
        const assign = await assignCoverSeriesForWork(workId);
        if ("error" in assign) {
          setBusy(false);
          pushFeedback("err", assign.error);
          return;
        }
        sid = assign.seriesId;
        setCoverSeriesId(sid);
      }

      const err = await uploadNewVersion(file, "cover", sid);
      setBusy(false);
      if (err) {
        pushFeedback("err", err);
        return;
      }
      pushFeedback("ok", "대표 이미지가 새 버전으로 저장되었습니다. 이전 버전은 보관됩니다.");
      router.refresh();
    },
    [coverSeriesId, pushFeedback, router, uploadNewVersion, workId],
  );

  const onOriginalNewVersion = useCallback(
    async (file: File, seriesId: string) => {
      const v = validateOriginalFile(file);
      if (v) {
        pushFeedback("err", v);
        return;
      }
      setBusy(true);
      setFeedback(null);
      const err = await uploadNewVersion(file, "original", seriesId);
      setBusy(false);
      setTargetSeriesForVersion(null);
      if (err) {
        pushFeedback("err", err);
        return;
      }
      pushFeedback("ok", "새 버전이 추가되었습니다. 이전 파일은 그대로 보관됩니다.");
      router.refresh();
    },
    [pushFeedback, router, uploadNewVersion],
  );

  return (
    <div className="space-y-8">
      {feedback ? (
        <div
          role="status"
          className={
            feedback.tone === "ok"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          {feedback.text}
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">대표 이미지</h2>
            <p className="mt-0.5 text-xs text-slate-500">{hints.cover}</p>
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 sm:mt-0">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onCoverFile(f);
                e.target.value = "";
              }}
            />
            {busy ? "처리 중…" : latestCover ? "이미지 교체 (버전 추가)" : "이미지 업로드"}
          </label>
        </div>

        {latestCover ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-slate-500">현재 대표</p>
            <CoverPreview
              objectRef={{ bucket: latestCover.bucket, path: latestCover.path }}
            />
            {primaryCoverGroup && primaryCoverGroup.versions.length > 1 ? (
              <details className="rounded-md border border-slate-100 bg-slate-50/80 p-3 text-sm">
                <summary className="cursor-pointer text-slate-600">
                  이전 버전 ({primaryCoverGroup.versions.length - 1})
                </summary>
                <ul className="mt-2 space-y-2">
                  {primaryCoverGroup.versions
                    .filter((v) => !v.is_latest)
                    .map((v) => (
                      <li key={v.id}>
                        <WorkFileDownload file={v} />
                      </li>
                    ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            등록된 대표 이미지가 없습니다.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">원본 파일</h2>
            <p className="mt-0.5 text-xs text-slate-500">{hints.original}</p>
            <p className="mt-1 text-xs text-slate-400">
              여러 개 선택 시 파일마다 별도 자산으로 추가됩니다. 기존 파일은 삭제되지
              않으며, 줄기별로 &quot;새 버전&quot;만 쌓입니다.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            <input
              type="file"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const list = e.target.files;
                if (!list?.length) return;
                void (async () => {
                  const selected = Array.from(list);
                  const batchErr = validateBatchTotal(selected);
                  if (batchErr) {
                    pushFeedback("err", batchErr);
                    e.target.value = "";
                    return;
                  }
                  const failed: string[] = [];
                  let ok = 0;
                  setBusy(true);
                  for (const f of selected) {
                    const v = validateOriginalFile(f);
                    if (v) {
                      failed.push(v);
                      continue;
                    }
                    const err = await uploadNewVersion(
                      f,
                      "original",
                      crypto.randomUUID(),
                    );
                    if (err) failed.push(`${f.name}: ${err}`);
                    else ok += 1;
                  }
                  setBusy(false);
                  e.target.value = "";
                  if (failed.length && ok === 0) {
                    pushFeedback("err", failed.slice(0, 4).join(" · "));
                  } else if (failed.length) {
                    pushFeedback(
                      "err",
                      `${ok}개 성공, 일부 실패: ${failed.slice(0, 2).join(" · ")}`,
                    );
                  } else {
                    pushFeedback("ok", `${ok}개 파일을 추가했습니다.`);
                  }
                  router.refresh();
                })();
              }}
            />
            {busy ? "업로드 중…" : "파일 추가 (여러 개)"}
          </label>
        </div>

        {targetSeriesForVersion ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            선택한 줄기에 새 버전을 올리세요.
            <label className="ml-2 inline cursor-pointer font-medium underline">
              파일 선택
              <input
                type="file"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && targetSeriesForVersion) {
                    void onOriginalNewVersion(f, targetSeriesForVersion);
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              className="ml-2 text-slate-600 underline"
              onClick={() => setTargetSeriesForVersion(null)}
            >
              취소
            </button>
          </div>
        ) : null}

        <ul className="mt-6 space-y-4">
          {originalGroups.length === 0 ? (
            <li className="text-sm text-slate-500">원본 파일이 없습니다.</li>
          ) : (
            originalGroups.map((g) => {
              const latest = g.versions.find((v) => v.is_latest) ?? g.versions[0];
              const older = g.versions.filter((v) => !v.is_latest);
              return (
                <li
                  key={g.seriesId}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <WorkFileDownload file={latest} />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setTargetSeriesForVersion(g.seriesId)}
                      className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      새 버전 업로드
                    </button>
                  </div>
                  {older.length > 0 ? (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-xs text-slate-500">
                        이전 버전 ({older.length})
                      </summary>
                      <ul className="mt-2 space-y-2">
                        {older.map((v) => (
                          <li key={v.id}>
                            <WorkFileDownload file={v} />
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
