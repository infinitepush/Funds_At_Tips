from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

import json
import logging
import re
import os

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


def create_driver(headless: bool = True):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver


def parse_percent(value: str):
    if not value:
        return None
    try:
        if isinstance(value, (int, float)):
            return float(value)
        v = value.strip()
        if v.upper() == 'NA':
            return None
        v = v.replace(',', '').replace('%', '')
        return float(v)
    except Exception:
        return None


def write_output(data, out_path, fmt='json'):
    if fmt == 'json':
        with open(out_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
    elif fmt == 'csv':
        with open(out_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            # include category column when available
            writer.writerow(['name', 'category', 'one_year_return',
                            'three_year_return', 'five_year_return'])
            for item in data:
                writer.writerow([
                    item.get('name', ''),
                    item.get('category', ''),
                    item.get('one_year_return', ''),
                    item.get('three_year_return', ''),
                    item.get('five_year_return', ''),
                ])


def summarize(data, top_n=5):
    def key_fn(it):
        return parse_percent(it.get('five_year_return'))

    scored = [d for d in data]
    scored.sort(key=lambda d: (key_fn(d) is None, -(key_fn(d) or 0)))
    for i, item in enumerate(scored[:top_n]):
        print(f"{i+1}. {item.get('name')} — {item.get('five_year_return')}")


def scrape(headless=True, url='https://groww.in/mutual-funds/filter', timeout=15, limit=0, debug=False, debug_dir='.'):
    driver = create_driver(headless=headless)
    logging.info("ChromeDriver started")

    try:
        driver.get(url)

        wait = WebDriverWait(driver, timeout)
        try:
            fund_rows = wait.until(
                EC.presence_of_all_elements_located((By.XPATH, '//tr')))
        except TimeoutException:
            logging.warning("Timed out waiting for fund rows; no rows found")
            fund_rows = []

        fund_data = []
        skipped = 0

        for idx, row in enumerate(fund_rows):
            if debug and idx < 3:
                try:
                    html = row.get_attribute('innerHTML')
                    with open(os.path.join(debug_dir, f'debug_row_{idx}.html'), 'w', encoding='utf-8') as fh:
                        fh.write(html)
                    logging.info('Wrote debug_row_%d.html', idx)
                except Exception:
                    pass

            try:
                fund_name = ""
                try:
                    fund_name = row.find_element(
                        By.XPATH, './/div[contains(@class, "f22SchemeName")]//div[contains(@class, "contentPrimary")]').text.strip()
                except Exception:
                    fund_name = ""

                if not fund_name:
                    try:
                        fund_name = row.find_element(
                            By.XPATH, './/td[2]//div').text.strip()
                    except Exception:
                        pass

                if not fund_name:
                    percent_re = re.compile(r"^-?\d+(?:\.\d+)?%$")
                    for el in row.find_elements(By.XPATH, './/*'):
                        try:
                            txt = el.text.strip()
                        except Exception:
                            continue
                        if not txt:
                            continue
                        if percent_re.match(txt) or len(txt) <= 1:
                            continue
                        fund_name = txt
                        logging.debug(
                            "Found fund name by fallback: %s", fund_name)
                        break

                # Extract year returns: 1Y, 3Y, 5Y are in separate td.f22YearReturn cells
                year_cells = row.find_elements(
                    By.XPATH, './/td[contains(@class, "f22YearReturn")]')
                one_year = None
                three_year = None
                five_year = None
                for cell in year_cells:
                    try:
                        primary = cell.find_element(
                            By.XPATH, './/div/div[contains(@class, "contentPrimary")]').text.strip()
                    except Exception:
                        primary = ''
                    try:
                        label = cell.find_element(
                            By.XPATH, './/div/div[contains(@class, "contentSecondary")]').text.strip()
                    except Exception:
                        label = ''
                    if label.startswith('1'):
                        one_year = primary
                    elif label.startswith('3'):
                        three_year = primary
                    elif label.startswith('5'):
                        five_year = primary

                # Try to extract category/risk line (e.g. "Very High Risk • Commodities • 5 ★")
                category = None
                try:
                    cat_text = row.find_element(
                        By.XPATH, './/div[contains(@class, "f22SchemeName")]//div[contains(@class, "contentSecondary")]').text.strip()
                    # split on bullet separator and pick the middle token if available
                    parts = [p.strip() for p in re.split(
                        r'•|\\u2022', cat_text) if p.strip()]
                    if len(parts) >= 2:
                        # common pattern: <risk> • <category> • <rating>
                        category = parts[1]
                    elif len(parts) == 1:
                        category = parts[0]
                except Exception:
                    category = None

                fund_data.append({
                    'name': fund_name,
                    'category': category or 'Unknown',
                    'one_year_return': one_year or 'NA',
                    'three_year_return': three_year or 'NA',
                    'five_year_return': five_year or 'NA',
                })

                if limit and limit > 0 and len(fund_data) >= limit:
                    break

            except Exception as e:
                logging.debug("Skipping a row: %s", e)
                skipped += 1

    finally:
        try:
            driver.quit()
            logging.info("ChromeDriver closed")
        except Exception:
            pass

    return fund_data, skipped
