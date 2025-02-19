from flask import Flask
from flask_cors import CORS
from .config.config import Config
from .api.audit import audit_bp  # Import audit blueprint
from dotenv import load_dotenv
import os
from mongoengine import connect

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # Load configurations
    CORS(app)  # Enable CORS for all routes
    # Register blueprints
    app.register_blueprint(audit_bp, url_prefix="/api/audit")
    # Connect to MongoDB Atlas
    MONGO_URI = os.getenv("MONGO_URI")
    connect(db="fba_dev", host=MONGO_URI)

    @app.route("/")
    def welcome():
        return "<h1>backend is up</h1>"
    
    # Health Check Route
    @app.route("/health")
    def health_check():
        return ({"status": "healthy"}), 200

    return app
