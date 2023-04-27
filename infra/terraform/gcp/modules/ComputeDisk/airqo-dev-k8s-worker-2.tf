resource "google_compute_disk" "airqo_dev_k8s_worker_1" {
  image                     = var.os["ubuntu-focal"]
  name                      = "airqo-dev-k8s-worker-2"
  physical_block_size_bytes = 4096
  project                   = var.project_id
  size                      = var.disk_size["medium"]
  type                      = "pd-standard"
  zone                      = var.zone["d"]
  description               = "Disk for the airqo-dev-k8s-worker-2 instance"
}
# terraform import google_compute_disk.airqo_dev_k8s_worker_2 projects/${var.project_id}/zones/${var.zone["b"]}/disks/airqo-dev-k8s-worker-2