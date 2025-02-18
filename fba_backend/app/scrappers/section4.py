import os
import time
import json
import re
import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# Load environment variables only in local development
if not os.environ.get('RENDER'):
    load_dotenv()

# --- Helper Functions ---
def get_wait_time():
    """Return environment-appropriate timeout duration"""
    return 20 if os.environ.get('RENDER') else 10

def get_driver():
    """Initialize Chrome driver with environment-aware configuration"""
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")

    if os.environ.get('RENDER'):
        # Render-specific configuration
        options.binary_location = '/tmp/chrome/opt/google/chrome/chrome'
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        try:
            # Auto-detect Chrome version
            chrome_path = options.binary_location
            result = subprocess.run([chrome_path, '--version'],
                                   capture_output=True, text=True)
            version = re.search(r'\d+\.\d+\.\d+', result.stdout).group()
            major_version = version.split('.')[0]

            # Install matching chromedriver
            service = Service(ChromeDriverManager(version=major_version).install())
        except Exception as e:
            print(f"Error initializing ChromeDriver: {e}")
            service = Service(ChromeDriverManager().install())
    else:
        # Windows/local configuration
        options.headless = False  # Visible browser for local testing
        service = Service(ChromeDriverManager().install())

    return webdriver.Chrome(service=service, options=options)

def click_button(driver, by, value, timeout=None, sleep_time=2, verbose=False):
    """
    Wait for a button to be clickable and click it.
    If verbose is True, prints an error if the button cannot be clicked.
    """
    timeout = timeout or get_wait_time()
    try:
        wait = WebDriverWait(driver, timeout)
        button = wait.until(EC.element_to_be_clickable((by, value)))
        driver.execute_script("arguments[0].click();", button)
        time.sleep(sleep_time)
    except Exception as e:
        if verbose:
            print(f"Could not click button with {by}='{value}': {e}")

def yahoo_lookup(company, driver):
    """
    Navigates to Yahoo Finance lookup for a given company name,
    clicks necessary buttons, and returns the extracted ticker.
    """
    lookup_url = f"https://finance.yahoo.com/lookup/?s={company}"
    driver.get(lookup_url)
    wait = WebDriverWait(driver, get_wait_time())

    # Try scrolling down if needed
    click_button(driver, By.ID, "scroll-down-btn", sleep_time=2)
    # Try accepting cookies/consent if prompted
    click_button(driver, By.XPATH, '//button[@name="agree" and contains(text(), "Accept all")]', sleep_time=2)

    ticker_element = wait.until(
        EC.presence_of_element_located((By.XPATH, '//a[contains(@class, "loud-link") and contains(@href, "/quote/")]'))
    )
    ticker = ticker_element.text.strip()
    return ticker

def get_text(wait, css_selector):
    element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
    return element.text

def get_all_texts(wait, css_selector):
    elements = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, css_selector)))
    return [element.text for element in elements]

