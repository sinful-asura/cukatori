"""Shared Docker Compose names (local db + production stack)."""

from __future__ import annotations

COMPOSE_ALL_PROD = "docker-compose.prod.yaml"
COMPOSE_PROJECT = "cukatori"
MANAGED_CONTAINERS = (
    "cukatori-postgres",
    "cukatori-api",
    "cukatori-web",
)


def prod_compose_cmd(*, env_file: str = "../.env") -> str:
    return f"docker compose --env-file {env_file} -f {COMPOSE_ALL_PROD}"
