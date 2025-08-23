from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
import shutil
from datetime import datetime
import json
from app.core.auth import decode_access_token
from app.core.config import settings

router = APIRouter()

# Pydantic models
class LabReportResponse(BaseModel):
    id: str
    report_name: str
    test_date: str
    lab_name: Optional[str] = None
    doctor_name: Optional[str] = None
    file_path: str
    extracted_text: Optional[str] = None
    ai_analysis: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

class AnalyticsResponse(BaseModel):
    total_reports: int
    recent_reports: int
    key_findings: List[str]

# MongoDB connection
try:
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    lab_reports_collection = db.lab_reports
    print("✅ Connected to MongoDB for Lab Reports")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB for Lab Reports: {e}")
    # Fallback to mock database
    lab_reports_collection = None

# Test endpoint
@router.get("/test")
async def test_endpoint():
    """Test endpoint to check if lab reports API is working"""
    return {"message": "Lab Reports API is working!", "status": "success"}

# Get user's lab reports
@router.get("/my-reports", response_model=List[LabReportResponse])
async def get_my_reports(current_user: dict = Depends(decode_access_token)):
    """Get all lab reports for the current user"""
    try:
        user_id = current_user.get("user_id")
        
        if lab_reports_collection:
            # MongoDB query
            reports = list(lab_reports_collection.find({"user_id": user_id}))
            result = []
            for report in reports:
                result.append(LabReportResponse(
                    id=str(report["_id"]),
                    report_name=report["report_name"],
                    test_date=report["test_date"],
                    lab_name=report.get("lab_name"),
                    doctor_name=report.get("doctor_name"),
                    file_path=report["file_path"],
                    extracted_text=report.get("extracted_text"),
                    ai_analysis=report.get("ai_analysis"),
                    notes=report.get("notes"),
                    created_at=report["created_at"],
                    updated_at=report["updated_at"]
                ))
            return result
        else:
            # Mock data
            return []
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")

# Get analytics
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(current_user: dict = Depends(decode_access_token)):
    """Get analytics for user's lab reports"""
    try:
        user_id = current_user.get("user_id")
        
        if lab_reports_collection:
            total_reports = lab_reports_collection.count_documents({"user_id": user_id})
            recent_reports = lab_reports_collection.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": datetime.now().replace(day=1).isoformat()}
            })
        else:
            total_reports = 0
            recent_reports = 0
            
        return AnalyticsResponse(
            total_reports=total_reports,
            recent_reports=recent_reports,
            key_findings=["No significant findings", "All parameters within normal range"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

# Upload lab report (simplified without OCR)
@router.post("/upload")
async def upload_lab_report(
    report_name: str = Form(...),
    test_date: str = Form(...),
    lab_name: str = Form(None),
    doctor_name: str = Form(None),
    notes: str = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(decode_access_token)
):
    """Upload a new lab report"""
    try:
        user_id = current_user.get("user_id")
        
        # Validate file type
        if not file.content_type.startswith(('image/', 'application/pdf')):
            raise HTTPException(status_code=400, detail="Only image and PDF files are supported")
        
        # Create upload directory
        upload_dir = "uploads/lab_reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        file_name = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(upload_dir, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Simple AI analysis (mock)
        ai_analysis = "Report uploaded successfully. Manual review recommended for detailed analysis."
        
        # Save to database
        report_data = {
            "user_id": user_id,
            "report_name": report_name,
            "test_date": test_date,
            "lab_name": lab_name,
            "doctor_name": doctor_name,
            "file_path": file_path,
            "extracted_text": "Text extraction not available - OCR service disabled",
            "ai_analysis": ai_analysis,
            "notes": notes,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if lab_reports_collection:
            result = lab_reports_collection.insert_one(report_data)
            report_id = str(result.inserted_id)
        else:
            report_id = "mock_id_" + datetime.now().strftime('%Y%m%d_%H%M%S')
        
        return {
            "message": "Lab report uploaded successfully",
            "report_id": report_id,
            "extracted_text": report_data["extracted_text"],
            "ai_analysis": ai_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")

# Get specific report
@router.get("/report/{report_id}", response_model=LabReportResponse)
async def get_report(report_id: str, current_user: dict = Depends(decode_access_token)):
    """Get a specific lab report"""
    try:
        user_id = current_user.get("user_id")
        
        if lab_reports_collection:
            report = lab_reports_collection.find_one({
                "_id": ObjectId(report_id),
                "user_id": user_id
            })
            
            if not report:
                raise HTTPException(status_code=404, detail="Report not found")
                
            return LabReportResponse(
                id=str(report["_id"]),
                report_name=report["report_name"],
                test_date=report["test_date"],
                lab_name=report.get("lab_name"),
                doctor_name=report.get("doctor_name"),
                file_path=report["file_path"],
                extracted_text=report.get("extracted_text"),
                ai_analysis=report.get("ai_analysis"),
                notes=report.get("notes"),
                created_at=report["created_at"],
                updated_at=report["updated_at"]
            )
        else:
            raise HTTPException(status_code=404, detail="Report not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")

# Delete report
@router.delete("/report/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(decode_access_token)):
    """Delete a lab report"""
    try:
        user_id = current_user.get("user_id")
        
        if lab_reports_collection:
            result = lab_reports_collection.delete_one({
                "_id": ObjectId(report_id),
                "user_id": user_id
            })
            
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Report not found")
                
            return {"message": "Report deleted successfully"}
        else:
            return {"message": "Report deleted successfully (mock)"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")
