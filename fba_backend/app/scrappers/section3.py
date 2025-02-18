import os
import re
import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables only in local development
if not os.environ.get('RENDER'):
    load_dotenv()

# Get API key from environment
API_KEY = os.environ.get('SERPAPI_KEY')
SERP_API_URL = "https://serpapi.com/search.json"

# Query template
QUERY_TEMPLATE = "Past Business History of {company} Previous Companies of Executives, Past Bankruptcies, Regulatory Actions"

def get_driver():
    """Initialize Chrome driver with environment-aware configuration"""
    options = Options()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--headless=new")  # New headless mode

    if os.environ.get('RENDER'):
        # Render-specific configuration using your existing build command setup
        chrome_path = '/tmp/chrome/opt/google/chrome/chrome'
        options.binary_location = chrome_path

        # Auto-detect Chrome version and get matching chromedriver
        try:
            # Get Chrome version
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
        service = Service(ChromeDriverManager().install())

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(service=service, options=options)

def get_wait_time():
    """Environment-aware timeout configuration"""
    return 20 if os.environ.get('RENDER') else 10

def handle_cookie_consent(driver):
    """Handle cookie consent overlay if present."""
    try:
        consent_button = WebDriverWait(driver, get_wait_time()).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".consent-overlay .accept-all"))
        )
        consent_button.click()
        print("Cookie consent accepted.")
    except TimeoutException:
        print("No cookie consent overlay found.")


def get_ticker_symbol(company_name):
    """Fetch the stock ticker symbol for a given company name using SerpApi."""
    print(f"Fetching ticker symbol for {company_name}...")
    params = {
        "engine": "google",
        "q": f"{company_name} stock ticker site:finance.yahoo.com",
        "api_key": API_KEY
    }
    response = requests.get(SERP_API_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        for result in data.get("organic_results", []):
            link = result.get("link", "")
            if "quote/" in link:
                ticker = link.split("quote/")[-1].split("?")[0]
                print(f"Found ticker symbol: {ticker}")
                return ticker.upper()
    print(f"Could not find a ticker symbol for {company_name}.")
    return None

def scrape_key_executives(ticker):
    """Scrape the Key Executives table from Yahoo Finance."""
    driver = get_driver()
    driver.set_script_timeout(1200)  # Set script timeout to 120 seconds

    try:
        url = f"https://finance.yahoo.com/quote/{ticker}/profile"
        print(f"Scraping key executives for {ticker}...")
        driver.get(url)
        handle_cookie_consent(driver)

        table = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table.yf-mj92za"))
        )
        rows = table.find_elements(By.TAG_NAME, "tr")
        executives = []
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) == 5:
                executives.append({
                    "Name": cols[0].text.strip(),
                    "Title": cols[1].text.strip(),
                    "Pay": cols[2].text.strip(),
                    "Exercised": cols[3].text.strip(),
                    "Year Born": cols[4].text.strip(),
                })
        return executives
    except TimeoutException:
        print(f"Key Executives table not found for {ticker}.")
        return []
    finally:
        driver.quit()

def scrape_esg_scores(ticker):
    """Scrape ESG scores from Yahoo Finance."""
    driver = get_driver()
    try:
        url = f"https://finance.yahoo.com/quote/{ticker}/sustainability"
        print(f"Scraping ESG scores for {ticker}...")
        driver.get(url)
        handle_cookie_consent(driver)

        esg_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "section[data-testid='esg-cards']"))
        )
        return {
            "Total ESG Risk Score": esg_section.find_element(By.CSS_SELECTOR, "section[data-testid='TOTAL_ESG_SCORE'] h4").text,
            "Environmental Risk Score": esg_section.find_element(By.CSS_SELECTOR, "section[data-testid='ENVIRONMENTAL_SCORE'] h4").text,
            "Social Risk Score": esg_section.find_element(By.CSS_SELECTOR, "section[data-testid='SOCIAL_SCORE'] h4").text,
            "Governance Risk Score": esg_section.find_element(By.CSS_SELECTOR, "section[data-testid='GOVERNANCE_SCORE'] h4").text,
        }
    except TimeoutException:
        print(f"No ESG data found for {ticker}.")
        return {
            "Total ESG Risk Score": "N/A",
            "Environmental Risk Score": "N/A",
            "Social Risk Score": "N/A",
            "Governance Risk Score": "N/A",
        }
    finally:
        driver.quit()

def fetch_linkedin_profile(name):
    """Search for the LinkedIn profile of an executive using SerpApi."""
    print(f"Searching LinkedIn profile for {name}...")
    params = {
        "engine": "google",
        "q": f"{name} LinkedIn",
        "api_key": API_KEY
    }
    response = requests.get(SERP_API_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        for result in data.get("organic_results", []):
            link = result.get("link", "")
            if "linkedin.com/in/" in link or "linkedin.com/pub/" in link:
                print(f"Found LinkedIn profile: {link}")
                return link
    print(f"LinkedIn profile for {name} not found.")
    return "Not Found"

def fetch_business_history(company):
    """Fetch past business history using SerpApi."""
    print(f"Fetching business history for {company}...")
    params = {
        "engine": "google",
        "q": QUERY_TEMPLATE.format(company=company),
        "api_key": API_KEY,
        "num": 10
    }
    response = requests.get(SERP_API_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        return [
            {
                "Title": result.get("title"),
                "Link": result.get("link"),
                "Snippet": result.get("snippet", "N/A")
            } for result in data.get("organic_results", [])
        ]
    print(f"Error fetching business history for {company}: {response.status_code}")
    return []
