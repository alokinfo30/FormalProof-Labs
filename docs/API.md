# FormalProof Labs API Documentation

## Base URL

http://localhost:5000/api
Production: https://api.formalproof.io


## Authentication

### Register
```http
POST /register
Content-Type: application/json

{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
}

Login
http
POST /login
Content-Type: application/json

{
    "username": "john_doe",
    "password": "secure_password"
}
Response:

json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
    }
}
Proofs
Create Proof
http
POST /proofs
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Proof of Quadratic Formula",
    "statement": "For ax² + bx + c = 0, x = [-b ± √(b² - 4ac)]/(2a)",
    "proof_attempt": "Step 1: ax² + bx + c = 0\nStep 2: x² + (b/a)x = -c/a\n...",
    "is_public": true
}
Get User Proofs
http
GET /proofs
Authorization: Bearer <token>
Get Proof by ID
http
GET /proofs/{id}
Authorization: Bearer <token> (required for private proofs)
Verify Proof
http
POST /proofs/{id}/verify
Authorization: Bearer <token>
Verification Tools
Parse Expression
http
POST /verify/expression
Authorization: Bearer <token>
Content-Type: application/json

{
    "expression": "x^2 + 2x + 1"
}
Verify Derivative
http
POST /verify/derivative
Authorization: Bearer <token>
Content-Type: application/json

{
    "function": "x^2",
    "variable": "x",
    "expected": "2x"
}
Verify Integral
http
POST /verify/integral
Authorization: Bearer <token>
Content-Type: application/json

{
    "function": "cos(x)",
    "variable": "x",
    "expected": "sin(x)"
}
Public Access
Search Public Proofs
http
GET /search/public?q=quadratic
Error Responses
json
{
    "message": "Error description",
    "error": "Detailed error message (development only)"
}
Status Codes:

200: Success

201: Created

400: Bad Request

401: Unauthorized

403: Forbidden

404: Not Found

429: Too Many Requests

500: Internal Server Error

t