from flask_mongoengine import MongoEngine
from mongoengine import Document, StringField, IntField, DictField
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
