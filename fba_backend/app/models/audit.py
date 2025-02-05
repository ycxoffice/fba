from flask_mongoengine import MongoEngine
from mongoengine import (
    Document, StringField, IntField, ListField, DictField, FloatField
)

db = MongoEngine()

def init_db(app):
    db.init_app(app)



class Audit(Document):
    company_name = StringField(required=True, max_length=100)
    registration_number = IntField(required=True, unique=True)
    website_url = StringField(required=True, max_length=255)  # Required
    linkedin_url = StringField(required=True, max_length=255)  # Required

    # Competitive Landscape
    competitors = ListField(DictField(), default=[])  # List of competitor details
    competitive_description = StringField(required=False, default=None)

    # Decision Makers
    decision_makers = ListField(DictField(), default=[])

    # Estimated Revenue
    recent_Q = DictField(required=False, default={"Q": None, "revenue": None})
    recent_year = DictField(required=False, default={"year": None, "revenue": None})

    # Other Fields
    headcount_insights = StringField(required=False, default=None)
    how_company_makes_money = StringField(required=False, default=None)
    related_news = ListField(DictField(), default=[])

    def to_json(self):
        return {
            "company_name": self.company_name,
            "registration_number": self.registration_number,
            "website_url": self.website_url,
            "linkedin_url": self.linkedin_url,
            "competitive_landscape": {
                "competitors": self.competitors,
                "description": self.competitive_description
            },
            "decision_makers": self.decision_makers,
            "estimated_revenue": {
                "recent_Q": self.recent_Q,
                "recent_year": self.recent_year
            },
            "headcount_insights": self.headcount_insights,
            "how_company_makes_money": self.how_company_makes_money,
            "related_news": self.related_news,
        }
