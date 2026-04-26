# AutoShift Houston

Car note takeover marketplace. Sellers list subject-to deals. Buyers browse and inquire. Every connection goes through you.

## Stack

- Next.js 14 (App Router)
- shadcn/ui + Tailwind CSS
- Supabase (Postgres + Storage)
- Custom JWT auth via jose
- Terraform (infra as code)
- Vercel (hosting)

## Setup

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your values
3. Run SQL migrations in `infra/sql/` against your Supabase project
4. Install shadcn components: `npx shadcn@latest init` then add components listed in the spec
5. `npm install && npm run dev`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home / landing |
| `/browse` | Public listing browser |
| `/sell` | Seller intake form |
| `/status` | Seller listing status lookup |
| `/admin` | Admin dashboard (password protected) |
| `/admin/login` | Admin login |

## Infra

See `infra/` for Terraform config. Copy `terraform.tfvars.example` to `terraform.tfvars`, fill in values, run `terraform apply`.

**Note:** Run SQL migrations manually via the Supabase dashboard for reliability.

Built by 4thandBailey.