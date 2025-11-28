#!/usr/bin/env bash

# Add Chrome to PATH
export PATH="${PATH}:/opt/render/project/.render/chrome/opt/google/chrome"

# Start the backend server
cd backend
uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
