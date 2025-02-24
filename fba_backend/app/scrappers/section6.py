import re
import os
import requests
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv



load_dotenv()
# API KEY--------------------------------------------------------
SERP_API_KEY = os.getenv("SERP_API_KEY")
RAPID_API_KEY = os.getenv("RAPID_API_KEY") 

if not SERP_API_KEY:
    raise RuntimeError("Missing SERP_API_KEY in environment variables.")

if not RAPID_API_KEY:
    raise RuntimeError("Missing RAPID_API_KEY in environment variables.")

# Fetching results from SERP API-------------------------------------------------------
def fetch_search_results(queries):
    """Fetch search results from SERP API for a list of queries."""
    results = []
    for query in queries:
        try:
            response = requests.get("https://serpapi.com/search", params={"q": query, "api_key": SERP_API_KEY})
            results.append(response.json())
        except requests.RequestException as e:
            print(f"Failed to fetch data for query: {query}", str(e))
            results.append(None)
    return results

# Fetch job openings using RapidAPI (Glassdoor Data API) --------------------------------
def fetch_job_data_from_rapidapi(company_name):
    """Fetch job-related data from RapidAPI using multiple sources."""
    job_data = {
        "job_count": "Not Found",
        "diversity_and_inclusion_rating": "Not Found",
        "rating": "Not Found"
    }

    url = "https://real-time-glassdoor-data.p.rapidapi.com/company-search"
    
    headers = {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": "real-time-glassdoor-data.p.rapidapi.com"
    }
    
    params = {"query": company_name, "limit": "1"}  # Search for the most relevant company
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant job-related data
        if "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
            company_info = data["data"][0]
            job_data["job_count"] = company_info.get("job_count", "Not Found")
            job_data["diversity_and_inclusion_rating"] = company_info.get("diversity_and_inclusion_rating", "Not Found")
            job_data["rating"] = company_info.get("rating", "Not Found")
    
    except requests.RequestException as e:
        print(f"Failed to fetch job openings from RapidAPI for {company_name}: {str(e)}")
    
    return job_data

# Fetch employee data from LinkedIn Data API --------------------------------
def fetch_linkedin_data(company_name):
    """Fetch total employees and previous employee count from LinkedIn API."""
    url = "https://linkedin-data-scraper.p.rapidapi.com/company_insights"
    querystring = {"link": f"https://www.linkedin.com/company/{company_name.lower()}"}
    headers = {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": "linkedin-data-scraper.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json().get("data", {})
        headcount_growth = data.get("headcountInsights", {}).get("headcountGrowth", [])
        previous_employee_count = headcount_growth[10].get("employeeCount", "Not Found") if len(headcount_growth) > 24 else "Not Found"
        total_employees = data.get("headcountInsights", {}).get("totalEmployees", "Not Found")
        
        # Calculate employee growth rate
        if isinstance(previous_employee_count, int) and isinstance(total_employees, int) and previous_employee_count > 0:
            employee_growth_rate = ((total_employees - previous_employee_count) / previous_employee_count) * 100
            turnover_rate = (1 / (1 + (employee_growth_rate / 100))) * 100
        else:
            employee_growth_rate = "Not Calculable"
            turnover_rate = "Not Calculable"
        
        return {
            "totalEmployees": total_employees,
            "previousEmployeeCount": previous_employee_count,
            "medianTenureYears": data.get("headcountInsights", {}).get("medianTenureYears", "Not Found"),
            "employeeGrowthRate": employee_growth_rate,
            "turnoverRate": turnover_rate
        }
    except requests.RequestException as e:
        print(f"Failed to fetch LinkedIn data for {company_name}: {str(e)}")
        return {"totalEmployees": "Not Found", "previousEmployeeCount": "Not Found", "medianTenureYears": "Not Found", "employeeGrowthRate": "Not Calculable", "turnoverRate": "Not Calculable"}

