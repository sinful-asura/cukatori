# Photos route

Register `PHOTOS_ROUTES` at `/os/photos` (see `../exercise/insights/INTEGRATION.md`).

Files are served only from `GET /api/photos/:id/file` behind `AuthGuard`. Do not expose a static / public uploads path.
