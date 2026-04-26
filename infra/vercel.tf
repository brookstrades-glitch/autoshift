resource "vercel_project" "autoshift" {
  name      = "autoshift"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

resource "vercel_project_domain" "domain" {
  project_id = vercel_project.autoshift.id
  domain     = "autoshifthouston.com"
}

locals {
  env_vars = {
    NEXT_PUBLIC_SUPABASE_URL      = "https://${supabase_project.autoshift.id}.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY = supabase_project.autoshift.anon_key
    SUPABASE_SERVICE_ROLE_KEY     = supabase_project.autoshift.service_role_key
    ADMIN_PASSWORD                = var.admin_password
    NEXTAUTH_SECRET               = var.nextauth_secret
    NEXTAUTH_URL                  = "https://autoshifthouston.com"
  }
}

resource "vercel_project_environment_variable" "vars" {
  for_each   = local.env_vars
  project_id = vercel_project.autoshift.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = contains(["SUPABASE_SERVICE_ROLE_KEY", "ADMIN_PASSWORD", "NEXTAUTH_SECRET"], each.key)
}