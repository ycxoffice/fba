import os
import time
import json
import re
import platform
import logging
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ============================
# Driver Initialization
# ============================
def get_driver():
    """Initialize Chrome driver for both Ubuntu (VPS) and Windows (local)"""
    options = Options()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Enable headless mode only on Linux
    if platform.system() == "Linux":
        options.add_argument("--headless=new")  # New headless mode for Linux

    # Detect OS and set ChromeDriver path accordingly
    chromedriver_path = "/usr/local/bin/chromedriver" if platform.system() == "Linux" else None

    try:
        if chromedriver_path and os.path.exists(chromedriver_path):
            logging.info(f"Using custom ChromeDriver path: {chromedriver_path}")
            service = Service(executable_path=chromedriver_path)
        else:
            logging.info("Downloading and using ChromeDriver from ChromeDriverManager...")
            service = Service(ChromeDriverManager().install())  # Auto-download latest

        driver = webdriver.Chrome(service=service, options=options)
        logging.info("ChromeDriver initialized successfully.")
        return driver

    except Exception as e:
        logging.error(f"Error initializing ChromeDriver: {e}", exc_info=True)
        return None

def get_wait_time():
    """Environment-aware timeout configuration"""
    # Increase timeout for production server
    return 20

# ============================
# Constants and Global Settings
# ============================
DEFAULT_WAIT_TIME = get_wait_time()  # seconds for private scraping
CONSENT_WAIT_TIME = 5       # seconds for consent pop-up wait (private)
LAZY_LOAD_PAUSE = 1         # seconds pause for lazy-loaded content (private)
EXPORT_FOLDER = "export"

# ============================
# Utility Functions
# ============================
def click_button(driver, by, value, timeout=5, sleep_time=2, verbose=False):
    """
    Waits for a clickable element and clicks it using JavaScript.
    """
    try:
        wait = WebDriverWait(driver, timeout)
        button = wait.until(EC.element_to_be_clickable((by, value)))
        driver.execute_script("arguments[0].click();", button)
        time.sleep(sleep_time)
    except Exception as e:
        if verbose:
            print(f"Could not click button with {by}='{value}': {e}")

def google_finance_lookup(company, driver):
    """
    Uses Google Finance to look up a company.
    It opens Google Finance, clicks "Accept all", enters the company name,
    and then waits for the URL to change. If the URL changes, the company is
    assumed to be public and the ticker is extracted from the heading element.
    Returns the ticker if found; otherwise, returns None.
    """
    driver.get("https://www.google.com/finance/")
    time.sleep(2)
    click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2)

    search_elements = driver.find_elements(By.CSS_SELECTOR, "input.Ax4B8.ZAGvjd")
    comp_found = False
    for el in search_elements:
        if el.is_displayed() and el.is_enabled():
            el.clear()
            el.send_keys(company)
            el.send_keys(Keys.ENTER)
            comp_found = True
            break
    if not comp_found:
        print("No interactable search input found for company:", company)
        return None

    try:
        WebDriverWait(driver, 10).until(EC.url_changes("https://www.google.com/finance/"))
    except Exception as e:
        # URL did not change within the timeout; treat as private.
        return None

    # If the URL remains the same, assume the company is private.
    if driver.current_url == "https://www.google.com/finance/":
        return None

    # Extract the ticker from the heading element.
    try:
        ticker_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//div[@role='heading' and contains(@class, 'PdOqHc')]"))
        )
        element_text = ticker_element.text  # Expected format: "Home AAPL • NASDAQ"
        if "•" in element_text:
            parts = element_text.split("•")
            left_part = parts[0].strip()   # e.g., "Home AAPL"
            ticker = left_part.split()[-1]   # extracts "AAPL"
            return ticker
        else:
            print("Ticker information not found in element text:", element_text)
            return None
    except Exception as e:
        print("Error extracting ticker:", e)
        return None

def get_text(wait, css_selector):
    """
    Retrieves text from an element specified by its CSS selector.
    If the element is not found, returns "NA".
    """
    try:
        element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
        text = element.text.strip()
        return text if text else "NA"
    except Exception:
        return "NA"

