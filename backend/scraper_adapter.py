import os
import json
import logging
from typing import Optional, List

# Since the scraper is now part of the backend, we can import it directly
from backend.webscrapper.grow import scrape

# Paths
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKEND_DATA = os.path.join(ROOT, 'backend', 'data', 'data.json')

logging.basicConfig(level=logging.INFO)


def load_latest_json() -> Optional[List[dict]]:
    """Load the combined backend data.json used by the frontend."""
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
    """
    Run the Selenium Groww scraper and then update backend/data/data.json.
    """
    logging.info("▶ Running scraper in-process...")

    try:
        # The scrape function now returns the data directly
        fund_data, skipped = scrape(headless=headless, limit=limit)
        logging.info("Scraper finished (scraped: %d, skipped: %d)", len(fund_data), skipped)

        # Ensure backend/data directory exists
        os.makedirs(os.path.dirname(BACKEND_DATA), exist_ok=True)

        # Write the data to the final destination
        with open(BACKEND_DATA, "w", encoding="utf-8") as f:
            json.dump(fund_data, f, indent=4)

        logging.info("✔ Updated backend data.json with %d funds", len(fund_data))
        return BACKEND_DATA

    except Exception as e:
        logging.error("❌ Exception running scraper: %s", e, exc_info=True)
        return None
