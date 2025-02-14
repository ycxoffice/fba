import requests
import pandas as pd
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
import re
import os
import warnings

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

import json

# Suppress XML warning
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# User inputs API key for ScraperAPI
SCRAPER_API_KEY = "6de50d316b80483b7c00a9db6f3cade0"  # Replace with your ScraperAPI key

# CSV_FILE = "company_data.csv"  # File to store combined data

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
    options = webdriver.ChromeOptions()
    options.headless = True
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920x1080')

    driver = webdriver.Chrome(options=options)
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

        time.sleep(5)  # Allow pages to load

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

        driver.switch_to.window(driver.window_handles[0])  # Return to main tab
        page_number += 10

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

            # Convert to uppercase for case-insensitive comparison
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
            if len(columns) >= 3:  # Ensure at least 3 columns exist
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

    # Combine and remove duplicates
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
            if len(columns) >= 4:  # Ensure at least 4 columns exist
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
    hibp_url = "https://haveibeenpwned.com/api/v3/breaches"
    hibp_response = requests.get(hibp_url)

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

        # Find the FATF Blacklist section
        blacklist_section = soup.find("h3", id="Current_FATF_blacklist")

        if blacklist_section:
            # Find the first <ol> after this section
            country_list = blacklist_section.find_next("ol")

            if country_list:
                items = country_list.find_all("a")  # Get all country names in <a> tags

                for item in items:
                    country_name = item.get_text(strip=True)

                    # Match if part of the company_name appears in the country_name
                    if re.search(rf"\b{re.escape(company_name)}\b", country_name, re.IGNORECASE):
                        fatf_blacklist.append(country_name)

        return fatf_blacklist if fatf_blacklist else ["Not Listed on Blacklist"]
    else:
        print(f"Failed to fetch FATF Blacklist for {company_name}. Status Code: {response.status_code}")
        return ["Not Listed"]

### ==== INTERPOL RED NOTICE ==== ###
def scrape_interpol_notices(family_name):
    """Scrape Interpol Red Notices by searching for a family name (Headless Mode)."""

    # Set Chrome options to run in headless mode (background)
    options = Options()
    options.headless = True  # Run Chrome in headless mode (no GUI)
    options.add_argument("--disable-gpu")  # Disables GPU for better stability
    options.add_argument("--no-sandbox")  # Helps avoid some permission issues
    options.add_argument("--disable-dev-shm-usage")  # Prevents memory issues

    # Initialize WebDriver with options
    driver = webdriver.Chrome(options=options)

    # Open the Interpol Red Notices search page
    url = "https://www.interpol.int/en/How-we-work/Notices/Red-Notices/View-Red-Notices"
    driver.get(url)

    # Allow page to load
    time.sleep(5)

    # Locate the "Family Name" search input and enter the user’s input
    family_name_input = driver.find_element(By.ID, "name")
    family_name_input.send_keys(family_name)  # Type the family name

    # Press Enter to submit search
    family_name_input.send_keys(Keys.RETURN)

    # Wait for search results to load
    time.sleep(5)

    # Parse the updated page with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Find all Red Notice items
    notices = soup.find_all("div", class_="redNoticeItem__labelText")

    # Extract results
    results = []
    for notice in notices:
        name_tag = notice.find("a", class_="redNoticeItem__labelLink")
        if name_tag:
            name = name_tag.get_text(separator=" ", strip=True)  # Extract full name
            profile_url = name_tag["data-singleurl"]  # Extract profile link

            # Only append valid results
            if name and profile_url:
                results.append(f"{name} ({profile_url})")

    # Close Selenium WebDriver
    driver.quit()

    # Ensure valid output
    return results if results else ["No Interpol Notices Found"]

### ==== GDPR PRIVACY COMPLIANCE SCRAPER ==== ###
def scrape_gdpr_fines(search_term):
    """Scrape GDPR fines from Enforcement Tracker based on user input (Runs in Background)."""

    # Set Chrome options for **headless execution**
    options = Options()
    options.add_argument("--headless=new")  # Runs in background (new headless mode for better support)
    options.add_argument("--window-size=1920,1080")  # Ensures page loads fully
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--log-level=3")  # Suppress unnecessary logs
    options.add_argument("--silent")  # Suppresses console output

    # Initialize WebDriver (Runs in background)
    driver = webdriver.Chrome(options=options)

    # Open the GDPR Enforcement Tracker page
    url = "https://www.enforcementtracker.com/"
    driver.get(url)

    # Allow page to load fully
    time.sleep(5)

    # Locate all filter input fields
    filter_inputs = driver.find_elements(By.CSS_SELECTOR, "input[placeholder='Filter Column']")

    if len(filter_inputs) < 4:
        print("Could not locate the correct filter input field.")
        driver.quit()
        return ["No GDPR Fines Found"]

    # Scroll the element into view (even in headless mode)
    driver.execute_script("arguments[0].scrollIntoView();", filter_inputs[3])
    time.sleep(2)  # Allow time for it to be interactable

    # Input the search term into the 4th filter input field
    filter_inputs[3].send_keys(search_term)
    filter_inputs[3].send_keys(Keys.RETURN)

    # Wait for search results to load
    time.sleep(5)

    # Parse the updated page with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Find all table rows
    rows = soup.find_all("tr", class_=["odd", "even"])  # Rows alternate classes "odd" and "even"

    # Extract fine details
    results = []
    for row in rows:
        columns = row.find_all("td")
        if len(columns) >= 10:
            fine_amount = columns[5].text.strip()  # 6th <td> (Fine amount with € symbol)
            violation = columns[6].text.strip()  # 7th <td> (Violation description)
            controller = columns[9].text.strip()  # 10th <td> (Data controller name)
            results.append(f"{fine_amount} - {violation} - {controller}")

    # Close Selenium WebDriver
    driver.quit()

    return results if results else ["No GDPR Fines Found"]

def scrape_ofac_sanctions(company_name):
    """Scrape OFAC sanctions list for the given company name."""

    # Set Chrome options for headless execution
    options = Options()
    options.headless = True
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Initialize WebDriver
    driver = webdriver.Chrome(options=options)

    # Open OFAC Sanctions Search page
    url = "https://sanctionssearch.ofac.treas.gov/"
    driver.get(url)

    # Allow page to load
    time.sleep(5)

    # Locate search input and enter company name
    search_input = driver.find_element(By.ID, "ctl00_MainContent_txtLastName")
    search_input.clear()
    search_input.send_keys(company_name)
    search_input.send_keys(Keys.RETURN)

    # Wait for results to load
    time.sleep(5)

    # Parse page source with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Find results table
    rows = soup.find_all("tr", class_="alternatingRowColor")  # Target table rows

    results = []
    for row in rows:
        columns = row.find_all("td")
        if len(columns) >= 4:
            entity_name = columns[0].text.strip()  # 1st column
            sanctions_type = columns[3].text.strip()  # 4th column
            results.append(f"{entity_name} - {sanctions_type}")

    # Close the WebDriver
    driver.quit()

    return results if results else ["No OFAC Sanctions Found"]

### ==== GATHER DATA IN JSON FORMAT ==== ###
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
    privacy_compliance = scrape_gdpr_fines(company_name)  # Integrated GDPR scraper

    copyrights = []
    fincen = []

    company_json = get_company_data(
        company_name, case_titles, trademark_decisions,
        data_breaches, fatf_blacklist, copyrights, privacy_compliance,  # Added privacy_compliance here
        ofac_sanctions, fincen, interpol_notices, patents
    )

    return company_json

