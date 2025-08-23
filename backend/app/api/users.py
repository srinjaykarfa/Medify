from fastapi import APIRouter, HTTPException, Depends, Header, Query, Request, File, UploadFile, Form
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
import shutil
from datetime import datetime
from app.core.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas.user import UserCreate, UserRole
from app.core.config import settings

router = APIRouter()

# MongoDB connection (sync)
client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("MONGODB_DB")]

# Models
class UserBase(BaseModel):
    email: str
    password: str
    class Config:
        orm_mode = True

class User(UserBase):
    id: str

class HealthMetric(BaseModel):
    type: str
    value: float
    unit: str
    notes: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

# User endpoints
@router.post("/register")
async def register(
    username: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    role: UserRole = Form(UserRole.PATIENT),
    license_number: Optional[str] = Form(None),
    specialization: Optional[str] = Form(None),
    experience: Optional[int] = Form(None),
    aadhaar_card: Optional[UploadFile] = File(None),
    doctor_certificate: Optional[UploadFile] = File(None)
):
    # Check if email or username already exists
    if db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create uploads directory if it doesn't exist
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)

    # Prepare user data
    user_dict = {
        "username": username,
        "email": email,
        "password": hash_password(password),
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "is_verified": False,
        "verification_status": "pending" if role == UserRole.DOCTOR else "approved"
    }

    # Handle doctor-specific data
    if role == UserRole.DOCTOR:
        if not license_number or not specialization or not experience:
            raise HTTPException(status_code=400, detail="License number, specialization, and experience are required for doctors")
        
        if not aadhaar_card or not doctor_certificate:
            raise HTTPException(status_code=400, detail="Aadhaar card and doctor certificate are required for doctors")

        user_dict.update({
            "license_number": license_number,
            "specialization": specialization,
            "experience": experience
        })

        # Save uploaded files
        try:
            # Save Aadhaar card
            aadhaar_filename = f"{username}_aadhaar_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{aadhaar_card.filename.split('.')[-1]}"
            aadhaar_path = os.path.join(uploads_dir, aadhaar_filename)
            with open(aadhaar_path, "wb") as buffer:
                shutil.copyfileobj(aadhaar_card.file, buffer)
            user_dict["aadhaar_card_path"] = aadhaar_path

            # Save doctor certificate
            cert_filename = f"{username}_certificate_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{doctor_certificate.filename.split('.')[-1]}"
            cert_path = os.path.join(uploads_dir, cert_filename)
            with open(cert_path, "wb") as buffer:
                shutil.copyfileobj(doctor_certificate.file, buffer)
            user_dict["doctor_certificate_path"] = cert_path

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")

    result = db.users.insert_one(user_dict)
    
    # Create token with user ID and username
    access_token = create_access_token(data={"sub": str(result.inserted_id), "username": username})

    response_data = {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "username": username,
        "access_token": access_token,
        "role": role
    }

    if role == UserRole.DOCTOR:
        response_data["message"] = "Doctor registration submitted successfully. Your account will be verified by our admin team."

    return response_data

@router.get("/verify-email")
def verify_email(token: str = Query(...)):
    payload = decode_access_token(token)
    if not payload or not payload.get("verify"):
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user_id = payload.get("sub")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("is_verified"):
        return {"message": "Email already verified."}
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_verified": True}})
    return {"message": "Email verified successfully."}

@router.post("/login")
def login(request: LoginRequest):
    user = db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user.get("password")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Create token with user ID and username
    access_token = create_access_token(data={"sub": str(user["_id"]), "username": user["username"]})

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user_id": str(user["_id"]),
        "username": user["username"],
        "role": user.get("role", "patient"),
        "verification_status": user.get("verification_status", "approved")
    }

def get_current_user(Authorization: str = Header(...)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = Authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/profile")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile information"""
    try:
        # Remove sensitive information
        user_profile = {
            "id": str(current_user["_id"]),
            "username": current_user.get("username", ""),
            "email": current_user.get("email", ""),
            "phone": current_user.get("phone", ""),
            "address": current_user.get("address", ""),
            "bloodGroup": current_user.get("bloodGroup", ""),
            "allergies": current_user.get("allergies", ""),
            "medications": current_user.get("medications", ""),
            "conditions": current_user.get("conditions", ""),
            "role": current_user.get("role", "patient"),
            "created_at": current_user.get("created_at", ""),
            "is_verified": current_user.get("is_verified", False),
            "verification_status": current_user.get("verification_status", "approved")
        }
        
        # Add doctor-specific fields if user is a doctor
        if current_user.get("role") == "doctor":
            user_profile.update({
                "license_number": current_user.get("license_number", ""),
                "specialization": current_user.get("specialization", ""),
                "experience": current_user.get("experience", 0)
            })
        
        return user_profile
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.put("/profile")
def update_current_user_profile(
    username: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    phone: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    bloodGroup: Optional[str] = Form(None),
    allergies: Optional[str] = Form(None),
    medications: Optional[str] = Form(None),
    conditions: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile information"""
    try:
        update_data = {}
        
        # Only update fields that are provided
        if username is not None:
            # Check if username is already taken by another user
            existing_user = db.users.find_one({"username": username, "_id": {"$ne": current_user["_id"]}})
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")
            update_data["username"] = username
            
        if email is not None:
            # Check if email is already taken by another user
            existing_user = db.users.find_one({"email": email, "_id": {"$ne": current_user["_id"]}})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            update_data["email"] = email
            
        if phone is not None:
            update_data["phone"] = phone
        if address is not None:
            update_data["address"] = address
        if bloodGroup is not None:
            update_data["bloodGroup"] = bloodGroup
        if allergies is not None:
            update_data["allergies"] = allergies
        if medications is not None:
            update_data["medications"] = medications
        if conditions is not None:
            update_data["conditions"] = conditions
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$set": update_data}
            )
        
        return {"message": "Profile updated successfully", "updated_fields": list(update_data.keys())}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.get("/", response_model=List[User])
def get_users(current_user: dict = Depends(get_current_user)):
    users = db.users.find()
    return [
        User(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            password=user["password"]
        ) for user in users
    ]

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return User(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        password=user["password"]
    )

@router.post("/{user_id}/metrics")
def add_health_metric(user_id: str, metric: HealthMetric, current_user: dict = Depends(get_current_user)):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"health_metrics": metric.dict()}}
    )
    
    return {"message": "Health metric added successfully"}

@router.get("/approved-doctors")
def get_approved_doctors_public():
    """Get all approved doctors for appointment booking - Public endpoint"""
    try:
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
                "rating": 4.5,  # Default rating, you can implement actual rating system
                "image": "https://randomuser.me/api/portraits/men/1.jpg",  # Default image
                "availableSlots": ["09:00 AM", "11:00 AM", "02:00 PM"],  # You can implement actual slot management
                "isAvailable": True,
                "consultationFee": "₹1500",  # You can add this field to doctor profile
                "languages": ["Hindi", "English"],  # You can add this field to doctor profile
                "hospital": "Medify Network",  # You can add this field to doctor profile
                "isDropInAvailable": True,
                "license_number": doctor.get("license_number", ""),
                "email": doctor.get("email", ""),
                "created_at": doctor.get("created_at", "")
            }
            formatted_doctors.append(formatted_doctor)
        
        return formatted_doctors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching approved doctors: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching approved doctors: {str(e)}")
