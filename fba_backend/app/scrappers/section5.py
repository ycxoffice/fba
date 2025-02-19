import os
import re
import subprocess
import time
import json
import requests
import pandas as pd
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import warnings

# Suppress XML warning
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# Load environment variables only in local development
load_dotenv()

# Environment configuration
SCRAPER_API_KEY = "6de50d316b80483b7c00a9db6f3cade0"

def get_driver():
    """Initialize Chrome driver for custom VPS deployment"""
    options = Options()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--headless=new")  # New headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Use the system's chromedriver directly
    chromedriver_path = "/usr/local/bin/chromedriver"  
    
    try:
        service = Service(executable_path=chromedriver_path)
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"Error using system chromedriver: {e}")
        # Fallback to ChromeDriverManager
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=options)

def get_wait_time():
    """Environment-aware timeout configuration"""
    # Increase timeout for production server
    return 20

### ==== UK NATIONAL ARCHIVES CASE LAW SCRAPER ==== ###
def get_total_pages(company_name):
    """Find the total number of pages from the UK National Archives case law search."""
    search_url = f"https://caselaw.nationalarchives.gov.uk/search?query=&judge=&party={company_name}&order=-date&page=1&per_page=50"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={search_url}"
    response = requests.get(scraper_url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        pagination_links = soup.find_all("a", class_="pagination__page-link")
        last_page = 1
        for link in pagination_links:
            if "aria-label" in link.attrs:
                match = re.search(r"Go to page (\d+)", link["aria-label"])
                if match:
                    last_page = max(last_page, int(match.group(1)))
        return last_page
    else:
        print(f"Failed to fetch the total page count for {company_name}.")
        return 1

def get_case_titles_uk(company_name, total_pages):
    """Scrape case law titles from all pages of UK National Archives."""
    all_titles = []
    for page in range(1, total_pages + 1):
        print(f"Scraping UK page {page} of {total_pages} for {company_name}...")
        search_url = f"https://caselaw.nationalarchives.gov.uk/search?per_page=50&order=relevance&query={company_name}&page={page}"
        scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={search_url}"
        response = requests.get(scraper_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            titles = [span.text.strip() for span in soup.find_all("span", class_="judgment-listing__title")]
            matching_titles = [title for title in titles if re.search(rf"\b{re.escape(company_name)}\b", title, re.IGNORECASE)]
            all_titles.extend(matching_titles)
        else:
            print(f"Failed to fetch UK page {page} for {company_name}. Skipping...")
    return all_titles if all_titles else ["No UK Lawsuits Found"]

### ==== FINDLAW CASE LAW SCRAPER ==== ###
def get_case_titles_findlaw(company_name):
    driver = get_driver()
    try:
        url = "https://caselaw.findlaw.com/"
        driver.get(url)
        time.sleep(3)

        search_input = driver.find_element(By.ID, "caselaw-banner-search__input--codes-keyword-or-citation")
        search_input.send_keys(company_name)
        search_input.send_keys(Keys.RETURN)
        time.sleep(5)

        current_url = driver.current_url
        all_cases = []
        page_number = 1

        while True:
            tabs = []
            for i in range(10):
                page_url = current_url.replace("cludopage=1", f"cludopage={page_number + i}")
                driver.execute_script(f"window.open('{page_url}');")
                tabs.append(driver.window_handles[-1])

            time.sleep(5)

            for tab in tabs:
                driver.switch_to.window(tab)
                soup = BeautifulSoup(driver.page_source, "html.parser")

                if soup.find("h1", string="No results found."):
                    print("No more FindLaw results found. Ending scrape.")
                    driver.quit()
                    return all_cases if all_cases else ["No FindLaw Cases Found"]

                cases = [case.get_text(strip=True) for case in soup.find_all("h2") if company_name.lower() in case.get_text(strip=True).lower()]
                all_cases.extend(cases)
                driver.close()

            driver.switch_to.window(driver.window_handles[0])
            page_number += 10


    finally:
        driver.quit()
        return all_cases if all_cases else ["No FindLaw Cases Found"]
### ==== PATENT SCRAPER (Espacenet) ==== ###
def get_patent_titles(company_name):
    """Scrape Espacenet and extract patent titles and applicants with specified conditions."""
    search_url = f"https://worldwide.espacenet.com/websyndication/searchFeed?DB=EPODOC&PA={company_name}&ST=advanced&locale=en_EP"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={search_url}"
    response = requests.get(scraper_url)

    all_patents = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "lxml")
        items = soup.find_all("item")

        for item in items:
            title_tag = item.find("title")
            patent_title = title_tag.get_text(strip=True) if title_tag else "Unknown"

            applicants_tag = item.find("esp:applicants")
            applicants = applicants_tag.get_text(strip=True) if applicants_tag else "Unknown Applicant"

            company_name_upper = company_name.upper()
            applicants_list = [a.strip().upper() for a in applicants.split(';')]

            if (applicants_list[0].startswith(company_name_upper) or
                any(app.startswith(company_name_upper) for app in applicants_list[1:])):
                all_patents.append(f"{patent_title} - {applicants}")

        return all_patents if all_patents else ["No Patents Found"]
    else:
        print(f"Failed to fetch patent information for {company_name}. Status Code: {response.status_code}")
        return ["No Patents Found"]

### ==== PATENT DECISIONS SCRAPER (UK IPO) ==== ###
def get_patent_decisions(company_name):
    """Scrape UK IPO website for patent decisions."""
    search_url = f"https://www.ipo.gov.uk/p-challenge-decision-results/p-challenge-decision-results-gen.htm?hearingtype=All&number=&MonthFrom=&YearFrom=&MonthTo=&YearTo=&hearingofficer=&party={company_name}&provisions=&keywords1=&keywords2=&keywords3=&submit=Go+%BB"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={search_url}"
    response = requests.get(scraper_url)

    patent_decisions = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        rows = soup.find_all("tr")

        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 3:
                application_number = columns[1].get_text(strip=True)
                company_name = columns[2].get_text(strip=True)
                decision_entry = f"{application_number} - {company_name}"
                patent_decisions.append(decision_entry)

        return patent_decisions if patent_decisions else ["No Patent Decisions Found"]
    else:
        print(f"Failed to fetch patent decisions for {company_name}. Status Code: {response.status_code}")
        return ["No Patent Decisions Found"]

### ==== COMBINED PATENT SCRAPER ==== ###
def get_all_patents(company_name):
    """Combine results from Espacenet and UK IPO patent scrapers into a single list."""
    espacenet_patents = get_patent_titles(company_name)
    ipo_patent_decisions = get_patent_decisions(company_name)
    combined_patents = list(set(espacenet_patents + ipo_patent_decisions))
    return combined_patents if combined_patents else ["No Patents Found"]

### ==== TRADEMARK DECISIONS SCRAPER (UK IPO) ==== ###
def get_trademark_decisions(company_name):
    """Scrape UK IPO website for trademark decisions."""
    search_url = f"https://www.ipo.gov.uk/t-challenge-decision-results/t-challenge-decision-results-gen.htm?hearingtype=All&mark=&tmclass=0&MonthFrom=&YearFrom=&MonthTo=&YearTo=&hearingofficer=&party={company_name}&grounds=All&submit=Search+%BB"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={search_url}"
    response = requests.get(scraper_url)

    trademark_decisions = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        rows = soup.find_all("tr")

        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 4:
                company_name_td = columns[1].get_text(strip=True)
                case_number_td = columns[3].get_text(strip=True)
                decision_entry = f"{company_name_td} - {case_number_td}"
                trademark_decisions.append(decision_entry)

        return trademark_decisions if trademark_decisions else ["No Trademark Decisions Found"]
    else:
        print(f"Failed to fetch trademark decisions for {company_name}. Status Code: {response.status_code}")
        return ["No Trademark Decisions Found"]

### ==== DATA BREACH SCRAPER (Wikipedia and Have I Been Pwned) ==== ###
def get_data_breaches(company_name):
    """Scrape Wikipedia and Have I Been Pwned for data breach incidents related to the company."""


    # Wikipedia scraping
    url = "https://en.wikipedia.org/wiki/List_of_data_breaches"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={url}"
    response = requests.get(scraper_url)
    data_breaches = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        tables = soup.find_all("table", class_="wikitable")

        for table in tables:
            rows = table.find_all("tr")
            for row in rows[1:]:
                columns = row.find_all("td")
                if len(columns) >= 3:
                    entity = columns[0].get_text(strip=True)
                    records = columns[2].get_text(strip=True)
                    if re.search(rf"\b{re.escape(company_name)}\b", entity, re.IGNORECASE):
                        entry = f"{entity} - {records} records breached"
                        data_breaches.append(entry)
    else:
        print(f"Failed to fetch data breach information from Wikipedia for {company_name}.")
    # Have I Been Pwned API scraping
    hibp_response = requests.get("https://haveibeenpwned.com/api/v3/breaches")
    if hibp_response.status_code == 200:
        breaches = hibp_response.json()
        for breach in breaches:
            if company_name.lower() in breach.get("Name", "").lower():
                name = breach.get("Name", "Unknown")
                description = breach.get("Description", "No description available").replace("\n", " ").strip()
                data_breaches.append(f"{name} - {description}")
    else:
        print(f"Failed to fetch data breach information from Have I Been Pwned for {company_name}.")


    return data_breaches if data_breaches else ["No Data Breaches Found"]

### ==== FATF BLACKLIST SCRAPER (Wikipedia) ==== ###
def get_fatf_blacklist(company_name):
    """Scrape Wikipedia for FATF blacklist countries matching the company name."""
    url = "https://en.wikipedia.org/wiki/Financial_Action_Task_Force_blacklist"
    scraper_url = f"http://api.scraperapi.com?api_key={SCRAPER_API_KEY}&url={url}"
    response = requests.get(scraper_url)

    fatf_blacklist = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        blacklist_section = soup.find("h3", id="Current_FATF_blacklist")

        if blacklist_section:
            country_list = blacklist_section.find_next("ol")
            if country_list:
                items = country_list.find_all("a")
                for item in items:
                    country_name = item.get_text(strip=True)
                    if re.search(rf"\b{re.escape(company_name)}\b", country_name, re.IGNORECASE):
                        fatf_blacklist.append(country_name)

    return fatf_blacklist if fatf_blacklist else ["Not Listed on Blacklist"]

### ==== INTERPOL RED NOTICE ==== ###
def scrape_interpol_notices(family_name):
    """Scrape Interpol Red Notices by searching for a family name."""
    driver = get_driver()
    try:
        driver.get("https://www.interpol.int/en/How-we-work/Notices/Red-Notices/View-Red-Notices")
        time.sleep(get_wait_time())

        family_name_input = driver.find_element(By.ID, "name")
        family_name_input.send_keys(family_name)
        family_name_input.send_keys(Keys.RETURN)
        time.sleep(get_wait_time())

        soup = BeautifulSoup(driver.page_source, "html.parser")
        notices = soup.find_all("div", class_="redNoticeItem__labelText")

        results = []
        for notice in notices:
            name_tag = notice.find("a", class_="redNoticeItem__labelLink")
            if name_tag:
                name = name_tag.get_text(separator=" ", strip=True)
                profile_url = name_tag["data-singleurl"]
                if name and profile_url:
                    results.append(f"{name} ({profile_url})")

        return results if results else ["No Interpol Notices Found"]
    finally:
        driver.quit()

### ==== GDPR PRIVACY COMPLIANCE SCRAPER ==== ###
def scrape_gdpr_fines(search_term):
    """Scrape GDPR fines from Enforcement Tracker."""
    driver = get_driver()
    try:
        driver.get("https://www.enforcementtracker.com/")
        time.sleep(get_wait_time())

        filter_inputs = driver.find_elements(By.CSS_SELECTOR, "input[placeholder='Filter Column']")
        if len(filter_inputs) < 4:
            return ["No GDPR Fines Found"]

        driver.execute_script("arguments[0].scrollIntoView();", filter_inputs[3])
        time.sleep(2)
        filter_inputs[3].send_keys(search_term)
        filter_inputs[3].send_keys(Keys.RETURN)
        time.sleep(get_wait_time())

        soup = BeautifulSoup(driver.page_source, "html.parser")
        rows = soup.find_all("tr", class_=["odd", "even"])

        results = []
        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 10:
                fine_amount = columns[5].text.strip()
                violation = columns[6].text.strip()
                controller = columns[9].text.strip()
                results.append(f"{fine_amount} - {violation} - {controller}")

        return results if results else ["No GDPR Fines Found"]
    finally:
        driver.quit()

### ==== OFAC SANCTIONS SCRAPER ==== ###
def scrape_ofac_sanctions(company_name):
    """Scrape OFAC sanctions list."""
    driver = get_driver()
    try:
        driver.get("https://sanctionssearch.ofac.treas.gov/")
        time.sleep(get_wait_time())

        search_input = driver.find_element(By.ID, "ctl00_MainContent_txtLastName")
        search_input.send_keys(company_name)
        search_input.send_keys(Keys.RETURN)
        time.sleep(get_wait_time())

        soup = BeautifulSoup(driver.page_source, "html.parser")
        rows = soup.find_all("tr", class_="alternatingRowColor")

        results = []
        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 4:
                entity_name = columns[0].text.strip()
                sanctions_type = columns[3].text.strip()
                results.append(f"{entity_name} - {sanctions_type}")

        return results if results else ["No OFAC Sanctions Found"]
    finally:
        driver.quit()

### ==== DATA AGGREGATION ==== ###
def get_company_data(company_name, lawsuits, trademark_decisions, data_breaches,
                     fatf_blacklist, copyrights, privacy_compliance,
                     ofac, fincen, interpol, patents):
    company_data = {
        "Company": company_name,
        "Lawsuits": lawsuits if lawsuits else ["No Data"],
        "Patents": patents if patents else ["No Patents Found"],
        "Trademark Decisions": trademark_decisions if trademark_decisions else ["No Data"],
        "Data Breaches": data_breaches if data_breaches else ["No Data"],
        "FATF Blacklist": fatf_blacklist if fatf_blacklist else ["Not Listed"],
        "Copyrights": copyrights if copyrights else ["No Data"],
        "Privacy Compliance": privacy_compliance if privacy_compliance else ["No Data"],
        "OFAC": ofac if ofac else ["No Sanctions"],
        "FinCEN": fincen if fincen else ["No Data"],
        "Interpol Notices": interpol if interpol else ["No Data"]
    }
    return json.dumps(company_data, indent=4)

### ==== MAIN SCRIPT ==== ###
def main5(company_name):
    print(f"Scraping case law from UK National Archives for {company_name}...")
    total_pages = get_total_pages(company_name)
    case_titles_uk = get_case_titles_uk(company_name, total_pages)

    print(f"Scraping case law from FindLaw for {company_name}...")
    case_titles_findlaw = get_case_titles_findlaw(company_name)
    case_titles = case_titles_uk + case_titles_findlaw

    print(f"Scraping patents for {company_name}...")
    patents = get_all_patents(company_name)

    print(f"Scraping trademark decisions for {company_name}...")
    trademark_decisions = get_trademark_decisions(company_name)

    print(f"Scraping data breaches for {company_name}...")
    data_breaches = get_data_breaches(company_name)

    print(f"Scraping FATF blacklist for {company_name}...")
    fatf_blacklist = get_fatf_blacklist(company_name)

    print(f"Scraping Interpol Red Notices for {company_name}...")
    interpol_notices = scrape_interpol_notices(company_name)

    print(f"Scraping OFAC sanctions for {company_name}...")
    ofac_sanctions = scrape_ofac_sanctions(company_name)

    print(f"Scraping GDPR privacy compliance fines for {company_name}...")
    privacy_compliance = scrape_gdpr_fines(company_name)

    copyrights = []
    fincen = []

    company_json = get_company_data(
        company_name, case_titles, trademark_decisions,
        data_breaches, fatf_blacklist, copyrights, privacy_compliance,  # Added privacy_compliance here
        ofac_sanctions, fincen, interpol_notices, patents
    )

    return company_json
