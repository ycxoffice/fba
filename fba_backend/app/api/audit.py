from flask import Blueprint, request, jsonify
from ..models.audit import Audit
import requests


audit_bp = Blueprint("audit", __name__)

RAPIDAPI_LINKEDIN_HOST = "fresh-linkedin-profile-data.p.rapidapi.com"
RAPIDAPI_COMPANY_HOST = "company-intelligence.p.rapidapi.com"
RAPIDAPI_KEY = "b3e1057148msh3b8f35241e1969fp1a3710jsn0939a32f1193"

@audit_bp.route("", methods=["POST"])
def create_audit():
    try:
        data = request.json
        required_fields = ["company_name", "registration_number"]

        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        website_url = data["website"]
        linkedin_url = data["linkedin"]
        company_data = {}

        # Fetch Company Intelligence data
        try:
            company_response = requests.get(
                f"https://{RAPIDAPI_COMPANY_HOST}/company-info",
                headers={
                    "x-rapidapi-host": RAPIDAPI_COMPANY_HOST,
                    "x-rapidapi-key": RAPIDAPI_KEY
                },
                params={"domain": website_url}
            )
            if company_response.status_code == 200:
                company_data = company_response.json().get("data", {})
        except requests.RequestException as req_err:
            return jsonify({"error": "Error connecting to Company Intelligence API", "details": str(req_err)}), 500


        # Create and save the Audit document
        audit = Audit(
            company_name=data["company_name"],
            registration_number=data["registration_number"],
            website_url=website_url,
            linkedin_url=linkedin_url,
            properties=company_data["properties"],
            info=company_data["info"]
            # Dynamically store all API fields
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



# Get audit by company_name
@audit_bp.route("/<company_name>", methods=["GET"])
def get_audit_by_company_name(company_name):
    try:
        audit = Audit.objects(company_name=company_name).first()
        if not audit:
            return jsonify({"error": "Audit not found"}), 404

        return jsonify({
            "companyName": audit.company_name,
            "data": {
                "properties": audit.properties,
                "info": audit.info
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
