resource "google_compute_disk" "cfgsvr_dev_1" {
  image                     = var.os["ubuntu-bionic"]
  name                      = "cfgsvr-dev-1"
  physical_block_size_bytes = 4096
  project                   = var.project-id
  size                      = var.disk_size["small"]
  type                      = "pd-balanced"
  zone                      = var.zone
}
# terraform import google_compute_disk.cfgsvr_dev_1 projects/${var.project-id}/zones/europe-west1-b/disks/cfgsvr-dev-1
