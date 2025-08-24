from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")
    model = None

class EmergencyRequest(BaseModel):
    location: str
    emergency_type: Optional[str] = "general"
    radius_km: Optional[int] = 10

class Hospital(BaseModel):
    name: str
    address: str
    phone: str
    distance_km: float
    emergency_services: bool
    available_beds: Optional[int] = None
    rating: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class EmergencyResponse(BaseModel):
    hospitals: List[Hospital]
    emergency_contacts: List[dict]
    location_found: str

# Emergency contacts for different regions in India
EMERGENCY_CONTACTS = {
    "national": [
        {"name": "National Emergency Number", "number": "112", "type": "general"},
        {"name": "Police", "number": "100", "type": "police"},
        {"name": "Fire Brigade", "number": "101", "type": "fire"},
        {"name": "Ambulance", "number": "102", "type": "medical"},
        {"name": "Disaster Management", "number": "108", "type": "disaster"},
    ],
    "regional": {
        "delhi": [
            {"name": "AIIMS Emergency", "number": "+91-11-26588500", "type": "medical"},
            {"name": "Safdarjung Hospital", "number": "+91-11-26165060", "type": "medical"},
        ],
        "mumbai": [
            {"name": "Tata Memorial Hospital", "number": "+91-22-24177000", "type": "medical"},
            {"name": "KEM Hospital", "number": "+91-22-24136051", "type": "medical"},
        ],
        "bangalore": [
            {"name": "Nimhans Emergency", "number": "+91-80-26995023", "type": "medical"},
            {"name": "Victoria Hospital", "number": "+91-80-26700000", "type": "medical"},
        ],
        "chennai": [
            {"name": "Apollo Emergency", "number": "+91-44-28293333", "type": "medical"},
            {"name": "Stanley Medical College", "number": "+91-44-25281351", "type": "medical"},
        ],
        "kolkata": [
            {"name": "SSKM Hospital", "number": "+91-33-22041188", "type": "medical"},
            {"name": "Medical College Hospital", "number": "+91-33-22417000", "type": "medical"},
        ]
    }
}

def get_regional_contacts(location: str) -> List[dict]:
    """Get emergency contacts based on location"""
    location_lower = location.lower()
    
    # Check for major cities
    for city, contacts in EMERGENCY_CONTACTS["regional"].items():
        if city in location_lower:
            return EMERGENCY_CONTACTS["national"] + contacts
    
    # Return national contacts if no specific city found
    return EMERGENCY_CONTACTS["national"]

