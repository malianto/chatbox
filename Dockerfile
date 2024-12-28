# Use a more specific base image with only the necessary tools
FROM node:20-slim

WORKDIR /app

# Install necessary build tools and clean up in the same layer
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p release/app

# Install global dependencies
RUN npm install -g cross-env typescript ts-node webpack webpack-cli

# Copy package files first for better caching
COPY package*.json ./
COPY .erb ./.erb
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY jest.config.ts ./

# Install dependencies and web polyfills in a single layer to reduce image size
RUN npm install --ignore-scripts && \
    npm install --save-dev \
    path-browserify \
    crypto-browserify \
    stream-browserify \
    buffer \
    process \
    util \
    events \
    assert \
    os-browserify \
    constants-browserify \
    && npm cache clean --force

# Copy source code
COPY src ./src
COPY assets ./assets
COPY release ./release

# Expose the port the app runs on
EXPOSE 1212

# Set environment variables
ENV HOST=0.0.0.0 \
    NODE_ENV=development \
    TS_NODE_TRANSPILE_ONLY=true \
    CHATBOX_BUILD_TARGET=web \
    CHATBOX_BUILD_PLATFORM=web \
    PORT=1212

# Command to run the development server
CMD ["cross-env", "NODE_ENV=development", "TS_NODE_TRANSPILE_ONLY=true", "webpack", "serve", "--config", "./.erb/configs/webpack.config.web.dev.ts"]
