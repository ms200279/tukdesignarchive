#!/usr/bin/env node
/**
 * supabase link 없이 DB 연결 문자열로 마이그레이션만 푸시합니다.
 *
 * .env.local 에 다음 중 하나:
 *   SUPABASE_DB_PASSWORD=...  (자동으로 direct URI 구성)
 * 또는
 *   SUPABASE_DB_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
 *
 * 비밀번호: Dashboard → Project Settings → Database → Database password
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

if (!existsSync(envPath)) {
  console.error("❌ .env.local 파일이 없습니다.");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf8");
const vars = {};
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

let dbUrl = vars.SUPABASE_DB_URL;

if (!dbUrl) {
  const supabaseUrl = vars.NEXT_PUBLIC_SUPABASE_URL;
  const password = vars.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL 이 .env.local 에 없습니다.");
    process.exit(1);
  }

  if (!password) {
    console.error(
      "❌ SUPABASE_DB_PASSWORD 또는 SUPABASE_DB_URL 이 필요합니다.\n\n" +
        "   대시보드 → Project Settings → Database → Database password\n" +
        "   .env.local 예:\n" +
        "   SUPABASE_DB_PASSWORD=비밀번호\n\n" +
        "   (또는 URI 전체를 SUPABASE_DB_URL 로 넣어도 됩니다.)",
    );
    process.exit(1);
  }

  const host = supabaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const ref = host.replace(/\.supabase\.co$/i, "");
  if (!ref || ref === host) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL 에서 project ref 를 파싱할 수 없습니다.");
    process.exit(1);
  }

  const enc = encodeURIComponent(password);
  dbUrl = `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`;
}

const masked = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
console.log(`→ db push (${masked})`);

const r = spawnSync(
  "npx",
  ["supabase", "db", "push", "--db-url", dbUrl, "--yes"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(r.status ?? 1);
