from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timedelta, date, time
from enum import Enum
import os
import jwt
import bcrypt
import uuid
import json
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import asyncio
from contextlib import asynccontextmanager
import stripe
import logging
import aiofiles
import openai
from io import BytesIO
import csv
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import qrcode
import base64
from PIL import Image

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/salonmanager")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

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
    description="Complete Salon Management System API with all features",
    version="2.0.0",
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

# Enums
class UserRole(str, Enum):
    CUSTOMER = "customer"
    STYLIST = "stylist" 
    SALON_OWNER = "salon_owner"
    ADMIN = "admin"

class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

# Extended Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    language: str = "de"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    last_login: Optional[datetime] = None

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
    opening_hours: Dict[str, Dict[str, str]] = {}
    services: List[Dict[str, Any]] = []
    images: List[str] = []
    location: Optional[Dict[str, float]] = None  # {lat: 52.5, lng: 13.4}
    amenities: List[str] = []
    price_range: str = "€€"  # €, €€, €€€
    instagram: Optional[str] = None
    facebook: Optional[str] = None

class SalonCreate(SalonBase):
    pass

class SalonResponse(SalonBase):
    id: str
    owner_id: str
    slug: str
    rating: float = 0.0
    reviews_count: int = 0
    verified: bool = False
    featured: bool = False
    created_at: datetime
    updated_at: datetime

class StylistBase(BaseModel):
    salon_id: str
    user_id: str
    specialties: List[str] = []
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    languages: List[str] = ["de"]
    working_hours: Dict[str, Dict[str, str]] = {}
    is_available: bool = True

class StylistCreate(StylistBase):
    pass

class StylistResponse(StylistBase):
    id: str
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    category: str
    salon_id: str
    stylist_ids: List[str] = []  # Which stylists offer this service

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    updated_at: datetime

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
    status: AppointmentStatus = AppointmentStatus.PENDING
    total_price: float
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_intent_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    is_anonymous: bool = False

class ReviewCreate(ReviewBase):
    salon_id: Optional[str] = None
    stylist_id: Optional[str] = None
    appointment_id: Optional[str] = None

class ReviewResponse(ReviewBase):
    id: str
    customer_id: str
    salon_id: Optional[str]
    stylist_id: Optional[str]
    created_at: datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    salon_id: str
    stock_quantity: int = 0
    sku: Optional[str] = None
    images: List[str] = []
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

class VoucherBase(BaseModel):
    code: str
    value: float
    voucher_type: str  # "percentage" or "fixed"
    salon_id: str
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    min_purchase_amount: Optional[float] = None

class VoucherCreate(VoucherBase):
    pass

class VoucherResponse(VoucherBase):
    id: str
    used_count: int = 0
    is_active: bool = True
    created_at: datetime

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
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_slug(text: str) -> str:
    """Generate URL-friendly slug from text"""
    slug = text.lower().strip()
    slug = slug.replace(" ", "-").replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    return slug[:50]  # Limit length

async def send_email(to_email: str, subject: str, content: str):
    """Send email notification (placeholder - integrate with email service)"""
    # TODO: Integrate with email service like SendGrid, Mailgun, etc.
    print(f"📧 Email to {to_email}: {subject}")
    return True

