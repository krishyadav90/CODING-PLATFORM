# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package cache, install dependencies, and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-11-jdk-headless \
    nodejs \
    npm \
    python3 \
    python3-pip \
    gcc \
    g++ && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends --fix-broken \
    nodejs \
    npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a working directory for code execution
WORKDIR /code

# Set up a non-root user for security
RUN useradd -m sandboxuser
USER sandboxuser

# Command to keep the container ready (optional, for testing)
CMD ["tail", "-f", "/dev/null"]