from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
import os
import shutil
from datetime import datetime
import json
from PIL import Image
import pytesseract
import re
from app.core.auth import decode_access_token
from app.core.config import settings

router = APIRouter()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", settings.MONGODB_URL)
MONGODB_DB = os.getenv("MONGODB_DB", settings.MONGODB_DB)

try:
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=3000)
    client.server_info()
    db = client[MONGODB_DB]
except Exception:
    from app.core.mock_db import get_mock_db
    mock = get_mock_db()
    class MockDB:
        def __init__(self, _mock):
            self._mock = _mock
        def __getitem__(self, collection_name):
            return self._mock.get_collection(collection_name)
    db = MockDB(mock)

# Models
class LabReportAnalysis(BaseModel):
    test_name: str
    value: str
    unit: str
    reference_range: str
    status: str  # normal, high, low, critical
    recommendation: str

class LabReportCreate(BaseModel):
    report_name: str
    test_date: str
    lab_name: Optional[str] = None
    doctor_name: Optional[str] = None
    notes: Optional[str] = None

# Authentication helper
def get_current_user(authorization: str = Depends(lambda: None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# OCR Text Extraction
def extract_text_from_image(image_path):
    """Extract text from uploaded image using OCR"""
    try:
        # Use pytesseract for OCR
        text = pytesseract.image_to_string(Image.open(image_path))
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

# AI Analysis Functions
def analyze_blood_sugar(value, unit="mg/dL"):
    """Analyze blood sugar levels"""
    try:
        val = float(value)
        if unit == "mmol/L":
            val = val * 18  # Convert to mg/dL
        
        if val < 70:
            return "low", "Low blood sugar - consult doctor immediately. Have some glucose/sugar."
        elif val <= 100:
            return "normal", "Normal fasting blood sugar level. Maintain healthy diet."
        elif val <= 125:
            return "high", "Pre-diabetic range. Consider lifestyle changes and doctor consultation."
        else:
            return "critical", "Diabetic range. Immediate medical attention required."
    except:
        return "unknown", "Unable to analyze this value."

def analyze_blood_pressure(systolic, diastolic):
    """Analyze blood pressure readings"""
    try:
        sys_val = float(systolic)
        dia_val = float(diastolic)
        
        if sys_val < 90 or dia_val < 60:
            return "low", "Low blood pressure. Monitor and consult doctor if symptoms persist."
        elif sys_val <= 120 and dia_val <= 80:
            return "normal", "Normal blood pressure. Maintain healthy lifestyle."
        elif sys_val <= 139 or dia_val <= 89:
            return "high", "Pre-hypertension. Consider lifestyle modifications."
        else:
            return "critical", "High blood pressure. Medical attention recommended."
    except:
        return "unknown", "Unable to analyze blood pressure values."

def analyze_cholesterol(total_chol, hdl=None, ldl=None):
    """Analyze cholesterol levels"""
    try:
        total = float(total_chol)
        
        if total < 200:
            status = "normal"
            recommendation = "Good cholesterol level. Maintain healthy diet."
        elif total <= 239:
            status = "high"
            recommendation = "Borderline high cholesterol. Consider dietary changes."
        else:
            status = "critical"
            recommendation = "High cholesterol. Medical consultation recommended."
        
        return status, recommendation
    except:
        return "unknown", "Unable to analyze cholesterol values."

def smart_analysis(extracted_text):
    """AI-powered analysis of lab report text"""
    analysis_results = []
    text_lines = extracted_text.split('\n')
    
    # Common test patterns
    patterns = {
        'blood_sugar': [
            r'glucose.*?(\d+\.?\d*)\s*(mg/dl|mmol/l)',
            r'sugar.*?(\d+\.?\d*)\s*(mg/dl|mmol/l)',
            r'fbs.*?(\d+\.?\d*)\s*(mg/dl|mmol/l)',
            r'rbs.*?(\d+\.?\d*)\s*(mg/dl|mmol/l)'
        ],
        'cholesterol': [
            r'cholesterol.*?(\d+\.?\d*)\s*(mg/dl)',
            r'total cholesterol.*?(\d+\.?\d*)\s*(mg/dl)'
        ],
        'hemoglobin': [
            r'hemoglobin.*?(\d+\.?\d*)\s*(g/dl|gm/dl)',
            r'hb.*?(\d+\.?\d*)\s*(g/dl|gm/dl)'
        ],
        'creatinine': [
            r'creatinine.*?(\d+\.?\d*)\s*(mg/dl)',
            r'serum creatinine.*?(\d+\.?\d*)\s*(mg/dl)'
        ]
    }
    
    for line in text_lines:
        line = line.lower().strip()
        
        # Blood Sugar Analysis
        for pattern in patterns['blood_sugar']:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                value = match.group(1)
                unit = match.group(2)
                status, recommendation = analyze_blood_sugar(value, unit)
                
                analysis_results.append({
                    "test_name": "Blood Glucose",
                    "value": f"{value} {unit}",
                    "unit": unit,
                    "reference_range": "70-100 mg/dL (fasting)",
                    "status": status,
                    "recommendation": recommendation
                })
        
        # Cholesterol Analysis
        for pattern in patterns['cholesterol']:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                value = match.group(1)
                unit = match.group(2)
                status, recommendation = analyze_cholesterol(value)
                
                analysis_results.append({
                    "test_name": "Total Cholesterol",
                    "value": f"{value} {unit}",
                    "unit": unit,
                    "reference_range": "<200 mg/dL",
                    "status": status,
                    "recommendation": recommendation
                })
        
        # Hemoglobin Analysis
        for pattern in patterns['hemoglobin']:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                value = match.group(1)
                unit = match.group(2)
                val = float(value)
                
                if val < 12:
                    status = "low"
                    recommendation = "Low hemoglobin. Iron-rich foods and medical consultation recommended."
                elif val <= 15:
                    status = "normal"
                    recommendation = "Normal hemoglobin level."
                else:
                    status = "high"
                    recommendation = "High hemoglobin. Further investigation may be needed."
                
                analysis_results.append({
                    "test_name": "Hemoglobin",
                    "value": f"{value} {unit}",
                    "unit": unit,
                    "reference_range": "12-15 g/dL",
                    "status": status,
                    "recommendation": recommendation
                })
    
    return analysis_results

# API Endpoints
@router.post("/upload")
async def upload_lab_report(
    report_file: UploadFile = File(...),
    report_name: str = Form(...),
    test_date: str = Form(...),
    lab_name: Optional[str] = Form(None),
    doctor_name: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload and analyze lab report"""
    try:
        # Create uploads directory
        uploads_dir = "uploaded_reports"
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Save uploaded file
        file_extension = report_file.filename.split('.')[-1].lower()
        if file_extension not in ['jpg', 'jpeg', 'png', 'pdf']:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, and PDF files are allowed")
        
        filename = f"{current_user['username']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(uploads_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(report_file.file, buffer)
        
        # Extract text using OCR (for images)
        extracted_text = ""
        analysis_results = []
        
        if file_extension in ['jpg', 'jpeg', 'png']:
            extracted_text = extract_text_from_image(file_path)
            analysis_results = smart_analysis(extracted_text)
        
        # Save to database
        report_data = {
            "user_id": str(current_user["_id"]),
            "report_name": report_name,
            "test_date": test_date,
            "lab_name": lab_name,
            "doctor_name": doctor_name,
            "notes": notes,
            "file_path": file_path,
            "file_type": file_extension,
            "extracted_text": extracted_text,
            "analysis_results": analysis_results,
            "upload_date": datetime.utcnow().isoformat(),
            "status": "processed"
        }
        
        result = db.lab_reports.insert_one(report_data)
        
        return {
            "message": "Lab report uploaded and analyzed successfully",
            "report_id": str(result.inserted_id),
            "analysis_results": analysis_results,
            "extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading report: {str(e)}")

@router.get("/test")
async def test_endpoint():
    """Test endpoint to check if lab reports API is working"""
    return {"message": "Lab Reports API is working!", "status": "success"}

@router.get("/my-reports")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    """Get all reports for current user"""
    try:
        reports = list(db.lab_reports.find(
            {"user_id": str(current_user["_id"])},
            {"extracted_text": 0}  # Exclude large text field
        ).sort("upload_date", -1))
        
        for report in reports:
            report["id"] = str(report["_id"])
            del report["_id"]
        
        return reports
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@router.get("/report/{report_id}")
async def get_report_details(report_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed report with analysis"""
    try:
        report = db.lab_reports.find_one({
            "_id": ObjectId(report_id),
            "user_id": str(current_user["_id"])
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report["id"] = str(report["_id"])
        del report["_id"]
        
        return report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching report details: {str(e)}")

@router.delete("/report/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a lab report"""
    try:
        report = db.lab_reports.find_one({
            "_id": ObjectId(report_id),
            "user_id": str(current_user["_id"])
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Delete file
        if os.path.exists(report["file_path"]):
            os.remove(report["file_path"])
        
        # Delete from database
        db.lab_reports.delete_one({"_id": ObjectId(report_id)})
        
        return {"message": "Report deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting report: {str(e)}")

@router.get("/analytics")
async def get_health_analytics(current_user: dict = Depends(get_current_user)):
    """Get health analytics based on lab reports"""
    try:
        reports = list(db.lab_reports.find(
            {"user_id": str(current_user["_id"])}
        ).sort("test_date", 1))
        
        # Analyze trends
        trends = {
            "blood_sugar": [],
            "cholesterol": [],
            "hemoglobin": [],
            "total_reports": len(reports),
            "critical_alerts": 0,
            "normal_results": 0
        }
        
        for report in reports:
            for analysis in report.get("analysis_results", []):
                test_name = analysis["test_name"].lower()
                
                if "glucose" in test_name or "sugar" in test_name:
                    trends["blood_sugar"].append({
                        "date": report["test_date"],
                        "value": analysis["value"],
                        "status": analysis["status"]
                    })
                elif "cholesterol" in test_name:
                    trends["cholesterol"].append({
                        "date": report["test_date"],
                        "value": analysis["value"],
                        "status": analysis["status"]
                    })
                elif "hemoglobin" in test_name:
                    trends["hemoglobin"].append({
                        "date": report["test_date"],
                        "value": analysis["value"],
                        "status": analysis["status"]
                    })
                
                if analysis["status"] == "critical":
                    trends["critical_alerts"] += 1
                elif analysis["status"] == "normal":
                    trends["normal_results"] += 1
        
        return trends
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")
