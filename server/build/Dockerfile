FROM ubuntu:latest

RUN apt update && apt install -y \
    curl \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

RUN mkdir -p output

COPY main.sh index.js ./
COPY config/ ./config/

RUN chmod +x main.sh

ENTRYPOINT ["./main.sh"]