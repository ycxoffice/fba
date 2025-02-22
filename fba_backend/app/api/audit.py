from flask import Blueprint, request, jsonify
from ..models.audit import Audit , Executives , LegalRisk , Financial , Competitors
import requests
from app.scrappers.section3 import get_ticker_symbol , fetch_business_history , scrape_esg_scores , scrape_key_executives
from app.scrappers.section2 import main
from app.scrappers.section5 import main5
from app.scrappers.section4 import main4
import threading
import json


audit_bp = Blueprint("audit", __name__)

RAPIDAPI_LINKEDIN_HOST = "linkedin-data-api.p.rapidapi.com"
RAPIDAPI_KEY = "b3e1057148msh3b8f35241e1969fp1a3710jsn0939a32f1193"


@audit_bp.route("", methods=["POST"])
def create_audit():
    try:
        data = request.json
        required_fields = ["company_name", "website"]

        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        website_url = data["website"]

        # Fetch Company Intelligence data
        company_data = {}
        try:
            company_response = requests.get(
                "https://linkedin-data-api.p.rapidapi.com/get-company-by-domain",
                headers={
                    "x-rapidapi-host": RAPIDAPI_LINKEDIN_HOST,
                    "x-rapidapi-key": RAPIDAPI_KEY
                },
                params={"domain": website_url}
            )
            if company_response.status_code == 200:
                response_json = company_response.json()
                company_data = response_json.get("data", {})  # ✅ Extract only "data"
        except requests.RequestException as req_err:
            return jsonify({"error": "Error connecting to LinkedIn Data API", "details": str(req_err)}), 500

        # Save the Audit document immediately
        audit = Audit(
            company_name=data["company_name"],
            website_url=website_url,
            properties=company_data  # ✅ Store full API response in properties
        )
        audit.save()

        company_name = data["company_name"].strip()

        # Start background processing in separate threads
        threading.Thread(target=process_executive_data, args=(company_name,), daemon=True).start()
        threading.Thread(target=process_financial_data, args=(company_name,), daemon=True).start()
        threading.Thread(target=scrape_company_data, args=(company_name,), daemon=True).start()
        threading.Thread(target=process_companies, args=(company_name,), daemon=True).start()



        return jsonify({"message": "Audit saved and background processing started", "audit": audit.to_json()}), 201

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


def process_executive_data(company_name):
    """Background function to process executive data after Audit is saved."""
    try:
        ticker = get_ticker_symbol(company_name)

        if not ticker:
            return

        executives = scrape_key_executives(ticker)
        esg_scores = scrape_esg_scores(ticker)
        business_history = fetch_business_history(company_name)

        # Check if the company already exists in MongoDB
        existing_record = Executives.objects(company_name=company_name).first()
        if existing_record:
            return  # If record exists, do nothing

        # Save the data to the "Executives" collection
        executive_record = Executives(
            company_name=company_name,
            ticker_symbol=ticker,
            key_executives=executives,
            esg_scores=esg_scores,
            business_history=business_history
        )
        executive_record.save()

    except Exception as e:
        print(f"Error in executive data processing for {company_name}: {str(e)}")  # Log the error


def process_financial_data(company_name):
    """Background function to fetch and store financial data."""
    try:
        result = main(company_name)

        if not result:
            print(f"No financial data found for {company_name}")
            return

        financial_data = result[0]  # Assuming result is a list, take the first element

        financial = Financial(
            company_name=company_name,
            source=financial_data.get("Source"),
            revenue=financial_data.get("Revenue"),
            net_profit_loss=financial_data.get("Net Profit/Loss"),
            total_assets=financial_data.get("Total Assets"),
            total_liabilities=financial_data.get("Total Liabilities"),
            ebitda=financial_data.get("EBITDA"),
            free_cash_flow=financial_data.get("Free Cash Flow"),
            working_capital=financial_data.get("Working Capital"),
            debt_to_equity_ratio=financial_data.get("Debt-to-Equity Ratio"),
            current_ratio=financial_data.get("Current Ratio"),
            quick_ratio=financial_data.get("Quick Ratio"),
            credit_score=financial_data.get("Credit Score", "N/A"),
            loan_history=financial_data.get("Loan History", "N/A"),
            outstanding_debt=financial_data.get("Outstanding Debt"),
            payment_history=financial_data.get("Payment History", "N/A"),
            corporate_tax_filings=financial_data.get("Corporate Tax Filings", "N/A"),
            vat_gst_records=financial_data.get("VAT/GST Records", "N/A"),
            unpaid_taxes=financial_data.get("Unpaid Taxes"),
            government_incentives=financial_data.get("Government Incentives", "N/A")
        )

        # Save the financial data to the database
        financial.save()
        print(f"Financial data for {company_name} saved successfully.")

    except Exception as e:
        print(f"Error in financial data processing for {company_name}: {str(e)}")  # Log the error