def get_all_texts(wait, css_selector):
    """
    Retrieves text from all elements matching the given CSS selector.
    If none are found, returns a list containing "NA".
    """
    try:
        elements = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, css_selector)))
        texts = [element.text.strip() for element in elements if element.text.strip() != ""]
        return texts if texts else ["NA"]
    except Exception:
        return ["NA"]

def extract_stock_data(wait):
    """
    Extracts stock-related data from Google Finance.
    Each field is assigned "NA" if it cannot be scraped.
    """
    stock_name = get_text(wait, 'div.zzDege')
    stock_value = get_text(wait, 'div.YMlKec.fxKbKc')
    key_stats = get_all_texts(wait, 'div.P6K39c')
    income_statement = get_all_texts(wait, 'td.QXDnM')
    income_statement_percent = get_all_texts(wait, 'td.gEUVJe')

    market_cap = key_stats[3] if len(key_stats) > 3 else "NA"
    avg_volume = key_stats[4] if len(key_stats) > 4 else "NA"
    pe_ratio   = key_stats[5] if len(key_stats) > 5 else "NA"

    revenue = income_statement[0] if len(income_statement) > 0 else "NA"
    revenue_growth_rate = income_statement_percent[0] if len(income_statement_percent) > 0 else "NA"
    operating_expense = income_statement[1] if len(income_statement) > 1 else "NA"
    operating_expense_rate = income_statement_percent[1] if len(income_statement_percent) > 1 else "NA"
    net_income = income_statement[2] if len(income_statement) > 2 else "NA"
    net_income_rate = income_statement_percent[2] if len(income_statement_percent) > 2 else "NA"
    net_profit_margin = income_statement[3] if len(income_statement) > 3 else "NA"
    net_profit_margin_rate = income_statement_percent[3] if len(income_statement_percent) > 3 else "NA"

    return {
        "stock name": stock_name,
        "stock value": stock_value,
        "market cap": market_cap,
        "avg volume": avg_volume,
        "P/E ratio": pe_ratio,
        "revenue": revenue,
        "revenue growth rate": revenue_growth_rate,
        "operating expense": operating_expense,
        "operating expense rate": operating_expense_rate,
        "net income": net_income,
        "net income rate": net_income_rate,
        "net profit margin": net_profit_margin,
        "net profit margin rate": net_profit_margin_rate,
    }

def extract_cnn_data(wait):
    """
    Extracts sector and industry data from CNN.
    Each field is assigned "NA" if not found.
    """
    key_data = get_all_texts(wait, 'div.markets-keyfacts__value-3a2Zj8.cnn-pcl-bn5xbk')
    sector = key_data[0] if len(key_data) > 0 else "NA"
    industry = key_data[1] if len(key_data) > 1 else "NA"
    return {"sector": sector, "industry": industry}

def extract_csimarket_data(wait):
    """
    Extracts market share data from csimarket.
    """
    shares = get_all_texts(wait, 'td.subcomp11.ac')
    market_share = shares[2] if len(shares) > 2 else "NA"
    return {"market share": market_share}

def extract_marketbeat_data(wait):
    """
    Extracts competitor data from MarketBeat.
    """
    competitor_text = get_text(wait, 'h2.section-h.mt-0')
    if competitor_text != "NA" and "vs." in competitor_text:
        competitors_str = competitor_text.split("vs.")[1]
    else:
        competitors_str = competitor_text
    competitors_list = [comp.strip() for comp in competitors_str.replace("and", "").split(",") if comp.strip()]
    if not competitors_list:
        competitors_list = ["NA"]
    competitors_list = competitors_list[:3]
    return {f"competitor_{i+1}": comp for i, comp in enumerate(competitors_list)}

