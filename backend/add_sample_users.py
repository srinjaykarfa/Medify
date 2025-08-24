#!/usr/bin/env python3

import os
import sys
from pymongo import MongoClient
from datetime import datetime
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def add_sample_users():
    """Add sample users to MongoDB Atlas"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL")
    MONGODB_DB = os.getenv("MONGODB_DB", "health_db")
    
    try:
        client = MongoClient(MONGODB_URL)
        db = client[MONGODB_DB]
        
        # Test connection
        client.server_info()
        print("✅ Connected to MongoDB successfully")
        
        # Admin user only
        admin_user = {
            "_id": "admin1",
            "username": "Admin User",
            "email": "admin@medify.com", 
            "password": hash_password("Admin123!@#"),
            "role": "admin",
            "created_at": datetime.now().isoformat(),
            "is_verified": True,
            "verification_status": "approved"
        }
        
        # Insert admin user if doesn't exist
        users_collection = db.users
        
        existing_admin = users_collection.find_one({"email": admin_user["email"]})
        if not existing_admin:
            users_collection.insert_one(admin_user)
            print(f"✅ Added admin user: {admin_user['email']}")
        else:
            print(f"⚠️  Admin user already exists: {admin_user['email']}")
        
        print("\n🎉 Admin user added successfully!")
        print("\nAdmin Login credentials:")
        print("Email: admin@medify.com")
        print("Password: Admin123!@#")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    add_sample_users()
