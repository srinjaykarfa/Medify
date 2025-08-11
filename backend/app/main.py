from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient  # Changed from motor.motor_asyncio
from dotenv import load_dotenv
import os
from .api import chat, users, admin, doctor, predict
from fastapi.staticfiles import StaticFiles
from .core.mock_db import get_mock_db

# Load environment variables
load_dotenv()

app = FastAPI(title="Health App API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection (synchronous) with fallback to mock
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "health_db")

try:
    # Try to connect to MongoDB
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    client.server_info()  # Test connection
    db = client[MONGODB_DB]
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("🔄 Using mock database for development")
    # Use mock database
    mock_db = get_mock_db()
    
    # Create a mock db object that behaves like pymongo
    class MockDB:
        def __init__(self, mock_db):
            self.mock_db = mock_db
            
        def __getitem__(self, collection_name):
            return self.mock_db.get_collection(collection_name)
            
        def list_collection_names(self):
            return list(self.mock_db.data.keys())
    
    db = MockDB(mock_db)

app.mount("/responses", StaticFiles(directory="responses"), name="responses")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(predict.router, prefix="/api/predict", tags=["prediction"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["doctor"])

# Basic endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Health App API"}

# Test endpoint for approved doctors (temporary)
@app.get("/api/approved-doctors")
async def get_approved_doctors_test():
    """Get all approved doctors - temporary test endpoint"""
    from pymongo import MongoClient
    import os
    
    try:
        client = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
        db = client[os.getenv("MONGODB_DB", "health_db")]
        
        doctors = list(db.users.find(
            {
                "role": "doctor",
                "verification_status": "approved",
                "is_verified": True
            },
            {"password": 0}  # Exclude password field
        ))
        
        formatted_doctors = []
        for doctor in doctors:
            formatted_doctor = {
                "id": str(doctor["_id"]),
                "name": doctor.get("username", "Unknown Doctor"),
                "specialization": doctor.get("specialization", "General Medicine"),
                "experience": f"{doctor.get('experience', 0)} years",
                "rating": 4.5,
                "image": "https://randomuser.me/api/portraits/men/1.jpg",
                "availableSlots": ["09:00 AM", "11:00 AM", "02:00 PM"],
                "isAvailable": True,
                "consultationFee": "₹1500",
                "languages": ["Hindi", "English"],
                "hospital": "Medify Network",
                "isDropInAvailable": True,
                "license_number": doctor.get("license_number", ""),
                "email": doctor.get("email", ""),
                "created_at": doctor.get("created_at", "")
            }
            formatted_doctors.append(formatted_doctor)
        
        return formatted_doctors
    except Exception as e:
        return {"error": f"Error fetching approved doctors: {str(e)}"}