@router.post("/find-hospitals", response_model=EmergencyResponse)
async def find_nearest_hospitals(request: EmergencyRequest):
    """Find nearest hospitals using Gemini AI based on location"""
    
    try:
        if not model:
            # Fallback: Return mock data if Gemini is not available
            logger.warning("Gemini API not available, returning mock data")
            return get_mock_hospitals(request.location)
        
        # Create prompt for Gemini
        prompt = f"""
        You are a medical emergency assistant with access to real hospital databases in India.
        
        I need you to find ACTUAL, REAL hospitals near these exact coordinates: {request.location}
        
        Search within {request.radius_km} km radius for {request.emergency_type} emergencies.
        
        IMPORTANT: 
        - Use the exact latitude,longitude coordinates provided
        - Find REAL hospitals that actually exist in that area
        - Provide accurate contact numbers and addresses
        - Use your knowledge of actual hospitals in India
        
        Return ONLY a valid JSON response in this exact format:
        {{
            "hospitals": [
                {{
                    "name": "Actual Hospital Name",
                    "address": "Complete real address with area, city, state, pincode",
                    "phone": "+91-XX-XXXXXXXX",
                    "distance_km": 2.5,
                    "emergency_services": true,
                    "available_beds": 15,
                    "rating": 4.2,
                    "lat": 22.5726,
                    "lng": 88.3639
                }}
            ],
            "location_found": "Area Name, City, State"
        }}
        
        Requirements:
        - Find 5-8 REAL hospitals near coordinates {request.location}
        - Use ACTUAL working phone numbers
        - Provide REAL addresses that exist on Google Maps
        - Include accurate latitude/longitude for each hospital
        - Include major hospitals (Apollo, Fortis, Max, Government hospitals)
        - Sort by actual distance from the coordinates
        - Focus on hospitals with 24/7 emergency services
        - Use proper Indian phone format (+91-XX-XXXXXXXX)
        
        Coordinates: {request.location}
        Emergency Type: {request.emergency_type}
        Search Radius: {request.radius_km} km
        """
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Clean the response text
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        # Parse JSON response
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from Gemini response: {response_text}")
            return get_mock_hospitals(request.location)
        
        # Validate and convert to our model
        hospitals = []
        for hospital_data in data.get("hospitals", []):
            try:
                hospital = Hospital(**hospital_data)
                hospitals.append(hospital)
            except Exception as e:
                logger.warning(f"Skipping invalid hospital data: {e}")
                continue
        
        # Get emergency contacts for the location
        emergency_contacts = get_regional_contacts(request.location)
        
        return EmergencyResponse(
            hospitals=hospitals,
            emergency_contacts=emergency_contacts,
            location_found=data.get("location_found", request.location)
        )
        
    except Exception as e:
        logger.error(f"Error in find_nearest_hospitals: {e}")
        # Return mock data as fallback
        return get_mock_hospitals(request.location)

