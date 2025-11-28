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

# Install system dependencies, forcefully updating certificates first
RUN apt-get update && \
    apt-get install -y --reinstall ca-certificates && \
    update-ca-certificates && \
    apt-get install -y curl gnupg unzip jq

# Download Chrome and Chromedriver binaries
RUN LATEST_VERSIONS_JSON_URL="https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" && \
    JSON_DATA=$(curl -k -sL ${LATEST_VERSIONS_JSON_URL}) && \
    LATEST_STABLE_CHROME_URL=$(echo "${JSON_DATA}" | jq -r '[.versions[] | .downloads.chrome[] | select(.platform=="linux64") | .url] | last') && \
    LATEST_STABLE_CHROMEDRIVER_URL=$(echo "${JSON_DATA}" | jq -r '[.versions[] | .downloads.chromedriver[] | select(.platform=="linux64") | .url] | last') && \
    curl -k -L -o /tmp/chrome.deb "${LATEST_STABLE_CHROME_URL}" && \
    curl -k -L -o /tmp/chromedriver.zip "${LATEST_STABLE_CHROMEDRIVER_URL}"

# Install the downloaded Chrome browser
RUN apt-get update && apt-get install -y /tmp/chrome.deb && rm /tmp/chrome.deb

# Install the downloaded Chromedriver
RUN unzip /tmp/chromedriver.zip -d /tmp/ && \
    mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/ && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64

# Copy application code from the context
COPY . .

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install pipenv && \
    cd backend && \
    pipenv requirements > requirements.txt && \
    pip install -r requirements.txt

# Start the application
WORKDIR /app/backend
EXPOSE 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]