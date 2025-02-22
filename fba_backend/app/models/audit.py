from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, IntField, DictField , ListField , FloatField
from bson import json_util

db = MongoEngine()

def init_db(app):
    db.init_app(app)

class Audit(Document):
    company_name = StringField(required=True, max_length=100, unique=True)
    website_url = StringField(required=True, max_length=255)

    # Store full API response
    properties = DictField(default={})


    def to_json(self):
        """ ✅ Fix serialization issue using `json_util.dumps` """
        return {
            "id": str(self.id),  # ✅ Convert ObjectId to string
            "properties": self.properties,
            "company_name": self.company_name,
            "website_url": self.website_url,

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
    company_name = StringField(required=True , unique=True)
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
            "company_name" : self.company_name,
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
    company_name = StringField(required=True, max_length=100 , unique=True)
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

# New Competitors Collection
class Competitors(Document):
    company_name = StringField(required=True, max_length=100, unique=True)
    stock_name = StringField()
    stock_value = StringField()
    market_cap = StringField()
    avg_volume = StringField()
    pe_ratio = StringField()  # Represents "P/E ratio"
    revenue = StringField()
    revenue_growth_rate = StringField()
    operating_expense = StringField()
    operating_expense_rate = StringField()
    net_income = StringField()
    net_income_rate = StringField()
    net_profit_margin = StringField()
    net_profit_margin_rate = StringField()
    sector = StringField()
    industry = StringField()
    market_share = StringField()
    competitors = ListField(DictField())  # List of competitor details

    meta = {'collection': 'competitors'}

    def to_json(self):
        return {
            "id": str(self.id),
            "company_name": self.company_name,
            "stock name": self.stock_name,
            "stock value": self.stock_value,
            "market cap": self.market_cap,
            "avg volume": self.avg_volume,
            "P/E ratio": self.pe_ratio,
            "revenue": self.revenue,
            "revenue growth rate": self.revenue_growth_rate,
            "operating expense": self.operating_expense,
            "operating expense rate": self.operating_expense_rate,
            "net income": self.net_income,
            "net income rate": self.net_income_rate,
            "net profit margin": self.net_profit_margin,
            "net profit margin rate": self.net_profit_margin_rate,
            "sector": self.sector,
            "industry": self.industry,
            "market share": self.market_share,
            "Competitors": self.competitors
        }
