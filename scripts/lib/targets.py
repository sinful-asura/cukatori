"""Parse api / fe / db / seed / all from npm extra args (after `--`)."""

from __future__ import annotations

import argparse
import json
import os
import shutil

from lib.compose import COMPOSE_PROJECT
from lib.paths import REPO

LOCAL_SERVICES = ("api", "fe", "db", "seed")
LOCAL_DEFAULT = ("db", "api", "fe")
SHIP_SERVICES = ("api", "fe", "db")

ALIASES = {
    "web": "fe",
    "frontend": "fe",
    "angular": "fe",
    "postgres": "db",
    "nest": "api",
}

COMPOSE_DB = [
    REPO / "docker" / "docker-compose.db.yaml",
    REPO / "docker" / "docker-compose.db.local.yaml",
]
POSTGRES_IMAGE = "postgres:18-alpine"


def load_repo_env() -> dict[str, str]:
    env = os.environ.copy()
    path = REPO / ".env"
    if not path.is_file():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def ensure_env_file() -> None:
    dest = REPO / ".env"
    example = REPO / ".env.example"
    if dest.is_file() or not example.is_file():
        return
    dest.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")
    print("  wrote .env from .env.example")


def compose_db_args() -> list[str]:
    files: list[str] = [
        "-p",
        COMPOSE_PROJECT,
        "--env-file",
        str(REPO / ".env"),
    ]
    for path in COMPOSE_DB:
        files.extend(["-f", str(path)])
    return files


def parse_services(
    tokens: list[str],
    *,
    allowed: tuple[str, ...] = SHIP_SERVICES,
    default: tuple[str, ...] | None = None,
) -> tuple[str, ...]:
    fallback = default if default is not None else allowed
    if not tokens:
        return fallback
    if tokens == ["all"]:
        return allowed
    chosen: list[str] = []
    for token in tokens:
        for part in token.split(","):
            name = part.strip().lower()
            if not name:
                continue
            if name == "all":
                return allowed
            name = ALIASES.get(name, name)
            if name not in allowed:
                raise SystemExit(
                    f"Unknown target {part!r}. Use {', '.join(allowed)}, or all."
                )
            if name not in chosen:
                chosen.append(name)
    if not chosen:
        return fallback
    return tuple(chosen)


def service_parser(description: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument(
        "services",
        nargs="*",
        help="Targets (comma or space). Default / all = every target this command supports.",
    )
    return parser


def resolve_npm() -> str:
    for name in ("npm", "npm.cmd"):
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("npm not found in PATH — install Node.js")


def resolve_node() -> str:
    for name in ("node", "node.exe"):
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("node not found in PATH — install Node.js")


def prime_ng_licence(env: dict[str, str] | None = None) -> str:
    src = env if env is not None else os.environ
    raw = (src.get("PRIME_NG_LICENCE") or src.get("PRIME_NG_LICENSE") or "").strip()
    if raw in {"", "your-prime-ng-licence"}:
        return ""
    return raw


def ng_define_flags(env: dict[str, str] | None = None) -> list[str]:
    return ["--define", f"ASCEND_PRIME_NG_LICENCE={json.dumps(prime_ng_licence(env))}"]


def docker_prime_ng_build_args(env: dict[str, str] | None = None) -> list[str]:
    return ["--build-arg", f"PRIME_NG_LICENCE={prime_ng_licence(env)}"]


def resolve_ng() -> list[str]:
    local = REPO / "node_modules" / "@angular" / "cli" / "bin" / "ng.js"
    if local.is_file():
        return [resolve_node(), str(local)]
    ng = shutil.which("ng") or shutil.which("ng.cmd")
    if ng:
        return [ng]
    raise RuntimeError("Angular CLI not found — run npm install or install ng globally")


def resolve_nest() -> list[str]:
    local = REPO / "api" / "node_modules" / "@nestjs" / "cli" / "bin" / "nest.js"
    if local.is_file():
        return [resolve_node(), str(local)]
    nest = shutil.which("nest") or shutil.which("nest.cmd")
    if nest:
        return [nest]
    raise RuntimeError("Nest CLI not found — run npm install in api/ or install nest globally")
