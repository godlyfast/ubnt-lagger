#Dockerfile

# Build stage: compile the SvelteKit app on native architecture
FROM --platform=$BUILDPLATFORM node:20 AS builder

COPY . /shms
WORKDIR /shms/app

# Build the app (architecture-agnostic JavaScript)
RUN cd /shms/pf-router && \
    rm -rf node_modules && \
    yarn install --prod && \
    rm -rf artifacts && \
    cd /shms/app && \
    rm -rf node_modules .svelte-kit build && \
    yarn install && \
    yarn build

# Runtime stage: install production dependencies on target architecture
FROM --platform=$TARGETPLATFORM node:20-slim AS shms-build

# Install OpenSSL for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /shms /shms
WORKDIR /shms/app

# Install production node_modules for target architecture
RUN cd /shms/pf-router && \
    yarn install --prod && \
    cd /shms/app && \
    yarn install --prod && \
    rm -rf src/ static/ .svelte-kit prisma 

# The USER instruction sets the user name to use as the default user for the remainder of the current stage
# USER node:node

# Using slim image for runtime (smaller than full but avoids alpine issues)
FROM node:20-slim AS shms

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=shms-build /shms /shms

WORKDIR /shms/app

CMD [ "node", "build" ]