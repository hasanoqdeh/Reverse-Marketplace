# syntax=docker/dockerfile:1

# Use Node.js 20 Alpine for modern features and performance
FROM node:20-alpine AS base

# Install pnpm globally in the base image for reliability across stages
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# --- Stage 1: Dependencies ---
FROM base AS deps
# Install libc6-compat for some native modules
RUN apk add --no-cache libc6-compat

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies using BuildKit cache for pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install

# --- Stage 2: Builder ---
FROM base AS builder
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm run build

# --- Stage 3: Development ---
FROM base AS development
WORKDIR /app
ENV NODE_ENV development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3008
ENV PORT 3008
CMD ["pnpm", "run", "dev"]


# --- Stage 4: Runner ---
FROM base AS runner

WORKDIR /app
ENV NODE_ENV production

# Use the built-in 'node' user (UID 1000) to match the host user for volume permissions
# Ensure /app is owned by node
RUN chown node:node /app

# Copy essential files for Next.js standalone mode WITH ownership set
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3008
ENV PORT 3008

# Next.js standalone mode output uses server.js
CMD ["node", "server.js"]





