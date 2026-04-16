import { createServerSupabaseClient } from "@/lib/db/server";
import type { WorksRepository } from "@/repositories/ports/works-repository.port";
import type {
  ProfessorWorkDetail,
  ProfessorWorkListItem,
  StudentWorkListItem,
  Work,
} from "@/types/domain";

function mapWorkRow(row: Record<string, unknown>): Work {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    title: String(row.title ?? ""),
    description:
      row.description === null || row.description === undefined
        ? null
        : String(row.description),
    exhibition_year:
      row.exhibition_year === null || row.exhibition_year === undefined
        ? null
        : Number(row.exhibition_year),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    cover_series_id:
      row.cover_series_id === null || row.cover_series_id === undefined
        ? null
        : String(row.cover_series_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapOwnerSummary(
  raw: unknown,
): { display_name: string | null; student_id: string | null } | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    display_name:
      o.display_name === null || o.display_name === undefined
        ? null
        : String(o.display_name),
    student_id:
      o.student_id === null || o.student_id === undefined
        ? null
        : String(o.student_id),
  };
}

function mapProfessorListItem(raw: Record<string, unknown>): ProfessorWorkListItem {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ""),
    exhibition_year:
      raw.exhibition_year === null || raw.exhibition_year === undefined
        ? null
        : Number(raw.exhibition_year),
    updated_at: String(raw.updated_at),
    owner: mapOwnerSummary(raw.owner),
  };
}

export class SupabaseWorksRepository implements WorksRepository {
  async listWorksForOwner(
    ownerId: string,
  ): Promise<{ rows: StudentWorkListItem[]; error: Error | null }> {
    const db = await createServerSupabaseClient();
    const { data: rows, error } = await db
      .from("works")
      .select("id, title, description, exhibition_year, updated_at")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false });

    if (error) {
      return { rows: [], error: new Error(error.message) };
    }
    const mapped = (rows ?? []).map((r) => {
      const row = r as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        title: String(row.title ?? ""),
        description:
          row.description === null || row.description === undefined
            ? null
            : String(row.description),
        exhibition_year:
          row.exhibition_year === null || row.exhibition_year === undefined
            ? null
            : Number(row.exhibition_year),
        updated_at: String(row.updated_at),
      } satisfies StudentWorkListItem;
    });
    return { rows: mapped, error: null };
  }

  async insertWorkForOwner(params: {
    ownerId: string;
    title: string;
  }): Promise<{ id: string } | { error: string }> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db
      .from("works")
      .insert({
        owner_id: params.ownerId,
        title: params.title,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "insert failed" };
    }
    return { id: data.id as string };
  }

  async updateWorkMetadataForOwner(params: {
    ownerId: string;
    workId: string;
    title: string;
    description: string | null;
    exhibition_year: number | null;
  }): Promise<{ error: string | null }> {
    const db = await createServerSupabaseClient();
    const { error } = await db
      .from("works")
      .update({
        title: params.title,
        description: params.description,
        exhibition_year: params.exhibition_year,
      })
      .eq("id", params.workId)
      .eq("owner_id", params.ownerId);

    return { error: error?.message ?? null };
  }

  async updateCoverSeriesIdForOwner(params: {
    ownerId: string;
    workId: string;
    coverSeriesId: string;
  }): Promise<{ error: string | null }> {
    const db = await createServerSupabaseClient();
    const { error } = await db
      .from("works")
      .update({ cover_series_id: params.coverSeriesId })
      .eq("id", params.workId)
      .eq("owner_id", params.ownerId);

    return { error: error?.message ?? null };
  }

  async getOwnedWorkById(params: {
    ownerId: string;
    workId: string;
  }): Promise<{ work: Work | null; error: string | null }> {
    const db = await createServerSupabaseClient();
    const { data: work, error } = await db
      .from("works")
      .select("*")
      .eq("id", params.workId)
      .eq("owner_id", params.ownerId)
      .maybeSingle();

    if (error) {
      return { work: null, error: error.message };
    }
    if (!work) {
      return { work: null, error: null };
    }
    return {
      work: mapWorkRow(work as unknown as Record<string, unknown>),
      error: null,
    };
  }

  async listWorksForProfessor(): Promise<{
    rows: ProfessorWorkListItem[];
    error: Error | null;
  }> {
    const db = await createServerSupabaseClient();
    const { data: rows, error } = await db
      .from("works")
      .select(
        "id, title, exhibition_year, updated_at, owner:profiles!works_owner_id_fkey(display_name, student_id)",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      return { rows: [], error: new Error(error.message) };
    }
    const mapped = (rows ?? []).map((r) =>
      mapProfessorListItem(r as unknown as Record<string, unknown>),
    );
    return { rows: mapped, error: null };
  }

  async getWorkByIdForProfessorView(workId: string): Promise<{
    work: ProfessorWorkDetail | null;
    error: string | null;
  }> {
    const db = await createServerSupabaseClient();
    const { data: work, error } = await db
      .from("works")
      .select(
        "*, owner:profiles!works_owner_id_fkey(display_name, student_id)",
      )
      .eq("id", workId)
      .maybeSingle();

    if (error) {
      return { work: null, error: error.message };
    }
    if (!work) {
      return { work: null, error: null };
    }
    const row = work as unknown as Record<string, unknown>;
    const base = mapWorkRow(row);
    const detail: ProfessorWorkDetail = {
      ...base,
      owner: mapOwnerSummary(row.owner),
    };
    return { work: detail, error: null };
  }

  async deleteWorkForOwner(params: {
    ownerId: string;
    workId: string;
  }): Promise<{ error: string | null }> {
    const db = await createServerSupabaseClient();
    const { error } = await db
      .from("works")
      .delete()
      .eq("id", params.workId)
      .eq("owner_id", params.ownerId);

    return { error: error?.message ?? null };
  }
}
