## Vercel — Monorepo (Client, API, S3 Proxy)

This repo contains a simple Vercel-like flow:

- Client: React + Vite app in `client/`.
- API: Express service in `server/api/` that triggers an ECS task to build a project and checks deployment status in S3.
- S3 Proxy: Express reverse proxy in `server/s3-proxy/` that serves built static sites via subdomains like `http://{projectId}.localhost:8000`.

### Architecture

- User submits a GitHub repo URL to the API via `POST /newproject`.
- API triggers an ECS Fargate task (builder) with `PROJECT_ID` and repo URL.
- Builder clones, builds, and uploads `dist/` to S3 at `s3://vercel-demo-clone/output/{PROJECT_ID}/...`.
- Client polls `POST /isdeploy` to detect when `index.html` exists in S3.
- Proxy serves the built site from `http://{PROJECT_ID}.localhost:8000` by forwarding to a base origin using `BASE_URL`.

---

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm/yarn
- AWS account with programmatic credentials authorized for ECS and S3

---

## Getting Started (Local)

Open three terminals (or run in a process manager) and start each service.

1. Client (Vite)

```bash
cd client
pnpm install
pnpm dev
# defaults to http://localhost:5173
```

2. API (Express)

```bash
cd server/api
pnpm install
cp .env.example .env  # then fill values
pnpm dev
# runs on http://localhost:8001
```

3. S3 Proxy (Express)

```bash
cd server/s3-proxy
pnpm install
cp .env.example .env  # then fill values
pnpm dev
# serves at http://localhost:8000
# built sites available at http://{projectId}.localhost:8000
```

Note: Modern browsers resolve `*.localhost` to `127.0.0.1`, so no hosts file changes are required.

---

## Environment Variables

Populate `.env` files under `server/api/` and `server/s3-proxy/` as indicated below. The builder service (ECS task) also uses AWS env vars.

### server/api/.env

```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET

# ECS (used by POST /newproject RunTaskCommand)
ECS_CLUSTER=your-ecs-cluster-name
ECS_TASKDEFINITION=your-taskdef-name-or-arn
ECS_SUBNET_1=subnet-xxxxxxxx
ECS_SUBNET_2=subnet-xxxxxxxx
ECS_SUBNET_3=subnet-xxxxxxxx
ECS_SECURITYGRP=sg-xxxxxxxx
```

### server/s3-proxy/.env

```bash
# Where the proxy forwards requests. Example points to an S3 website/CDN/gateway that serves
# paths like /{projectId}/index.html
BASE_URL=https://your-base-origin.example.com
```

### Builder service (ECS task)

The builder (see `server/build/`) expects the following env vars injected by the API task override:

- `GITURL` (provided by API from request body)
- `PROJECT_ID` (provided by API)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

It uploads built files to S3 bucket `vercel-demo-clone` under key prefix `output/{PROJECT_ID}/...`.

---

## Services

### Client (client/)

- React 19 + Vite 7
- Scripts:

```bash
pnpm dev       # start dev server
pnpm build     # production build
pnpm preview   # preview built output
```

### API (server/api/)

- Express 5, AWS SDK v3
- Important routes:

```http
POST /newproject
Content-Type: application/json
{
  "githubURL": "https://github.com/user/repo"
}

Response 200
{
  "status": "queue",
  "data": {
    "projectId": "abc12",
    "url": "http://abc12.localhost:8000/"
  }
}
```

```http
POST /isdeploy
Content-Type: application/json
{
  "projectId": "abc12"
}

Response 200 when ready
{
  "status": "done",
  "success": true,
  "data": { /* HeadObjectCommand result */ }
}
```

Quick test with curl:

```bash
curl -X POST http://localhost:8001/newproject \
  -H 'Content-Type: application/json' \
  -d '{"githubURL": "https://github.com/user/repo"}'

curl -X POST http://localhost:8001/isdeploy \
  -H 'Content-Type: application/json' \
  -d '{"projectId": "abc12"}'
```

Environment variables are read via `dotenv` and passed to ECS and the S3 client. See `server/api/index.js` and `server/api/config/s3client.js`.

### S3 Proxy (server/s3-proxy/)

- Express proxy that extracts `{projectId}` from the subdomain and forwards to `${BASE_URL}/{projectId}`.
- If the incoming path is `/`, it rewrites to `/index.html`.

```text
http://{projectId}.localhost:8000        ->  ${BASE_URL}/{projectId}/index.html
http://{projectId}.localhost:8000/assets ->  ${BASE_URL}/{projectId}/assets
```

---

## Deployment Notes

- Ensure the S3 bucket `vercel-demo-clone` exists and is readable by the origin behind `BASE_URL` (e.g., S3 Website, CloudFront, API Gateway, or a lightweight proxy that serves S3 objects under `/output/{projectId}` or equivalent mapping).
- The builder writes to `s3://vercel-demo-clone/output/{PROJECT_ID}/...`. The proxy expects the origin to serve the same structure at `${BASE_URL}/{PROJECT_ID}/...`.
- ECS task definition should run the `server/build/` image or entrypoint to clone, build, and upload artifacts.

---

## Troubleshooting

- 404 at `/{projectId}/index.html`: verify S3 upload path and that your origin serves the same key prefix.
- CORS errors: confirm CORS config on the proxy/origin and that the client target matches your local ports.
- ECS failures: check CloudWatch logs for the task; ensure subnets and security group are correct and public IP is enabled when required.
