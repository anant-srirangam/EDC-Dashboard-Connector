pid_file = "/tmp/vault-agent.pid"

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/etc/vault/role_id_env"   # populated from env
      secret_id_file_path = "/etc/vault/secret_id_env" # populated from env
    }
  }

  sink "file" {
    config = {
      path = "/home/edc/.vault-token"
    }
  }
}
