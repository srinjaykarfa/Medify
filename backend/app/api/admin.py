from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
from app.core.auth import verify_password, decode_access_token
import logging

router = APIRouter()

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("MONGODB_DB")]

# Models
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminStats(BaseModel):
    total_users: int
    active_chats: int
    health_checks: int
    system_health: str

class UserStats(BaseModel):
    id: str
    name: str
    email: str
    status: str
    join_date: str
    last_login: Optional[str] = None

class SystemSettings(BaseModel):
    maintenance_mode: bool = False
    allow_registrations: bool = True
    api_rate_limit: int = 1000

# Admin authentication
def verify_admin_credentials(email: str, password: str) -> bool:
    admin_email = os.getenv("ADMIN_EMAIL", "admin@medify.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!@#")
    return email == admin_email and password == admin_password

def get_admin_user(Authorization: str = Header(...)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = Authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Check if user is admin (you can implement this based on your auth logic)
    is_admin = payload.get("is_admin", False)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return payload

# Admin endpoints
@router.post("/login")
def admin_login(request: AdminLoginRequest):
    """Admin login endpoint"""
    if not verify_admin_credentials(request.email, request.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # For simplicity, we'll return success without JWT for now
    # In production, implement proper JWT with admin claims
    return {
        "message": "Admin login successful",
        "admin_email": request.email,
        "access_token": "admin_token_placeholder"  # Replace with actual JWT
    }

@router.get("/stats", response_model=AdminStats)
def get_admin_stats():
    """Get dashboard statistics"""
    try:
        # Count total users
        total_users = db.users.count_documents({})
        
        # Count active chats (mock data for now)
        active_chats = db.chats.count_documents({"status": "active"}) if "chats" in db.list_collection_names() else 0
        
        # Count health checks (mock data)
        health_checks = total_users * 2  # Assume 2 health checks per user on average
        
        return AdminStats(
            total_users=total_users,
            active_chats=active_chats,
            health_checks=health_checks,
            system_health="Good"
        )
    except Exception as e:
        logging.error(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

@router.get("/users", response_model=List[UserStats])
def get_all_users():
    """Get all users for admin management"""
    try:
        users = db.users.find({}, {"password": 0})  # Exclude password field
        user_list = []
        
        for user in users:
            user_data = UserStats(
                id=str(user["_id"]),
                name=user.get("username", "Unknown"),
                email=user.get("email", ""),
                status="active",  # You can implement actual status logic
                join_date=user.get("created_at", "Unknown"),
                last_login=user.get("last_login", None)
            )
            user_list.append(user_data)
        
        return user_list
    except Exception as e:
        logging.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    """Delete a user"""
    try:
        result = db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")

@router.put("/users/{user_id}/status")
def update_user_status(user_id: str, status: str):
    """Update user status (active/inactive)"""
    try:
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"status": status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": f"User status updated to {status}"}
    except Exception as e:
        logging.error(f"Error updating user status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user status")

@router.get("/analytics")
def get_analytics():
    """Get analytics data for admin dashboard"""
    try:
        # Calculate date ranges
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)
        
        # Mock analytics data (replace with actual queries)
        analytics = {
            "daily_active_users": 847,
            "daily_active_users_change": 12,
            "chat_sessions": 234,
            "chat_sessions_change": 8,
            "health_predictions": 156,
            "health_predictions_change": 15,
            "emergency_alerts": 3,
            "emergency_alerts_change": -2,
            "user_registrations_today": 45,
            "user_registrations_week": 312
        }
        
        return analytics
    except Exception as e:
        logging.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

@router.get("/recent-activity")
def get_recent_activity():
    """Get recent system activity"""
    try:
        # Mock recent activity data
        activities = [
            {
                "action": "New user registration",
                "user": "john@example.com",
                "timestamp": datetime.now() - timedelta(minutes=2),
                "type": "registration"
            },
            {
                "action": "Health check completed",
                "user": "jane@example.com", 
                "timestamp": datetime.now() - timedelta(minutes=5),
                "type": "health_check"
            },
            {
                "action": "Chat session started",
                "user": "bob@example.com",
                "timestamp": datetime.now() - timedelta(minutes=10),
                "type": "chat"
            },
            {
                "action": "Emergency alert triggered",
                "user": "alice@example.com",
                "timestamp": datetime.now() - timedelta(minutes=15),
                "type": "emergency"
            }
        ]
        
        # Format timestamps
        formatted_activities = []
        for activity in activities:
            time_diff = datetime.now() - activity["timestamp"]
            if time_diff.total_seconds() < 60:
                time_str = f"{int(time_diff.total_seconds())} seconds ago"
            elif time_diff.total_seconds() < 3600:
                time_str = f"{int(time_diff.total_seconds() / 60)} mins ago"
            else:
                time_str = f"{int(time_diff.total_seconds() / 3600)} hours ago"
            
            formatted_activities.append({
                "action": activity["action"],
                "user": activity["user"],
                "time": time_str,
                "type": activity["type"]
            })
        
        return formatted_activities
    except Exception as e:
        logging.error(f"Error fetching recent activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent activity")

@router.get("/settings", response_model=SystemSettings)
def get_system_settings():
    """Get current system settings"""
    try:
        # Get settings from database or return defaults
        settings_doc = db.system_settings.find_one({"_id": "main"})
        
        if settings_doc:
            return SystemSettings(
                maintenance_mode=settings_doc.get("maintenance_mode", False),
                allow_registrations=settings_doc.get("allow_registrations", True),
                api_rate_limit=settings_doc.get("api_rate_limit", 1000)
            )
        else:
            return SystemSettings()
    except Exception as e:
        logging.error(f"Error fetching settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@router.put("/settings")
def update_system_settings(settings: SystemSettings):
    """Update system settings"""
    try:
        db.system_settings.update_one(
            {"_id": "main"},
            {"$set": settings.dict()},
            upsert=True
        )
        
        return {"message": "Settings updated successfully"}
    except Exception as e:
        logging.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

# Doctor verification endpoints
@router.get("/doctors/pending")
def get_pending_doctors():
    """Get all doctors pending verification"""
    try:
        doctors = list(db.users.find(
            {"role": "doctor"},
            {"password": 0}  # Exclude password
        ))
        for doctor in doctors:
            doctor["id"] = str(doctor["_id"])
            del doctor["_id"]
        return doctors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching doctors: {str(e)}")

@router.post("/doctors/{doctor_id}/approve")
def approve_doctor(doctor_id: str):
    """Approve a doctor's registration"""
    try:
        result = db.users.update_one(
            {"_id": ObjectId(doctor_id)},
            {
                "$set": {
                    "verification_status": "approved",
                    "is_verified": True,
                    "approved_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        return {"message": "Doctor approved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving doctor: {str(e)}")

@router.post("/doctors/{doctor_id}/reject")
def reject_doctor(doctor_id: str):
    """Reject a doctor's registration"""
    try:
        result = db.users.update_one(
            {"_id": ObjectId(doctor_id)},
            {
                "$set": {
                    "verification_status": "rejected",
                    "is_verified": False,
                    "rejected_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        return {"message": "Doctor rejected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting doctor: {str(e)}")

@router.get("/doctors/{doctor_id}")
def get_doctor_details(doctor_id: str):
    """Get detailed information about a specific doctor"""
    try:
        doctor = db.users.find_one(
            {"_id": ObjectId(doctor_id), "role": "doctor"},
            {"password": 0}
        )
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        doctor["id"] = str(doctor["_id"])
        del doctor["_id"]
        
        return doctor
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching doctor details: {str(e)}")
