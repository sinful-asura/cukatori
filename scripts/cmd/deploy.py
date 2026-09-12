"""Ship Docker images and (optionally) the host nginx site.

  npm run deploy
  npm run deploy -- fe
  npm run deploy -- api,db
  npm run deploy -- nginx

Local laptop never runs API/FE in Docker. This command builds production
images (and pushes when DOCKER_REGISTRY is set), then applies the compose
stack + host nginx the same way Knežević Garage does.

Set ASCEND_SSH_HOST and ASCEND_REMOTE_DIR for a real server.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.compose import COMPOSE_ALL_PROD, COMPOSE_PROJECT, prod_compose_cmd
from lib.paths import REPO
from lib.targets import SHIP_SERVICES, load_repo_env, parse_services, service_parser

DEPLOY_SERVICES = (*SHIP_SERVICES, "nginx")


def _registry() -> str | None:
    env = load_repo_env()
    value = env.get("DOCKER_REGISTRY", "").strip()
    if not value or value == "your-dockerhub-username":
        return None
    return value


def _tag(name: str) -> str:
    env = load_repo_env()
    tag = env.get("IMAGE_TAG", "latest")
    registry = _registry()
    if registry:
        return f"{registry}/{name}:{tag}"
    return f"{name}:{tag}"


def build_and_maybe_push(image_name: str, dockerfile: Path) -> None:
    tagged = _tag(image_name)
    print(f"=== docker build {tagged} ===")
    subprocess.check_call(
        ["docker", "build", "-t", tagged, "-f", str(dockerfile), str(REPO)],
    )
    if _registry():
        print(f"=== docker push {tagged} ===")
        subprocess.check_call(["docker", "push", tagged])
    else:
        print("  DOCKER_REGISTRY unset — image kept local (no push)")


_REMOTE_SVC = {"api": "api", "db": "postgres", "fe": "web"}


def deploy_remote_stack(services: tuple[str, ...]) -> None:
    host = os.environ.get("ASCEND_SSH_HOST", "").strip()
    remote = os.environ.get("ASCEND_REMOTE_DIR", "/opt/ascend-os").strip()
    if not host:
        print(
            "  ASCEND_SSH_HOST unset — skip remote compose. "
            "Images are built; on the server run:\n"
            f"    cd docker && {prod_compose_cmd()} up -d",
        )
        return

    compose = prod_compose_cmd()
    names = " ".join(
        _REMOTE_SVC[name] for name in services if name in _REMOTE_SVC
    )
    print(f"=== remote compose on {host}:{remote} ===")
    subprocess.check_call(
        [
            "ssh",
            host,
            f"mkdir -p {remote}/docker && cd {remote}/docker && {compose} up -d {names} --remove-orphans",
        ],
    )


def main() -> int:
    parser = service_parser(__doc__)
    args = parser.parse_args()
    services = parse_services(args.services, allowed=DEPLOY_SERVICES, default=SHIP_SERVICES)
    print(f"deploy → {', '.join(services)}")

    try:
        if "api" in services:
            build_and_maybe_push("ascend-os-api", REPO / "api" / "Dockerfile")
        if "fe" in services:
            build_and_maybe_push("ascend-os-web", REPO / "src" / "web" / "Dockerfile")
        if "db" in services or "api" in services or "fe" in services:
            deploy_remote_stack(services)
        if "nginx" in services:
            from lib import nginx

            nginx.deploy(force=True)
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError) as exc:
        print(f"\nDeploy failed: {exc}", file=sys.stderr)
        return 1

    print(f"\n=== deploy done ({COMPOSE_PROJECT} / {COMPOSE_ALL_PROD}) ===")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
