import threading
import requests
import feedparser
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from typing import Optional
from io import StringIO
import logging
import json
import scraper_adapter
import processor
import os
import sys

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Mutual Fund Ranker API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_scraper_in_background():
    """Run scraper in a separate thread."""
    logging.info("Triggering background scraper update...")
    scraper_adapter.run_scraper(headless=True, limit=0)

@app.on_event("startup")
async def startup_event():
    """Run scraper on startup in a background thread."""
    thread = threading.Thread(target=run_scraper_in_background)
    thread.start()


# --------------------------------------------
# ⚡ Always load latest data.json
# --------------------------------------------
def load_fresh():
    data = scraper_adapter.load_latest_json()
    # Don't raise error if file not found, just return None
    return data


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"status": "Backend is running"}


# --------------------------------------------
# ⭐ UPDATE (scraper trigger)
# --------------------------------------------
@app.post("/api/update")
def update_data(background: BackgroundTasks, headless: bool = True, limit: int = 0):
    background.add_task(scraper_adapter.run_scraper, headless, limit)
    return {"status": "update started"}


# --------------------------------------------
# ⭐ Return updated list of all funds
# --------------------------------------------
@app.get("/api/funds")
def get_funds():
    try:
        raw = load_fresh()
        if raw is None:
            # Return empty list if no data.json exists yet
            return JSONResponse(content=[])
        cleaned = processor.clean_and_normalize(raw)
        return JSONResponse(content=jsonable_encoder(cleaned))
    except Exception as e:
        logging.exception("Error in /api/funds")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/funds/top10")
def get_top10():
    try:
        raw = load_fresh()
        df = processor.clean_df(raw)
        ranked = processor.rank_funds(df, top_n=10)
        return JSONResponse(content=jsonable_encoder(ranked))
    except Exception as e:
        logging.exception("Error in /api/funds/top10")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/export/csv")
def export_csv():
    try:
        raw = load_fresh()
        df = processor.clean_df(raw)
        top = processor.rank_funds_df(df, top_n=10)

        csv_io = StringIO()
        top.to_csv(csv_io, index=False)
        csv_io.seek(0)

        return StreamingResponse(
            iter([csv_io.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=top10_funds.csv",
                "Access-control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        logging.exception("Error in /api/export/csv")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# 🌍 RESTORED ORIGINAL RSS NEWS (WORKING)
# ---------------------------------------------------------

@app.get('/api/news')
def get_news():
    try:
        feed = feedparser.parse('http://feeds.bbci.co.uk/news/rss.xml')
        news = [{"Title:": e.title, "Link:": e.link} for e in feed.entries]
        return JSONResponse(content=news)
    except Exception as e:
        logging.exception('Error in /api/news')
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/latest_news')
def get_latest_news():
    try:
        feed = feedparser.parse(
            'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml')
        news = [{"Title:": e.title, "Link:": e.link} for e in feed.entries]
        return JSONResponse(content=news)
    except Exception as e:
        logging.exception('Error in /api/latest_news')
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/business_news')
def get_business_news():
    try:
        feed = feedparser.parse(
            'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml')
        news = [{"Title:": e.title, "Link:": e.link} for e in feed.entries]
        return JSONResponse(content=news)
    except Exception as e:
        logging.exception('Error in /api/business_news')
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
