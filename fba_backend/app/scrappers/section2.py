import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
from urllib.request import urlopen
import certifi

# API keys
SCRAPERAPI_KEY = "0a8d142dcdf31caf525b0024e3035526"
RAPIDAPI_KEY = "23585dbb71mshb1594d79dd32fc3p1de79ajsn28f0953b4a6c"
FMP_API_KEY = "KRsF6VEc3WR9geGvXfjuZ0rG9x4VToR5"
ALPHA_VANTAGE_API_KEY = "ZE0ZA1KEYCS8N5B3"

# CSV save location
SAVE_PATH = ""  # Set a path for saving the CSV file

# Attributes to extract
FINANCIAL_ATTRIBUTES = [
    "Revenue", "EBITDA", "Net Profit/Loss", "Gross Margin", "Operating Margin",
    "Total Assets", "Total Liabilities", "Free Cash Flow", "Working Capital",
    "Quick Ratio", "Current Ratio", "Debt-to-Equity Ratio", "Credit Score",
    "Loan History", "Outstanding Debt", "Payment History", "Corporate Tax Filings",
    "VAT/GST Records", "Unpaid Taxes", "Government Incentives"
]


def get_jsonparsed_data(url):
    response = urlopen(url, cafile=certifi.where())
    data = response.read().decode("utf-8")
    return json.loads(data)


def get_company_symbol(company_name):
    """Search for the company symbol using the company name."""
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "SYMBOL_SEARCH",
        "keywords": company_name,
        "apikey": ALPHA_VANTAGE_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        print(f"Symbol search response for {company_name}: {data}")  # Debugging output

        if "bestMatches" in data:
            matches = data["bestMatches"]
            if matches:
                symbol = matches[0]["1. symbol"]
                print(f"Found symbol {symbol} for company {company_name}")
                return symbol
    except Exception as e:
        print(f"Error fetching company symbol: {e}")

    # Fallback for Google
    if company_name.lower() == "google":
        print("Using fallback symbol for Google: GOOGL")
        return "GOOGL"

    return None


def fetch_fmp_data(endpoint, company_symbol):
    url = f"https://financialmodelingprep.com/api/v3/{endpoint}/{company_symbol}?period=annual&limit=1&apikey={FMP_API_KEY}"
    try:
        data = get_jsonparsed_data(url)
        print(f'Data from {endpoint} for {company_symbol}:', data)  # Debugging output
        return data
    except Exception as e:
        print(f"Error fetching data from {endpoint}: {e}")
    return []


def calculate_financial_attributes(data):
    """Calculate financial attributes from the API data safely."""
    attributes = {}

    if not data:
        return attributes  # Return empty if no data is available

    report = data[0]  # Use the latest report

    # Helper function to safely extract numerical values
    def safe_get(key, default=0):
        value = report.get(key, default)
        return value if isinstance(value, (int, float)) else default

    # Map API fields to financial attributes
    attributes["Revenue"] = safe_get("revenuefromcontractwithcustomerexcludingassessedtax")
    attributes["Net Profit/Loss"] = safe_get("netincomeloss")
    attributes["Total Assets"] = safe_get("assets")
    attributes["Total Liabilities"] = safe_get("liabilities")

    attributes["EBITDA"] = safe_get("operatingincomeloss") + safe_get("depreciationdepletionandamortization")
    attributes["Free Cash Flow"] = safe_get("netcashprovidedbyusedinoperatingactivities") - safe_get("paymentstoacquirepropertyplantandequipment")
    attributes["Working Capital"] = safe_get("assetscurrent") - safe_get("liabilitiescurrent")

    # Calculate derived metrics safely
    revenue = attributes["Revenue"]
    if revenue:
        attributes["Gross Margin"] = (revenue - safe_get("costofrevenue")) / revenue
        attributes["Operating Margin"] = attributes["EBITDA"] / revenue if attributes["EBITDA"] else 0

    total_liabilities = attributes["Total Liabilities"]
    total_assets = attributes["Total Assets"]
    if total_liabilities and total_assets:
        attributes["Debt-to-Equity Ratio"] = total_liabilities / (total_assets - total_liabilities) if total_assets - total_liabilities else 0

    current_assets = safe_get("assetscurrent")
    current_liabilities = safe_get("liabilitiescurrent")
    if current_assets and current_liabilities:
        attributes["Current Ratio"] = current_assets / current_liabilities if current_liabilities else 0
        attributes["Quick Ratio"] = (current_assets - safe_get("inventory")) / current_liabilities if current_liabilities else 0

    # Placeholder for attributes not directly calculable
    attributes["Credit Score"] = "N/A"
    attributes["Loan History"] = "N/A"
    attributes["Outstanding Debt"] = safe_get("longtermdebt")
    attributes["Payment History"] = "N/A"
    attributes["Corporate Tax Filings"] = "N/A"
    attributes["VAT/GST Records"] = "N/A"
    attributes["Unpaid Taxes"] = safe_get("unrecognizedtaxbenefits")
    attributes["Government Incentives"] = "N/A"

    return attributes


def main(company_name):
    """Main function to extract financial and employee data and return as a dictionary."""
    results = []
    company_symbol = get_company_symbol(company_name)

    if company_symbol:
        # Fetch data from Financial Modeling Prep API for different endpoints
        endpoint = "financial-statement-full-as-reported"
        fmp_data = fetch_fmp_data(endpoint, company_symbol)

        if fmp_data:
            financial_attributes = calculate_financial_attributes(fmp_data)
            results.append({"Source": f"Financial Modeling Prep - {endpoint}", **financial_attributes})
        else:
            print(f"No financial data available for {company_name} ({company_symbol})")
    else:
        print(f"No valid symbol found for {company_name}, skipping.")

    if results:
        return results  # Return the data as a Python object (not a JSON string)
    else:
        return {"message": "No relevant data found."}  # Return a message if no data found


