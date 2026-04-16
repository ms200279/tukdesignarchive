/**
 * Back-compat barrel — prefer `@/config` for env-backed values.
 */
export {
  professorEmailDomain,
  studentEmailDomain,
  workFilesBucket as WORK_FILES_BUCKET,
  workFilesBucket,
} from "@/config";
