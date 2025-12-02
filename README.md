# FundsAtTips: Mutual Fund Analysis and Ranking Platform

FundsAtTips is a full-stack web application designed to help users analyze and discover the best-performing mutual funds. It features a web scraper to gather the latest fund data, a ranking engine to identify top performers, and an intuitive user interface to view and compare funds. The application also includes an AI-powered chatbot, 'Wisbee', to provide financial advice and answer user questions.

## Features

- **Automated Data Scraping**: Gathers real-time mutual fund data from Groww.
- **Top 10 Rankings**: A ranking algorithm processes the data to highlight the top 10 best-performing funds based on historical returns (1Y, 3Y, 5Y CAGR).
- **Comprehensive Fund List**: View a detailed list of all scraped mutual funds.
- **Fund Comparison**: (Future Implementation) A planned feature to compare two funds side-by-side.
- **Downloadable Reports**: Export the top 10 fund rankings as a CSV file.
- **AI Financial Assistant**: "Wisbee" chatbot, powered by Google's Gemini Pro, provides financial advice.
- **Latest News**: Stay updated with the latest business and financial news from various RSS feeds.

## Architecture

The project is a monorepo with a decoupled frontend and backend.

- **Frontend**: A responsive user interface built with **React** and **Vite**, styled with **Tailwind CSS**. It is deployed on **Vercel**.
- **Backend**: A robust API built with **Python**, **FastAPI**, and **Uvicorn**. It handles data scraping, processing, and serving data to the frontend. The backend is containerized using **Docker** and deployed on **Render**.

### Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, Uvicorn, Selenium (for scraping)
- **Database**: JSON files (for scraped data)
- **Deployment**: Vercel (Frontend), Render (Backend via Docker)

## Getting Started

### Prerequisites

- Git
- Node.js and npm
- Python 3.11
- Docker Desktop (for containerized backend deployment)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd FundsAtTips_final
    ```

2.  **Run the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

3.  **Run the Backend:**
    - Navigate to the backend directory:
      ```bash
      cd ../backend
      ```
    - Create a Python virtual environment and activate it:
      ```bash
      # On Windows
      python -m venv .venv
      .venv\Scripts\activate

      # On macOS/Linux
      python3 -m venv .venv
      source .venv/bin/activate
      ```
    - Install the required dependencies:
      ```bash
      pip install -r requirements.txt
      ```
    - Start the FastAPI server:
      ```bash
      uvicorn main:app --reload --host 0.0.0.0 --port 8000
      ```
    The backend API will be available at `http://localhost:8000`.

## API Endpoints

The backend exposes the following endpoints:

- `GET /api/health`: Health check.
- `GET /`: Backend status.
- `POST /api/update`: Triggers the background scraper to update the fund data.
- `GET /api/funds`: Returns the complete list of cleaned and normalized fund data.
- `GET /api/funds/top10`: Returns the top 10 ranked mutual funds.
- `GET /api/export/csv`: Exports the top 10 funds as a CSV file.
- `GET /api/news`: Fetches general news from the BBC RSS feed.
- `GET /api/latest_news`: Fetches the latest news from the NYT RSS feed.
- `GET /api/business_news`: Fetches business news from the NYT RSS feed.

## Deployment

### Frontend (Vercel)

The frontend is configured for continuous deployment on Vercel. Any pushes to the `main` branch will automatically trigger a new deployment. The live site is available at: [https://funds-at-tips.vercel.app/](https://funds-at-tips.vercel.app/)

The following environment variable must be set in the Vercel project settings:

- `VITE_API_BASE_URL`: The URL of the deployed backend (e.g., `https://funds-at-tips.onrender.com`).

### Backend (Render)

The backend is deployed as a Docker container on Render. The `render.yaml` file in the root directory defines the service configuration. Any pushes to the `main` branch will automatically trigger a new build and deployment on Render.

The backend service is live at: [https://funds-at-tips.onrender.com](https://funds-at-tips.onrender.com)
