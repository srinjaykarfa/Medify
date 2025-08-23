from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from ..core.auth import get_current_user
from ..schemas.user import User

router = APIRouter()

def get_database():
    """Get the database instance from main app"""
    from ..main import db
    return db

@router.get("/doctors")
async def get_available_doctors(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    """Get all approved doctors for appointment booking"""
    try:
        # Get users collection from MongoDB
        users_collection = db.users
        
        # Filter doctors who are approved by admin
        approved_doctors_cursor = users_collection.find({
            "role": "doctor",
            "verification_status": "approved"
        })
        
        approved_doctors = []
        for doctor_data in approved_doctors_cursor:
            doctor_info = {
                "id": str(doctor_data.get("_id")),
                "name": doctor_data.get("username", doctor_data.get("full_name", "Unknown")),
                "email": doctor_data.get("email"),
                "specialization": doctor_data.get("specialization", "General Medicine"),
                "experience": doctor_data.get("experience", "Not specified"),
                "license_number": doctor_data.get("license_number", "Not specified"),
                "consultation_fee": doctor_data.get("consultation_fee", 500),
                "available_days": doctor_data.get("available_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
                "available_time": doctor_data.get("available_time", "9:00 AM - 5:00 PM")
            }
            approved_doctors.append(doctor_info)
        
        return {
            "success": True,
            "doctors": approved_doctors,
            "count": len(approved_doctors)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching doctors: {str(e)}"
        )

@router.post("/book")
async def book_appointment(
    appointment_data: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Book an appointment with a doctor"""
    try:
        # Get users collection from MongoDB
        users_collection = db.users
        
        # Validate doctor exists and is approved
        doctor_id = appointment_data.get("doctor_id")
        
        # Try to convert doctor_id to ObjectId if it's a string
        from bson import ObjectId
        try:
            if isinstance(doctor_id, str):
                doctor_object_id = ObjectId(doctor_id)
            else:
                doctor_object_id = doctor_id
        except:
            doctor_object_id = doctor_id
        
        doctor = users_collection.find_one({
            "_id": doctor_object_id,
            "role": "doctor",
            "verification_status": "approved"
        })
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found or not approved"
            )
        
        # Create appointment record
        appointment_id = f"apt_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user.id[:8]}"
        
        appointment = {
            "_id": appointment_id,
            "patient_id": current_user.id,
            "patient_name": current_user.full_name,
            "patient_email": current_user.email,
            "doctor_id": str(doctor.get("_id")),
            "doctor_name": doctor.get("username"),
            "appointment_date": appointment_data.get("date"),
            "appointment_time": appointment_data.get("time"),
            "reason": appointment_data.get("reason", "General consultation"),
            "status": "scheduled",
            "created_at": datetime.now().isoformat(),
            "consultation_fee": doctor.get("consultation_fee", 500)
        }
        
        # Store appointment in MongoDB
        appointments_collection = db.appointments
        appointments_collection.insert_one(appointment)
        
        return {
            "success": True,
            "message": "Appointment booked successfully",
            "appointment": appointment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error booking appointment: {str(e)}"
        )

@router.get("/my-appointments")
async def get_my_appointments(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    """Get appointments for the current user"""
    try:
        # Get appointments collection from MongoDB
        appointments_collection = db.appointments
        
        appointments_cursor = appointments_collection.find({
            "patient_id": current_user.id
        })
        
        user_appointments = []
        for apt_data in appointments_cursor:
            user_appointments.append(apt_data)
        
        # Sort by appointment date
        user_appointments.sort(key=lambda x: x.get("appointment_date", ""))
        
        return {
            "success": True,
            "appointments": user_appointments,
            "count": len(user_appointments)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching appointments: {str(e)}"
        )

@router.get("/categories")
async def get_doctor_categories():
    """Get available doctor categories/specializations"""
    categories = [
        {"id": "general", "name": "General Medicine", "icon": "🩺"},
        {"id": "cardiology", "name": "Cardiology", "icon": "❤️"},
        {"id": "dermatology", "name": "Dermatology", "icon": "🧴"},
        {"id": "orthopedics", "name": "Orthopedics", "icon": "🦴"},
        {"id": "pediatrics", "name": "Pediatrics", "icon": "👶"},
        {"id": "gynecology", "name": "Gynecology", "icon": "👩"},
        {"id": "neurology", "name": "Neurology", "icon": "🧠"},
        {"id": "psychiatry", "name": "Psychiatry", "icon": "🧘"},
        {"id": "dentistry", "name": "Dentistry", "icon": "🦷"},
        {"id": "ophthalmology", "name": "Ophthalmology", "icon": "👁️"}
    ]
    
    return {
        "success": True,
        "categories": categories
    }
