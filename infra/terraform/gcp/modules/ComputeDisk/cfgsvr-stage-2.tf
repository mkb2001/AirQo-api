resource "google_compute_disk" "cfgsvr_stage_2" {
  image                     = var.os["ubuntu-bionic"]
  name                      = "cfgsvr-stage-2"
  physical_block_size_bytes = 4096
  project                   = var.project-id
  size                      = var.disk_size["small"]
  type                      = "pd-balanced"
  zone                      = var.zone
}
# terraform import google_compute_disk.cfgsvr_stage_2 projects/${var.project-id}/zones/europe-west1-b/disks/cfgsvr-stage-2
