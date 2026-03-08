# ==============================================================================
# MoveWise RL Engine — Dockerfile
# ==============================================================================
# Containerised environment for the RL-powered MaaS recommendation engine.
# Includes both the training pipeline and the FastAPI backend server.
#
# Usage:
#   docker build -t movewise-rl .
#   docker run -p 8000:8000 movewise-rl             # Start API server
#   docker run movewise-rl python -m rl_engine.train # Run training
#
# NEXUS 2026 — Politecnico di Torino
# ==============================================================================

FROM python:3.11-slim AS base

# Metadata
LABEL maintainer="Team [NUMBER] — NEXUS 2026"
LABEL description="MoveWise RL Engine: Behaviorally-Aware MaaS Recommendation"
LABEL version="0.3.0"

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies (minimal for PyTorch CPU + matplotlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first for Docker layer caching
COPY rl_engine/requirements.txt /app/rl_engine/requirements.txt

# Install Python dependencies
# Use CPU-only PyTorch to keep image small (~1.5 GB vs ~5 GB with CUDA)
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r /app/rl_engine/requirements.txt

# Copy the RL engine source code
COPY rl_engine/ /app/rl_engine/

# Expose the FastAPI port
EXPOSE 8000

# Health check for the API server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

# Default command: start the API server
CMD ["uvicorn", "rl_engine.api:app", "--host", "0.0.0.0", "--port", "8000"]
