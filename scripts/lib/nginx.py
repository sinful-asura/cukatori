"""Deploy host nginx site (sites-available → sites-enabled), garage-style."""

from __future__ import annotations

import hashlib
import os
import subprocess
import sys
from pathlib import Path

from lib.paths import REPO

SITE_SRC = REPO / "src" / "nginx" / "nginx.conf"
HOST = os.environ.get("ASCEND_SSH_HOST", "root@starlabs.rs")
REMOTE_SITE = os.environ.get(
    "ASCEND_NGINX_SITE",
    "/etc/nginx/sites-available/ascend-os",
)
SITE_ENABLED = os.environ.get(
    "ASCEND_NGINX_ENABLED",
    "/etc/nginx/sites-enabled/ascend-os",
)


def local_digest() -> str:
    return hashlib.sha256(SITE_SRC.read_bytes()).hexdigest()


def remote_digest() -> str | None:
    result = subprocess.run(
        ["ssh", HOST, f"sha256sum {REMOTE_SITE} 2>/dev/null"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return None
    return result.stdout.strip().split()[0]


def config_changed() -> bool:
    return local_digest() != remote_digest()


def deploy(*, force: bool = False) -> bool:
    if not SITE_SRC.is_file():
        print(f"{SITE_SRC} not found", file=sys.stderr)
        raise FileNotFoundError(str(SITE_SRC))

    if not force and not config_changed():
        print("  nginx ok (unchanged)")
        return False

    print(f"uploading -> {REMOTE_SITE}")
    subprocess.check_call(["scp", str(SITE_SRC), f"{HOST}:{REMOTE_SITE}"])
    print("enabling site (symlink sites-enabled)")
    subprocess.check_call(
        ["ssh", HOST, f"ln -sf {REMOTE_SITE} {SITE_ENABLED}"],
    )
    print("testing and reloading nginx")
    subprocess.check_call(["ssh", HOST, "nginx -t"])
    subprocess.check_call(["ssh", HOST, "nginx -s reload"])
    print("done — host nginx reloaded")
    return True


def main() -> int:
    try:
        deploy(force="--force" in sys.argv[1:])
    except FileNotFoundError:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
