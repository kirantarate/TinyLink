# TinyLink Backend API

A URL shortener service built with Node.js, Express, and PostgreSQL. This backend provides RESTful APIs for creating, managing, and tracking shortened URLs.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Working Flow](#working-flow)
- [Deployment](#deployment)
- [Testing](#testing)

## ✨ Features

- **URL Shortening**: Convert long URLs into short, manageable codes (6-8 alphanumeric characters)
- **Custom Codes**: Optionally specify custom short codes for your links
- **Click Tracking**: Automatically track total clicks and last clicked timestamp
- **Link Management**: Create, view, and delete shortened links
- **Statistics**: View detailed statistics for each shortened link
- **URL Validation**: Automatic validation and protocol addition for URLs
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Health Check**: System health monitoring endpoint

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Validation**: validator.js
- **Environment**: dotenv

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # Database connection and initialization
├── controllers/
│   └── linkController.js    # Business logic for link operations
├── middleware/
│   ├── errorHandler.js      # Global error handling middleware
│   └── validation.js       # Input validation middleware
├── models/
│   └── Link.js              # Database model for links
├── routes/
│   ├── api.js               # API routes (/api/*)
│   └── index.js             # Root routes (/, /healthz, /:code, /code/:code)
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
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
   cp .env 
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

### Database Setup

The application automatically creates the required database tables and indexes on startup. No manual database setup is required.

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Health check |
| POST | `/api/links` | Create a new link |
| GET | `/api/links` | Get all links |
| GET | `/api/links/:code` | Get link stats by code |
| DELETE | `/api/links/:code` | Delete a link |
| GET | `/code/:code` | Stats page for a link |
| GET | `/:code` | Redirect to original URL |

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

## 🔄 Working Flow

### 1. Server Initialization

```
server.js
  ↓
Initialize Database Connection (config/database.js)
  ↓
Create Tables & Indexes (if not exists)
  ↓
Start Express Server
  ↓
Register Middleware (CORS, JSON parser, logging)
  ↓
Register Routes (API routes, root routes)
  ↓
Register Error Handlers
  ↓
Server Ready on PORT
```

### 2. Request Flow

```
Client Request
  ↓
Express Middleware Stack
  ├── CORS
  ├── JSON Parser
  ├── URL Encoded Parser
  └── Request Logger
  ↓
Route Matching
  ├── /api/* → api.js routes
  ├── /healthz → Health check
  ├── /code/:code → Stats page
  └── /:code → Redirect handler
  ↓
Validation Middleware (if applicable)
  ├── URL Validation
  └── Code Format Validation
  ↓
Controller (linkController.js)
  ├── Business Logic
  └── Database Operations (models/Link.js)
  ↓
Response
  ├── Success Response
  └── Error Response (errorHandler.js)
```

### 3. Create Link Flow

```
POST /api/links
  ↓
validateCreateLink Middleware
  ├── Validate URL format
  └── Validate code format (if provided)
  ↓
linkController.createLink
  ├── Generate random code (if not provided)
  ├── Check code uniqueness
  └── Create link in database
  ↓
Return 201 Created with link data
```

### 4. Redirect Flow

```
GET /:code
  ↓
validateCodeParam Middleware
  └── Validate code format [A-Za-z0-9]{6,8}
  ↓
linkController.redirectLink
  ├── Find link by code
  ├── If not found → 404
  ├── Increment click count
  └── Update last_clicked timestamp
  ↓
302 Redirect to target_url
```

### 5. Delete Link Flow

```
DELETE /api/links/:code
  ↓
validateCodeParam Middleware
  ↓
linkController.deleteLink
  ├── Find link by code
  ├── If not found → 404
  └── Delete from database
  ↓
Return 200 OK with deleted link data
```

## 🚢 Deployment

### Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables in Render dashboard
6. Deploy!

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Create a new project
3. Add PostgreSQL service (or use external Neon database)
4. Set environment variables
5. Deploy!

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

# Get link stats
curl http://localhost:5000/api/links/abc123

# Delete a link
curl -X DELETE http://localhost:5000/api/links/abc123

# Test redirect (should return 302)
curl -I http://localhost:5000/abc123
```

## 📝 Code Rules & Conventions

- **Code Format**: Short codes must be 6-8 alphanumeric characters `[A-Za-z0-9]{6,8}`
- **URL Validation**: URLs are automatically validated and protocol is added if missing
- **Error Codes**:
  - `400` - Bad Request (validation errors)
  - `404` - Not Found (link doesn't exist)
  - `409` - Conflict (code already exists)
  - `500` - Internal Server Error
- **Response Format**: All errors return `{ "error": "message" }`
- **Redirect**: Uses HTTP 302 status code

## 🤝 Contributing

1. Follow the existing code structure
2. Ensure all routes match the specification
3. Test all endpoints before submitting
4. Follow error handling patterns

## 📄 License

ISC

## 👤 Author

TinyLink Backend Team

