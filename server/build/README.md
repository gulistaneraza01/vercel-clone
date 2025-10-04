# Build Service

A Node.js service responsible for building and uploading static projects to AWS S3. This service runs the build pipeline for deployed applications.

## Overview

The build service takes source code from the output directory, installs dependencies, builds the project, and uploads the resulting static files to an S3 bucket. It's designed to run as a containerized service within an ECS task.

## Features

- **Automatic Build Process**: Installs dependencies and builds projects
- **S3 Upload**: Uploads built files to AWS S3 with proper content types
- **MIME Type Detection**: Automatically detects and sets appropriate content types
- **Project Isolation**: Separates builds by project ID in S3

## How It Works

1. **Build Process**: Runs `npm install && npm run build` in the output directory
2. **File Upload**: Scans the dist folder and uploads all files to S3
3. **Organization**: Files are organized in S3 under `output/{projectId}/` structure
4. **Content Type**: Automatically sets correct MIME types for different file formats

## Environment Variables

The service expects the following environment variable:

```env
PROJECT_ID=unique_project_identifier
```

This ID is used to organize uploaded files in the S3 bucket structure.

## Installation

```bash
npm install
# or
pnpm install
```

## Usage

The service runs automatically when the container starts. It does not provide HTTP endpoints - it's designed to be executed as a one-time build task.

```bash
node index.js
```

## Dependencies

- **@aws-sdk/client-s3**: AWS S3 client for file uploads
- **mime-types**: Content type detection for uploaded files

## S3 Structure

Files are uploaded to the S3 bucket with the following structure:

```
vercel-demo-clone/
└── output/
    └── {projectId}/
        ├── index.html
        ├── assets/
        │   ├── main.css
        │   ├── main.js
        │   └── ...
        └── ...
```

## Configuration

The service uses a shared S3 client configuration. Ensure the following:

- S3 bucket "vercel-demo-clone" exists and is accessible
- AWS credentials are properly configured
- The build environment has access to output files in `./output/dist/`

## Docker Integration

This service runs in a Docker container with:

- Pre-created `./output` directory containing the source code
- Environment variable `PROJECT_ID` set by the parent orchestration
- Network access to AWS S3 services

## Output Structure

After the build completes successfully:

- Console logs show build progress
- Files are uploaded to S3 with project-specific organization
- Build artifacts are preserved in the S3 bucket for serving

## Related Services

- **api**: Triggers the build process and monitors completion
- **s3-proxy**: Serves the deployed files from S3

## Troubleshooting

- Ensure source code is present in the output directory
- Verify AWS S3 permissions and credentials
- Check that the project's package.json includes build scripts
- Ensure the dist directory is generated after the build process
