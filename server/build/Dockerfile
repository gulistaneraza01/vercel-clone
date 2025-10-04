
FROM ubuntu:rolling

# Install dependencies (curl, git, node, pnpm)
RUN apt update && apt install -y \
    curl \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/app

# Copy package files and install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the app
COPY main.sh .
COPY index.js .
COPY config/ ./config/

# Ensure script is executable
RUN chmod +x main.sh

# Entrypoint
ENTRYPOINT ["./main.sh"]

