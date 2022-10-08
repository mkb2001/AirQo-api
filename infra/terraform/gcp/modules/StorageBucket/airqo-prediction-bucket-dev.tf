resource "google_storage_bucket" "airqo_prediction_bucket_dev" {
  force_destroy               = false
  location                    = var.location
  name                        = "airqo_prediction_bucket_dev"
  project                     = var.project-id
  ## Argument "public_access_prevention" not expected here.
  # public_access_prevention    = "inherited"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
}
# terraform import google_storage_bucket.airqo_prediction_bucket_dev airqo_prediction_bucket_dev
