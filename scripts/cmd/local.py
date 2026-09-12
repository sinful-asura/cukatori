"""Run API / frontend / Postgres on the laptop.

  npm run local
  npm run local -- all
  npm run local -- api
  npm run local -- fe
  npm run local -- db
  npm run local -- api,fe,db
  npm run local -- seed

Local: Postgres is Docker. Nest (`api/`) and Angular are live processes, not containers.
"""

from __future__ import annotations

import atexit
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.paths import REPO
from lib.ports import pids_on_port
from lib.targets import (
    LOCAL_DEFAULT,
    LOCAL_SERVICES,
    compose_db_args,
    ensure_env_file,
    load_repo_env,
    parse_services,
    resolve_ng,
    resolve_npm,
    service_parser,
)

_procs: list[subprocess.Popen[bytes]] = []
_owned_ports: set[int] = set()
_stop_compose_on_exit = False
_cleaned = False
POSTGRES_CONTAINER = "cukatori-postgres"


def _postgres_inspect() -> str:
    result = subprocess.run(
        [
            "docker",
            "inspect",
            "-f",
            "status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}",
            POSTGRES_CONTAINER,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return (result.stderr or result.stdout or "container missing").strip()
    return result.stdout.strip()


def wait_for_postgres(timeout_s: int = 90) -> None:
    deadline = time.time() + timeout_s
    last = ""
    while time.time() < deadline:
        last = _postgres_inspect()
        if "health=healthy" in last:
            print("  postgres healthy")
            return
        time.sleep(2)
    logs = subprocess.run(
        ["docker", "logs", POSTGRES_CONTAINER, "--tail", "40"],
        capture_output=True,
        text=True,
    )
    detail = (logs.stdout or logs.stderr or "").strip()
    raise RuntimeError(
        f"postgres not healthy after {timeout_s}s ({last or 'unknown'}).\n{detail}"
    )


def _host_port() -> str:
    return load_repo_env().get("POSTGRES_PORT", "5433")


def _postgres_host_port() -> str:
    result = subprocess.run(
        ["docker", "port", POSTGRES_CONTAINER, "5432"],
        capture_output=True,
        text=True,
    )
    return (result.stdout or "").strip()


def start_db() -> None:
    ensure_env_file()
    host_port = _host_port()
    print(f"=== local db (Compose Postgres 18 on :{host_port}) ===")
    up = ["docker", "compose", *compose_db_args(), "up", "-d"]
    subprocess.check_call(up, cwd=REPO)
    wait_for_postgres()
    if not _postgres_host_port():
        print(f"  :{host_port} not published on the host — recreating container…", flush=True)
        subprocess.check_call([*up, "--force-recreate"], cwd=REPO)
        wait_for_postgres()
    if not _postgres_host_port():
        raise RuntimeError(
            "Compose Postgres is healthy inside Docker, but the host port is not published. "
            f"Nest expects DATABASE_URL on localhost:{host_port}.\n"
            "Re-run: npm run local -- db"
        )


def stop_db() -> None:
    print("  stopping compose postgres…", flush=True)
    subprocess.run(
        ["docker", "compose", *compose_db_args(), "stop"],
        cwd=REPO,
        check=False,
    )


def fe_cmd() -> list[str]:
    return [
        *resolve_ng(),
        "serve",
        "--proxy-config",
        "proxy.conf.json",
    ]


def api_cmd() -> list[str]:
    return [resolve_npm(), "run", "start:dev"]


def seed_cmd() -> list[str]:
    return [resolve_npm(), "run", "seeder:run"]


def _kill_pid_tree(pid: int) -> None:
    if pid <= 0:
        return
    if sys.platform == "win32":
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            capture_output=True,
            check=False,
        )
        return
    try:
        os.kill(pid, 15)
    except OSError:
        pass


def kill_port(port: int) -> None:
    me = os.getpid()
    for pid in pids_on_port(port):
        if pid != me:
            _kill_pid_tree(pid)


def _popen(cmd: list[str], cwd: Path, env: dict[str, str]) -> subprocess.Popen[bytes]:
    kwargs: dict[str, object] = {
        "cwd": cwd,
        "env": env,
        "stdin": subprocess.DEVNULL,
    }
    if sys.platform != "win32":
        kwargs["start_new_session"] = True
    return subprocess.Popen(cmd, **kwargs)


def _stop_proc(proc: subprocess.Popen[bytes]) -> None:
    if proc.poll() is not None:
        return
    _kill_pid_tree(proc.pid)


def cleanup() -> None:
    global _cleaned
    if _cleaned:
        for port in _owned_ports:
            kill_port(port)
        return
    _cleaned = True
    print("\nStopping local processes…", file=sys.stderr, flush=True)
    for proc in _procs:
        _stop_proc(proc)
    for port in _owned_ports:
        kill_port(port)
    if _stop_compose_on_exit:
        stop_db()


def run_blocking(commands: list[tuple[str, list[str], Path]]) -> int:
    child_env = load_repo_env()
    child_env.setdefault("NODE_ENV", "development")
    atexit.register(cleanup)
    try:
        for name, cmd, cwd in commands:
            print(f"+ [{name}] {' '.join(cmd)}", flush=True)
            _procs.append(_popen(cmd, cwd, child_env))
        while not _cleaned:
            still = [p for p in _procs if p.poll() is None]
            if not still:
                codes = [p.returncode or 0 for p in _procs]
                return max(codes, default=0)
            time.sleep(0.2)
        cleanup()
        return 130
    except KeyboardInterrupt:
        cleanup()
        return 130
    finally:
        cleanup()


def main() -> int:
    global _stop_compose_on_exit
    parser = service_parser(__doc__)
    args = parser.parse_args()
    services = parse_services(
        args.services,
        allowed=LOCAL_SERVICES,
        default=LOCAL_DEFAULT,
    )

    print(f"local → {', '.join(services)}")
    ensure_env_file()

    started_db = False
    if "db" in services:
        start_db()
        started_db = True

    if "seed" in services:
        print("=== seed local database ===")
        subprocess.check_call(seed_cmd(), cwd=REPO / "api", env=load_repo_env())

    long_running: list[tuple[str, list[str], Path]] = []
    if "api" in services:
        kill_port(3000)
        _owned_ports.add(3000)
        long_running.append(("api", api_cmd(), REPO / "api"))
    if "fe" in services:
        kill_port(4200)
        _owned_ports.add(4200)
        long_running.append(("fe", fe_cmd(), REPO))

    if not long_running:
        if started_db:
            print("  database is up.")
        return 0

    _stop_compose_on_exit = False
    return run_blocking(long_running)


if __name__ == "__main__":
    raise SystemExit(main())