def generate_qr_code(data: str) -> str:
    """Generate QR code and return base64 encoded image"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

# API Endpoints

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "version": "2.0.0",
        "features": ["authentication", "salons", "appointments", "payments", "ai", "pwa"]
    }

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_data = user.dict()
    user_data["password"] = hash_password(user.password)
    user_data["id"] = str(uuid.uuid4())
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    user_data["is_active"] = True
    
    await db.users.insert_one(user_data)
    del user_data["password"]
    return UserResponse(**user_data)

@app.post("/api/auth/login")
async def login(email: EmailStr, password: str):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]}, 
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(data={"sub": user["email"]})
    user["id"] = str(user["_id"])
    del user["password"]
    del user["_id"]  # Remove ObjectId to avoid serialization issues
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# Salon endpoints (extended)
@app.get("/api/salons", response_model=List[SalonResponse])
async def get_salons(
    skip: int = 0, 
    limit: int = 20,
    city: Optional[str] = None,
    q: Optional[str] = None,
    min_rating: Optional[float] = None,
    service: Optional[str] = None,
    featured: Optional[bool] = None
):
    filter_query = {}
    
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    if q:
        filter_query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    if min_rating:
        filter_query["rating"] = {"$gte": min_rating}
    if featured:
        filter_query["featured"] = True
    
    salons = await db.salons.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    for salon in salons:
        salon["id"] = str(salon["_id"])
    return salons

@app.get("/api/salons/{salon_id}", response_model=SalonResponse)
async def get_salon(salon_id: str):
    try:
        if ObjectId.is_valid(salon_id):
            salon = await db.salons.find_one({"_id": ObjectId(salon_id)})
        else:
            salon = await db.salons.find_one({"slug": salon_id})
            
        if not salon:
            raise HTTPException(status_code=404, detail="Salon not found")
        
        salon["id"] = str(salon["_id"])
        return salon
    except Exception as e:
        raise HTTPException(status_code=404, detail="Salon not found")

@app.post("/api/salons", response_model=SalonResponse)
async def create_salon(salon: SalonCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["salon_owner", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to create salons")
    
    salon_data = salon.dict()
    salon_data["id"] = str(uuid.uuid4())
    salon_data["owner_id"] = current_user["id"]
    salon_data["slug"] = generate_slug(salon.name)
    salon_data["rating"] = 0.0
    salon_data["reviews_count"] = 0
    salon_data["verified"] = False
    salon_data["featured"] = False
    salon_data["created_at"] = datetime.utcnow()
    salon_data["updated_at"] = datetime.utcnow()
    
    await db.salons.insert_one(salon_data)
    salon_data["id"] = str(salon_data["_id"])
    return SalonResponse(**salon_data)

# Stylist endpoints
@app.get("/api/salons/{salon_id}/stylists")
async def get_salon_stylists(salon_id: str):
    stylists = await db.stylists.find({"salon_id": salon_id}).to_list(length=None)
    
    # Get user details for each stylist
    for stylist in stylists:
        stylist["id"] = str(stylist["_id"])
        # Remove ObjectId to avoid serialization issues
        del stylist["_id"]
        
        try:
            if ObjectId.is_valid(stylist["user_id"]):
                user = await db.users.find_one({"id": stylist["user_id"]})
            else:
                user = await db.users.find_one({"id": stylist["user_id"]})
                
            if user:
                stylist["user"] = {
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "avatar_url": user.get("avatar_url")
                }
        except:
            stylist["user"] = {
                "first_name": "Unknown",
                "last_name": "User",
                "avatar_url": None
            }
    
    return stylists

@app.post("/api/stylists", response_model=StylistResponse)
async def create_stylist(stylist: StylistCreate, current_user: dict = Depends(get_current_user)):
    stylist_data = stylist.dict()
    stylist_data["id"] = str(uuid.uuid4())
    stylist_data["created_at"] = datetime.utcnow()
    stylist_data["rating"] = 0.0
    stylist_data["reviews_count"] = 0
    
    await db.stylists.insert_one(stylist_data)
    stylist_data["id"] = str(stylist_data["_id"])
    return StylistResponse(**stylist_data)

# Service endpoints (extended)
@app.get("/api/salons/{salon_id}/services", response_model=List[ServiceResponse])
async def get_salon_services(salon_id: str):
    services = await db.services.find({"salon_id": salon_id}).to_list(length=None)
    for service in services:
        service["id"] = str(service["_id"])
    return services

@app.post("/api/services", response_model=ServiceResponse)
async def create_service(service: ServiceBase, current_user: dict = Depends(get_current_user)):
    service_data = service.dict()
    service_data["id"] = str(uuid.uuid4())
    service_data["created_at"] = datetime.utcnow()
    service_data["updated_at"] = datetime.utcnow()
    
    await db.services.insert_one(service_data)
    service_data["id"] = str(service_data["_id"])
    return ServiceResponse(**service_data)

# Appointment endpoints (extended)
@app.get("/api/appointments", response_model=List[AppointmentResponse])
async def get_appointments(
    current_user: dict = Depends(get_current_user),
    status: Optional[AppointmentStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    filter_query = {}
    
    if current_user["role"] == "customer":
        filter_query["customer_id"] = current_user["id"]
    elif current_user["role"] == "stylist":
        filter_query["stylist_id"] = current_user["id"]
    elif current_user["role"] == "salon_owner":
        # Get salons owned by user
        salons = await db.salons.find({"owner_id": current_user["id"]}).to_list(length=None)
        salon_ids = [str(salon["_id"]) for salon in salons]
        filter_query["salon_id"] = {"$in": salon_ids}
    
    if status:
        filter_query["status"] = status
    if date_from:
        filter_query["appointment_date"] = {"$gte": datetime.combine(date_from, time.min)}
    if date_to:
        if "appointment_date" in filter_query:
            filter_query["appointment_date"]["$lte"] = datetime.combine(date_to, time.max)
        else:
            filter_query["appointment_date"] = {"$lte": datetime.combine(date_to, time.max)}
    
    appointments = await db.appointments.find(filter_query).to_list(length=None)
    for appointment in appointments:
        appointment["id"] = str(appointment["_id"])
    return appointments

@app.post("/api/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, background_tasks: BackgroundTasks):
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
            "language": "de",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        await db.users.insert_one(customer_data)
        customer_id = customer_data["id"]
    else:
        customer_id = str(customer["_id"])
    
    appointment_data = appointment.dict()
    appointment_data["id"] = str(uuid.uuid4())
    appointment_data["customer_id"] = customer_id
    appointment_data["status"] = AppointmentStatus.PENDING
    appointment_data["payment_status"] = PaymentStatus.PENDING
    appointment_data["total_price"] = service["price"]
    appointment_data["created_at"] = datetime.utcnow()
    appointment_data["updated_at"] = datetime.utcnow()
    
    # Remove fields that shouldn't be stored
    del appointment_data["customer_email"]
    del appointment_data["customer_name"]
    
    await db.appointments.insert_one(appointment_data)
    
    # Send confirmation email
    background_tasks.add_task(
        send_email,
        appointment.customer_email,
        "Terminbestätigung",
        f"Ihr Termin am {appointment.appointment_date} wurde erfolgreich gebucht."
    )
    
    appointment_data["id"] = str(appointment_data["_id"])
    return AppointmentResponse(**appointment_data)

@app.put("/api/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str, 
    status: AppointmentStatus,
    current_user: dict = Depends(get_current_user)
):
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Status updated successfully"}

# Available slots endpoint
@app.get("/api/appointments/available-slots")
async def get_available_slots(
    salon_id: str,
    service_id: str,
    date: str,  # YYYY-MM-DD format
    stylist_id: Optional[str] = None
):
    """Get available time slots for a specific date"""
    try:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get salon opening hours for the day
    salon = await db.salons.find_one({"_id": ObjectId(salon_id)})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    
    # Get service duration
    service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get existing appointments for the date
    start_of_day = datetime.combine(appointment_date, time.min)
    end_of_day = datetime.combine(appointment_date, time.max)
    
    filter_query = {
        "salon_id": salon_id,
        "appointment_date": {"$gte": start_of_day, "$lte": end_of_day},
        "status": {"$nin": ["cancelled"]}
    }
    
    if stylist_id:
        filter_query["stylist_id"] = stylist_id
    
    booked_appointments = await db.appointments.find(filter_query).to_list(length=None)
    
    # Generate available slots (simplified logic)
    day_name = appointment_date.strftime("%A").lower()
    opening_hours = salon.get("opening_hours", {}).get(day_name, {"open": "09:00", "close": "18:00"})
    
    available_slots = []
    current_time = datetime.strptime(opening_hours["open"], "%H:%M").time()
    end_time = datetime.strptime(opening_hours["close"], "%H:%M").time()
    
    while current_time < end_time:
        slot_datetime = datetime.combine(appointment_date, current_time)
        
        # Check if slot is available (simplified - should check actual appointment duration)
        is_available = True
        for appointment in booked_appointments:
            if appointment["appointment_date"] == slot_datetime:
                is_available = False
                break
        
        if is_available:
            available_slots.append(slot_datetime.isoformat())
        
        # Move to next slot (30 min intervals)
        current_time = (datetime.combine(appointment_date, current_time) + timedelta(minutes=30)).time()
    
    return {"available_slots": available_slots}

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
            metadata={
                'appointment_id': appointment_id,
                'customer_id': appointment["customer_id"]
            }
        )
        
        # Update appointment with payment intent
        await db.appointments.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"payment_intent_id": intent.id}}
        )
        
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/payments/confirm")
async def confirm_payment(payment_intent_id: str):
    # Update appointment payment status
    await db.appointments.update_one(
        {"payment_intent_id": payment_intent_id},
        {"$set": {"payment_status": PaymentStatus.PAID, "status": AppointmentStatus.CONFIRMED}}
    )
    
    return {"message": "Payment confirmed"}

# Reviews endpoints
@app.post("/api/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_data = review.dict()
    review_data["id"] = str(uuid.uuid4())
    review_data["customer_id"] = current_user["id"]
    review_data["created_at"] = datetime.utcnow()
    
    await db.reviews.insert_one(review_data)
    
    # Update salon/stylist rating
    if review.salon_id:
        await update_salon_rating(review.salon_id)
    if review.stylist_id:
        await update_stylist_rating(review.stylist_id)
    
    review_data["id"] = str(review_data["_id"])
    return ReviewResponse(**review_data)

@app.get("/api/salons/{salon_id}/reviews")
async def get_salon_reviews(salon_id: str, skip: int = 0, limit: int = 20):
    reviews = await db.reviews.find({"salon_id": salon_id}).skip(skip).limit(limit).to_list(length=limit)
    
    for review in reviews:
        review["id"] = str(review["_id"])
        # Remove ObjectId to avoid serialization issues
        del review["_id"]
        # Get customer info
        try:
            if ObjectId.is_valid(review["customer_id"]):
                customer = await db.users.find_one({"id": review["customer_id"]})
            else:
                customer = await db.users.find_one({"id": review["customer_id"]})
            
            if customer and not review["is_anonymous"]:
                review["customer_name"] = f"{customer['first_name']} {customer['last_name'][0]}."
            else:
                review["customer_name"] = "Anonymer Kunde"
        except:
            review["customer_name"] = "Anonymer Kunde"
    
    return reviews

# Product/Shop endpoints
@app.get("/api/salons/{salon_id}/products")
async def get_salon_products(salon_id: str):
    products = await db.products.find({"salon_id": salon_id, "is_active": True}).to_list(length=None)
    for product in products:
        product["id"] = str(product["_id"])
    return products

@app.post("/api/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    product_data = product.dict()
    product_data["id"] = str(uuid.uuid4())
    product_data["created_at"] = datetime.utcnow()
    product_data["updated_at"] = datetime.utcnow()
    
    await db.products.insert_one(product_data)
    product_data["id"] = str(product_data["_id"])
    return ProductResponse(**product_data)

# Voucher endpoints
@app.post("/api/vouchers", response_model=VoucherResponse)
async def create_voucher(voucher: VoucherCreate, current_user: dict = Depends(get_current_user)):
    voucher_data = voucher.dict()
    voucher_data["id"] = str(uuid.uuid4())
    voucher_data["used_count"] = 0
    voucher_data["is_active"] = True
    voucher_data["created_at"] = datetime.utcnow()
    
    await db.vouchers.insert_one(voucher_data)
    voucher_data["id"] = str(voucher_data["_id"])
    return VoucherResponse(**voucher_data)

@app.get("/api/vouchers/{code}")
async def get_voucher(code: str):
    voucher = await db.vouchers.find_one({"code": code, "is_active": True})
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found or expired")
    
    # Check if voucher is still valid
    if voucher.get("valid_until") and voucher["valid_until"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Voucher has expired")
    
    if voucher.get("usage_limit") and voucher["used_count"] >= voucher["usage_limit"]:
        raise HTTPException(status_code=400, detail="Voucher usage limit reached")
    
    voucher["id"] = str(voucher["_id"])
    return voucher

# AI endpoints
@app.post("/api/ai/appointment-suggestions")
async def get_appointment_suggestions(
    customer_id: str, 
    preferences: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """AI-powered appointment suggestions based on customer history and preferences"""
    if not OPENAI_API_KEY:
        return {"suggestions": [], "message": "AI features not available"}
    
    # Get customer appointment history
    appointments = await db.appointments.find({
        "customer_id": customer_id,
        "status": "completed"
    }).limit(10).to_list(length=10)
    
    # Simple AI suggestion logic (could be enhanced with OpenAI)
    suggestions = [
        {
            "service": "Haarschnitt",
            "reason": "Basierend auf Ihren vorherigen Terminen",
            "confidence": 0.85
        },
        {
            "service": "Färbung",
            "reason": "Beliebter Service bei ähnlichen Kunden",
            "confidence": 0.72
        }
    ]
    
    return {"suggestions": suggestions}

@app.post("/api/ai/hairstyle-suggestions")
async def get_hairstyle_suggestions(file: UploadFile = File(...)):
    """AI hairstyle suggestions based on uploaded photo"""
    if not OPENAI_API_KEY:
        return {"suggestions": [], "message": "AI features not available"}
    
    # Save uploaded file temporarily
    content = await file.read()
    
    # Placeholder for AI analysis
    suggestions = [
        {
            "style": "Bob-Haarschnitt",
            "confidence": 0.88,
            "description": "Ein klassischer Bob würde gut zu Ihrer Gesichtsform passen"
        },
        {
            "style": "Pixie Cut",
            "confidence": 0.76,
            "description": "Ein mutiger, kurzer Schnitt für einen modernen Look"
        }
    ]
    
    return {"suggestions": suggestions}

# File upload endpoints
@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload image and return URL"""
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return URL (in production, this would be a CDN URL)
    image_url = f"/uploads/{unique_filename}"
    return {"url": image_url}

