"""Repo and scripts/ roots (this file lives in scripts/lib/)."""

from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[2]
