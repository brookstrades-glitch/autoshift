resource "supabase_project" "autoshift" {
  name              = "autoshift"
  organization_id   = var.supabase_org_id
  region            = "us-east-1"
  database_password = var.supabase_db_password
}

resource "supabase_storage_bucket" "photos" {
  project_ref = supabase_project.autoshift.id
  id          = "vehicle-photos"
  public      = true
}