variable "supabase_access_token" { sensitive = true }
variable "supabase_org_id"       {}
variable "supabase_db_password"  { sensitive = true }
variable "vercel_api_token"      { sensitive = true }
variable "github_repo"           {}
variable "admin_password"        { sensitive = true }
variable "nextauth_secret"       { sensitive = true }