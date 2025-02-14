from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, IntField, DictField , ListField , FloatField
from bson import json_util

db = MongoEngine()

def init_db(app):
    db.init_app(app)

class Audit(Document):
    company_name = StringField(required=True, max_length=100)
    registration_number = IntField(required=True, unique=True)
    website_url = StringField(required=True, max_length=255)
    linkedin_url = StringField(required=True, max_length=255)

    # Store full API response
    properties = DictField(default={})


    def to_json(self):
        """ ✅ Fix serialization issue using `json_util.dumps` """
        return {
            "id": str(self.id),  # ✅ Convert ObjectId to string
            "company_name": self.company_name,
            "registration_number": self.registration_number,
            "website_url": self.website_url,
            "linkedin_url": self.linkedin_url,
            "properties": self.properties
        }

class Executives(Document):
    company_name = StringField(required=True, unique=True, max_length=100)
    ticker_symbol = StringField(required=True, max_length=50)
    key_executives = ListField(DictField(), default=[])
    esg_scores = DictField(default={})
    business_history = ListField(DictField(), default=[])

    meta = {'collection': 'executives'}

    def to_json(self):
        """ ✅ Fix serialization issue using `json_util.dumps` """
        return {
            "id": str(self.id),  # ✅ Convert ObjectId to string
            "company_name": self.company_name,
            "ticker_symbol": self.ticker_symbol,
            "key_executives": self.key_executives,
            "esg_scores": self.esg_scores,
            "business_history": self.business_history
        }

# New Financial Collection
class Financial(Document):
    source = StringField(required=True, max_length=255)
    revenue = IntField(default=None)
    net_profit_loss = IntField(default=None)
    total_assets = IntField(default=None)
    total_liabilities = IntField(default=None)
    ebitda = IntField(default=None)
    free_cash_flow = IntField(default=None)
    working_capital = IntField(default=None)
    debt_to_equity_ratio = FloatField(default=None)
    current_ratio = FloatField(default=None)
    quick_ratio = FloatField(default=None)
    credit_score = StringField(default="N/A")
    loan_history = StringField(default="N/A")
    outstanding_debt = IntField(default=None)
    payment_history = StringField(default="N/A")
    corporate_tax_filings = StringField(default="N/A")
    vat_gst_records = StringField(default="N/A")
    unpaid_taxes = IntField(default=None)
    government_incentives = StringField(default="N/A")

    def to_json(self):
        """ ✅ Fix serialization issue using `json_util.dumps` """
        return {
            "id": str(self.id),  # ✅ Convert ObjectId to string
            "source": self.source,
            "revenue": self.revenue,
            "net_profit_loss": self.net_profit_loss,
            "total_assets": self.total_assets,
            "total_liabilities": self.total_liabilities,
            "ebitda": self.ebitda,
            "free_cash_flow": self.free_cash_flow,
            "working_capital": self.working_capital,
            "debt_to_equity_ratio": self.debt_to_equity_ratio,
            "current_ratio": self.current_ratio,
            "quick_ratio": self.quick_ratio,
            "credit_score": self.credit_score,
            "loan_history": self.loan_history,
            "outstanding_debt": self.outstanding_debt,
            "payment_history": self.payment_history,
            "corporate_tax_filings": self.corporate_tax_filings,
            "vat_gst_records": self.vat_gst_records,
            "unpaid_taxes": self.unpaid_taxes,
            "government_incentives": self.government_incentives
        }
class LegalRisk(Document):
    company_name = StringField(required=True, max_length=100)
    copyrights = ListField(StringField(), default=[])
    data_breaches = ListField(StringField(), default=[])
    fatf_blacklist = ListField(StringField(), default=[])
    fincen = ListField(StringField(), default=[])
    interpol_notices = ListField(StringField(), default=[])
    lawsuits = ListField(StringField(), default=[])
    ofac = ListField(StringField(), default=[])
    patents = ListField(StringField(), default=[])
    privacy_compliance = ListField(StringField(), default=[])  # Added this line
    trademark_decisions = ListField(StringField(), default=[])  # Added this line

    meta = {'collection': 'legal_risk'}

    def to_json(self):
        return {
            "id": str(self.id),
            "company_name": self.company_name,
            "copyrights": self.copyrights,
            "data_breaches": self.data_breaches,
            "fatf_blacklist": self.fatf_blacklist,
            "fincen": self.fincen,
            "interpol_notices": self.interpol_notices,
            "lawsuits": self.lawsuits,
            "ofac": self.ofac,
            "patents": self.patents,
            "privacy_compliance": self.privacy_compliance,  # Added this line
            "trademark_decisions": self.trademark_decisions  # Added this line
        }
