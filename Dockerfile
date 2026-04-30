# syntax=docker/dockerfile:1

# Force linux/amd64 throughout: image-webpack-loader pulls in gifsicle,
# mozjpeg, optipng, and pngquant via bin-wrapper, whose old postinstalls
# only have x86_64 prebuilt binaries. Building under arm64 (e.g. Apple
# Silicon) would download those x86_64 binaries into an arm64 container
# and fail to exec them. Pinning amd64 means Docker Desktop runs the
# whole container under Rosetta on Apple Silicon, which has the matching
# x86_64 glibc available.

# ---- Build stage: install deps and produce the frontend bundle ----
FROM --platform=linux/amd64 node:16-bullseye-slim AS builder

WORKDIR /app

# Native build deps for image-webpack-loader (gifsicle, mozjpeg, optipng,
# pngquant all fall back to compiling from source on modern Debian) and
# node-gyp packages.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        git \
        ca-certificates \
        autoconf \
        automake \
        libtool \
        nasm \
        pkg-config \
        libpng-dev \
        zlib1g-dev \
        dpkg-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# internals/ is needed at install time because the project's `preinstall`
# lifecycle script runs internals/scripts/npmcheckversion.js.
COPY internals ./internals
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

# Node 16 ships OpenSSL 1.1.1, which webpack 4 is compatible with out of the
# box. (If this is ever bumped to Node >= 17, set
# NODE_OPTIONS=--openssl-legacy-provider here to keep the webpack 4 build
# working against OpenSSL 3.)
RUN npm run build

# ---- Runtime stage ----
FROM --platform=linux/amd64 node:16-bullseye-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/server ./server
COPY --from=builder /app/internals ./internals
COPY --from=builder /app/babel.config.js ./babel.config.js
COPY --from=builder /app/package.json ./package.json

# 3001: Express frontend (static build)
# 3000: socket.io backend
EXPOSE 3000 3001

CMD ["npm", "start"]
