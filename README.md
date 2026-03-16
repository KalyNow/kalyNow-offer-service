# kalyNow-offer-service

Manages restaurants, offers, and reservations.

---

## Prerequisites

- Node.js 20+
- MongoDB running locally (or via Docker — see `kalyNow-infra`)
- **kalynow-user-service** running (required for authentication)

---

## Run locally

```bash
npm install
npm run start:dev
```

The service starts on **port 3000** by default. Set the `PORT` env var to change it.

### Environment variables

| Variable      | Default                                          | Description         |
|---------------|--------------------------------------------------|---------------------|
| `PORT`        | `3000`                                           | HTTP port           |
| `MONGODB_URI` | `mongodb://localhost:27017/kalynow-offer-service` | MongoDB connection  |

---

## Authentication

All protected routes require a valid **Bearer JWT** in the `Authorization` header.

Authentication is **delegated to Traefik** via `forwardAuth`. On every incoming request, Traefik calls:

```
GET http://kalynow-user-service/auth/verify
Authorization: Bearer <token>
```

- ✅ **200** — token is valid. Traefik forwards the request and injects the following headers:
  - `X-User-Id` — authenticated user's ID
  - `X-User-Email` — authenticated user's email
  - `X-User-Role` — authenticated user's role
- ❌ **401** — token is invalid or missing. Traefik blocks the request.

> When running locally **without** Traefik, you can call the offer-service directly and manually pass the `X-User-Id`, `X-User-Email`, and `X-User-Role` headers to simulate an authenticated request.

---

## Run infrastructure (MongoDB + Traefik)

```bash
cd ../kalyNow-infra
docker compose up -d
```
