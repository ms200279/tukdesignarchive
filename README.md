# tukdesignarchive

TUK 디자인학과 졸업전시 아카이브 웹앱입니다. Next.js 15, TypeScript, Tailwind CSS, Supabase를 사용합니다.

## 시작하기

```bash
npm install
cp .env.local.example .env.local
# .env.local 에 Supabase URL·Anon Key·(마이그레이션용) DB 비밀번호를 넣습니다.
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Supabase

1. [대시보드](https://supabase.com/dashboard)에서 **Project URL**과 **anon 키**를 `.env.local`에 넣습니다.
2. **Project Settings → Database → Database password**를 `.env.local`에 `SUPABASE_DB_PASSWORD=...`로 추가합니다.
3. 스키마 적용: **`npm run db:push`** (`supabase link` 없이 동작).

이미 `supabase link`를 쓰는 경우: `npm run db:push:linked`

## 배포

[Vercel](https://vercel.com/docs) 등에 배포할 때 환경 변수를 동일하게 설정하면 됩니다.
