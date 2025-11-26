import os
import sys
# Add parent directory to path to allow running as script
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import processor
import scraper_adapter
import json
import logging
from io import StringIO
from typing import Optional

from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
# import yfinance as yf
import feedparser
import requests

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Mutual Fund Ranker API")

# Allow CORS for local frontend development (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/update")
def update_data(background: BackgroundTasks, headless: bool = True, limit: int = 0):
    """Trigger the scraper to run (background). Uses existing webscrapper/grow_cli.py script."""
    # Schedule background job
    background.add_task(scraper_adapter.run_scraper, headless, limit)
    return {"status": "scheduled"}


@app.get("/api/funds")
def get_funds():
    """Return full cleaned dataset (JSON list)."""
    try:
        raw = scraper_adapter.load_latest_json()
        if raw is None:
            raise HTTPException(
                status_code=404, detail="No scraped data found")
        cleaned = processor.clean_and_normalize(raw)
        return JSONResponse(content=jsonable_encoder(cleaned))
    except HTTPException:
        raise
    except Exception as e:
        logging.exception('Error in /api/funds')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})


@app.get("/api/funds/top10")
def get_top10():
    try:
        raw = scraper_adapter.load_latest_json()
        if raw is None:
            raise HTTPException(
                status_code=404, detail="No scraped data found")
        cleaned_df = processor.clean_df(raw)
        ranked = processor.rank_funds(cleaned_df, top_n=10)
        return JSONResponse(content=jsonable_encoder(ranked))
    except HTTPException:
        raise
    except Exception as e:
        logging.exception('Error in /api/funds/top10')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})


@app.get("/api/export/csv")
def export_csv():
    try:
        raw = scraper_adapter.load_latest_json()
        if raw is None:
            raise HTTPException(
                status_code=404, detail="No scraped data found")
        df = processor.clean_df(raw)
        top = processor.rank_funds_df(df, top_n=10)

        csv_io = StringIO()
        top.to_csv(csv_io, index=False)
        csv_io.seek(0)

        return StreamingResponse(iter([csv_io.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=top10_funds.csv", "Access-control-Allow-Origin": "*"})
    except HTTPException:
        raise
    except Exception as e:
        logging.exception('Error in /api/export/csv')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})


@app.get("/api/compare")
def compare(fundA: str = Query(...), fundB: str = Query(...)):
    try:
        raw = scraper_adapter.load_latest_json()
        if raw is None:
            raise HTTPException(
                status_code=404, detail="No scraped data found")
        df = processor.clean_df(raw)
        a = df[df['name'].str.lower() == fundA.strip().lower()]
        b = df[df['name'].str.lower() == fundB.strip().lower()]
        if a.empty or b.empty:
            raise HTTPException(
                status_code=404, detail="One or both funds not found")
        return JSONResponse(content=jsonable_encoder({"fundA": a.iloc[0].to_dict(), "fundB": b.iloc[0].to_dict()}))
    except HTTPException:
        raise
    except Exception as e:
        logging.exception('Error in /api/compare')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})

@app.get('/api/news')
def get_news():
    try:
        feed = feedparser.parse('http://feeds.bbci.co.uk/news/rss.xml')
        news = []
        for entry in feed.entries:
            news.append({'Title:': entry.title, 'Link:': entry.link})
        return JSONResponse(content=news)
    except Exception as e:
        logging.exception('Error in /api/news')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})

@app.get('/api/latest_news')
def get_latest_news():
    try:
        feed = feedparser.parse('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml')
        latest_news = []
        for entry in feed.entries:
            latest_news.append({'Title:': entry.title, 'Link:': entry.link})
        return JSONResponse(content=latest_news)
    except Exception as e:
        logging.exception('Error in /api/latest_news')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})

@app.get('/api/business_news')
def get_business_news():
    try:
        feed = feedparser.parse('https://rss.nytimes.com/services/xml/rss/nyt/Business.xml')
        business_news = []
        for entry in feed.entries:
            business_news.append({'Title:': entry.title, 'Link:': entry.link})
        return JSONResponse(content=business_news)
    except Exception as e:
        logging.exception('Error in /api/business_news')
        return JSONResponse(content={"detail": str(e)}, status_code=500, headers={"Access-Control-Allow-Origin": "*"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

