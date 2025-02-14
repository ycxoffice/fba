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
    """Calculate financial attributes from the API data."""
    attributes = {}
    if data:
        report = data[0]  # Assuming we're interested in the most recent report

        # Map API fields to financial attributes
        attributes["Revenue"] = report.get("revenuefromcontractwithcustomerexcludingassessedtax")
        attributes["Net Profit/Loss"] = report.get("netincomeloss")
        attributes["Total Assets"] = report.get("assets")
        attributes["Total Liabilities"] = report.get("liabilities")
        attributes["EBITDA"] = report.get("operatingincomeloss") + report.get("depreciationdepletionandamortization", 0)
        attributes["Free Cash Flow"] = report.get("netcashprovidedbyusedinoperatingactivities") - report.get(
            "paymentstoacquirepropertyplantandequipment", 0)
        attributes["Working Capital"] = report.get("assetscurrent") - report.get("liabilitiescurrent")

        # Calculate derived metrics
        if attributes["Revenue"]:
            attributes["Gross Margin"] = (attributes["Revenue"] - report.get("costofrevenue", 0)) / attributes[
                "Revenue"]
            attributes["Operating Margin"] = attributes["EBITDA"] / attributes["Revenue"]

        if attributes["Total Liabilities"] and attributes["Total Assets"]:
            attributes["Debt-to-Equity Ratio"] = attributes["Total Liabilities"] / (
                        attributes["Total Assets"] - attributes["Total Liabilities"])

        if report.get("assetscurrent") and report.get("liabilitiescurrent"):
            attributes["Current Ratio"] = report.get("assetscurrent") / report.get("liabilitiescurrent")
            attributes["Quick Ratio"] = (report.get("assetscurrent") - report.get("inventory", 0)) / report.get(
                "liabilitiescurrent")

        # Placeholder for attributes not directly calculable from the data
        attributes["Credit Score"] = "N/A"
        attributes["Loan History"] = "N/A"
        attributes["Outstanding Debt"] = report.get("longtermdebt")
        attributes["Payment History"] = "N/A"
        attributes["Corporate Tax Filings"] = "N/A"
        attributes["VAT/GST Records"] = "N/A"
        attributes["Unpaid Taxes"] = report.get("unrecognizedtaxbenefits")
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


