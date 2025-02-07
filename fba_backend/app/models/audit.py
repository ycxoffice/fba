from flask_mongoengine import MongoEngine
from mongoengine import (
    Document, StringField, IntField, ListField, DictField
)
from bson import ObjectId  # Import to handle ObjectId serialization

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
    info = DictField(default={})


    def to_json(self):
        return {
            "id": str(self.id),  # ✅ Convert ObjectId to string to fix serialization issue
            "company_name": self.company_name,
            "registration_number": self.registration_number,
            "website_url": self.website_url,
            "linkedin_url": self.linkedin_url,
            "properties": self.properties,
            "info": self.info
        }
