import { SupabaseUsersRepository } from "@/repositories/adapters/supabase/supabase-users.repository";
import { SupabaseWorkFilesRepository } from "@/repositories/adapters/supabase/supabase-work-files.repository";
import { SupabaseWorksRepository } from "@/repositories/adapters/supabase/supabase-works.repository";
import type { UsersRepository } from "@/repositories/ports/users-repository.port";
import type { WorkFilesRepository } from "@/repositories/ports/work-files-repository.port";
import type { WorksRepository } from "@/repositories/ports/works-repository.port";

/** Composition root: swap implementations for migration. */
export const usersRepository: UsersRepository = new SupabaseUsersRepository();
export const worksRepository: WorksRepository = new SupabaseWorksRepository();
export const workFilesRepository: WorkFilesRepository =
  new SupabaseWorkFilesRepository();
