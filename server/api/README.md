# API Service

A Node.js Express API service that manages project deployment lifecycle, integrating with AWS ECS and S3 services.

## Overview

The API service provides endpoints for creating new projects and checking deployment status. It's designed to work as part of a larger deployment pipeline that builds and serves applications.

## Features

- **Project Creation**: Create new deployments from GitHub repositories
- **Deployment Status**: Check if a project has been successfully deployed
- **AWS Integration**: Interfaces with AWS ECS and S3 services
- **Unique Project IDs**: Generates unique project identifiers using nanoid

## Endpoints

### `POST /newproject`

Creates a new project deployment.

**Request Body:**

```json
{
  "githubURL": "https://github.com/username/repository"
}
```

**Response:**

```json
{
  "status": "queue",
  "data": {
    "projectId": "abc12",
    "url": "http://abc12.localhost:8000/"
  }
}
```

### `GET /isdeploy`

Checks if a project has been deployed successfully.

**Request Body:**

```json
{
  "projectId": "abc12"
}
```

**Response:**

```json
{
  "status": "done",
  "success": true,
  "data": {} // S3 metadata
}
```

## Environment Variables

Create a `.env` file in the api directory with the following variables:

```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
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

The service will start on port 8001.

## Dependencies

- **@aws-sdk/client-ecs**: AWS ECS client for running tasks
- **@aws-sdk/client-s3**: AWS S3 client for file operations
- **express**: Web framework
- **nanoid**: Unique ID generation
- **dotenv**: Environment variable management

## Architecture Notes

- Currently in development mode with ECS integration commented out
- Uses S3 bucket "vercel-demo-clone" for storing deployment artifacts
- Generates project-specific URLs in the format: `http://{projectId}.localhost:8000/`

## Related Services

- **s3-proxy**: Serves deployed projects from S3
- **build**: Processes and builds projects for deployment

## Docker Deployment

This service runs in the Docker environment with proper volume mounting and networking configured for integration with other services.

## Troubleshooting

- Ensure AWS credentials are properly configured
- Verify S3 bucket exists and is accessible
- Check network connectivity to AWS services
