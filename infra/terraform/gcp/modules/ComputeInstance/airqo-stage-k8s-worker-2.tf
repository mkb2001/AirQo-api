resource "google_compute_instance" "airqo_stage_k8s_worker_2" {
  boot_disk {
    auto_delete = true
    device_name = "airqo-stage-k8s-worker-2"

    initialize_params {
      image = var.os["ubuntu-focal"]
      size  = var.disk_size["tiny"]
      type  = "pd-standard"
    }

    mode   = "READ_WRITE"
    source = "airqo-stage-k8s-worker-2"
  }

  can_ip_forward = true

  confidential_instance_config {
    enable_confidential_compute = false
  }

  machine_type = "e2-standard-2"

  name = "airqo-stage-k8s-worker-2"

  network_interface {
    access_config {
      network_tier = "PREMIUM"
    }

    network            = "airqo-k8s-cluster"
    network_ip         = "10.240.0.70"
    stack_type         = "IPV4_ONLY"
    subnetwork         = "k8s-nodes"
    subnetwork_project = var.project-id
  }

  project = var.project-id

  reservation_affinity {
    type = "ANY_RESERVATION"
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    provisioning_model  = "STANDARD"
  }

  service_account {
    email  = "${var.project-number}-compute@developer.gserviceaccount.com"
    scopes = ["https://www.googleapis.com/auth/compute", "https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/logging.write", "https://www.googleapis.com/auth/monitoring", "https://www.googleapis.com/auth/service.management.readonly", "https://www.googleapis.com/auth/servicecontrol"]
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
    enable_vtpm                 = true
  }

  tags = ["airqo-k8s-cluster", "worker"]
  zone = var.zone
}
# terraform import google_compute_instance.airqo_stage_k8s_worker_2 projects/${var.project-id}/zones/europe-west1-b/instances/airqo-stage-k8s-worker-2
