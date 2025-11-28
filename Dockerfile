# Stage 1: Build frontend
FROM node:18-slim AS frontend-builder
WORKDIR /app
COPY frontend/package*.json frontend/
COPY frontend/package-lock.json frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Stage 2: Python application
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for Chrome
RUN apt-get update && apt-get install -y wget gnupg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy application code from the context
COPY . .

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install pipenv && \
    cd backend && \
    pipenv lock -r > requirements.txt && \
    pip install -r requirements.txt

# Start the application
WORKDIR /app/backend
EXPOSE 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]