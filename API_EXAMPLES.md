# PersianAds API Usage Examples

Complete examples for using the PersianAds API.

## Base URL
```
http://localhost:3001/api
```

## Authentication Flow

### 1. Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+49 123 456789",
  "password": "securePassword123",
  "role": "user"  // optional: "user" | "business" | "admin"
}

Response:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+49 123 456789",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: Same as signup
```

### 3. Using Token
Include token in all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Categories

### Get All Categories
```bash
GET /api/categories

Response:
[
  {
    "id": "uuid",
    "name": { "fa": "خودرو", "de": "Fahrzeuge", "en": "Vehicles" },
    "icon": "🚗",
    "children": [
      {
        "id": "uuid",
        "name": { "fa": "خودرو", "de": "Autos", "en": "Cars" },
        "icon": "🚙",
        "parentId": "parent-uuid"
      }
    ]
  }
]
```

### Create Category (Admin Only)
```bash
POST /api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": {
    "fa": "خودرو",
    "de": "Fahrzeuge",
    "en": "Vehicles"
  },
  "icon": "🚗",
  "parentId": null  // null for root, UUID for subcategory
}
```

## Cities

### Get All Cities
```bash
GET /api/cities

Response:
[
  {
    "id": "uuid",
    "name": { "fa": "برلین", "de": "Berlin", "en": "Berlin" },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Ads

### Get All Ads (with filters)
```bash
GET /api/ads?categoryId=uuid&cityId=uuid&minPrice=1000&maxPrice=50000&status=active&search=BMW&page=1&limit=20&sortBy=createdAt&sortOrder=DESC

Query Parameters:
- categoryId: Filter by category
- subcategoryId: Filter by subcategory
- cityId: Filter by city
- minPrice: Minimum price
- maxPrice: Maximum price
- status: "active" | "pending" | "sold"
- search: Search in title and description
- userId: Filter by user (owner)
- page: Page number (default: 1)
- limit: Items per page (default: 20, max: 100)
- sortBy: "createdAt" | "price" | "views" (default: "createdAt")
- sortOrder: "ASC" | "DESC" (default: "DESC")

Response:
{
  "data": [
    {
      "id": "uuid",
      "title": "BMW 320d",
      "description": "Great car...",
      "price": 25000,
      "status": "active",
      "condition": "like-new",
      "views": 245,
      "isPremium": true,
      "categoryId": "uuid",
      "subcategoryId": "uuid",
      "cityId": "uuid",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": { ... },
      "category": { ... },
      "city": { ... },
      "images": [ ... ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get Ad by ID
```bash
GET /api/ads/:id

Response: Single ad object with all relations
Note: View count is automatically incremented
```

### Create Ad
```bash
POST /api/ads
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "BMW 320d سال 2020",
  "description": "خودروی عالی با شرایط خوب. تمام سرویس‌ها انجام شده است.",
  "price": 25000,
  "categoryId": "uuid",
  "subcategoryId": "uuid",  // optional
  "cityId": "uuid",
  "status": "active",  // optional, defaults to "pending"
  "condition": "like-new"  // optional: "new" | "like-new" | "used"
}

Response: Created ad object
```

### Update Ad (Owner or Admin)
```bash
PATCH /api/ads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 23000,
  "status": "sold"
}

Response: Updated ad object
```

### Delete Ad (Owner or Admin)
```bash
DELETE /api/ads/:id
Authorization: Bearer <token>

Response: { message: "Ad deleted successfully" }
```

### Get My Ads
```bash
GET /api/ads/user/my
Authorization: Bearer <token>

Response: Array of current user's ads
```

## Images

### Upload Image
```bash
POST /api/images/:adId?order=1
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <image file>

Supported formats: jpg, jpeg, png, gif, webp
Max size: 5MB

Response:
{
  "id": "uuid",
  "url": "/uploads/filename.jpg",
  "fileName": "original.jpg",
  "fileSize": 123456,
  "mimeType": "image/jpeg",
  "adId": "uuid",
  "order": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Images for Ad
```bash
GET /api/images/ad/:adId

Response: Array of images, sorted by order
```

### Delete Image (Owner or Admin)
```bash
DELETE /api/images/:id
Authorization: Bearer <token>

Response: { message: "Image deleted successfully" }
```

## Messages

### Send Message
```bash
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "adId": "uuid",
  "messageText": "Is this item still available?"
}

Response:
{
  "id": "uuid",
  "senderId": "uuid",
  "receiverId": "uuid",  // Ad owner
  "adId": "uuid",
  "messageText": "Is this item still available?",
  "isRead": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "sender": { ... },
  "receiver": { ... },
  "ad": { ... }
}
```

### Get Messages for Ad
```bash
GET /api/messages/ad/:adId
Authorization: Bearer <token>

Response: Array of messages (only visible to ad owner and message participants)
```

### Get My Inbox
```bash
GET /api/messages/inbox/my
Authorization: Bearer <token>

Response: Array of messages received by current user
```

### Get Message by ID
```bash
GET /api/messages/:id
Authorization: Bearer <token>

Response: Single message object
```

### Mark Message as Read
```bash
PATCH /api/messages/:id/read
Authorization: Bearer <token>

Response: Updated message object with isRead: true
```

## Users

### Get My Profile
```bash
GET /api/users/profile
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+49 123 456789",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update My Profile
```bash
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+49 987 654321",
  "password": "newPassword123"  // optional
}

Response: Updated user object
```

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

## JavaScript/TypeScript Examples

### Using Fetch API
```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { user, accessToken } = await loginResponse.json();

// Get Ads
const adsResponse = await fetch('http://localhost:3001/api/ads?status=active&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const adsData = await adsResponse.json();
```

### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

localStorage.setItem('token', data.accessToken);

// Get Ads
const { data: adsData } = await api.get('/ads', {
  params: { status: 'active', page: 1, limit: 20 }
});
```