# QR Code endpoint
@app.get("/api/salons/{salon_id}/qr-code")
async def get_salon_qr_code(salon_id: str):
    salon = await db.salons.find_one({"_id": ObjectId(salon_id)})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    
    # Generate QR code for salon page
    salon_url = f"https://salonmanager.app/salon/{salon['slug']}"
    qr_code_base64 = generate_qr_code(salon_url)
    
    return {"qr_code": qr_code_base64, "url": salon_url}

# Analytics endpoints
@app.get("/api/analytics/salon/{salon_id}")
async def get_salon_analytics(
    salon_id: str, 
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: dict = Depends(get_current_user)
):
    if not date_from:
        date_from = (datetime.utcnow() - timedelta(days=30)).date()
    if not date_to:
        date_to = datetime.utcnow().date()
    
    # Get appointments in date range
    appointments = await db.appointments.find({
        "salon_id": salon_id,
        "appointment_date": {
            "$gte": datetime.combine(date_from, time.min),
            "$lte": datetime.combine(date_to, time.max)
        }
    }).to_list(length=None)
    
    # Calculate metrics
    total_appointments = len(appointments)
    completed_appointments = len([a for a in appointments if a["status"] == "completed"])
    total_revenue = sum(a.get("total_price", 0) for a in appointments if a["status"] == "completed")
    avg_rating = await get_avg_salon_rating(salon_id)
    
    return {
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "completion_rate": completed_appointments / total_appointments if total_appointments > 0 else 0,
        "total_revenue": total_revenue,
        "average_rating": avg_rating,
        "date_range": {"from": date_from, "to": date_to}
    }

