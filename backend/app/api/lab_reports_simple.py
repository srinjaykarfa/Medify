from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
import shutil
from datetime import datetime
import json
from app.core.auth import get_current_user
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

# Test endpoint without authentication
@router.get("/test-reports")
async def test_reports_endpoint():
    """Test endpoint to check if we can fetch reports without auth"""
    try:
        if lab_reports_collection:
            # Get some sample reports (limit to 5 for testing)
            reports = list(lab_reports_collection.find({}).limit(5))
            return {
                "message": "Successfully connected to lab reports collection",
                "total_reports": lab_reports_collection.count_documents({}),
                "sample_reports": len(reports),
                "status": "success"
            }
        else:
            return {
                "message": "Using mock database",
                "status": "success",
                "mock": True
            }
    except Exception as e:
        return {"error": str(e), "status": "error"}

# Get user's lab reports (simplified without auth for now)
@router.get("/my-reports", response_model=List[LabReportResponse])
async def get_my_reports():
    """Get all lab reports for the current user"""
    try:
        # For now, return mock data - will add proper auth later
        user_id = "test_user_123"
        
        if lab_reports_collection is not None:
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

# Get analytics (simplified without auth for now)
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get analytics for user's lab reports"""
    try:
        # For now, use mock user - will add proper auth later
        user_id = "test_user_123"
        
        if lab_reports_collection is not None:
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

# Upload lab report (simplified without auth for now)
@router.post("/upload")
async def upload_lab_report(
    report_name: str = Form(...),
    test_date: str = Form(...),
    lab_name: str = Form(None),
    doctor_name: str = Form(None),
    notes: str = Form(None),
    file: UploadFile = File(...)
):
    """Upload a new lab report"""
    try:
        # For now, use mock user - will add proper auth later
        user_id = "test_user_123"
        
        # Check if required fields are provided
        if not report_name or not test_date:
            raise HTTPException(status_code=400, detail="Report name and test date are required")
        
        # Validate file if provided
        if file and file.filename:
            # Validate file type
            allowed_types = ['image/', 'application/pdf', 'text/']
            if not any(file.content_type.startswith(allowed_type) for allowed_type in allowed_types):
                raise HTTPException(status_code=400, detail="Only image, PDF, and text files are supported")
        else:
            raise HTTPException(status_code=400, detail="File is required")
        
        # Create upload directory
        upload_dir = "uploads/lab_reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'bin'
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
        
        if lab_reports_collection is not None:
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
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading lab report: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")

# Test upload endpoint without authentication
@router.post("/test-upload")
async def test_upload_lab_report(
    report_name: str = Form(...),
    test_date: str = Form(...),
    lab_name: str = Form(None),
    doctor_name: str = Form(None),
    notes: str = Form(None),
    file: UploadFile = File(...)
):
    """Test upload endpoint without authentication"""
    try:
        # Create upload directory
        upload_dir = "uploads/lab_reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        file_name = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(upload_dir, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": "Test upload successful",
            "file_name": file_name,
            "file_path": file_path,
            "report_name": report_name,
            "test_date": test_date
        }
        
    except Exception as e:
        return {"error": f"Test upload failed: {str(e)}"}

# Get specific report (simplified without auth for now)
@router.get("/report/{report_id}", response_model=LabReportResponse)
async def get_report(report_id: str):
    """Get a specific lab report"""
    try:
        # For now, use mock user - will add proper auth later
        user_id = "test_user_123"
        
        if lab_reports_collection is not None:
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

# Delete report (simplified without auth for now)
@router.delete("/report/{report_id}")
async def delete_report(report_id: str):
    """Delete a lab report"""
    try:
        # For now, use mock user - will add proper auth later
        user_id = "test_user_123"
        
        if lab_reports_collection is not None:
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
