from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"

class HealthMetricBase(BaseModel):
    type: str
    value: float
    unit: str
    notes: Optional[str] = None

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetric(HealthMetricBase):
    timestamp: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.PATIENT

class UserCreate(UserBase):
    password: str
    # Doctor-specific fields
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    health_metrics: List[HealthMetric] = []
    password_hash: Optional[str] = None
    # Doctor-specific fields
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    aadhaar_card_path: Optional[str] = None
    doctor_certificate_path: Optional[str] = None
    is_verified: Optional[bool] = False
    verification_status: Optional[str] = "pending"  # pending, approved, rejected

    class Config:
        from_attributes = True 