# ============================
# Public Company Scraper
# ============================
def scrape_public_company(company, ticker):
    driver = get_driver()
    if not driver:
        print("Failed to initialize ChromeDriver.")
        return

    try:
        print(f"Scraping public company data for: {company} with ticker {ticker}")
        # Open Google Finance and search for the ticker.
        driver.get("https://www.google.com/finance/")
        click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2)

        elements = driver.find_elements(By.CSS_SELECTOR, "input.Ax4B8.ZAGvjd")
        found = False
        for el in elements:
            if el.is_displayed() and el.is_enabled():
                el.click()
                el.send_keys(ticker)
                el.send_keys(Keys.ENTER)
                found = True
                break
        if not found:
            print("No interactable search input element found for ticker", ticker)

        WebDriverWait(driver, 10).until(EC.url_changes("https://www.google.com/finance/"))
        # Extract exchange from a heading element.
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.ygUjEc[jsname='Vebqub']"))
        )
        parts = element.text.split(" · ")
        exchange = parts[2].strip() if len(parts) >= 3 else "NA"

        # Construct URL for detailed stock info.
        google_url = f"https://www.google.com/finance/quote/{ticker.replace('.', '-')}: {exchange}?window=1Y".replace(" ", "")
        driver.get(google_url)
        time.sleep(2)
        click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2)
        click_button(driver, By.XPATH, "//button[contains(., 'Annual')]", timeout=5, sleep_time=2)

        wait = WebDriverWait(driver, 10)
        google_data = extract_stock_data(wait)

        # Scrape additional info from CNN.
        cnn_url = f"https://edition.cnn.com/markets/stocks/{ticker.lower()}"
        driver.get(cnn_url)
        time.sleep(2)
        wait = WebDriverWait(driver, 10)
        cnn_data = extract_cnn_data(wait)

        # Scrape data from csimarket.
        csimarket_url = f"https://csimarket.com/stocks/competitionSEG2.php?code={ticker.lower()}"
        driver.get(csimarket_url)
        time.sleep(2)
        click_button(driver, By.XPATH, "//button[contains(., 'Consent')]", timeout=5, sleep_time=2)
        wait = WebDriverWait(driver, 10)
        csimarket_data = extract_csimarket_data(wait)

        # Scrape competitor data from MarketBeat.
        marketbeat_url = f"https://www.marketbeat.com/stocks/{exchange}/{ticker.lower()}/competitors-and-alternatives/"
        driver.get(marketbeat_url)
        time.sleep(2)
        click_button(driver, By.XPATH, "//button[contains(., 'Consent')]", timeout=5, sleep_time=2)
        wait = WebDriverWait(driver, 10)
        marketbeat_data = extract_marketbeat_data(wait)

        # Aggregate data from all sources.
        stock_data = {**google_data, **cnn_data, **csimarket_data, **marketbeat_data}

        # For each competitor, if the competitor name is "NA", assign "NA" for its data.
        for comp_key, competitor in marketbeat_data.items():
            if competitor == "NA":
                stock_data[f"{comp_key}_data"] = "NA"
            else:
                try:
                    driver.get("https://www.google.com/finance/")
                    time.sleep(2)
                    click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2)
                    search_elements = driver.find_elements(By.CSS_SELECTOR, "input.Ax4B8.ZAGvjd")
                    comp_found = False
                    for el in search_elements:
                        if el.is_displayed() and el.is_enabled():
                            el.clear()
                            el.send_keys(competitor)
                            el.send_keys(Keys.ENTER)
                            comp_found = True
                            break
                    if not comp_found:
                        print("No interactable search input found for competitor:", competitor)
                        stock_data[f"{comp_key}_data"] = "NA"
                        continue

                    WebDriverWait(driver, 10).until(EC.url_changes("https://www.google.com/finance/"))
                    click_button(driver, By.XPATH, "//button[contains(., '1Y')]", timeout=5, sleep_time=2)
                    click_button(driver, By.XPATH, "//button[contains(., 'Annual')]", timeout=5, sleep_time=2)

                    wait_comp = WebDriverWait(driver, 10)
                    comp_data = extract_stock_data(wait_comp)
                    stock_data[f"{comp_key}_data"] = comp_data
                except Exception as e:
                    print(f"An error occurred while processing competitor {competitor}: {e}")
                    stock_data[f"{comp_key}_data"] = "NA"

        return json.dumps(stock_data, indent=4)

    except Exception as e:
        print(f"An error occurred while processing ticker {ticker}: {e}")

    finally:
        driver.quit()

