#!/usr/bin/env python3
"""
SalonManager Backend API Test Suite
Tests all major API endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class SalonManagerAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.salon_id = None
        self.service_id = None
        self.appointment_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200, auth_required=True):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)
            
            success = response.status_code == expected_status
            return success, response
            
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.make_request('GET', '/api/health', auth_required=False)
        if success and response:
            data = response.json()
            has_required_fields = all(key in data for key in ['status', 'timestamp', 'version'])
            return self.log_test("Health Check", success and has_required_fields, 
                               f"Status: {data.get('status', 'unknown')}")
        return self.log_test("Health Check", False, "No response")

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        user_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+49123456789",
            "role": "customer"
        }
        
        success, response = self.make_request('POST', '/api/auth/register', user_data, 
                                            expected_status=200, auth_required=False)
        if success and response:
            data = response.json()
            self.test_email = test_email
            self.test_password = "TestPassword123!"
            return self.log_test("User Registration", True, f"User ID: {data.get('id', 'unknown')}")
        return self.log_test("User Registration", False, "Registration failed")

    def test_user_login(self):
        """Test user login"""
        if not hasattr(self, 'test_email'):
            return self.log_test("User Login", False, "No test user to login with")
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.make_request('POST', '/api/auth/login', login_data, 
                                            expected_status=200, auth_required=False)
        if success and response:
            data = response.json()
            self.token = data.get('access_token')
            self.user_id = data.get('user', {}).get('id')
            return self.log_test("User Login", True, f"Token received: {bool(self.token)}")
        return self.log_test("User Login", False, "Login failed")

    def test_get_current_user(self):
        """Test get current user profile"""
        if not self.token:
            return self.log_test("Get Current User", False, "No auth token")
            
        success, response = self.make_request('GET', '/api/auth/me')
        if success and response:
            data = response.json()
            return self.log_test("Get Current User", True, f"User: {data.get('first_name', 'unknown')}")
        return self.log_test("Get Current User", False, "Failed to get user profile")

    def test_create_salon_owner(self):
        """Create a salon owner for testing salon creation"""
        test_email = f"owner_{uuid.uuid4().hex[:8]}@example.com"
        owner_data = {
            "email": test_email,
            "password": "OwnerPassword123!",
            "first_name": "Salon",
            "last_name": "Owner",
            "role": "salon_owner"
        }
        
        success, response = self.make_request('POST', '/api/auth/register', owner_data, 
                                            expected_status=200, auth_required=False)
        if success:
            # Login as salon owner
            login_data = {"email": test_email, "password": "OwnerPassword123!"}
            success, response = self.make_request('POST', '/api/auth/login', login_data, 
                                                expected_status=200, auth_required=False)
            if success and response:
                data = response.json()
                self.owner_token = data.get('access_token')
                return self.log_test("Create Salon Owner", True, "Owner created and logged in")
        
        return self.log_test("Create Salon Owner", False, "Failed to create salon owner")

    def test_create_salon(self):
        """Test salon creation"""
        if not hasattr(self, 'owner_token'):
            return self.log_test("Create Salon", False, "No salon owner token")
            
        # Temporarily switch to owner token
        original_token = self.token
        self.token = self.owner_token
        
        salon_data = {
            "name": "Test Salon",
            "description": "A test salon for API testing",
            "address": "Teststraße 123",
            "city": "Berlin",
            "postal_code": "10115",
            "phone": "+49301234567",
            "email": "test@testsalon.de",
            "opening_hours": {
                "monday": {"open": "09:00", "close": "18:00"},
                "tuesday": {"open": "09:00", "close": "18:00"}
            },
            "price_range": "€€"
        }
        
        success, response = self.make_request('POST', '/api/salons', salon_data, expected_status=200)
        if success and response:
            data = response.json()
            self.salon_id = data.get('id')
            result = self.log_test("Create Salon", True, f"Salon ID: {self.salon_id}")
        else:
            result = self.log_test("Create Salon", False, "Failed to create salon")
        
        # Restore original token
        self.token = original_token
        return result

    def test_get_salons(self):
        """Test getting list of salons"""
        success, response = self.make_request('GET', '/api/salons', auth_required=False)
        if success and response:
            data = response.json()
            salon_count = len(data) if isinstance(data, list) else 0
            return self.log_test("Get Salons", True, f"Found {salon_count} salons")
        return self.log_test("Get Salons", False, "Failed to get salons")

    def test_get_salon_detail(self):
        """Test getting salon details"""
        if not self.salon_id:
            return self.log_test("Get Salon Detail", False, "No salon ID available")
            
        success, response = self.make_request('GET', f'/api/salons/{self.salon_id}', auth_required=False)
        if success and response:
            data = response.json()
            return self.log_test("Get Salon Detail", True, f"Salon: {data.get('name', 'unknown')}")
        return self.log_test("Get Salon Detail", False, "Failed to get salon details")

    def test_create_service(self):
        """Test creating a service"""
        if not self.salon_id or not hasattr(self, 'owner_token'):
            return self.log_test("Create Service", False, "No salon ID or owner token")
            
        # Switch to owner token
        original_token = self.token
        self.token = self.owner_token
        
        service_data = {
            "name": "Haarschnitt",
            "description": "Professioneller Haarschnitt",
            "duration_minutes": 60,
            "price": 45.0,
            "category": "Haare",
            "salon_id": self.salon_id
        }
        
        success, response = self.make_request('POST', '/api/services', service_data)
        if success and response:
            data = response.json()
            self.service_id = data.get('id')
            result = self.log_test("Create Service", True, f"Service ID: {self.service_id}")
        else:
            result = self.log_test("Create Service", False, "Failed to create service")
        
        # Restore original token
        self.token = original_token
        return result

    def test_get_salon_services(self):
        """Test getting salon services"""
        if not self.salon_id:
            return self.log_test("Get Salon Services", False, "No salon ID available")
            
        success, response = self.make_request('GET', f'/api/salons/{self.salon_id}/services', auth_required=False)
        if success and response:
            data = response.json()
            service_count = len(data) if isinstance(data, list) else 0
            return self.log_test("Get Salon Services", True, f"Found {service_count} services")
        return self.log_test("Get Salon Services", False, "Failed to get salon services")

    def test_create_appointment(self):
        """Test creating an appointment"""
        if not self.salon_id or not self.service_id:
            return self.log_test("Create Appointment", False, "Missing salon or service ID")
            
        appointment_data = {
            "salon_id": self.salon_id,
            "service_id": self.service_id,
            "appointment_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "customer_email": "customer@example.com",
            "customer_name": "Test Customer",
            "notes": "Test appointment"
        }
        
        success, response = self.make_request('POST', '/api/appointments', appointment_data, auth_required=False)
        if success and response:
            data = response.json()
            self.appointment_id = data.get('id')
            return self.log_test("Create Appointment", True, f"Appointment ID: {self.appointment_id}")
        return self.log_test("Create Appointment", False, "Failed to create appointment")

    def test_get_appointments(self):
        """Test getting appointments"""
        if not self.token:
            return self.log_test("Get Appointments", False, "No auth token")
            
        success, response = self.make_request('GET', '/api/appointments')
        if success and response:
            data = response.json()
            appointment_count = len(data) if isinstance(data, list) else 0
            return self.log_test("Get Appointments", True, f"Found {appointment_count} appointments")
        return self.log_test("Get Appointments", False, "Failed to get appointments")

    def test_available_slots(self):
        """Test getting available appointment slots"""
        if not self.salon_id or not self.service_id:
            return self.log_test("Available Slots", False, "Missing salon or service ID")
            
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        endpoint = f'/api/appointments/available-slots?salon_id={self.salon_id}&service_id={self.service_id}&date={tomorrow}'
        
        success, response = self.make_request('GET', endpoint, auth_required=False)
        if success and response:
            data = response.json()
            slot_count = len(data.get('available_slots', []))
            return self.log_test("Available Slots", True, f"Found {slot_count} available slots")
        return self.log_test("Available Slots", False, "Failed to get available slots")

    def test_payment_intent(self):
        """Test creating payment intent"""
        if not self.appointment_id or not self.token:
            return self.log_test("Payment Intent", False, "Missing appointment ID or token")
            
        success, response = self.make_request('POST', f'/api/payments/create-intent?appointment_id={self.appointment_id}')
        if success and response:
            data = response.json()
            has_client_secret = 'client_secret' in data
            return self.log_test("Payment Intent", has_client_secret, f"Client secret: {bool(has_client_secret)}")
        return self.log_test("Payment Intent", False, "Failed to create payment intent")

    def test_ai_suggestions(self):
        """Test AI appointment suggestions"""
        if not self.user_id or not self.token:
            return self.log_test("AI Suggestions", False, "Missing user ID or token")
            
        ai_data = {
            "customer_id": self.user_id,
            "preferences": {"service_type": "hair", "budget": "medium"}
        }
        
        success, response = self.make_request('POST', '/api/ai/appointment-suggestions', ai_data)
        if success and response:
            data = response.json()
            has_suggestions = 'suggestions' in data
            return self.log_test("AI Suggestions", has_suggestions, f"Suggestions available: {has_suggestions}")
        return self.log_test("AI Suggestions", False, "Failed to get AI suggestions")

    def test_qr_code(self):
        """Test QR code generation"""
        if not self.salon_id:
            return self.log_test("QR Code", False, "No salon ID available")
            
        success, response = self.make_request('GET', f'/api/salons/{self.salon_id}/qr-code', auth_required=False)
        if success and response:
            data = response.json()
            has_qr_code = 'qr_code' in data and 'url' in data
            return self.log_test("QR Code", has_qr_code, f"QR code generated: {has_qr_code}")
        return self.log_test("QR Code", False, "Failed to generate QR code")

    def test_salon_analytics(self):
        """Test salon analytics"""
        if not self.salon_id or not hasattr(self, 'owner_token'):
            return self.log_test("Salon Analytics", False, "Missing salon ID or owner token")
            
        # Switch to owner token
        original_token = self.token
        self.token = self.owner_token
        
        success, response = self.make_request('GET', f'/api/analytics/salon/{self.salon_id}')
        if success and response:
            data = response.json()
            has_metrics = all(key in data for key in ['total_appointments', 'total_revenue'])
            result = self.log_test("Salon Analytics", has_metrics, f"Analytics available: {has_metrics}")
        else:
            result = self.log_test("Salon Analytics", False, "Failed to get analytics")
        
        # Restore original token
        self.token = original_token
        return result

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting SalonManager Backend API Tests")
        print("=" * 50)
        
        # Core functionality tests
        self.test_health_check()
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # Salon management tests
        self.test_create_salon_owner()
        self.test_create_salon()
        self.test_get_salons()
        self.test_get_salon_detail()
        
        # Service tests
        self.test_create_service()
        self.test_get_salon_services()
        
        # Appointment tests
        self.test_create_appointment()
        self.test_get_appointments()
        self.test_available_slots()
        
        # Payment tests
        self.test_payment_intent()
        
        # AI and additional features
        self.test_ai_suggestions()
        self.test_qr_code()
        self.test_salon_analytics()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} test(s) failed. Please check the backend implementation.")
            return 1

def main():
    """Main test runner"""
    tester = SalonManagerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())