# S3 Proxy Service

A Node.js Express proxy service that serves static websites from S3 storage using subdomain-based routing. Acts as a reverse proxy to serve deployed projects.

## Overview

The S3 proxy service listens for requests on subdomains (like `project123.localhost`) and forwards them to the corresponding project directory in S3. It provides the frontend serving layer for deployed applications.

## Features

- **Subdomain Routing**: Extracts project ID from hostname (e.g., `abc12.localhost:8000`)
- **S3 Integration**: Proxies requests to S3 bucket serving static files
- **Index File Handling**: Automatically appends `index.html` to root path requests
- **CORS Support**: Handles cross-origin requests with proper headers

## How It Works

1. **Request Processing**: Extracts project ID from the hostname
2. **S3 Proxy**: Forwards requests to `{BASE_URL}/{projectId}` in S3
3. **Path Handling**: Automatically adds `index.html` for root path requests
4. **Response Forwarding**: Streams S3 content back to the client

## Environment Variables

Create a `.env` file with:

```env
BASE_URL=http://localhost:4566/verceldemo
```

## Installation

```bash
npm install
# or
pnpm install
```

## Development

```bash
npm run dev
# or
pnpm dev
```

The service starts on port 8000.

## URL Format

Access deployed projects using the following URL pattern:

```
http://{projectId}.localhost:8000/
```

For example:

- `http://abc12.localhost:8000/` → serves abc12 project
- `http://xyz99.localhost:8000/about` → serves xyz99 project's about page

## Dependencies

- **express**: Web framework for the proxy server
- **http-proxy**: HTTP proxy functionality for S3 forwarding
- **dotenv**: Environment variable management

## Architecture

```
Client Request: http://abc12.localhost:8000/index.html
                    ↓
                Extract projectId: "abc12"
                    ↓
            Proxy to S3: http://localhost:4566/verceldemo/abc12/index.html
                    ↓
                Return S3 Response to Client
```

## Host Configuration

To use custom subdomains locally, add entries to your `/etc/hosts` file:

```
127.0.0.1 abc12.localhost
127.0.0.1 xyz99.localhost
```

Or configure your DNS to point project subdomains to the proxy service.

## Docker Integration

This service runs in Docker with:

- Port 8000 exposed for external access
- Connection to LocalStack S3 service on port 4566
- Environment variables configured via docker-compose

## Dependencies on Other Services

- **LocalStack S3**: Provides the actual file storage backend
- **build service**: Populates S3 with built project files
- **api service**: Coordinates the deployment process

## Troubleshooting

- **Hostname not resolving**: Check `/etc/hosts` configuration
- **404 errors**: Verify project files exist in S3 at correct path
- **Proxy errors**: Ensure LocalStack S3 service is running on port 4566
- **Blank pages**: Check if index.html exists in the project's S3 directory

## Production Considerations

For production deployment:

- Replace LocalStack with real AWS S3
- Configure proper domain routing
- Add SSL/TLS termination
- Implement caching strategies
- Add security headers and CORS policies
