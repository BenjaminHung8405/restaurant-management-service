# Restaurant Management System - API Documentation

> **Base URL:** `http://localhost:5000/api/v1`
>
> **Last Updated:** 2024
>
> **API Version:** v1

---

## Table of Contents

1. [Authentication](#authentication)
2. [Menu Catalog](#menu-catalog)
3. [Operations](#operations)
4. [Sales](#sales)
5. [Standard Response Format](#standard-response-format)
6. [Error Handling](#error-handling)

---

## Authentication

### POST /api/v1/auth/register

**Description:** Register a new user account with email and password.

**Authorization:** Public

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "phone_number": "0901234567",
  "role": "customer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | User's email address (must be unique) |
| `password` | string | ✓ | Password (minimum 8 characters) |
| `full_name` | string | ✓ | Full name of the user |
| `phone_number` | string | ✓ | Phone number for contact |
| `role` | string | ✓ | User role: `'admin'`, `'staff'`, or `'customer'` |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_number": "0901234567",
    "role": "customer"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid input, missing required fields, or email already exists
- `500 Internal Server Error` — Database error

---

### POST /api/v1/auth/login

**Description:** Authenticate user and receive JWT token for subsequent requests.

**Authorization:** Public

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | User's email address |
| `password` | string | ✓ | User's password |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZmZDg3MjdjLThjZDUtNDE5OC1iZjhiLTIwMWU2ODk5ODdlYiIsImVtYWlsIjoiYWRtaW5AZnVlbG1ldC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMzMDMwMTMsImV4cCI6MTc3MzkwNzgxM30.V6pf5ioWgbE96PMRJWMcfg2vR1kQeqpuyTyc-60uWPA",
    "user": {
      "id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "customer"
    }
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid email or password format
- `401 Unauthorized` — Email or password incorrect
- `500 Internal Server Error` — Server error

---

## Menu Catalog

### GET /api/v1/categories

**Description:** Retrieve all menu categories.

**Authorization:** Public

**Request:**

No request body required. No query parameters.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Beef",
      "description": "Premium beef dishes prepared by expert chefs",
      "image_url": "https://example.com/beef.jpg"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Chicken",
      "description": "Tender chicken prepared in various styles",
      "image_url": "https://example.com/chicken.jpg"
    }
  ],
  "error": null
}
```

**Errors:**
- `500 Internal Server Error` — Database error

---

### GET /api/v1/categories/:id

**Description:** Retrieve a specific category by its ID.

**Authorization:** Public

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Category ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Beef",
    "description": "Premium beef dishes prepared by expert chefs",
    "image_url": "https://example.com/beef.jpg"
  },
  "error": null
}
```

**Errors:**
- `404 Not Found` — Category does not exist
- `500 Internal Server Error` — Database error

---

### POST /api/v1/categories

**Description:** Create a new menu category. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

```json
{
  "name": "Seafood",
  "description": "Fresh seafood specialties from local waters",
  "image_url": "https://example.com/seafood.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Category name (must be unique) |
| `description` | string | ✗ | Category description |
| `image_url` | string | ✗ | URL to category image |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "name": "Seafood",
    "description": "Fresh seafood specialties from local waters",
    "image_url": "https://example.com/seafood.jpg"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing required fields or duplicate category name
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/categories/:id

**Description:** Update an existing category. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Category ID |

```json
{
  "name": "Premium Seafood",
  "description": "Updated description",
  "image_url": "https://example.com/seafood-new.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✗ | Updated category name |
| `description` | string | ✗ | Updated description |
| `image_url` | string | ✗ | Updated image URL |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "name": "Premium Seafood",
    "description": "Updated description",
    "image_url": "https://example.com/seafood-new.jpg"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Category does not exist
- `500 Internal Server Error` — Database error

---

### DELETE /api/v1/categories/:id

**Description:** Delete a category. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Category ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "name": "Premium Seafood",
    "description": "Updated description",
    "image_url": "https://example.com/seafood-new.jpg"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Category does not exist
- `500 Internal Server Error` — Database error

---

### GET /api/v1/menu-items

**Description:** Retrieve all menu items with optional category filtering.

**Authorization:** Public

**Request:**

| Query Param | Type | Required | Description |
|------------|------|----------|-------------|
| `categoryId` | string (UUID) | ✗ | Filter by category UUID |

**Example:** `GET /api/v1/menu-items?categoryId=123e4567-e89b-12d3-a456-426614174000`

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "category_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Beef Steak Tenderloin",
      "description": "Grilled premium beef tenderloin with herbs",
      "price": 350000,
      "image_url": "https://example.com/steak.jpg",
      "area": "Main Course",
      "is_available": true
    },
    {
      "id": "523e4567-e89b-12d3-a456-426614174004",
      "category_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Beef Rendang",
      "description": "Spiced beef slow-cooked in coconut milk",
      "price": 200000,
      "image_url": "https://example.com/rendang.jpg",
      "area": "Main Course",
      "is_available": true
    }
  ],
  "error": null
}
```

**Errors:**
- `500 Internal Server Error` — Database error

---

### GET /api/v1/menu-items/:id

**Description:** Retrieve a specific menu item by its ID.

**Authorization:** Public

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Menu item ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Menu item retrieved successfully",
  "data": {
    "id": "423e4567-e89b-12d3-a456-426614174003",
    "category_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Beef Steak Tenderloin",
    "description": "Grilled premium beef tenderloin with herbs",
    "price": 350000,
    "image_url": "https://example.com/steak.jpg",
    "area": "Main Course",
    "is_available": true
  },
  "error": null
}
```

**Errors:**
- `404 Not Found` — Menu item does not exist
- `500 Internal Server Error` — Database error

---

### POST /api/v1/menu-items

**Description:** Create a new menu item. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

```json
{
  "category_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon grilled to perfection",
  "price": 280000,
  "image_url": "https://example.com/salmon.jpg",
  "area": "Main Course",
  "is_available": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category_id` | string (UUID) | ✓ | Category ID (must exist) |
| `name` | string | ✓ | Menu item name (must be unique) |
| `description` | string | ✗ | Item description |
| `price` | number | ✓ | Price in VND (e.g., 280000) |
| `image_url` | string | ✗ | URL to item image |
| `area` | string | ✗ | Dish area/section (e.g., "Main Course", "Appetizer") |
| `is_available` | boolean | ✗ | Availability status (default: true) |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": "623e4567-e89b-12d3-a456-426614174005",
    "category_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon grilled to perfection",
    "price": 280000,
    "image_url": "https://example.com/salmon.jpg",
    "area": "Main Course",
    "is_available": true
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing required fields, invalid category, or duplicate item name
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/menu-items/:id

**Description:** Update an existing menu item. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Menu item ID |

```json
{
  "name": "Premium Grilled Salmon",
  "price": 320000,
  "is_available": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category_id` | string (UUID) | ✗ | Updated category ID |
| `name` | string | ✗ | Updated name |
| `description` | string | ✗ | Updated description |
| `price` | number | ✗ | Updated price |
| `image_url` | string | ✗ | Updated image URL |
| `area` | string | ✗ | Updated area |
| `is_available` | boolean | ✗ | Updated availability status |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "id": "623e4567-e89b-12d3-a456-426614174005",
    "category_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Premium Grilled Salmon",
    "description": "Fresh Atlantic salmon grilled to perfection",
    "price": 320000,
    "image_url": "https://example.com/salmon.jpg",
    "area": "Main Course",
    "is_available": false
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Menu item does not exist
- `500 Internal Server Error` — Database error

---

### DELETE /api/v1/menu-items/:id

**Description:** Delete a menu item. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Menu item ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Menu item deleted successfully",
  "data": {
    "id": "623e4567-e89b-12d3-a456-426614174005",
    "category_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Premium Grilled Salmon",
    "description": "Fresh Atlantic salmon grilled to perfection",
    "price": 320000,
    "image_url": "https://example.com/salmon.jpg",
    "area": "Main Course",
    "is_available": false
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Menu item does not exist
- `500 Internal Server Error` — Database error

---

## Operations

### GET /api/v1/tables

**Description:** Retrieve all restaurant tables. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

No request body or query parameters required.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tables retrieved successfully",
  "data": [
    {
      "id": "723e4567-e89b-12d3-a456-426614174006",
      "table_number": "VIP-01",
      "capacity": 4,
      "status": "available"
    },
    {
      "id": "823e4567-e89b-12d3-a456-426614174007",
      "table_number": "VIP-02",
      "capacity": 6,
      "status": "occupied"
    }
  ],
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `500 Internal Server Error` — Database error

---

### GET /api/v1/tables/:id

**Description:** Retrieve a specific table by its ID. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Table ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Table retrieved successfully",
  "data": {
    "id": "723e4567-e89b-12d3-a456-426614174006",
    "table_number": "VIP-01",
    "capacity": 4,
    "status": "available"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Table does not exist
- `500 Internal Server Error` — Database error

---

### POST /api/v1/tables

**Description:** Create a new table. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

```json
{
  "table_number": "A-05",
  "capacity": 4,
  "status": "available"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `table_number` | string | ✓ | Table identifier (e.g., "VIP-01", "A-05") |
| `capacity` | number | ✓ | Seating capacity (number of guests) |
| `status` | string | ✗ | Table status: `'available'` or `'occupied'` (default: `'available'`) |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "id": "923e4567-e89b-12d3-a456-426614174008",
    "table_number": "A-05",
    "capacity": 4,
    "status": "available"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing required fields
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/tables/:id

**Description:** Update table information. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Table ID |

```json
{
  "table_number": "A-05-Updated",
  "capacity": 6,
  "status": "occupied"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `table_number` | string | ✗ | Updated table identifier |
| `capacity` | number | ✗ | Updated seating capacity |
| `status` | string | ✗ | Updated status (`'available'` or `'occupied'`) |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Table updated successfully",
  "data": {
    "id": "923e4567-e89b-12d3-a456-426614174008",
    "table_number": "A-05-Updated",
    "capacity": 6,
    "status": "occupied"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Table does not exist
- `500 Internal Server Error` — Database error

---

### DELETE /api/v1/tables/:id

**Description:** Delete a table. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Table ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Table deleted successfully",
  "data": {
    "id": "923e4567-e89b-12d3-a456-426614174008",
    "table_number": "A-05-Updated",
    "capacity": 6,
    "status": "occupied"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Table does not exist
- `500 Internal Server Error` — Database error

---

### GET /api/v1/reservations

**Description:** Retrieve reservations. Customers see only their own; Admin/Staff see all.

**Authorization:** Bearer Token (All authenticated users)

**Request:**

No request body or query parameters required.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reservations retrieved successfully",
  "data": [
    {
      "id": "a23e4567-e89b-12d3-a456-426614174009",
      "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
      "table_id": null,
      "reservation_time": "2026-03-15T19:00:00Z",
      "guest_count": 4,
      "notes": "Anniversary dinner, please prepare flowers",
      "status": "pending"
    },
    {
      "id": "b23e4567-e89b-12d3-a456-426614174010",
      "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
      "table_id": "723e4567-e89b-12d3-a456-426614174006",
      "reservation_time": "2026-03-20T18:30:00Z",
      "guest_count": 2,
      "notes": null,
      "status": "confirmed"
    }
  ],
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `500 Internal Server Error` — Database error

---

### GET /api/v1/reservations/:id

**Description:** Retrieve a specific reservation. Users can only view their own unless Admin/Staff.

**Authorization:** Bearer Token (All authenticated users)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Reservation ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reservation retrieved successfully",
  "data": {
    "id": "a23e4567-e89b-12d3-a456-426614174009",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": null,
    "reservation_time": "2026-03-15T19:00:00Z",
    "guest_count": 4,
    "notes": "Anniversary dinner, please prepare flowers",
    "status": "pending"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Cannot view other users' reservations (customer only)
- `404 Not Found` — Reservation does not exist
- `500 Internal Server Error` — Database error

---

### POST /api/v1/reservations

**Description:** Create a new reservation. Authenticated users only. `user_id` is automatically extracted from JWT.

**Authorization:** Bearer Token (All authenticated users)

**Request:**

```json
{
  "reservation_time": "2026-03-15T19:00:00Z",
  "guest_count": 4,
  "notes": "Anniversary dinner, please prepare flowers"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reservation_time` | string (ISO 8601) | ✓ | Reservation date and time (e.g., "2026-03-15T19:00:00Z") |
| `guest_count` | number | ✓ | Number of guests |
| `notes` | string | ✗ | Special requests or notes |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": "c23e4567-e89b-12d3-a456-426614174011",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": null,
    "reservation_time": "2026-03-15T19:00:00Z",
    "guest_count": 4,
    "notes": "Anniversary dinner, please prepare flowers",
    "status": "pending"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing required fields or invalid time format
- `401 Unauthorized` — Missing or invalid token
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/reservations/:id/assign

**Description:** Assign a table to a reservation and confirm it. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Reservation ID |

```json
{
  "table_id": "723e4567-e89b-12d3-a456-426614174006"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `table_id` | string (UUID) | ✓ | Table ID to assign to reservation |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reservation confirmed and table assigned",
  "data": {
    "id": "c23e4567-e89b-12d3-a456-426614174011",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "reservation_time": "2026-03-15T19:00:00Z",
    "guest_count": 4,
    "notes": "Anniversary dinner, please prepare flowers",
    "status": "confirmed"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing or invalid table_id
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Reservation or table does not exist
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/reservations/:id

**Description:** Update reservation details. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Reservation ID |

```json
{
  "reservation_time": "2026-03-16T19:30:00Z",
  "guest_count": 5,
  "notes": "Updated notes"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reservation_time` | string (ISO 8601) | ✗ | Updated reservation time |
| `guest_count` | number | ✗ | Updated guest count |
| `notes` | string | ✗ | Updated notes |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reservation updated successfully",
  "data": {
    "id": "c23e4567-e89b-12d3-a456-426614174011",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "reservation_time": "2026-03-16T19:30:00Z",
    "guest_count": 5,
    "notes": "Updated notes",
    "status": "confirmed"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Reservation does not exist
- `500 Internal Server Error` — Database error

---

### DELETE /api/v1/reservations/:id

**Description:** Delete a reservation. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Reservation ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reservation deleted successfully",
  "data": {
    "id": "c23e4567-e89b-12d3-a456-426614174011",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "reservation_time": "2026-03-16T19:30:00Z",
    "guest_count": 5,
    "notes": "Updated notes",
    "status": "confirmed"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Reservation does not exist
- `500 Internal Server Error` — Database error

---

## Sales

### GET /api/v1/orders

**Description:** Retrieve all orders. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

No request body or query parameters required.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": "d23e4567-e89b-12d3-a456-426614174012",
      "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
      "table_id": "723e4567-e89b-12d3-a456-426614174006",
      "order_status": "pending",
      "payment_status": "unpaid",
      "total_amount": 850000,
      "created_at": "2026-03-15T19:00:00Z"
    },
    {
      "id": "e23e4567-e89b-12d3-a456-426614174013",
      "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
      "table_id": "823e4567-e89b-12d3-a456-426614174007",
      "order_status": "completed",
      "payment_status": "paid",
      "total_amount": 1200000,
      "created_at": "2026-03-14T18:30:00Z"
    }
  ],
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `500 Internal Server Error` — Database error

---

### GET /api/v1/orders/:id

**Description:** Retrieve a specific order with its items. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Order ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "id": "d23e4567-e89b-12d3-a456-426614174012",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "order_status": "pending",
    "payment_status": "unpaid",
    "total_amount": 850000,
    "created_at": "2026-03-15T19:00:00Z",
    "items": [
      {
        "id": "f23e4567-e89b-12d3-a456-426614174014",
        "menu_item_id": "423e4567-e89b-12d3-a456-426614174003",
        "quantity": 2,
        "unit_price": 350000,
        "subtotal": 700000
      },
      {
        "id": "g23e4567-e89b-12d3-a456-426614174015",
        "menu_item_id": "623e4567-e89b-12d3-a456-426614174005",
        "quantity": 1,
        "unit_price": 150000,
        "subtotal": 150000
      }
    ]
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Order does not exist
- `500 Internal Server Error` — Database error

---

### POST /api/v1/orders

**Description:** Create a new order with items. Authenticated users only. `user_id` is automatically extracted from JWT.

**Authorization:** Bearer Token (All authenticated users)

**Request:**

```json
{
  "table_id": "723e4567-e89b-12d3-a456-426614174006",
  "items": [
    {
      "menu_item_id": "423e4567-e89b-12d3-a456-426614174003",
      "quantity": 2
    },
    {
      "menu_item_id": "623e4567-e89b-12d3-a456-426614174005",
      "quantity": 1
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `table_id` | string (UUID) | ✗ | Table ID (optional, for dine-in orders) |
| `items` | array | ✓ | Array of order items (must have at least one item) |
| `items[].menu_item_id` | string (UUID) | ✓ | Menu item ID |
| `items[].quantity` | number | ✓ | Quantity (must be > 0) |

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "h23e4567-e89b-12d3-a456-426614174016",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "order_status": "pending",
    "payment_status": "unpaid",
    "total_amount": 850000,
    "created_at": "2026-03-15T19:05:00Z",
    "items": [
      {
        "id": "i23e4567-e89b-12d3-a456-426614174017",
        "menu_item_id": "423e4567-e89b-12d3-a456-426614174003",
        "quantity": 2,
        "unit_price": 350000,
        "subtotal": 700000
      },
      {
        "id": "j23e4567-e89b-12d3-a456-426614174018",
        "menu_item_id": "623e4567-e89b-12d3-a456-426614174005",
        "quantity": 1,
        "unit_price": 150000,
        "subtotal": 150000
      }
    ]
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Missing required fields, empty items array, or invalid menu item
- `401 Unauthorized` — Missing or invalid token
- `500 Internal Server Error` — Database error

---

### PUT /api/v1/orders/:id

**Description:** Update order status or payment status. Admin and Staff only.

**Authorization:** Bearer Token (Admin or Staff role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Order ID |

```json
{
  "order_status": "completed",
  "payment_status": "paid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_status` | string | ✗ | Order status: `'pending'`, `'preparing'`, `'completed'`, `'cancelled'` |
| `payment_status` | string | ✗ | Payment status: `'unpaid'`, `'paid'`, `'failed'` |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": "h23e4567-e89b-12d3-a456-426614174016",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "order_status": "completed",
    "payment_status": "paid",
    "total_amount": 850000,
    "created_at": "2026-03-15T19:05:00Z"
  },
  "error": null
}
```

**Errors:**
- `400 Bad Request` — Invalid status values
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin/staff)
- `404 Not Found` — Order does not exist
- `500 Internal Server Error` — Database error

---

### DELETE /api/v1/orders/:id

**Description:** Delete an order. Admin only.

**Authorization:** Bearer Token (Admin role required)

**Request:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Order ID |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": {
    "id": "h23e4567-e89b-12d3-a456-426614174016",
    "user_id": "6fd8727c-8cd5-4198-bf8b-201e68998e7b",
    "table_id": "723e4567-e89b-12d3-a456-426614174006",
    "order_status": "completed",
    "payment_status": "paid",
    "total_amount": 850000,
    "created_at": "2026-03-15T19:05:00Z"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid token
- `403 Forbidden` — Insufficient permissions (not admin)
- `404 Not Found` — Order does not exist
- `500 Internal Server Error` — Database error

---

## Standard Response Format

All API responses follow a standardized JSON structure:

```json
{
  "success": boolean,
  "message": string,
  "data": any | null,
  "error": any | null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates whether the request was successful |
| `message` | string | Human-readable message describing the result |
| `data` | any \| null | Response payload (null on error) |
| `error` | any \| null | Error details (null on success) |

### Success Response Example

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ },
  "error": null
}
```

### Error Response Example

```json
{
  "success": false,
  "message": "Invalid request",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Email is required"
  }
}
```

---

## Error Handling

### Standard HTTP Status Codes

| Status Code | Description | Example Scenario |
|------------|-------------|-------------------|
| `200 OK` | Request successful | Successfully retrieved resource |
| `201 Created` | Resource created | Successfully created new item |
| `400 Bad Request` | Invalid input | Missing required fields, invalid format |
| `401 Unauthorized` | Missing or invalid authentication | Invalid/expired JWT token |
| `403 Forbidden` | Insufficient permissions | User doesn't have required role |
| `404 Not Found` | Resource doesn't exist | Requested item ID not found |
| `500 Internal Server Error` | Server error | Database connection failure |

### Authentication

All protected endpoints require a **Bearer token** in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Structure:**
- Issued on successful login via `POST /api/v1/auth/login`
- Expires in 7 days
- Contains user ID, email, and role (admin/staff/customer)
- Include in all subsequent requests to protected endpoints

### Role-Based Access Control (RBAC)

The API uses three user roles with varying permission levels:

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all endpoints |
| `staff` | Can view/manage tables, reservations, and orders |
| `customer` | Can view menu, create reservations, and place orders |

---

## Health Check

### GET /api/v1/health

**Description:** Check if the API server is running and healthy.

**Authorization:** Public

**Request:**

No request body or parameters required.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Server is healthy",
  "data": null,
  "error": null
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Future versions may include:
- Request throttling per IP
- Per-user API quota
- Request timeout policies

---

## Versioning

This is **API v1** as indicated by the base URL `/api/v1`. Future versions may introduce breaking changes, which will be reflected in a new URL version (e.g., `/api/v2`).

---

## Support & Troubleshooting

For issues or questions:

1. Check the error message and HTTP status code
2. Verify your JWT token is valid and hasn't expired
3. Confirm you have the required role permissions
4. Review request payload structure against documentation
5. Contact the backend development team if issues persist

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Backend Development Team