# Export endpoints
@app.get("/api/export/appointments")
async def export_appointments(
    format: str = "csv",
    current_user: dict = Depends(get_current_user)
):
    # Get appointments based on user role
    if current_user["role"] == "admin":
        appointments = await db.appointments.find().to_list(length=None)
    else:
        appointments = await db.appointments.find({"customer_id": current_user["id"]}).to_list(length=None)
    
    if format == "csv":
        output = BytesIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Date", "Service", "Status", "Price"])
        
        for appointment in appointments:
            writer.writerow([
                str(appointment["_id"]),
                appointment["appointment_date"],
                appointment.get("service_id", ""),
                appointment["status"],
                appointment["total_price"]
            ])
        
        output.seek(0)
        return StreamingResponse(
            BytesIO(output.getvalue()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=appointments.csv"}
        )
    
    return {"message": "Format not supported"}

# Helper functions
async def update_salon_rating(salon_id: str):
    """Update salon rating based on reviews"""
    reviews = await db.reviews.find({"salon_id": salon_id}).to_list(length=None)
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.salons.update_one(
            {"_id": ObjectId(salon_id)},
            {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(reviews)}}
        )

async def update_stylist_rating(stylist_id: str):
    """Update stylist rating based on reviews"""
    reviews = await db.reviews.find({"stylist_id": stylist_id}).to_list(length=None)
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.stylists.update_one(
            {"_id": ObjectId(stylist_id)},
            {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(reviews)}}
        )

async def get_avg_salon_rating(salon_id: str) -> float:
    """Get average salon rating"""
    salon = await db.salons.find_one({"_id": ObjectId(salon_id)})
    return salon.get("rating", 0.0) if salon else 0.0

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)