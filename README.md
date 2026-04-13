# tukdesignarchive

TUK 디자인학과 졸업전시 아카이브 웹앱입니다. Next.js 15, TypeScript, Tailwind CSS, Supabase를 사용합니다.

## 시작하기

```bash
npm install
cp .env.local.example .env.local
# .env.local에 Supabase URL·Anon Key 등을 입력합니다.
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Supabase

`supabase/migrations/`의 SQL을 프로젝트에 적용한 뒤 Storage 버킷·RLS가 동작하는지 확인하세요.

## 배포

[Vercel](https://vercel.com/docs) 등에 배포할 때 환경 변수를 동일하게 설정하면 됩니다.
