import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class MockDatabase:
    """Mock database for development when MongoDB is not available"""
    
    def __init__(self):
        self.data = {
            "users": [
                {
                    "_id": "patient1",
                    "username": "John Patient",
                    "email": "patient@example.com",
                    "password": "$2b$12$LKR6uPqRxMdyDzZdqWoXTuOH6C7Y1vA3.NmX9i8gQrSt5WwYvB3XK",  # password123
                    "role": "patient",
                    "created_at": "2024-01-15T10:00:00"
                },
                {
                    "_id": "doctor1", 
                    "username": "Dr. Sarah Wilson",
                    "email": "sarah.wilson@hospital.com",
                    "password": "$2b$12$LKR6uPqRxMdyDzZdqWoXTuOH6C7Y1vA3.NmX9i8gQrSt5WwYvB3XK",  # password123
                    "role": "doctor",
                    "license_number": "MD12345",
                    "specialization": "Cardiology",
                    "experience": 8,
                    "verification_status": "approved",
                    "is_verified": True,
                    "aadhaar_card_path": "uploads/sarah_aadhaar.jpg",
                    "doctor_certificate_path": "uploads/sarah_certificate.jpg",
                    "created_at": "2024-01-10T10:00:00",
                    "approved_at": "2024-01-12T15:30:00"
                },
                {
                    "_id": "doctor2",
                    "username": "Dr. Michael Chen", 
                    "email": "michael.chen@clinic.com",
                    "password": "$2b$12$LKR6uPqRxMdyDzZdqWoXTuOH6C7Y1vA3.NmX9i8gQrSt5WwYvB3XK",  # password123
                    "role": "doctor",
                    "license_number": "MD67890",
                    "specialization": "Neurology", 
                    "experience": 12,
                    "verification_status": "pending",
                    "is_verified": False,
                    "aadhaar_card_path": "uploads/michael_aadhaar.jpg", 
                    "doctor_certificate_path": "uploads/michael_certificate.jpg",
                    "created_at": "2024-01-20T10:00:00"
                },
                {
                    "_id": "doctor3",
                    "username": "Dr. Priya Sharma",
                    "email": "priya.sharma@medify.com", 
                    "password": "$2b$12$LKR6uPqRxMdyDzZdqWoXTuOH6C7Y1vA3.NmX9i8gQrSt5WwYvB3XK",  # password123
                    "role": "doctor",
                    "license_number": "MD11111",
                    "specialization": "Dermatology",
                    "experience": 6,
                    "verification_status": "approved", 
                    "is_verified": True,
                    "aadhaar_card_path": "uploads/priya_aadhaar.jpg",
                    "doctor_certificate_path": "uploads/priya_certificate.jpg", 
                    "created_at": "2024-01-05T10:00:00",
                    "approved_at": "2024-01-08T14:20:00"
                }
            ],
            "chats": [],
            "system_settings": []
        }
        self.load_from_file()
        self.add_sample_data()
    
    def add_sample_data(self):
        """Add sample data if database is empty"""
        if len(self.data["users"]) == 0:
            # Add sample approved doctors
            sample_doctors = [
                {
                    "_id": "doctor1",
                    "username": "Dr. Sarah Wilson",
                    "email": "sarah.wilson@medify.com",
                    "password": "hashed_password",
                    "role": "doctor",
                    "license_number": "MD12345",
                    "specialization": "Cardiologist",
                    "experience": 8,
                    "verification_status": "approved",
                    "is_verified": True,
                    "created_at": "2024-01-15T10:30:00Z",
                    "approved_at": "2024-01-16T09:15:00Z"
                },
                {
                    "_id": "doctor2",
                    "username": "Dr. Michael Chen",
                    "email": "michael.chen@medify.com",
                    "password": "hashed_password",
                    "role": "doctor",
                    "license_number": "MD67890",
                    "specialization": "Dermatologist",
                    "experience": 12,
                    "verification_status": "approved",
                    "is_verified": True,
                    "created_at": "2024-01-20T14:20:00Z",
                    "approved_at": "2024-01-21T11:30:00Z"
                },
                {
                    "_id": "doctor3",
                    "username": "Dr. Priya Sharma",
                    "email": "priya.sharma@medify.com",
                    "password": "hashed_password",
                    "role": "doctor",
                    "license_number": "MD11111",
                    "specialization": "Pediatrician",
                    "experience": 6,
                    "verification_status": "pending",
                    "is_verified": False,
                    "created_at": "2024-02-01T16:45:00Z",
                    "aadhaar_card_path": "uploads/priya_aadhaar.jpg",
                    "doctor_certificate_path": "uploads/priya_certificate.jpg"
                },
                {
                    "_id": "doctor4",
                    "username": "Dr. Raj Patel",
                    "email": "raj.patel@medify.com",
                    "password": "hashed_password",
                    "role": "doctor",
                    "license_number": "MD22222",
                    "specialization": "Orthopedic",
                    "experience": 15,
                    "verification_status": "approved",
                    "is_verified": True,
                    "created_at": "2024-01-25T09:10:00Z",
                    "approved_at": "2024-01-26T13:45:00Z"
                }
            ]
            
            self.data["users"].extend(sample_doctors)
            self.save_to_file()
            print("📝 Added sample doctors to mock database")
    
    def save_to_file(self):
        """Save data to a JSON file for persistence"""
        try:
            with open("mock_db.json", "w") as f:
                # Convert datetime objects to strings for JSON serialization
                serializable_data = self._make_serializable(self.data)
                json.dump(serializable_data, f, indent=2)
        except Exception as e:
            print(f"Error saving mock database: {e}")
    
    def load_from_file(self):
        """Load data from JSON file if it exists"""
        try:
            if os.path.exists("mock_db.json"):
                with open("mock_db.json", "r") as f:
                    self.data = json.load(f)
            else:
                # Initialize with sample data if no file exists
                self.initialize_sample_data()
        except Exception as e:
            print(f"Error loading mock database: {e}")
            self.initialize_sample_data()
    
    def initialize_sample_data(self):
        """Initialize database with sample data"""
        from datetime import datetime
        
        # Sample users with different roles
        sample_users = [
            {
                "_id": "patient1",
                "username": "John Doe",
                "email": "john@example.com",
                "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LTy2mF1b5dM3bpOr2",  # hashed "password123"
                "role": "patient",
                "created_at": datetime.now().isoformat(),
                "is_verified": True,
                "verification_status": "approved"
            },
            {
                "_id": "doctor1",
                "username": "Dr. Sarah Wilson",
                "email": "sarah.wilson@hospital.com",
                "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LTy2mF1b5dM3bpOr2",  # hashed "password123"
                "role": "doctor",
                "license_number": "MD12345",
                "specialization": "Cardiology",
                "experience": 8,
                "aadhaar_card_path": "uploads/sarah_aadhaar.jpg",
                "doctor_certificate_path": "uploads/sarah_certificate.jpg",
                "created_at": datetime.now().isoformat(),
                "is_verified": True,
                "verification_status": "approved"
            },
            {
                "_id": "doctor2",
                "username": "Dr. Michael Chen",
                "email": "michael.chen@clinic.com",
                "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LTy2mF1b5dM3bpOr2",
                "role": "doctor",
                "license_number": "MD67890",
                "specialization": "Neurology",
                "experience": 12,
                "aadhaar_card_path": "uploads/michael_aadhaar.jpg",
                "doctor_certificate_path": "uploads/michael_certificate.jpg",
                "created_at": datetime.now().isoformat(),
                "is_verified": True,
                "verification_status": "approved"
            },
            {
                "_id": "doctor3",
                "username": "Dr. Priya Sharma",
                "email": "priya.sharma@hospital.com",
                "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LTy2mF1b5dM3bpOr2",
                "role": "doctor",
                "license_number": "MD11111",
                "specialization": "Pediatrics",
                "experience": 6,
                "aadhaar_card_path": "uploads/priya_aadhaar.jpg",
                "doctor_certificate_path": "uploads/priya_certificate.jpg",
                "created_at": datetime.now().isoformat(),
                "is_verified": False,
                "verification_status": "pending"
            }
        ]
        
        self.data = {
            "users": sample_users,
            "chats": [],
            "system_settings": []
        }
    
    def _make_serializable(self, obj):
        """Convert datetime objects to strings for JSON serialization"""
        if isinstance(obj, dict):
            return {k: self._make_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        else:
            return obj
    
    def _generate_id(self) -> str:
        """Generate a simple ID"""
        import uuid
        return str(uuid.uuid4())
    
    # Collection-like interface
    def get_collection(self, name: str):
        if name not in self.data:
            self.data[name] = []
        return MockCollection(self, name)

class MockCollection:
    """Mock collection that mimics MongoDB collection interface"""
    
    def __init__(self, db: MockDatabase, name: str):
        self.db = db
        self.name = name
    
    @property
    def data(self) -> List[Dict]:
        return self.db.data[self.name]
    
    def find_one(self, query: Dict = None) -> Optional[Dict]:
        """Find one document matching the query"""
        if query is None:
            query = {}
        
        for doc in self.data:
            if self._matches_query(doc, query):
                return doc
        return None
    
    def find(self, query: Dict = None, projection: Dict = None) -> List[Dict]:
        """Find documents matching the query"""
        if query is None:
            query = {}
        
        results = []
        for doc in self.data:
            if self._matches_query(doc, query):
                if projection:
                    # Apply projection (exclude fields with 0)
                    filtered_doc = {}
                    for key, value in doc.items():
                        if key not in projection or projection[key] != 0:
                            filtered_doc[key] = value
                    results.append(filtered_doc)
                else:
                    results.append(doc.copy())
        return results
    
    def insert_one(self, document: Dict) -> 'MockInsertResult':
        """Insert one document"""
        doc_copy = document.copy()
        doc_copy["_id"] = self.db._generate_id()
        self.data.append(doc_copy)
        self.db.save_to_file()
        return MockInsertResult(doc_copy["_id"])
    
    def update_one(self, query: Dict, update: Dict) -> 'MockUpdateResult':
        """Update one document"""
        for i, doc in enumerate(self.data):
            if self._matches_query(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                elif "$push" in update:
                    for key, value in update["$push"].items():
                        if key not in doc:
                            doc[key] = []
                        doc[key].append(value)
                self.db.save_to_file()
                return MockUpdateResult(1)
        return MockUpdateResult(0)
    
    def delete_one(self, query: Dict) -> 'MockDeleteResult':
        """Delete one document"""
        for i, doc in enumerate(self.data):
            if self._matches_query(doc, query):
                del self.data[i]
                self.db.save_to_file()
                return MockDeleteResult(1)
        return MockDeleteResult(0)
    
    def count_documents(self, query: Dict = None) -> int:
        """Count documents matching the query"""
        if query is None:
            query = {}
        
        count = 0
        for doc in self.data:
            if self._matches_query(doc, query):
                count += 1
        return count
    
    def _matches_query(self, document: Dict, query: Dict) -> bool:
        """Check if document matches the query"""
        for key, value in query.items():
            if key not in document:
                return False
            if document[key] != value:
                return False
        return True

class MockInsertResult:
    def __init__(self, inserted_id: str):
        self.inserted_id = inserted_id

class MockUpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count

class MockDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count

# Global mock database instance
mock_db = MockDatabase()

def get_mock_db():
    """Get the mock database instance"""
    return mock_db
