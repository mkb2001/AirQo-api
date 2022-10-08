resource "google_storage_bucket" "airqo_datawarehouse_bucket" {
  force_destroy               = false
  location                    = var.location
  name                        = "airqo_datawarehouse_bucket"
  project                     = var.project-id
  # Argument "public_access_prevention" not expected here.
# public_access_prevention    = "enforced"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
}
# terraform import google_storage_bucket.airqo_datawarehouse_bucket airqo_datawarehouse_bucket
