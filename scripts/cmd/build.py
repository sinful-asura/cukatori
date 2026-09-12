"""Build artifacts locally (no Hub push).

  npm run build
  npm run build -- fe
  npm run build -- api
  npm run build -- db
  npm run build -- api,fe
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.paths import REPO
from lib.targets import (
    POSTGRES_IMAGE,
    SHIP_SERVICES,
    compose_db_args,
    ensure_env_file,
    parse_services,
    resolve_ng,
    resolve_npm,
    service_parser,
)


def build_db() -> None:
    print("=== build db (pull official image) ===")
    ensure_env_file()
    subprocess.check_call(["docker", "pull", POSTGRES_IMAGE])
    subprocess.check_call(["docker", "compose", *compose_db_args(), "pull"], cwd=REPO)


def build_api() -> None:
    print("=== build api (Nest + Docker image) ===")
    dockerfile = REPO / "api" / "Dockerfile"
    if not dockerfile.is_file():
        raise FileNotFoundError(f"Missing API Dockerfile: {dockerfile}")
    subprocess.check_call([resolve_npm(), "run", "build"], cwd=REPO / "api")
    subprocess.check_call(
        [
            "docker",
            "build",
            "-t",
            "cukatori-api:local",
            "-f",
            str(dockerfile),
            str(REPO),
        ],
    )


def build_fe() -> None:
    print("=== build fe (Angular production + Docker image) ===")
    subprocess.check_call([*resolve_ng(), "build", "--configuration", "production"], cwd=REPO)
    subprocess.check_call(
        [
            "docker",
            "build",
            "-t",
            "cukatori-web:local",
            "-f",
            str(REPO / "src" / "web" / "Dockerfile"),
            str(REPO),
        ],
    )


def main() -> int:
    args = service_parser(__doc__).parse_args()
    services = parse_services(args.services, allowed=SHIP_SERVICES)
    print(f"build -> {', '.join(services)}")
    try:
        if "db" in services:
            build_db()
        if "api" in services:
            build_api()
        if "fe" in services:
            build_fe()
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError) as exc:
        print(f"\nBuild failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
