resource "google_compute_firewall" "airqo_k8s_cluster_allow_https" {
  allow {
    ports    = ["443"]
    protocol = "tcp"
  }

  direction     = "INGRESS"
  name          = "airqo-k8s-cluster-allow-https"
  network       = "airqo-k8s-cluster"
  priority      = 1000
  project       = var.project-id
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}
# terraform import google_compute_firewall.airqo_k8s_cluster_allow_https projects/${var.project-id}/global/firewalls/airqo-k8s-cluster-allow-https
