import type {
  ProfessorWorkDetail,
  ProfessorWorkListItem,
  StudentWorkListItem,
  Work,
} from "@/types/domain";

export interface WorksRepository {
  listWorksForOwner(
    ownerId: string,
  ): Promise<{ rows: StudentWorkListItem[]; error: Error | null }>;

  insertWorkForOwner(params: {
    ownerId: string;
    title: string;
  }): Promise<{ id: string } | { error: string }>;

  updateWorkMetadataForOwner(params: {
    ownerId: string;
    workId: string;
    title: string;
    description: string | null;
    exhibition_year: number | null;
  }): Promise<{ error: string | null }>;

  updateCoverSeriesIdForOwner(params: {
    ownerId: string;
    workId: string;
    coverSeriesId: string;
  }): Promise<{ error: string | null }>;

  getOwnedWorkById(params: {
    ownerId: string;
    workId: string;
  }): Promise<{ work: Work | null; error: string | null }>;

  listWorksForProfessor(): Promise<{
    rows: ProfessorWorkListItem[];
    error: Error | null;
  }>;

  getWorkByIdForProfessorView(workId: string): Promise<{
    work: ProfessorWorkDetail | null;
    error: string | null;
  }>;

  deleteWorkForOwner(params: {
    ownerId: string;
    workId: string;
  }): Promise<{ error: string | null }>;
}