@audit_bp.route("/", methods=["GET"])
def get_companies():
    try:
        search_query = request.args.get("search", "")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        # Construct the query filter
        query = {"company_name": {"$regex": search_query, "$options": "i"}} if search_query else {}

        # Use MongoEngine's `objects` to query the Audit model
        companies = Audit.objects(__raw__=query).only("company_name").skip((page - 1) * limit).limit(limit)

        # Get total count of documents
        total = Audit.objects(__raw__=query).count()

        return jsonify({
            "companies": [company.to_json() for company in companies],  # Ensure proper JSON serialization
            "total": total,
            "page": page,
            "limit": limit
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500








def scrape_company_data(company_name):
    import json
    try:
        # Parse the JSON request body to get the company name
        # data = request.get_json()
        company_name = company_name.strip()

        if not company_name:
            return

        # Call the main function to scrape company data
        result_json = main5(company_name)
        result_data = json.loads(result_json)

        legal_risk = LegalRisk(
        company_name=company_name,
        copyrights=result_data.get("Copyrights", []),
        data_breaches=result_data.get("Data Breaches", []),
        fatf_blacklist=result_data.get("FATF Blacklist", []),
        fincen=result_data.get("FinCEN", []),
        interpol_notices=result_data.get("Interpol Notices", []),
        lawsuits=result_data.get("Lawsuits", []),
        ofac=result_data.get("OFAC", []),
        patents=result_data.get("Patents", []),
        privacy_compliance=result_data.get("Privacy Compliance", []),
        trademark_decisions=result_data.get("Trademark Decisions", [])
    )
        # Save to MongoDB
        legal_risk.save()

        print(f"Saved Successfully {company_name}")
    except Exception as e:
        print(f"Error in risk data processing for {company_name}: {str(e)}")  # Log the error

# @audit_bp.route('/compare', methods=['GET'])
def process_companies(company_name):
    try:
        # data = request.json
        # company = data.get("company_name", "")
        company = company_name.strip()

        if not company:
            print(f"company not provided")
            return

        # Call main4 to obtain the public company data (as a JSON string)
        result_json = main4(company)
        print(result_json)
        # Convert the JSON string to a dictionary
        result_data = json.loads(result_json)

        # Helper function to handle null or empty values
        def handle_null(value):
            if value is None or value == "":
                return "NA"
            return value

        # Process the "Competitors" array directly: update each dictionary
        competitors_array = result_data.get("Competitors", [])
        for comp in competitors_array:
            for key in comp:
                comp[key] = handle_null(comp.get(key))

        # Build the Competitors document using data from result_data,
        # replacing any missing values with "NA"
        competitor_doc = Competitors(
            company_name=handle_null(result_data.get("company_name")),
            stock_name=handle_null(result_data.get("stock name")),
            stock_value=handle_null(result_data.get("stock value")),
            market_cap=handle_null(result_data.get("market cap")),
            avg_volume=handle_null(result_data.get("avg volume")),
            pe_ratio=handle_null(result_data.get("P/E ratio")),
            revenue=handle_null(result_data.get("revenue")),
            revenue_growth_rate=handle_null(result_data.get("revenue growth rate")),
            operating_expense=handle_null(result_data.get("operating expense")),
            operating_expense_rate=handle_null(result_data.get("operating expense rate")),
            net_income=handle_null(result_data.get("net income")),
            net_income_rate=handle_null(result_data.get("net income rate")),
            net_profit_margin=handle_null(result_data.get("net profit margin")),
            net_profit_margin_rate=handle_null(result_data.get("net profit margin rate")),
            sector=handle_null(result_data.get("sector")),
            industry=handle_null(result_data.get("industry")),
            market_share=handle_null(result_data.get("market share")),
            competitors=competitors_array
        )
        competitor_doc.save()
        print(f"Competitors Saved Successfully")
        return
    except Exception as e:
        print(f"Error caused during Competitors process!")
        return


@audit_bp.route('/get_financials', methods=['GET'])
def get_financials():
    """Endpoint to fetch financial data for a given company."""
    company_name = request.args.get('company_name')

    if not company_name:
        return jsonify({"error": "Missing required parameter: company_name"}), 400

    try:
        results = main5(company_name)
        return jsonify(results),200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@audit_bp.route("/<company_name>", methods=["GET"])
def get_audit_by_company_name(company_name):
    try:
        # Fetch audit data from different collections
        audit = Audit.objects(company_name=company_name).first()
        audit_executives = Executives.objects(company_name=company_name).first()
        financial = Financial.objects(company_name=company_name).first()
        legal_risk = LegalRisk.objects(company_name=company_name).first()
        competitors = Competitors.objects(company_name=company_name).first()

        # If all collections return empty, return 404
        if not any([audit, audit_executives, financial, legal_risk , competitors]):
            return jsonify({"error": "No audit data found for the given company"}), 404

        # Manually remove unnecessary fields from 'properties' inside 'audit'
        if audit and "properties" in audit.to_mongo():
            properties = audit.properties
            # Remove unnecessary nested fields inside properties, but keep description
            properties.pop("backgroundCoverImages", None)
            properties.pop("callToAction", None)

            # Reorder properties to make description the first field if it exists
            description = properties.get("description")
            if description:
                # Create a new dictionary with description first
                properties = {"description": description, **{key: value for key, value in properties.items() if key != "description"}}

        # Helper function to convert MongoEngine documents to JSON without _id
        def to_json(doc):
            if doc:
                doc_dict = doc.to_mongo().to_dict()
                doc_dict.pop("_id", None)  # Remove the _id field
                # Ensure 'properties' has description as first attribute
                if "properties" in doc_dict:
                    properties = doc_dict["properties"]
                    # Reorder properties if description is present
                    description = properties.get("description")
                    if description:
                        doc_dict["properties"] = {"description": description, **{key: value for key, value in properties.items() if key != "description"}}
                return doc_dict
            return None

        # Construct response structure
        response_data = {
            "companyName": company_name,
            "data": {
                "audit": to_json(audit),  # Cleaned audit data
                "executives": to_json(audit_executives),
                "financial": to_json(financial),
                "legalRisk": to_json(legal_risk),  # Fixed typo here: "legal Risk" => "legalRisk"
                "competitors": to_json(competitors)
            }
        }

        return jsonify(response_data), 200  # Return proper JSON response

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

