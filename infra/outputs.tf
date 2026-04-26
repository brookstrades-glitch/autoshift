output "supabase_url" {
  value = "https://${supabase_project.autoshift.id}.supabase.co"
}
output "vercel_project_id" {
  value = vercel_project.autoshift.id
}