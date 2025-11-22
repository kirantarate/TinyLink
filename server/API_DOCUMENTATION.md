# TinyLink API Documentation

**Base URL**: `http://localhost:5000`

---

## POST APIs

### Create Link
**POST** `/api/links`

**Headers**: `Content-Type: application/json`

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
  "id": 1,
  "code": "mycode1",
  "target_url": "https://example.com",
  "total_clicks": 0,
  "last_clicked": null,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid URL or code format
- `409` - Code already exists

---

## GET APIs

### Health Check
**GET** `/healthz`

**Response** (200 OK):
```json
{
  "ok": true,
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All Links
**GET** `/api/links`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "code": "abc123",
    "target_url": "https://example.com",
    "total_clicks": 42,
    "last_clicked": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-10T08:00:00.000Z"
  }
]
```

---

### Get Link Stats
**GET** `/api/links/:code`

**URL Parameter**: `code` (6-8 alphanumeric characters)

**Response** (200 OK):
```json
{
  "id": 1,
  "code": "abc123",
  "target_url": "https://example.com",
  "total_clicks": 42,
  "last_clicked": "2024-01-15T10:30:00.000Z",
  "created_at": "2024-01-10T08:00:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid code format
- `404` - Link not found

---

### Stats Page
**GET** `/code/:code`

**URL Parameter**: `code` (6-8 alphanumeric characters)

**Response**: Same as Get Link Stats (200 OK)

---

### Redirect
**GET** `/:code`

**URL Parameter**: `code` (6-8 alphanumeric characters)

**Response** (302 Found):
- Redirects to original URL
- Automatically increments click count
- Updates last_clicked timestamp

**Error Responses**:
- `400` - Invalid code format
- `404` - Link not found

---

## DELETE APIs

### Delete Link
**DELETE** `/api/links/:code`

**URL Parameter**: `code` (6-8 alphanumeric characters)

**Response** (200 OK):
```json
{
  "message": "Link deleted successfully",
  "link": {
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

## Request Body Examples

### Create Link - With Custom Code
```json
{
  "target_url": "https://example.com/very/long/url",
  "code": "mycode1"
}
```

### Create Link - Auto-Generated Code
```json
{
  "target_url": "https://example.com"
}
```

### Create Link - Without Protocol
```json
{
  "target_url": "example.com",
  "code": "example"
}
```

### Create Link - 8 Character Code
```json
{
  "target_url": "https://google.com",
  "code": "google12"
}
```

---

## Code Format Rules

- **Length**: 6 to 8 characters
- **Pattern**: `[A-Za-z0-9]{6,8}`
- **Uniqueness**: Globally unique across all users

**Valid**: `abc123`, `MyCode1`, `12345678`  
**Invalid**: `short` (too short), `toolongcode` (too long), `my-code` (contains hyphen)

---

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200` - Success
- `201` - Created
- `302` - Redirect
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate code)
- `500` - Internal Server Error

---

**Last Updated**: 2024-01-15
