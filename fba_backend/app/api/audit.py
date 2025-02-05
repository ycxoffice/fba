from flask import Blueprint, request, jsonify
from ..models.audit import Audit
import requests


audit_bp = Blueprint("audit", __name__)



audit_bp = Blueprint("audit", __name__)

RAPIDAPI_HOST = "fresh-linkedin-profile-data.p.rapidapi.com"
RAPIDAPI_KEY = "b3e1057148msh3b8f35241e1969fp1a3710jsn0939a32f1193"

@audit_bp.route("", methods=["POST"])
def create_audit():
    try:
        data = request.json
        required_fields = ["company_name", "registration_number", "website_url", "linkedin_url"]

        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        linkedin_url = data["linkedin_url"]
        linkedin_data = {}

        # Fetch LinkedIn data
        try:
            response = requests.get(
                "https://fresh-linkedin-profile-data.p.rapidapi.com/get-account-iq",
                headers={
                    "x-rapidapi-host": RAPIDAPI_HOST,
                    "x-rapidapi-key": RAPIDAPI_KEY
                },
                params={"linkedin_url": linkedin_url}
            )
            if response.status_code == 200:
                linkedin_data = response.json().get("data", {})
            else:
                return jsonify({"error": "Failed to fetch LinkedIn data"}), response.status_code

        except requests.RequestException as req_err:
            return jsonify({"error": "Error connecting to LinkedIn API", "details": str(req_err)}), 500

        # Create and save the Audit document
        audit = Audit(
            company_name=data["company_name"],
            registration_number=data["registration_number"],
            website_url=data["website_url"],
            linkedin_url=linkedin_url,
            competitors=linkedin_data.get("Competitive landscape", {}).get("competitors", []),
            competitive_description=linkedin_data.get("Competitive landscape", {}).get("description"),
            decision_makers=linkedin_data.get("Decision makers", []),
            recent_Q=linkedin_data.get("Estimated revenue", {}).get("recent_Q", {}),
            recent_year=linkedin_data.get("Estimated revenue", {}).get("recent_year", {}),
            headcount_insights=linkedin_data.get("Headcount insights"),
            how_company_makes_money=linkedin_data.get("How the company makes money"),
            related_news=linkedin_data.get("Related news", [])
        )

        audit.save()

        return jsonify({"message": "Audit saved", "audit": audit.to_json()}), 201

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500



@audit_bp.route("/", methods=["GET"])
def get_audits():
    try:
        audits = Audit.objects()
        return jsonify([audit.to_json() for audit in audits]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