# ============================
# Private Company Scraper
# ============================
def scrape_company_data(driver, wait, company_name):
    """
    Extracts revenue, industry, and competitor data from a private company's page.
    If any element is not found, assigns "NA" to that feature.
    """
    try:
        consent_button = WebDriverWait(driver, CONSENT_WAIT_TIME).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Consent')]"))
        )
        consent_button.click()
    except Exception:
        pass

    try:
        revenue_li = wait.until(
            EC.presence_of_element_located((By.XPATH, '//ul[@style="margin-bottom:5px"]/li[contains(., "estimated annual revenue")]'))
        )
        revenue_text = revenue_li.text
    except Exception:
        revenue_text = "NA"

    try:
        match = re.search(r'[\$£€]\d+(?:\.\d+)?[MB]', revenue_text)
        estimated_revenue = match.group() if match else "NA"
    except Exception:
        estimated_revenue = "NA"

    try:
        industry_element = wait.until(
            EC.presence_of_element_located((By.XPATH, "//h4[a[contains(@href, '/industry/')]]/a"))
        )
        industry = industry_element.text.strip() if industry_element.text.strip() != "" else "NA"
    except Exception:
        industry = "NA"

    try:
        competitor_table = wait.until(
            EC.visibility_of_element_located((By.XPATH, "(//table[contains(@class, 'cstm-table')])[2]"))
        )
    except Exception:
        competitor_table = None

    if competitor_table:
        driver.execute_script("arguments[0].scrollIntoView(true);", competitor_table)
        time.sleep(LAZY_LOAD_PAUSE)
    else:
        return {
            "company name": company_name,
            "revenue": estimated_revenue,
            "industry": industry,
            "competitors": [{"name": "NA", "revenue": "NA"}]
        }

    def extract_competitor(row_index):
        try:
            row = wait.until(
                EC.visibility_of_element_located((By.XPATH, f"(//table[contains(@class, 'cstm-table')])[2]//tbody/tr[{row_index}]"))
            )
            name = row.find_element(By.XPATH, ".//td[1]//a[contains(@href, '/company/')]").text.strip()
            revenue = row.find_element(By.XPATH, "./td[2]").text.strip()
            return {"name": name if name else "NA", "revenue": revenue if revenue else "NA"}
        except Exception:
            return {"name": "NA", "revenue": "NA"}

    competitor_1 = extract_competitor(1)
    competitor_2 = extract_competitor(2)
    competitor_3 = extract_competitor(3)

    return {
        "company name": company_name,
        "revenue": estimated_revenue,
        "industry": industry,
        "competitors": [competitor_1, competitor_2, competitor_3]
    }

def scrape_private_company(company):
    """
    Scrapes data for a private company using its Growjo page.
    """
    private_base_url = "https://growjo.com/company/"
    url = f"{private_base_url}{company}"

    driver = get_driver()
    if not driver:
        print("Failed to initialize ChromeDriver.")
        return

    try:
        driver.get(url)
        wait = WebDriverWait(driver, DEFAULT_WAIT_TIME)
        result = scrape_company_data(driver, wait, company)
        return json.dumps(result, indent=4)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
    finally:
        driver.quit()

# ============================
# Automatic Company Type Determination
# ============================
def determine_company_type(company):
    """
    Determines if the company is public or private by using Google Finance.
    Returns ("public", ticker) if a ticker is found; otherwise ("private", None).
    """
    driver = get_driver()
    if not driver:
        return "private", None

    try:
        ticker = google_finance_lookup(company, driver)
        if ticker:
            print(f"'{company}' is a public company with ticker: {ticker}")
            return "public", ticker
        else:
            print(f"'{company}' is a private company.")
            return "private", None
    except Exception as e:
        print(f"Error during Google Finance lookup for {company}: {e}")
        return "private", None
    finally:
        driver.quit()

# ============================
# Main Execution
# ============================
def main4(company):
    company_type, ticker = determine_company_type(company)

    if company_type == "public":
        result = scrape_public_company(company, ticker)
    else:
        result = scrape_private_company(company)
    return result

