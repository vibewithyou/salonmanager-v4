from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
import jwt
import bcrypt
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import asyncio
from contextlib import asynccontextmanager
import stripe
import logging

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/salonmanager")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
stripe.api_key = STRIPE_SECRET_KEY

# Database setup
client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.salonmanager
    print("✅ Connected to MongoDB")
    yield
    if client:
        client.close()
        print("✅ Disconnected from MongoDB")

# FastAPI app
app = FastAPI(
    title="SalonManager API",
    description="Complete Salon Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = "customer"  # customer, stylist, salon_owner, admin

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

class SalonBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    city: str
    postal_code: str
    country: str = "Deutschland"
    phone: str
    email: EmailStr
    website: Optional[str] = None
    opening_hours: Dict[str, Dict[str, str]] = {}  # {"monday": {"open": "09:00", "close": "18:00"}}
    services: List[Dict[str, Any]] = []
    images: List[str] = []

class SalonCreate(SalonBase):
    pass

class SalonResponse(SalonBase):
    id: str
    owner_id: str
    slug: str
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime
    updated_at: datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    category: str

class ServiceCreate(ServiceBase):
    salon_id: str

class ServiceResponse(ServiceBase):
    id: str
    salon_id: str
    created_at: datetime

class AppointmentBase(BaseModel):
    salon_id: str
    service_id: str
    stylist_id: Optional[str] = None
    appointment_date: datetime
    notes: Optional[str] = None
    customer_phone: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    customer_email: EmailStr
    customer_name: str

class AppointmentResponse(AppointmentBase):
    id: str
    customer_id: str
    status: str  # pending, confirmed, completed, cancelled
    total_price: float
    created_at: datetime
    updated_at: datetime

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60*24*7)  # 7 days
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        user["id"] = str(user["_id"])
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Endpoints

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password and create user
    hashed_password = hash_password(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_password
    user_data["id"] = str(uuid.uuid4())
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    
    await db.users.insert_one(user_data)
    
    # Remove password from response
    del user_data["password"]
    return UserResponse(**user_data)

@app.post("/api/auth/login")
async def login(email: EmailStr, password: str):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["email"]})
    user["id"] = str(user["_id"])
    del user["password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# Salon endpoints
@app.get("/api/salons", response_model=List[SalonResponse])
async def get_salons(skip: int = 0, limit: int = 20):
    salons = await db.salons.find().skip(skip).limit(limit).to_list(length=limit)
    for salon in salons:
        salon["id"] = str(salon["_id"])
    return salons

@app.get("/api/salons/{salon_id}", response_model=SalonResponse)
async def get_salon(salon_id: str):
    try:
        salon = await db.salons.find_one({"$or": [{"_id": ObjectId(salon_id)}, {"slug": salon_id}]})
        if not salon:
            raise HTTPException(status_code=404, detail="Salon not found")
        
        salon["id"] = str(salon["_id"])
        return salon
    except Exception as e:
        raise HTTPException(status_code=404, detail="Salon not found")

@app.post("/api/salons", response_model=SalonResponse)
async def create_salon(salon: SalonCreate, current_user: dict = Depends(get_current_user)):
    salon_data = salon.dict()
    salon_data["id"] = str(uuid.uuid4())
    salon_data["owner_id"] = current_user["id"]
    salon_data["slug"] = salon.name.lower().replace(" ", "-").replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    salon_data["rating"] = 0.0
    salon_data["reviews_count"] = 0
    salon_data["created_at"] = datetime.utcnow()
    salon_data["updated_at"] = datetime.utcnow()
    
    await db.salons.insert_one(salon_data)
    salon_data["id"] = str(salon_data["_id"])
    return SalonResponse(**salon_data)

# Service endpoints
@app.get("/api/salons/{salon_id}/services", response_model=List[ServiceResponse])
async def get_salon_services(salon_id: str):
    services = await db.services.find({"salon_id": salon_id}).to_list(length=None)
    for service in services:
        service["id"] = str(service["_id"])
    return services

@app.post("/api/services", response_model=ServiceResponse)
async def create_service(service: ServiceCreate, current_user: dict = Depends(get_current_user)):
    service_data = service.dict()
    service_data["id"] = str(uuid.uuid4())
    service_data["created_at"] = datetime.utcnow()
    
    await db.services.insert_one(service_data)
    service_data["id"] = str(service_data["_id"])
    return ServiceResponse(**service_data)

# Appointment endpoints
@app.get("/api/appointments", response_model=List[AppointmentResponse])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    filter_query = {}
    if current_user["role"] == "customer":
        filter_query["customer_id"] = current_user["id"]
    elif current_user["role"] == "stylist":
        filter_query["stylist_id"] = current_user["id"]
    
    appointments = await db.appointments.find(filter_query).to_list(length=None)
    for appointment in appointments:
        appointment["id"] = str(appointment["_id"])
    return appointments

@app.post("/api/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate):
    # Get service details for pricing
    service = await db.services.find_one({"_id": ObjectId(appointment.service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Create customer if not exists
    customer = await db.users.find_one({"email": appointment.customer_email})
    if not customer:
        customer_data = {
            "id": str(uuid.uuid4()),
            "email": appointment.customer_email,
            "first_name": appointment.customer_name.split(" ")[0],
            "last_name": " ".join(appointment.customer_name.split(" ")[1:]) if " " in appointment.customer_name else "",
            "role": "customer",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(customer_data)
        customer_id = customer_data["id"]
    else:
        customer_id = str(customer["_id"])
    
    appointment_data = appointment.dict()
    appointment_data["id"] = str(uuid.uuid4())
    appointment_data["customer_id"] = customer_id
    appointment_data["status"] = "pending"
    appointment_data["total_price"] = service["price"]
    appointment_data["created_at"] = datetime.utcnow()
    appointment_data["updated_at"] = datetime.utcnow()
    
    # Remove fields that shouldn't be stored
    del appointment_data["customer_email"]
    del appointment_data["customer_name"]
    
    await db.appointments.insert_one(appointment_data)
    appointment_data["id"] = str(appointment_data["_id"])
    return AppointmentResponse(**appointment_data)

@app.put("/api/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str, 
    status: str, 
    current_user: dict = Depends(get_current_user)
):
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Status updated successfully"}

# Payment endpoints
@app.post("/api/payments/create-intent")
async def create_payment_intent(appointment_id: str, current_user: dict = Depends(get_current_user)):
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(appointment["total_price"] * 100),  # Convert to cents
            currency='eur',
            automatic_payment_methods={'enabled': True},
            metadata={'appointment_id': appointment_id}
        )
        
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Search and filter endpoints
@app.get("/api/search/salons")
async def search_salons(
    q: Optional[str] = None,
    city: Optional[str] = None,
    service: Optional[str] = None,
    min_rating: Optional[float] = None
):
    filter_query = {}
    
    if q:
        filter_query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    
    if min_rating:
        filter_query["rating"] = {"$gte": min_rating}
    
    salons = await db.salons.find(filter_query).limit(20).to_list(length=20)
    for salon in salons:
        salon["id"] = str(salon["_id"])
    
    return salons

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)