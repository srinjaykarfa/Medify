from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
from app.core.auth import decode_access_token

router = APIRouter()

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("MONGODB_DB")]

# Models
class AppointmentCreate(BaseModel):
    patient_id: str
    date: str
    time: str
    type: str
    symptoms: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: str
    medications: List[dict]
    instructions: str
    follow_up_date: Optional[str] = None

class PatientNote(BaseModel):
    patient_id: str
    note: str
    date: str

# Authentication helper
def get_current_doctor(Authorization: str = Header(...)):
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
    
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    if user.get("verification_status") != "approved":
        raise HTTPException(status_code=403, detail="Doctor account not verified")
    
    return user

@router.get("/stats")
def get_doctor_stats(current_doctor: dict = Depends(get_current_doctor)):
    """Get doctor dashboard statistics"""
    try:
        doctor_id = str(current_doctor["_id"])
        today = datetime.now().date()
        
        # Count today's appointments
        today_appointments = db.appointments.count_documents({
            "doctor_id": doctor_id,
            "date": today.isoformat()
        })
        
        # Count total patients
        total_patients = db.appointments.distinct("patient_id", {"doctor_id": doctor_id})
        
        # Count pending consultations
        pending_consultations = db.appointments.count_documents({
            "doctor_id": doctor_id,
            "status": "scheduled"
        })
        
        # Count completed today
        completed_today = db.appointments.count_documents({
            "doctor_id": doctor_id,
            "date": today.isoformat(),
            "status": "completed"
        })
        
        return {
            "today_appointments": today_appointments,
            "total_patients": len(total_patients),
            "pending_consultations": pending_consultations,
            "completed_today": completed_today
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/appointments")
def get_doctor_appointments(current_doctor: dict = Depends(get_current_doctor)):
    """Get doctor's appointments"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        # Get appointments for the doctor
        appointments = list(db.appointments.find({"doctor_id": doctor_id}).sort("date", 1))
        
        # Enrich with patient information
        for appointment in appointments:
            appointment["id"] = str(appointment["_id"])
            del appointment["_id"]
            
            # Get patient details
            patient = db.users.find_one({"_id": ObjectId(appointment["patient_id"])})
            if patient:
                appointment["patient_name"] = patient.get("username", "Unknown")
                appointment["patient_email"] = patient.get("email", "")
        
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching appointments: {str(e)}")

@router.get("/patients")
def get_doctor_patients(current_doctor: dict = Depends(get_current_doctor)):
    """Get doctor's patients"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        # Get unique patient IDs from appointments
        patient_ids = db.appointments.distinct("patient_id", {"doctor_id": doctor_id})
        
        patients = []
        for patient_id in patient_ids:
            patient = db.users.find_one({"_id": ObjectId(patient_id)})
            if patient:
                # Get last appointment
                last_appointment = db.appointments.find_one(
                    {"doctor_id": doctor_id, "patient_id": patient_id},
                    sort=[("date", -1)]
                )
                
                patient_data = {
                    "id": str(patient["_id"]),
                    "name": patient.get("username", "Unknown"),
                    "email": patient.get("email", ""),
                    "age": patient.get("age", "Unknown"),
                    "gender": patient.get("gender", "Unknown"),
                    "last_visit": last_appointment.get("date") if last_appointment else "Never",
                    "condition": "General", # This would come from medical records
                    "status": "Active"
                }
                patients.append(patient_data)
        
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patients: {str(e)}")

@router.post("/appointments")
def create_appointment(appointment: AppointmentCreate, current_doctor: dict = Depends(get_current_doctor)):
    """Create a new appointment"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        appointment_data = appointment.dict()
        appointment_data.update({
            "doctor_id": doctor_id,
            "status": "scheduled",
            "created_at": datetime.utcnow(),
        })
        
        result = db.appointments.insert_one(appointment_data)
        
        return {
            "message": "Appointment created successfully",
            "appointment_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating appointment: {str(e)}")

@router.put("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, status: str, current_doctor: dict = Depends(get_current_doctor)):
    """Update appointment status"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        result = db.appointments.update_one(
            {"_id": ObjectId(appointment_id), "doctor_id": doctor_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        return {"message": f"Appointment status updated to {status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating appointment: {str(e)}")

@router.post("/prescriptions")
def create_prescription(prescription: PrescriptionCreate, current_doctor: dict = Depends(get_current_doctor)):
    """Create a prescription for a patient"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        prescription_data = prescription.dict()
        prescription_data.update({
            "doctor_id": doctor_id,
            "created_at": datetime.utcnow(),
        })
        
        result = db.prescriptions.insert_one(prescription_data)
        
        return {
            "message": "Prescription created successfully",
            "prescription_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating prescription: {str(e)}")

@router.get("/patient/{patient_id}/history")
def get_patient_history(patient_id: str, current_doctor: dict = Depends(get_current_doctor)):
    """Get patient's medical history with this doctor"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        # Get appointments
        appointments = list(db.appointments.find({
            "doctor_id": doctor_id,
            "patient_id": patient_id
        }).sort("date", -1))
        
        # Get prescriptions
        prescriptions = list(db.prescriptions.find({
            "doctor_id": doctor_id,
            "patient_id": patient_id
        }).sort("created_at", -1))
        
        # Get notes
        notes = list(db.patient_notes.find({
            "doctor_id": doctor_id,
            "patient_id": patient_id
        }).sort("date", -1))
        
        # Convert ObjectIds to strings
        for item in appointments + prescriptions + notes:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        return {
            "appointments": appointments,
            "prescriptions": prescriptions,
            "notes": notes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patient history: {str(e)}")

@router.post("/patient/{patient_id}/notes")
def add_patient_note(patient_id: str, note: PatientNote, current_doctor: dict = Depends(get_current_doctor)):
    """Add a note for a patient"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        note_data = note.dict()
        note_data.update({
            "doctor_id": doctor_id,
            "created_at": datetime.utcnow(),
        })
        
        result = db.patient_notes.insert_one(note_data)
        
        return {
            "message": "Note added successfully",
            "note_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding note: {str(e)}")

@router.get("/schedule")
def get_doctor_schedule(current_doctor: dict = Depends(get_current_doctor)):
    """Get doctor's schedule for the week"""
    try:
        doctor_id = str(current_doctor["_id"])
        
        # Get next 7 days
        today = datetime.now().date()
        week_dates = [(today + timedelta(days=i)).isoformat() for i in range(7)]
        
        schedule = {}
        for date in week_dates:
            appointments = list(db.appointments.find({
                "doctor_id": doctor_id,
                "date": date
            }).sort("time", 1))
            
            for appointment in appointments:
                appointment["id"] = str(appointment["_id"])
                del appointment["_id"]
                
                # Get patient name
                patient = db.users.find_one({"_id": ObjectId(appointment["patient_id"])})
                appointment["patient_name"] = patient.get("username", "Unknown") if patient else "Unknown"
            
            schedule[date] = appointments
        
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schedule: {str(e)}")
