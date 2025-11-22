# TinyLink Backend - Working Flow Documentation

This document explains the complete working flow of the TinyLink backend application, from server startup to request handling.

## 📋 Table of Contents

1. [Application Architecture](#application-architecture)
2. [Server Startup Flow](#server-startup-flow)
3. [Request Processing Flow](#request-processing-flow)
4. [Database Operations Flow](#database-operations-flow)
5. [Specific Feature Flows](#specific-feature-flows)
6. [Error Handling Flow](#error-handling-flow)

---

## 🏗 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser/API)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Server (server.js)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Stack                         │   │
│  │  • CORS                                              │   │
│  │  • JSON Parser                                       │   │
│  │  • URL Encoded Parser                                │   │
│  │  • Request Logger                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Route Handlers                           │   │
│  │  • /api/* → api.js                                   │   │
│  │  • /healthz → Health Check                           │   │
│  │  • /code/:code → Stats Page                          │   │
│  │  • /:code → Redirect                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Controllers (linkController.js)         │   │
│  │  • Business Logic                                    │   │
│  │  • Code Generation                                   │   │
│  │  • Request Processing                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Models (Link.js)                         │   │
│  │  • Database Queries                                  │   │
│  │  • Data Access Layer                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ SQL Queries
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Neon)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              links Table                              │   │
│  │  • id, code, target_url                              │   │
│  │  • total_clicks, last_clicked                        │   │
│  │  • created_at                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Server Startup Flow

```
1. Load Environment Variables
   └─> dotenv.config() reads .env file
       • DATABASE_URL
       • PORT
       • NODE_ENV
       • BASE_URL

2. Import Dependencies
   └─> Express, CORS, Database config, Routes, Middleware

3. Create Express App
   └─> const app = express()

4. Register Middleware (in order)
   ├─> CORS (Cross-Origin Resource Sharing)
   ├─> express.json() (Parse JSON bodies)
   ├─> express.urlencoded() (Parse URL-encoded bodies)
   └─> Request Logger (Log all incoming requests)

5. Register Routes (in order)
   ├─> /api/* → API routes (api.js)
   │   ├─> POST /api/links
   │   ├─> GET /api/links
   │   ├─> GET /api/links/:code
   │   └─> DELETE /api/links/:code
   │
   └─> /* → Root routes (index.js)
       ├─> GET /healthz
       ├─> GET /code/:code
       └─> GET /:code (catch-all for redirects)

6. Register Error Handlers
   ├─> 404 Handler (notFoundHandler)
   └─> Global Error Handler (errorHandler)

7. Initialize Database
   └─> initializeDatabase()
       ├─> Create PostgreSQL connection pool
       ├─> Create 'links' table (if not exists)
       ├─> Create indexes (if not exists)
       └─> Log success message

8. Start HTTP Server
   └─> app.listen(PORT)
       • Server ready on specified port
       • Log server status
```

**Startup Sequence:**
```
server.js
  ↓
Load .env → Import modules → Create Express app
  ↓
Register middleware → Register routes → Register error handlers
  ↓
Initialize database → Start server
  ↓
Server running and ready to accept requests
```

---

## 🔄 Request Processing Flow

### General Request Flow

```
1. Client sends HTTP request
   └─> Example: POST http://localhost:5000/api/links

2. Express receives request
   └─> Request object created with:
       • Method (GET, POST, DELETE, etc.)
       • Path (/api/links)
       • Headers
       • Body (if present)

3. Middleware Stack Execution (in order)
   ├─> CORS Middleware
   │   └─> Adds CORS headers to response
   │
   ├─> JSON Parser
   │   └─> Parses JSON body → req.body
   │
   ├─> URL Encoded Parser
   │   └─> Parses form data → req.body
   │
   └─> Request Logger
       └─> Logs: timestamp, method, path

4. Route Matching
   └─> Express matches request to registered route
       • Checks path pattern
       • Extracts parameters (if any)
       • Calls route handler

5. Validation Middleware (if applicable)
   └─> validateCreateLink or validateCodeParam
       ├─> Validates input
       ├─> Returns 400 if invalid
       └─> Calls next() if valid

6. Controller Execution
   └─> linkController function
       ├─> Extracts data from request
       ├─> Calls model methods
       ├─> Processes business logic
       └─> Prepares response

7. Model/Database Operations
   └─> Link model methods
       ├─> Execute SQL queries
       ├─> Return data or errors
       └─> Update database

8. Response Sent
   └─> Controller sends response
       • Status code
       • JSON data or redirect
       • Headers

9. Error Handling (if error occurred)
   └─> Error caught by errorHandler
       • Logs error
       • Sends appropriate error response
```

---

## 💾 Database Operations Flow

### Connection Pool Management

```
PostgreSQL Connection Pool (pg.Pool)
  ├─> Manages multiple database connections
  ├─> Reuses connections for efficiency
  ├─> Handles connection errors
  └─> Auto-reconnects on failure
```

### Query Execution Flow

```
1. Model method called
   └─> Example: Link.findByCode('abc123')

2. SQL query prepared
   └─> Query: SELECT * FROM links WHERE code = $1
       Parameters: ['abc123']

3. Pool executes query
   └─> pool.query(query, params)
       ├─> Gets connection from pool
       ├─> Executes query
       └─> Returns connection to pool

4. Result processing
   └─> result.rows[0] or result.rows
       • Returns first row or all rows
       • Returns null if no results

5. Data returned to controller
   └─> Controller processes data
       • Formats response
       • Handles errors
```

---

## 🎯 Specific Feature Flows

### 1. Create Link Flow

```
POST /api/links
  │
  ├─> Request Body:
  │   {
  │     "target_url": "https://example.com",
  │     "code": "mycode" (optional)
  │   }
  │
  ├─> Middleware: validateCreateLink
  │   ├─> Validates target_url
  │   │   ├─> Checks if URL is valid
  │   │   ├─> Adds https:// if missing
  │   │   └─> Returns 400 if invalid
  │   │
  │   └─> Validates code (if provided)
  │       ├─> Checks format [A-Za-z0-9]{6,8}
  │       └─> Returns 400 if invalid
  │
  ├─> Controller: createLink
  │   ├─> Extract target_url and code from req.body
  │   │
  │   ├─> If code not provided:
  │   │   ├─> Generate random 6-character code
  │   │   ├─> Check if code exists (Link.codeExists)
  │   │   └─> Retry if exists (max 10 attempts)
  │   │
  │   ├─> If code provided:
  │   │   └─> Check if code exists
  │   │       └─> Return 409 if exists
  │   │
  │   └─> Create link (Link.create)
  │       ├─> INSERT INTO links (code, target_url)
  │       └─> Return created link
  │
  └─> Response: 201 Created
      {
        "id": 1,
        "code": "mycode",
        "target_url": "https://example.com",
        "total_clicks": 0,
        "last_clicked": null,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
```

### 2. Redirect Flow

```
GET /:code (e.g., /abc123)
  │
  ├─> Middleware: validateCodeParam
  │   ├─> Validates code format
  │   └─> Returns 400 if invalid
  │
  ├─> Controller: redirectLink
  │   ├─> Find link by code (Link.findByCode)
  │   │   └─> SELECT * FROM links WHERE code = $1
  │   │
  │   ├─> If not found:
  │   │   └─> Return 404 Not Found
  │   │
  │   ├─> If found:
  │   │   ├─> Increment click count (Link.incrementClick)
  │   │   │   └─> UPDATE links
  │   │   │       SET total_clicks = total_clicks + 1,
  │   │   │           last_clicked = CURRENT_TIMESTAMP
  │   │   │       WHERE code = $1
  │   │   │
  │   │   └─> Redirect to target_url
  │   │       └─> res.redirect(302, link.target_url)
  │   │
  └─> Response: 302 Found
      Location: https://example.com
      (Browser automatically follows redirect)
```

### 3. Get All Links Flow

```
GET /api/links
  │
  ├─> Controller: getAllLinks
  │   └─> Link.findAll()
  │       ├─> SELECT * FROM links ORDER BY created_at DESC
  │       └─> Return all links
  │
  └─> Response: 200 OK
      [
        {
          "id": 1,
          "code": "abc123",
          "target_url": "https://example.com",
          "total_clicks": 42,
          "last_clicked": "2024-01-15T10:30:00.000Z",
          "created_at": "2024-01-10T08:00:00.000Z"
        },
        ...
      ]
```

### 4. Get Link Stats Flow

```
GET /api/links/:code or GET /code/:code
  │
  ├─> Middleware: validateCodeParam
  │   └─> Validates code format
  │
  ├─> Controller: getLinkStats
  │   ├─> Find link by code (Link.findByCode)
  │   │
  │   ├─> If not found:
  │   │   └─> Return 404 Not Found
  │   │
  │   └─> If found:
  │       └─> Return link data
  │
  └─> Response: 200 OK
      {
        "id": 1,
        "code": "abc123",
        "target_url": "https://example.com",
        "total_clicks": 42,
        "last_clicked": "2024-01-15T10:30:00.000Z",
        "created_at": "2024-01-10T08:00:00.000Z"
      }
```

### 5. Delete Link Flow

```
DELETE /api/links/:code
  │
  ├─> Middleware: validateCodeParam
  │   └─> Validates code format
  │
  ├─> Controller: deleteLink
  │   ├─> Delete link by code (Link.deleteByCode)
  │   │   └─> DELETE FROM links WHERE code = $1 RETURNING *
  │   │
  │   ├─> If not found:
  │   │   └─> Return 404 Not Found
  │   │
  │   └─> If deleted:
  │       └─> Return deleted link data
  │
  └─> Response: 200 OK
      {
        "message": "Link deleted successfully",
        "link": { ... }
      }
      
  Note: After deletion, GET /:code returns 404
```

### 6. Health Check Flow

```
GET /healthz
  │
  ├─> Route Handler (no middleware)
  │   └─> Direct response
  │
  └─> Response: 200 OK
      {
        "ok": true,
        "version": "1.0",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
```

---

## ⚠️ Error Handling Flow

### Error Types and Flow

```
1. Validation Error
   └─> Middleware catches invalid input
       ├─> Returns 400 Bad Request
       └─> Response: { "error": "Error message" }

2. Not Found Error
   └─> Controller checks if resource exists
       ├─> If not found → 404 Not Found
       └─> Response: { "error": "Link not found" }

3. Conflict Error (Duplicate Code)
   └─> Database constraint violation
       ├─> PostgreSQL error code: 23505
       ├─> errorHandler catches it
       └─> Returns 409 Conflict
           Response: { "error": "Code already exists" }

4. Database Connection Error
   └─> Pool connection fails
       ├─> errorHandler catches it
       └─> Returns 503 Service Unavailable
           Response: { "error": "Database connection failed" }

5. Unexpected Error
   └─> Any other error
       ├─> errorHandler catches it
       ├─> Logs error to console
       └─> Returns 500 Internal Server Error
           Response: { "error": "Internal server error" }
```

### Error Handler Execution

```
Error occurs in:
  ├─> Middleware
  ├─> Controller
  └─> Model/Database

  ↓
Error passed to next(error)
  ↓
Global errorHandler middleware
  ├─> Logs error
  ├─> Checks error type
  ├─> Maps to appropriate status code
  └─> Sends error response
```

---

## 🔐 Security & Validation Flow

### URL Validation

```
Input: "example.com"
  │
  ├─> Check if starts with http:// or https://
  │   └─> No → Add "https://" prefix
  │
  ├─> Validate URL format (validator.isURL)
  │   └─> Invalid → Return error
  │
  └─> Valid URL: "https://example.com"
```

### Code Validation

```
Input: "mycode"
  │
  ├─> Check length (6-8 characters)
  │   └─> Invalid → Return error
  │
  ├─> Check format [A-Za-z0-9]{6,8}
  │   └─> Invalid → Return error
  │
  └─> Valid code → Proceed
```

### Code Generation

```
No code provided
  │
  ├─> Generate random 6-character code
  │   └─> Characters: A-Z, a-z, 0-9
  │
  ├─> Check if code exists
  │   └─> Exists → Generate new code (max 10 attempts)
  │
  └─> Unique code found → Use it
```

---

## 📊 Data Flow Diagram

```
Client Request
    │
    ▼
Express Server
    │
    ├─> Middleware Processing
    │   ├─> CORS
    │   ├─> Body Parsing
    │   └─> Validation
    │
    ▼
Route Handler
    │
    ▼
Controller
    │
    ├─> Business Logic
    │   ├─> Code Generation
    │   ├─> Uniqueness Check
    │   └─> Data Processing
    │
    ▼
Model
    │
    ├─> SQL Query Construction
    │
    ▼
Database
    │
    ├─> Execute Query
    │
    ▼
Return Data
    │
    ▼
Controller Response
    │
    ▼
Client Response
```

---

## 🎓 Key Concepts

### 1. Middleware Chain
- Middleware executes in order
- Each middleware can modify request/response
- `next()` passes control to next middleware

### 2. Route Matching
- Routes matched in order of registration
- More specific routes should come first
- `/:code` must be last to catch all short codes

### 3. Async/Await Pattern
- All database operations are async
- Controllers use async/await
- Errors caught by try/catch and passed to errorHandler

### 4. Database Connection Pool
- Reuses connections for efficiency
- Handles multiple concurrent requests
- Auto-manages connection lifecycle

### 5. Error Propagation
- Errors thrown in async functions
- Caught by try/catch blocks
- Passed to errorHandler via `next(error)`

---

## 🔍 Debugging Flow

When debugging, follow this flow:

1. **Check Request**
   - Method, path, headers, body
   - Logged by request logger middleware

2. **Check Route Matching**
   - Verify route is registered
   - Check route order
   - Verify path parameters

3. **Check Validation**
   - Input format validation
   - Error messages in response

4. **Check Controller Logic**
   - Business logic execution
   - Data extraction from request
   - Function calls to models

5. **Check Database**
   - Connection status
   - Query execution
   - Data returned

6. **Check Response**
   - Status code
   - Response body
   - Headers

---

**Last Updated**: 2024-01-15

