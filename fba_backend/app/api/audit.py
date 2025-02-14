from flask import Blueprint, request, jsonify
from ..models.audit import Audit , Executives , LegalRisk , Financial
import requests
from app.scrappers.section3 import get_ticker_symbol , fetch_business_history , scrape_esg_scores , scrape_key_executives



audit_bp = Blueprint("audit", __name__)

RAPIDAPI_LINKEDIN_HOST = "linkedin-data-api.p.rapidapi.com"
RAPIDAPI_KEY = "5de868c170mshc545ef5304b9b72p13d8edjsn418d6a210780"

@audit_bp.route("", methods=["POST"])
def create_audit():
    try:
        data = request.json
        required_fields = ["company_name", "registration_number", "website"]

        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        website_url = data["website"]
        linkedin_url = data.get("linkedin", "")

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


        # Create and save the Audit document
        audit = Audit(
            company_name=data["company_name"],
            registration_number=data["registration_number"],
            website_url=website_url,
            linkedin_url=linkedin_url,
            properties=company_data  # ✅ Store full API response in properties
        )

        audit.save()

        return jsonify({"message": "Audit saved", "audit": audit.to_json()}), 201

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


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

@audit_bp.route("/company-info", methods=["POST"])
def get_company_info():
    """API endpoint to fetch company info and save it in MongoDB."""
    try:
        data = request.get_json()
        if not data or "company_name" not in data:
            return jsonify({"error": "Missing 'company_name' in request body"}), 400

        company_name = data["company_name"].strip()
        ticker = get_ticker_symbol(company_name)

        if not ticker:
            return jsonify({"error": "Could not retrieve ticker symbol"}), 404

        executives = scrape_key_executives(ticker)
        esg_scores = scrape_esg_scores(ticker)
        business_history = fetch_business_history(company_name)

        # 🔍 Check if the company already exists in MongoDB
        existing_record = Executives.objects(company_name=company_name).first()
        if existing_record:
            return jsonify({"message": "Company info already exists", "data": existing_record.to_json()}), 200

        # 📝 Save the data to the "Executives" collection
        executive_record = Executives(
            company_name=company_name,
            ticker_symbol=ticker,
            key_executives=executives,
            esg_scores=esg_scores,
            business_history=business_history
        )
        executive_record.save()

        return jsonify({"message": "Company info saved successfully", "data": executive_record.to_json()}), 201

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")  # Log error for debugging
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

from app.scrappers.section2 import main
from app.scrappers.section5 import main5



@audit_bp.route('/financial-data', methods=['POST'])
def get_financial_data():
    try:
        # Parse the JSON request body to get company name
        data = request.get_json()
        company_name = data.get('company_name', None)

        if not company_name:
            return jsonify({"error": "company_name is required"}), 400

        # Call the main function to get the financial data
        result = main(company_name)

        # Check if the result contains valid financial data
        if not result:
            return jsonify({"error": "No financial data found for the given company"}), 404

        # Assuming 'result' contains the financial data in a format that matches the Financial model
        financial_data = result[0]  # Since `result` is a list, get the first element (modify based on your structure)

        # Create a new Financial document from the result and save it
        financial = Financial(
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

        # Return the result as JSON using jsonify, Flask will automatically handle the conversion
        return jsonify(financial.to_json()), 200

    except Exception as e:
        # Handle any exceptions that occur during the request processing
        return jsonify({"error": str(e)}), 500


@audit_bp.route('/risk', methods=['POST'])
def scrape_company_data():
    import json
    try:
        # Parse the JSON request body to get the company name
        data = request.get_json()
        company_name = data.get('company_name')

        if not company_name:
            return jsonify({"error": "company_name is required"}), 400

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

        return jsonify({"message": "Data saved successfully", "risk": legal_risk.to_json()}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get audit by company_name
@audit_bp.route("/<company_name>", methods=["GET"])
def get_audit_by_company_name(company_name):
    try:
        audit = Audit.objects(company_name=company_name).first()
        print(f"{audit}")
        if not audit:
            return jsonify({"error": "Audit not found"}), 404

        return jsonify({
            "companyName": audit.company_name,
            "data": {
                "properties": audit.properties
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
