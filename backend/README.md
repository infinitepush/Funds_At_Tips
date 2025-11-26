# Mutual Fund Ranker — Backend

This FastAPI backend connects to the scrapers in `../webscrapper` (the project already contains scrapers), cleans and ranks mutual funds, and exposes API endpoints used by the React frontend.

Quick start (local):

1. Create a Python virtual environment and install requirements

```bash
python -m venv .venv
source .venv/Scripts/activate   # Windows (bash)
pip install -r requirements.txt
```

2. (Optional) Run the scraper once to produce `webscrapper/groww_mutual_fund_data.json`:

```bash
python ../webscrapper/grow_cli.py --headless --output ../webscrapper/groww_mutual_fund_data.json
```

3. Start the API (from the `backend/` directory):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Available endpoints:

- `GET /api/health` — health check
- `POST /api/update` — trigger the scraper (runs in background)
- `GET /api/funds` — returns cleaned dataset as JSON
- `GET /api/funds/top10` — returns ranked top 10 funds
- `GET /api/export/csv` — returns downloadable CSV of top 10
- `GET /api/compare?fundA=...&fundB=...` — compare two funds by name

Notes:

- The backend will attempt to run the existing scraper at `webscrapper/grow_cli.py` via `sys.executable` when `/api/update` is called. If your environment does not have Chrome/driver available, you can still use previously-saved JSON under `webscrapper/groww_mutual_fund_data.json`.
- The ranking engine uses a simple weighted scoring (CAGR 50%, 3Y 30%, 1Y 20%). Adjust `processor.py` to change weights.