def extract_stock_data(wait):
    stock_name = get_text(wait, 'div.zzDege')
    stock_value = get_text(wait, 'div.YMlKec.fxKbKc')
    key_stats = get_all_texts(wait, 'div.P6K39c')
    income_statement = get_all_texts(wait, 'td.QXDnM')
    income_statement_percent = get_all_texts(wait, 'td.gEUVJe')

    market_cap = key_stats[3] if len(key_stats) > 3 else ""
    avg_volume = key_stats[4] if len(key_stats) > 4 else ""
    pe_ratio = key_stats[5] if len(key_stats) > 5 else ""

    revenue = income_statement[0] if len(income_statement) > 0 else ""
    revenue_growth_rate = income_statement_percent[0] if len(income_statement_percent) > 0 else ""
    operating_expense = income_statement[1] if len(income_statement) > 1 else ""
    operating_expense_rate = income_statement_percent[1] if len(income_statement_percent) > 1 else ""
    net_income = income_statement[2] if len(income_statement) > 2 else ""
    net_income_rate = income_statement_percent[2] if len(income_statement_percent) > 2 else ""
    net_profit_margin = income_statement[3] if len(income_statement) > 3 else ""
    net_profit_margin_rate = income_statement_percent[3] if len(income_statement_percent) > 3 else ""

    return {
        "stock_name": stock_name,
        "stock_value": stock_value,
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
    key_data = get_all_texts(wait, 'div.markets-keyfacts__value-3a2Zj8.cnn-pcl-bn5xbk')
    sector = key_data[0] if len(key_data) > 0 else ""
    industry = key_data[1] if len(key_data) > 1 else ""
    return {"sector": sector, "industry": industry}

def extract_csimarket_data(wait):
    shares = get_all_texts(wait, 'td.subcomp11.ac')
    market_share = shares[2] if len(shares) > 2 else ""
    return {"market share": market_share}

def extract_marketbeat_data(wait):
    competitor_text = get_text(wait, 'h2.section-h.mt-0')
    if "vs." in competitor_text:
        competitors_str = competitor_text.split("vs.")[1]
    else:
        competitors_str = competitor_text
    competitors_str = competitors_str.replace("and", "")
    competitors_list = [comp.strip() for comp in competitors_str.split(",") if comp.strip()]
    competitors_list = competitors_list[:3]
    competitor_dict = {}
    for i, competitor in enumerate(competitors_list, 1):
        competitor_dict[f"competitor_{i}"] = competitor
    return competitor_dict

# Main execution flow
def main4(companies):
    try:
        # Initialize driver
        driver = get_driver()

        # Create export folder if it doesn't exist
        export_folder = "export"
        os.makedirs(export_folder, exist_ok=True)

        topTickers = []
        data = []

        # --- Yahoo Finance Lookup ---
        for company in companies:
            try:
                ticker = yahoo_lookup(company, driver)
                topTickers.append(ticker)
            except Exception as e:
                print(f"Error looking up {company}: {e}")

        # Process each ticker from the lookup
        for ticker in topTickers:
            try:
                # --- Scrape primary company data from Google Finance ---
                driver.get("https://www.google.com/finance/")
                click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2, verbose=True)

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

                WebDriverWait(driver, get_wait_time()).until(EC.url_changes("https://www.google.com/finance/"))
                element = WebDriverWait(driver, get_wait_time()).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.ygUjEc[jsname='Vebqub']"))
                )
                text = element.text
                parts = text.split(" · ")
                exchange = parts[2].strip() if len(parts) >= 3 else ""

                # Construct URL for detailed stock info
                google_url = f"https://www.google.com/finance/quote/{ticker.replace('.', '-')}:{exchange}?window=1Y"
                driver.get(google_url)
                time.sleep(2)
                click_button(driver, By.XPATH, "//button[contains(., 'Accept all')]", timeout=5, sleep_time=2)
                click_button(driver, By.XPATH, "//button[contains(., 'Annual')]", timeout=5, sleep_time=2)

                wait = WebDriverWait(driver, get_wait_time())
                google_data = extract_stock_data(wait)

                # --- Scrape additional info from CNN ---
                cnn_url = f"https://edition.cnn.com/markets/stocks/{ticker.lower()}"
                driver.get(cnn_url)
                time.sleep(2)
                wait = WebDriverWait(driver, get_wait_time())
                cnn_data = extract_cnn_data(wait)

                # --- Scrape from csimarket ---
                csimarket_url = f"https://csimarket.com/stocks/competitionSEG2.php?code={ticker.lower()}"
                driver.get(csimarket_url)
                time.sleep(2)
                click_button(driver, By.XPATH, "//button[contains(., 'Consent')]", timeout=5, sleep_time=2)
                wait = WebDriverWait(driver, get_wait_time())
                csimarket_data = extract_csimarket_data(wait)

                # --- Scrape competitor data from MarketBeat ---
                marketbeat_url = f"https://www.marketbeat.com/stocks/{exchange}/{ticker.lower()}/competitors-and-alternatives/"
                driver.get(marketbeat_url)
                time.sleep(2)
                click_button(driver, By.XPATH, "//button[contains(., 'Consent')]", timeout=5, sleep_time=2)
                wait = WebDriverWait(driver, get_wait_time())
                marketbeat_data = extract_marketbeat_data(wait)

                # --- Aggregate the data from all sources ---
                stock_data = {**google_data, **cnn_data, **csimarket_data, **marketbeat_data}

                # --- Competitor processing ---
                for comp_key, competitor in marketbeat_data.items():
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
                            stock_data[f"{comp_key}_data"] = {}
                            continue

                        WebDriverWait(driver, get_wait_time()).until(EC.url_changes("https://www.google.com/finance/"))
                        click_button(driver, By.XPATH, "//button[contains(., '1Y')]", timeout=5, sleep_time=2)
                        click_button(driver, By.XPATH, "//button[contains(., 'Annual')]", timeout=5, sleep_time=2)

                        wait_comp = WebDriverWait(driver, get_wait_time())
                        comp_data = extract_stock_data(wait_comp)
                        stock_data[f"{comp_key}_data"] = comp_data
                    except Exception as e:
                        print(f"An error occurred while processing competitor {competitor}: {e}")
                        stock_data[f"{comp_key}_data"] = {}

                data.append(stock_data)

                # Export individual JSON file
                filename = f"{stock_data['stock_name'].replace(' ', '_')}_Market_Analysis.json"
                with open(os.path.join(export_folder, filename), 'w') as f:
                    json.dump(stock_data, f, indent=4)

            except Exception as e:
                print(f"An error occurred while processing {ticker}: {e}")

        # Clean up
        driver.quit()

        # Save aggregated data
        with open(os.path.join(export_folder, "all_stock_data.json"), 'w') as f:
            json.dump(data, f, indent=4)

        return data

    except Exception as e:
        return {"error": "Internal Server Error", "details": str(e)}