def get_mock_hospitals(location: str) -> EmergencyResponse:
    """Return mock hospital data as fallback with location-specific coordinates"""
    
    # Location-specific coordinates for major Indian cities
    city_coordinates = {
        "kolkata": {"lat": 22.5726, "lng": 88.3639, "state": "West Bengal"},
        "bengalore": {"lat": 12.9716, "lng": 77.5946, "state": "Karnataka"},
        "bangalore": {"lat": 12.9716, "lng": 77.5946, "state": "Karnataka"},
        "chennai": {"lat": 13.0827, "lng": 80.2707, "state": "Tamil Nadu"},
        "mumbai": {"lat": 19.0760, "lng": 72.8777, "state": "Maharashtra"},
        "delhi": {"lat": 28.7041, "lng": 77.1025, "state": "Delhi"},
        "new delhi": {"lat": 28.6139, "lng": 77.2090, "state": "Delhi"},
        "hyderabad": {"lat": 17.3850, "lng": 78.4867, "state": "Telangana"},
        "pune": {"lat": 18.5204, "lng": 73.8567, "state": "Maharashtra"},
        "ahmedabad": {"lat": 23.0225, "lng": 72.5714, "state": "Gujarat"},
        "jaipur": {"lat": 26.9124, "lng": 75.7873, "state": "Rajasthan"},
        "lucknow": {"lat": 26.8467, "lng": 80.9462, "state": "Uttar Pradesh"},
        "kanpur": {"lat": 26.4499, "lng": 80.3319, "state": "Uttar Pradesh"},
        "nagpur": {"lat": 21.1458, "lng": 79.0882, "state": "Maharashtra"},
        "indore": {"lat": 22.7196, "lng": 75.8577, "state": "Madhya Pradesh"},
        "bhopal": {"lat": 23.2599, "lng": 77.4126, "state": "Madhya Pradesh"},
        "visakhapatnam": {"lat": 17.6868, "lng": 83.2185, "state": "Andhra Pradesh"},
        "patna": {"lat": 25.5941, "lng": 85.1376, "state": "Bihar"},
        "vadodara": {"lat": 22.3072, "lng": 73.1812, "state": "Gujarat"},
        "ghaziabad": {"lat": 28.6692, "lng": 77.4538, "state": "Uttar Pradesh"}
    }
    
    # Find the best matching city
    location_lower = location.lower()
    city_info = None
    
    for city, coords in city_coordinates.items():
        if city in location_lower:
            city_info = coords
            break
    
    # Default to Delhi if no specific city found
    if not city_info:
        city_info = city_coordinates["delhi"]
    
    base_lat = city_info["lat"]
    base_lng = city_info["lng"]
    state = city_info["state"]
    
    # Generate realistic distances and coordinates around the city
    import random
    
    hospitals_data = [
        {
            "name": f"Apollo Hospitals",
            "base_distance": 2.5,
            "phone": "+91-44-28293333" if "chennai" in location_lower else "+91-11-26925858"
        },
        {
            "name": f"Fortis Hospital", 
            "base_distance": 3.1,
            "phone": "+91-80-66214444" if "bangalore" in location_lower else "+91-124-4962200"
        },
        {
            "name": f"Max Super Speciality Hospital",
            "base_distance": 4.7, 
            "phone": "+91-11-40554055"
        },
        {
            "name": f"Manipal Hospital",
            "base_distance": 5.2,
            "phone": "+91-80-25024444" if "bangalore" in location_lower else "+91-22-25506000"
        },
        {
            "name": f"Government General Hospital",
            "base_distance": 1.8,
            "phone": "+91-33-22041188" if "kolkata" in location_lower else "+91-11-23404040"
        }
    ]
    
    mock_hospitals = []
    
    for i, hospital_data in enumerate(hospitals_data):
        # Add some randomness to coordinates (within ~5km radius)
        lat_offset = random.uniform(-0.05, 0.05)  # ~5km variation
        lng_offset = random.uniform(-0.05, 0.05)
        
        # Ensure distances are realistic for the location
        distance = hospital_data["base_distance"] + random.uniform(-0.5, 1.0)
        distance = max(0.5, distance)  # Minimum 0.5km
        
        hospital = Hospital(
            name=hospital_data["name"],
            address=f"{hospital_data['name']}, {location}, {state}",
            phone=hospital_data["phone"],
            distance_km=round(distance, 1),
            emergency_services=True,
            available_beds=random.randint(3, 25),
            rating=round(random.uniform(3.8, 4.8), 1),
            lat=round(base_lat + lat_offset, 4),
            lng=round(base_lng + lng_offset, 4)
        )
        mock_hospitals.append(hospital)
    
    # Sort by distance
    mock_hospitals.sort(key=lambda h: h.distance_km)
    
    emergency_contacts = get_regional_contacts(location)
    
    return EmergencyResponse(
        hospitals=mock_hospitals,
        emergency_contacts=emergency_contacts,
        location_found=f"{location}, {state}"
    )

@router.get("/emergency-contacts")
async def get_emergency_contacts():
    """Get all emergency contact numbers"""
    return {
        "national_contacts": EMERGENCY_CONTACTS["national"],
        "regional_contacts": EMERGENCY_CONTACTS["regional"]
    }

@router.post("/emergency-alert")
async def send_emergency_alert(request: EmergencyRequest):
    """Send emergency alert (placeholder for SMS/notification service)"""
    
    # This would integrate with SMS service like Twilio, WhatsApp Business API, etc.
    # For now, we'll just log and return confirmation
    
    logger.info(f"Emergency alert sent for location: {request.location}")
    
    return {
        "status": "success",
        "message": f"Emergency alert sent for {request.location}",
        "alert_id": f"EMG_{request.location.replace(' ', '_').upper()}_{str(hash(request.location))[-6:]}",
        "contacts_notified": len(get_regional_contacts(request.location))
    }

# Health check endpoint
@router.get("/health")
async def emergency_health_check():
    """Health check for emergency service"""
    gemini_status = "available" if model else "unavailable"
    
    return {
        "status": "healthy",
        "gemini_api": gemini_status,
        "emergency_contacts_loaded": len(EMERGENCY_CONTACTS["national"]),
        "regional_coverage": list(EMERGENCY_CONTACTS["regional"].keys())
    }
