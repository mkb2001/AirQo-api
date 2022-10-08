resource "google_compute_firewall" "airqo_k8s_allow_internal" {
  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "ipip"
  }

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  direction     = "INGRESS"
  name          = "airqo-k8s-allow-internal"
  network       = "airqo-k8s-cluster"
  priority      = 1000
  project       = var.project-id
  source_ranges = ["10.240.0.0/24"]
}
# terraform import google_compute_firewall.airqo_k8s_allow_internal projects/${var.project-id}/global/firewalls/airqo-k8s-allow-internal
