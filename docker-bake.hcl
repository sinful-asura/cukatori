# Images for `task build` and `task release`. REGISTRY and TAG are set by the task.
# Image names are <app>-<component>, matching deploy/app.yaml.
variable "REGISTRY" { default = "localhost:5001" }
variable "TAG" { default = "dev" }

group "default" {
  targets = ["web", "api"]
}

target "web" {
  context    = "."
  dockerfile = "deploy/web.Dockerfile"
  platforms  = ["linux/amd64"]
  tags       = ["${REGISTRY}/cukatori-web:${TAG}"]
}

target "api" {
  context    = "."
  dockerfile = "api/Dockerfile"
  platforms  = ["linux/amd64"]
  tags       = ["${REGISTRY}/cukatori-api:${TAG}"]
}
