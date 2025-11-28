import time
import re
import json
import logging
import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def create_driver(headless=True):
    """Create a new Chrome webdriver."""
    options = Options()
    if headless:
        options.add_argument("--headless=new")

    # Required for Render/Debian
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--start-maximized")

    # Use the pre-installed ChromeDriver
    service = Service(executable_path='/usr/local/bin/chromedriver')
        
    return webdriver.Chrome(service=service, options=options)


def extract_text_safe(el):
    try:
        return el.text.strip()
    except:
        return ""


def scrape(headless=True, limit=0, url="https://groww.in/mutual-funds/filter", timeout=20):
    driver = create_driver(headless)
    logging.info("🌱 Groww Scraper Started")

    all_funds = []

    try:
        driver.get(url)
        wait = WebDriverWait(driver, timeout)

        # ⏳ Wait for the table to appear
        try:
            rows = wait.until(
                EC.presence_of_all_elements_located(
                    (By.XPATH, "//a[contains(@class,'f22Link')]")
                )
            )
        except TimeoutException:
            logging.error("❌ Could not find fund rows")
            return [], 0

        logging.info(f"Detected {len(rows)} rows")

        if limit:
            rows = rows[:limit]

        for idx, row in enumerate(rows):

            # ----------- FUND NAME ----------
            try:
                fund_name = row.find_element(
                    By.XPATH,
                    ".//div[contains(@class,'f22SchemeName')]//div[contains(@class,'contentPrimary')]"
                ).text.strip()
            except:
                fund_name = ""

            if not fund_name:
                continue

            # ----------- CATEGORY (NEW Groww Layout) ----------
            try:
                # Groww category pills look like:
                # <span class="chipLabel">Small Cap</span>
                cat_els = row.find_elements(
                    By.XPATH,
                    ".//span[contains(@class,'chipLabel')]"
                )

                if cat_els:
                    # First chip is always the category
                    category = cat_els[0].text.strip()
                else:
                    category = "Unknown"

            except:
                category = "Unknown"

            # ----------- RETURNS (1Y 3Y 5Y) ----------
            cells = row.find_elements(
                By.XPATH, ".//td[contains(@class,'f22YearReturn')]")

            one_year = three_year = five_year = "NA"

            for c in cells:
                try:
                    value = extract_text_safe(
                        c.find_element(
                            By.XPATH, ".//div/div[contains(@class,'contentPrimary')]")
                    )
                    label = extract_text_safe(
                        c.find_element(
                            By.XPATH, ".//div/div[contains(@class,'contentSecondary')]")
                    )

                    if label == "1Y":
                        one_year = value
                    elif label == "3Y":
                        three_year = value
                    elif label == "5Y":
                        five_year = value

                except:
                    continue

            all_funds.append({
                "name": fund_name,
                "category": category,
                "one_year_return": one_year,
                "three_year_return": three_year,
                "five_year_return": five_year
            })

    finally:
        driver.quit()

    logging.info(f"✔ Scraped {len(all_funds)} funds")
    return all_funds, 0


def save_json(data, filename="groww_mutual_fund_data.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    print(f"Saved: {filename}")


if __name__ == "__main__":
    d, _ = scrape()
    save_json(d)
