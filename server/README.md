# TinyLink - URL Shortener Backend

A complete URL shortener service built with Node.js, Express, and PostgreSQL (Neon). This backend provides RESTful APIs for creating, managing, and tracking shortened URLs.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Testing](#testing)

## 🎯 Overview

TinyLink is a URL shortener service similar to bit.ly that allows users to:
- Create short links from long URLs
- Optionally specify custom short codes
- Track click statistics
- Manage (view and delete) links
- View detailed statistics for each link

## ✨ Features

- ✅ **URL Shortening**: Convert long URLs into short codes (6-8 alphanumeric characters)
- ✅ **Custom Codes**: Optionally specify custom short codes
- ✅ **Click Tracking**: Automatically tracks total clicks and last clicked timestamp
- ✅ **Link Management**: Create, view, and delete shortened links
- ✅ **Statistics**: View detailed statistics for each shortened link
- ✅ **URL Validation**: Automatic validation and protocol addition
- ✅ **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- ✅ **Health Check**: System health monitoring endpoint
- ✅ **Pagination**: Support for paginated link lists
- ✅ **Duplicate Prevention**: Prevents duplicate codes (409 conflict)

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Validation**: validator.js
- **Environment**: dotenv
- **HTTP Client**: Built-in Node.js

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # Database connection and initialization
├── controllers/
│   └── linkController.js    # Business logic for link operations
├── middleware/
│   ├── errorHandler.js      # Global error handling middleware
│   └── validation.js        # Input validation middleware
├── models/
│   └── Link.js              # Database model for links
├── routes/
│   ├── api.js               # API routes (/api/*)
│   └── index.js             # Root routes (/, /healthz, /:code, /code/:code)
├── utils/
│   └── responseHelper.js    # Standardized response helpers
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies and scripts
└── server.js                # Main server file
```

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (Neon, Railway, or any PostgreSQL provider)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tinylink/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database connection string and configuration.

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on port 5000 (or the port specified in your `.env` file).

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Server Configuration
PORT=5000
NODE_ENV=development

# Base URL for shortened links
BASE_URL=http://localhost:5000
```

**Example for Neon:**
```env
DATABASE_URL=postgresql://neondb_owner:password@ep-young-lab-aef6vt3m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
```

### Database Setup

The application automatically creates the required database tables and indexes on startup. No manual database setup is required.

## 📚 API Endpoints

### Health Check

**GET** `/healthz`

Returns system health status.

**Response** (200 OK):
```json
{
  "ok": true,
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Create Link

**POST** `/api/links`

Create a new shortened link.

**Request Body**:
```json
{
  "target_url": "https://example.com",
  "code": "mycode1"
}
```

**Fields**:
- `target_url` (required) - The URL to shorten
- `code` (optional) - Custom short code (6-8 alphanumeric characters)

**Response** (201 Created):
```json
{
  "success": true,
  "status": 201,
  "message": "Link created successfully",
  "data": {
    "id": 1,
    "code": "mycode1",
    "target_url": "https://example.com",
    "total_clicks": 0,
    "last_clicked": null,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400` - Invalid URL or code format
- `409` - Code already exists

---

### Get All Links

**GET** `/api/links`

Retrieve all shortened links.

**Query Parameters** (optional):
- `page` - Page number (starts from 1)
- `start` - Offset/start position (starts from 0)
- `limit` - Items per page (default: 10, max: 100)

**Examples**:
```
GET /api/links                    # Get all links (simple array)
GET /api/links?page=1&limit=10    # Page-based pagination
GET /api/links?start=0&limit=10   # Offset-based pagination
```

**Response** (200 OK):
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "code": "abc123",
      "target_url": "https://example.com",
      "total_clicks": 42,
      "last_clicked": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "start": 0,
    "limit": 10,
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "nextStart": 10,
    "prevStart": null,
    "hasNext": true,
    "hasPrev": false,
    "from": 1,
    "to": 10
  }
}
```

**Note**: Without pagination parameters, returns a simple array of all links (for automated testing compatibility).

---

### Get Link Stats

**GET** `/api/links/:code`

Get statistics for a specific link by its code.

**Response** (200 OK):
```json
{
  "success": true,
  "status": 200,
  "message": "Link stats retrieved successfully",
  "data": {
    "id": 1,
    "code": "abc123",
    "target_url": "https://example.com",
    "total_clicks": 42,
    "last_clicked": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-10T08:00:00.000Z"
  }
}
```

**Error Responses**:
- `400` - Invalid code format
- `404` - Link not found

---

### Delete Link

**DELETE** `/api/links/:code`

Delete a shortened link.

**Response** (200 OK):
```json
{
  "success": true,
  "status": 200,
  "message": "Link deleted successfully",
  "data": {
    "id": 1,
    "code": "abc123",
    "target_url": "https://example.com",
    "total_clicks": 42,
    "last_clicked": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-10T08:00:00.000Z"
  }
}
```

**Error Responses**:
- `400` - Invalid code format
- `404` - Link not found

**Note**: After deletion, accessing `/:code` will return 404.

---

### Stats Page

**GET** `/code/:code`

Get link statistics for the stats page (same as GET /api/links/:code).

**Response**: Same as Get Link Stats (200 OK)

---

### Redirect

**GET** `/:code`

Redirect to the original URL using the short code.

**Response** (302 Found):
- Redirects to original URL
- Automatically increments click count
- Updates last_clicked timestamp

**Error Responses**:
- `400` - Invalid code format
- `404` - Link not found

---

## 🗄 Database Schema

### Links Table

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

- `idx_links_code` - Index on `code` column for fast lookups
- `idx_links_created_at` - Index on `created_at` for sorting

## 🚢 Deployment

### Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables:
   - `DATABASE_URL` - Your Neon database connection string
   - `NODE_ENV=production`
   - `BASE_URL` - Your Render app URL
6. Deploy!

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Create a new project
3. Set root directory: `server`
4. Add environment variables:
   - `DATABASE_URL` - Your Neon database connection string
   - `NODE_ENV=production`
   - `BASE_URL` - Your Railway app URL
5. Deploy!

### Deploy to Vercel (Node.js)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in server directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```
3. Deploy: `vercel`

### Environment Variables for Production

Make sure to set:
- `DATABASE_URL` - Your production database connection string
- `PORT` - Port number (usually set by hosting provider)
- `NODE_ENV=production`
- `BASE_URL` - Your production domain URL

## 🧪 Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:5000/healthz

# Create a link
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url": "https://example.com"}'

# Create link with custom code
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url": "https://example.com", "code": "mycode1"}'

# Get all links
curl http://localhost:5000/api/links

# Get all links with pagination
curl http://localhost:5000/api/links?start=0&limit=10

# Get link stats
curl http://localhost:5000/api/links/mycode1

# Test redirect (should return 302)
curl -I http://localhost:5000/mycode1

# Delete a link
curl -X DELETE http://localhost:5000/api/links/mycode1
```

### Testing Checklist

- [x] Health check returns 200
- [x] Create link with auto-generated code works
- [x] Create link with custom code works
- [x] Creating duplicate code returns 409
- [x] Invalid URL returns 400
- [x] Invalid code format returns 400
- [x] Get all links returns array
- [x] Get link stats returns correct data
- [x] Get non-existent link returns 404
- [x] Redirect works and returns 302
- [x] Redirect increments click count
- [x] Delete link works
- [x] Deleted link redirect returns 404
- [x] Stats page returns correct data

## 📝 Code Rules & Conventions

- **Code Format**: Short codes must be 6-8 alphanumeric characters `[A-Za-z0-9]{6,8}`
- **URL Validation**: URLs are automatically validated and protocol is added if missing
- **Error Codes**:
  - `200` - Success
  - `201` - Created
  - `302` - Redirect
  - `400` - Bad Request (validation errors)
  - `404` - Not Found
  - `409` - Conflict (duplicate code)
  - `500` - Internal Server Error
- **Response Format**: 
  - Success: `{ "success": true, "status": 200, "data": {...} }`
  - Error: `{ "error": "Error message" }`
- **Redirect**: Uses HTTP 302 status code

## 🔍 Key Features Implementation

### Click Tracking

- Each redirect (`GET /:code`) automatically:
  - Increments `total_clicks` by 1
  - Updates `last_clicked` to current timestamp
  - Updates happen before redirect (ensured with `await`)

### Duplicate Prevention

- Codes are globally unique
- Returns 409 Conflict if code already exists
- Auto-generates unique code if not provided

### Pagination

- Supports both page-based (`?page=1`) and offset-based (`?start=0`) pagination
- First page: `start=0` (entries 1-10)
- Second page: `start=10` (entries 11-20)
- Third page: `start=20` (entries 21-30)

## 📄 License

ISC

## 👤 Author

TinyLink Backend Team

---

**Last Updated**: 2024-01-15
