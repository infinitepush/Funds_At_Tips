import os
import json
import logging
from typing import Optional, List

# ✅ Correct import path based on your folder structure
from webscrapper.grow import scrape


# ✅ Correct JSON output location
ROOT = os.path.abspath(os.path.dirname(__file__))
BACKEND_DATA = os.path.join(ROOT, 'data', 'data.json')

logging.basicConfig(level=logging.INFO)


def load_latest_json() -> Optional[List[dict]]:
    """Load the backend data.json used by the frontend."""
    if not os.path.isfile(BACKEND_DATA):
        logging.warning("No backend data.json found at %s", BACKEND_DATA)
        return None

    try:
        with open(BACKEND_DATA, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logging.error("Failed to load backend data.json: %s", e)
        return None


def run_scraper(headless: bool = True, limit: int = 0) -> Optional[str]:
    """Run the scraper and write to backend/data/data.json"""
    logging.info("▶ Running scraper...")

    try:
        fund_data, skipped = scrape(headless=headless, limit=limit)
        logging.info("Scraper finished (scraped: %d, skipped: %d)",
                     len(fund_data), skipped)

        os.makedirs(os.path.dirname(BACKEND_DATA), exist_ok=True)

        with open(BACKEND_DATA, "w", encoding="utf-8") as f:
            json.dump(fund_data, f, indent=4)

        logging.info("✔ Updated %s", BACKEND_DATA)
        return BACKEND_DATA

    except Exception as e:
        logging.error("❌ Scraper exception: %s", e, exc_info=True)
        return None
