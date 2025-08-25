# ALPHADEVS MICROSERVICES PROJECT - COMPREHENSIVE API DOCUMENTATION

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Architecture & Infrastructure](#architecture--infrastructure)
3. [Service Details](#service-details)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Authentication & Authorization](#authentication--authorization)
7. [Middleware & Utilities](#middleware--utilities)
8. [Configuration & Environment](#configuration--environment)
9. [Deployment & Docker](#deployment--docker)
10. [Testing & Examples](#testing--examples)
11. [Error Handling](#error-handling)
12. [Security Features](#security-features)

---

## 🏗️ PROJECT OVERVIEW

**Project Name**: AlphaDevs Microservices  
**Description**: A microservices-based e-commerce application with centralized authentication  
**Architecture**: Microservices with API Gateway pattern  
**Database**: MongoDB with Redis caching  
**Message Broker**: Apache Kafka  
**Containerization**: Docker with Docker Compose  
**Reverse Proxy**: Nginx  

---

## 🏛️ ARCHITECTURE & INFRASTRUCTURE

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Web Browser   │    │   Mobile Apps   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Nginx Gateway (80)     │
                    │   Reverse Proxy & Load    │
                    │        Balancer           │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   Auth Service    │  │   Users Service   │  │   Items Service   │
│     (4004)        │  │      (4001)       │  │      (4002)       │
│                   │  │                   │  │                   │
│ • Token Validation│  │ • User Management │  │ • Item Catalog    │
│ • JWT Generation  │  │ • Registration    │  │ • Stock Management│
│ • Service Auth    │  │ • Authentication  │  │ • Caching         │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Orders Service (4003)   │
                    │                           │
                    │ • Order Processing        │
                    │ • Inventory Updates       │
                    │ • Event Handling          │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│     MongoDB       │  │      Redis        │  │     Kafka         │
│   (27017)         │  │      (6379)       │  │     (9092)        │
│                   │  │                   │  │                   │
│ • User Data       │  │ • Session Cache   │  │ • Event Streaming │
│ • Item Data       │  │ • API Response    │  │ • Order Events    │
│ • Order Data      │  │ • Rate Limiting   │  │ • Notifications   │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

### Infrastructure Components

#### 1. **Zookeeper Service**
- **Image**: `bitnami/zookeeper:latest`
- **Port**: 2181
- **Purpose**: Service discovery and coordination for Kafka

#### 2. **Apache Kafka**
- **Image**: `bitnami/kafka:latest`
- **Port**: 9092
- **Purpose**: Event streaming and message queuing
- **Configuration**: Single broker setup with Zookeeper coordination

#### 3. **MongoDB Database**
- **Image**: `mongo:5`
- **Port**: 27017
- **Purpose**: Primary data storage for all services
- **Volume**: Persistent data storage with `mongo_data` volume

#### 4. **Redis Cache**
- **Image**: `redis:6`
- **Port**: 6379
- **Purpose**: Caching layer for API responses and sessions

#### 5. **Nginx Gateway**
- **Image**: `nginx:latest`
- **Port**: 80
- **Purpose**: Reverse proxy, load balancing, and CORS handling

---

## 🔧 SERVICE DETAILS

### 1. AUTH SERVICE (Port 4004)

#### Service Description
Centralized authentication service responsible for JWT token management, validation, and service-to-service authentication.

#### Key Features
- JWT token generation and validation
- Service token validation for inter-service communication
- Token refresh functionality
- Centralized authentication logic

#### Dependencies
```json
{
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.18.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "cookie-parser": "^1.4.6"
}
```

#### Health Check Endpoint
- **URL**: `GET /health`
- **Response**: Service status, port, and timestamp

### 2. USERS SERVICE (Port 4001)

#### Service Description
User management service handling user registration, authentication, and profile management.

#### Key Features
- User registration with password hashing
- User login with JWT token generation
- User profile management
- Role-based access control (user/admin)

#### Dependencies
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.17.2",
  "bcryptjs": "^3.0.2",
  "express-validator": "^7.2.1",
  "express-async-handler": "^1.2.0"
}
```

#### Authentication Flow
1. User registers/logs in
2. Service validates credentials
3. Calls Auth Service to generate JWT token
4. Returns token to client

### 3. ITEMS SERVICE (Port 4002)

#### Service Description
Product catalog service managing items, inventory, and stock operations.

#### Key Features
- Item CRUD operations
- Inventory management with stock tracking
- Redis caching for performance
- Pagination and filtering
- Stock decrement operations

#### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "ioredis": "^5.3.2",
  "kafkajs": "^2.2.4"
}
```

#### Caching Strategy
- **Items List**: 5-minute cache with pagination support
- **Item Details**: 10-minute cache for individual items
- **Cache Invalidation**: Automatic on CRUD operations

### 4. ORDERS SERVICE (Port 4003)

#### Service Description
Order processing service handling order creation, management, and inventory synchronization.

#### Key Features
- Order lifecycle management
- Real-time stock validation
- Event-driven architecture
- Redis caching for orders
- Integration with Items Service

#### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.17.2",
  "axios": "^1.11.0",
  "ioredis": "^5.3.2",
  "kafkajs": "^2.2.4"
}
```

#### Order Status Flow
```
pending → processing → shipped → delivered
    ↓
cancelled
```

---

## 🌐 API ENDPOINTS

### AUTH SERVICE ENDPOINTS

#### 1. Token Validation
- **Method**: `POST`
- **URL**: `/api/auth/validate`
- **Description**: Validates JWT token and returns user information
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200)**:
  ```json
  {
    "valid": true,
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```
- **Response (401)**:
  ```json
  {
    "error": "Invalid Token",
    "message": "Token validation failed"
  }
  ```

#### 2. Token Refresh
- **Method**: `POST`
- **URL**: `/api/auth/refresh`
- **Description**: Refreshes expired JWT token
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Generate Token (Service-to-Service)
- **Method**: `POST`
- **URL**: `/api/auth/generate`
- **Description**: Generates JWT token for user (internal service use)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <service_token>
  ```
- **Request Body**:
  ```json
  {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 4. Validate Service Token
- **Method**: `POST`
- **URL**: `/api/auth/validate-service`
- **Description**: Validates service token for inter-service communication
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "token": "items-service-secret-token-123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "valid": true,
    "message": "Service token is valid"
  }
  ```

### USERS SERVICE ENDPOINTS

#### 1. User Registration
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Description**: Creates new user account
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Validation Rules**:
  - Name: Required, trimmed
  - Email: Required, valid email format, unique
  - Password: Required, minimum 6 characters
- **Response (201)**:
  ```json
  {
    "message": "Account created successfully!",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **Response (409)**:
  ```json
  {
    "message": "User with this email already exists"
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Description**: Authenticates user and generates JWT token
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **Cookies**: Sets `token` cookie (httpOnly, secure in production)

#### 3. Get User Profile
- **Method**: `GET`
- **URL**: `/api/users/me`
- **Description**: Retrieves current user's profile information
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (200)**:
  ```json
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
  ```

### ITEMS SERVICE ENDPOINTS

#### 1. List Items
- **Method**: `GET`
- **URL**: `/api/items`
- **Description**: Retrieves paginated list of items with caching
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Query Parameters**:
  - `page` (optional): Page number, default: 1
  - `limit` (optional): Items per page, default: 10, max: 100
- **Response (200)**:
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "items": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Premium Widget",
        "description": "High-quality widget for professional use",
        "category": "Electronics",
        "rate": 99.99,
        "qty": 50,
        "rating": 4.5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
  ```

#### 2. Get Item by ID
- **Method**: `GET`
- **URL**: `/api/items/:id`
- **Description**: Retrieves specific item details with caching
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response (200)**:
  ```json
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Premium Widget",
    "description": "High-quality widget for professional use",
    "category": "Electronics",
    "rate": 99.99,
    "qty": 50,
    "rating": 4.5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
  ```

#### 3. Create Item (Admin Only)
- **Method**: `POST`
- **URL**: `/api/items`
- **Description**: Creates new item in catalog
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Required Role**: `admin`
- **Request Body**:
  ```json
  {
    "name": "New Product",
    "description": "Product description",
    "category": "Category Name",
    "rate": 29.99,
    "qty": 100,
    "rating": 5
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "New Product",
    "description": "Product description",
    "category": "Category Name",
    "rate": 29.99,
    "qty": 100,
    "rating": 5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
  ```

#### 4. Update Item (Admin Only)
- **Method**: `PUT`
- **URL**: `/api/items/:id`
- **Description**: Updates existing item information
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Required Role**: `admin`
- **Request Body**: Partial update with any item fields
- **Response (200)**: Updated item object

#### 5. Delete Item (Admin Only)
- **Method**: `DELETE`
- **URL**: `/api/items/:id`
- **Description**: Removes item from catalog
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Required Role**: `admin`
- **Response (200)**:
  ```json
  {
    "message": "Item deleted"
  }
  ```

#### 6. Decrement Stock
- **Method**: `PUT`
- **URL**: `/api/items/:id/decrement`
- **Description**: Reduces item stock quantity (used during order placement)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Request Body**:
  ```json
  {
    "quantity": 5
  }
  ```
- **Response (200)**: Updated item with reduced stock
- **Error (400)**: If insufficient stock available

### ORDERS SERVICE ENDPOINTS

#### 1. Create Order
- **Method**: `POST`
- **URL**: `/api/orders`
- **Description**: Creates new order with stock validation
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main Street, City, Country"
  }
  ```
- **Process Flow**:
  1. Validates all items exist and have sufficient stock
  2. Calculates total amount
  3. Updates stock in Items Service
  4. Creates order record
  5. Emits ORDER_PLACED event
- **Response (201)**:
  ```json
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "items": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "totalAmount": 199.98,
    "status": "pending",
    "shippingAddress": "123 Main Street, City, Country",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
  ```

#### 2. Get All Orders
- **Method**: `GET`
- **URL**: `/api/orders`
- **Description**: Retrieves orders with role-based access
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Query Parameters**:
  - `status` (optional): Filter by order status
  - `page` (optional): Page number, default: 1
  - `limit` (optional): Orders per page, default: 10
- **Access Control**:
  - **Admin**: Can see all orders with pagination
  - **User**: Can only see their own orders
- **Response (200)**:
  ```json
  {
    "orders": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "items": [...],
        "totalAmount": 199.98,
        "status": "pending",
        "shippingAddress": "123 Main Street, City, Country",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
  ```

#### 3. Get Order by ID
- **Method**: `GET`
- **URL**: `/api/orders/:id`
- **Description**: Retrieves specific order details
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Access Control**:
  - **Admin**: Can access any order
  - **User**: Can only access their own orders
- **Response (200)**: Order object with full details

#### 4. Update Order Status (Admin Only)
- **Method**: `PATCH`
- **URL**: `/api/orders/:id`
- **Description**: Updates order status with validation
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Required Role**: `admin`
- **Request Body**:
  ```json
  {
    "status": "processing"
  }
  ```
- **Valid Status Transitions**:
  ```
  pending → processing, cancelled
  processing → shipped
  shipped → delivered
  ```
- **Response (200)**: Updated order object

#### 5. Delete/Cancel Order
- **Method**: `DELETE`
- **URL**: `/api/orders/:id`
- **Description**: Cancels order and restores stock
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Access Control**: Users can only cancel their own orders
- **Restrictions**: Only pending orders can be cancelled
- **Process**:
  1. Restores stock in Items Service
  2. Deletes order record
  3. Clears related caches
- **Response (200)**:
  ```json
  {
    "message": "Order cancelled"
  }
  ```

---

## 🗄️ DATA MODELS

### User Model
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  timestamps: true
}
```

### Item Model
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: "NA"
  },
  category: {
    type: String,
    required: false,
    default: "NA"
  },
  rate: {
    type: Number,
    min: 0,
    required: true,
    default: 0
  },
  qty: {
    type: Number,
    min: 0,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false,
    default: 5
  },
  timestamps: true
}
```

### Order Model
```javascript
{
  userId: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  timestamps: true
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token Structure
```javascript
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "role": "user",
  "iat": 1705312200,
  "exp": 1705315800
}
```

### Authentication Flow
1. **User Registration/Login**
   - User provides credentials
   - Service validates and hashes password
   - Calls Auth Service to generate JWT

2. **Token Validation**
   - Client includes JWT in Authorization header
   - Service validates token with Auth Service
   - User information attached to request

3. **Service-to-Service Authentication**
   - Services use service tokens for internal communication
   - Auth Service validates service tokens
   - Enables secure inter-service API calls

### Role-Based Access Control
- **User Role**: Basic access to own resources
- **Admin Role**: Full access to all resources
- **Service Role**: Internal service communication

### Security Features
- **Password Hashing**: SHA-256 with salt
- **JWT Expiration**: Configurable (default: 1 hour)
- **HTTPS Cookies**: Secure cookie handling
- **CORS Protection**: Cross-origin request handling
- **Helmet Security**: HTTP header security

---

## 🛠️ MIDDLEWARE & UTILITIES

### Authentication Middleware
```javascript
// Options
{
  roles: ['admin'],           // Required user roles
  useCookie: false,           // Use cookie instead of header
  cookieName: 'auth_token',   // Cookie name for token
  isServiceAuth: false        // Service token validation
}
```

### Error Handling Middleware
- **Global Error Handler**: Catches all unhandled errors
- **Validation Errors**: Input validation error handling
- **Database Errors**: MongoDB error handling
- **Service Errors**: Inter-service communication errors

### Caching Middleware
- **Redis Integration**: Automatic caching for API responses
- **Cache Keys**: Structured key generation
- **TTL Management**: Configurable cache expiration
- **Cache Invalidation**: Automatic on data changes

### Validation Middleware
- **Input Validation**: Request body and parameter validation
- **Schema Validation**: Mongoose schema validation
- **Custom Validators**: Business logic validation

---

## ⚙️ CONFIGURATION & ENVIRONMENT

### Environment Variables
```env
# Database Configuration
DB_URI=mongodb://mongo:27017/alphadevs
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=1h
AUTH_COOKIE_NAME=auth_token

# Service URLs
AUTH_SERVICE_URL=http://auth_service:4000/api

# Service Tokens (for inter-service communication)
ITEMS_SERVICE_TOKEN=items-service-secret-token-123
ORDERS_SERVICE_TOKEN=orders-service-secret-token-456
USERS_SERVICE_TOKEN=users-service-secret-token-789

# Node Environment
NODE_ENV=development
```

### Service Configuration
```javascript
module.exports = {
  port: process.env.PORT || 4000,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'auth_token',
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  redisUrl: process.env.REDIS_URL,
  
  // Service tokens
  itemsServiceToken: process.env.ITEMS_SERVICE_TOKEN,
  ordersServiceToken: process.env.ORDERS_SERVICE_TOKEN,
  usersServiceToken: process.env.USERS_SERVICE_TOKEN,
};
```

---

## 🐳 DEPLOYMENT & DOCKER

### Docker Compose Services
```yaml
services:
  zookeeper:
    image: 'bitnami/zookeeper:latest'
    container_name: zookeeper
    ports: ['2181:2181']
    
  kafka:
    image: 'bitnami/kafka:latest'
    container_name: kafka
    ports: ['9092:9092']
    depends_on: [zookeeper]
    
  mongo:
    image: mongo:5
    container_name: mongo_db
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
    
  redis:
    image: redis:6
    container_name: redis_cache
    ports: ["6379:6379"]
    
  users:
    build:
      context: .
      dockerfile: services/users/Dockerfile
    container_name: users_service
    ports: ["4001:4001"]
    environment: [PORT=4001]
    depends_on: [mongo, redis]
    
  items:
    build:
      context: .
      dockerfile: services/items/Dockerfile
    container_name: items_service
    ports: ["4002:4002"]
    depends_on: [mongo, redis]
    
  orders:
    build:
      context: .
      dockerfile: services/orders/Dockerfile
    container_name: orders_service
    ports: ["4003:4003"]
    environment: [PORT=4003]
    depends_on: [mongo, redis]
    
  auth:
    build:
      context: .
      dockerfile: services/auth/Dockerfile
    container_name: auth_service
    ports: ["4004:4004"]
    environment: [PORT=4004]
    depends_on: [mongo, redis]
    
  nginx:
    image: nginx:latest
    container_name: nginx_proxy
    ports: ["80:80"]
    volumes: ['./gateway/nginx.conf:/etc/nginx/nginx.conf:ro']
    depends_on: [users, items, orders, auth]
```

### Nginx Configuration
```nginx
upstream users_service {
    server users_service:4001;
}

upstream items_service {
    server items_service:4002;
}

upstream orders_service {
    server orders_service:4003;
}

upstream auth_service {
    server auth_service:4004;
}

server {
    listen 80;
    server_name localhost;
    
    # CORS setup
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Origin, Authorization, Content-Type, Accept";
    
    # Service routing
    location /api/auth/ {
        rewrite ^/api/auth/(.*) /$1 break;
        proxy_pass http://auth_service/api/auth/;
    }
    
    location /api/users/ {
        rewrite ^/api/users/(.*) /$1 break;
        proxy_pass http://users_service/api/users/;
    }
    
    location /api/items/ {
        rewrite ^/api/items/(.*) /$1 break;
        proxy_pass http://items_service/api/items/;
    }
    
    location /api/orders/ {
        rewrite ^/api/orders/(.*) /$1 break;
        proxy_pass http://orders_service/api/orders/;
    }
    
    # Health check
    location /health {
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

### Docker Commands
```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs auth
docker-compose logs users
docker-compose logs items
docker-compose logs orders

# Restart specific service
docker-compose restart auth

# Scale services
docker-compose up --scale users=3
```

---

## 🧪 TESTING & EXAMPLES

### cURL Examples

#### 1. User Registration
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

#### 2. User Login
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

#### 3. Create Item (Admin)
```bash
curl -X POST http://localhost:4002/api/items \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "category": "Test Category",
    "rate": 29.99,
    "qty": 100,
    "rating": 5
  }'
```

#### 4. List Items
```bash
curl -X GET http://localhost:4002/api/items \
  -H "Authorization: Bearer <jwt_token>"
```

#### 5. Create Order
```bash
curl -X POST http://localhost:4003/api/orders \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "<item_id>",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Test Street, Test City, Test Country"
  }'
```

#### 6. Get Orders
```bash
curl -X GET http://localhost:4003/api/orders \
  -H "Authorization: Bearer <jwt_token>"
```

#### 7. Update Order Status (Admin)
```bash
curl -X PATCH http://localhost:4003/api/orders/<order_id> \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

#### 8. Cancel Order
```bash
curl -X DELETE http://localhost:4003/api/orders/<order_id> \
  -H "Authorization: Bearer <jwt_token>"
```

### Postman Collection
You can import the following collection into Postman for easier API testing:

```json
{
  "info": {
    "name": "AlphaDevs Microservices API",
    "description": "Complete API collection for all microservices"
  },
  "item": [
    {
      "name": "Auth Service",
      "item": [
        {
          "name": "Validate Token",
          "request": {
            "method": "POST",
            "url": "http://localhost:4004/api/auth/validate",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"token\": \"<jwt_token>\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

## ❌ ERROR HANDLING

### Standard Error Response Format
All API endpoints follow a consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": {} // Optional additional error details
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side error

### Common Error Scenarios

#### Authentication Errors
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

#### Validation Errors
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 6 characters long"
  }
}
```

#### Authorization Errors
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

#### Service Communication Errors
```json
{
  "error": "Service Error",
  "message": "Error communicating with Items Service",
  "details": {
    "service": "items",
    "operation": "stock_update"
  }
}
```

---

## 🔒 SECURITY FEATURES

### JWT Security
- **Secret Key**: Strong, randomly generated JWT secret
- **Expiration**: Configurable token expiration (default: 1 hour)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Payload Validation**: User ID, email, and role verification

### Password Security
- **Hashing**: SHA-256 with random salt generation
- **Salt Storage**: Unique salt per user stored in database
- **Minimum Length**: 6 characters required
- **No Plain Text**: Passwords never stored in plain text

### API Security
- **CORS Protection**: Configurable cross-origin request handling
- **Helmet Security**: HTTP security headers
- **Rate Limiting**: Built-in rate limiting capabilities
- **Input Validation**: Comprehensive request validation

### Service-to-Service Security
- **Service Tokens**: Unique tokens for inter-service communication
- **Token Validation**: Centralized service token validation
- **Secure Communication**: HTTPS-ready communication channels

### Data Protection
- **MongoDB Security**: Database access control
- **Redis Security**: Cache data isolation
- **Environment Variables**: Sensitive data stored in environment variables
- **No Hardcoded Secrets**: All secrets configurable via environment

---

## 🚀 PERFORMANCE & SCALABILITY

### Caching Strategy
- **Redis Integration**: High-performance in-memory caching
- **Cache Keys**: Structured key generation for easy management
- **TTL Management**: Configurable cache expiration times
- **Cache Invalidation**: Automatic invalidation on data changes

### Database Optimization
- **MongoDB Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Pagination and filtering support

### Load Balancing
- **Nginx Gateway**: Reverse proxy with load balancing capabilities
- **Service Scaling**: Docker Compose scaling support
- **Health Checks**: Automatic health monitoring

### Event-Driven Architecture
- **Kafka Integration**: Event streaming for asynchronous operations
- **Order Events**: Real-time order status updates
- **Stock Events**: Inventory change notifications

---

## 🔧 DEVELOPMENT & DEBUGGING

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd alphadevs

# Install dependencies
npm run install-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start services individually
cd services/auth && npm run dev
cd ../users && npm run dev
cd ../items && npm run dev
cd ../orders && npm run dev
```

### Debugging Tools
- **Morgan Logging**: HTTP request logging
- **Console Logging**: Structured logging throughout services
- **Error Tracking**: Comprehensive error handling and logging
- **Health Checks**: Service health monitoring endpoints

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation
- **Code Reviews**: Pull request review process

---

## 📊 MONITORING & LOGS

### Service Health Monitoring
```bash
# Gateway health check
curl http://localhost/health

# Individual service health checks
curl http://localhost:4001/api/auth
curl http://localhost:4002/api/items
curl http://localhost:4003/api/orders
curl http://localhost:4004/health
```

### Log Management
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth
docker-compose logs -f users
docker-compose logs -f items
docker-compose logs -f orders

# View nginx logs
docker-compose logs -f nginx
```

### Performance Monitoring
- **Response Times**: API response time tracking
- **Error Rates**: Error frequency monitoring
- **Cache Hit Rates**: Redis cache performance metrics
- **Database Performance**: MongoDB query performance

---

## 🚨 TROUBLESHOOTING

### Common Issues & Solutions

#### 1. Service Connection Errors
**Problem**: Services cannot connect to each other
**Solution**: 
- Check Docker network configuration
- Verify service names in docker-compose.yml
- Ensure all services are running

#### 2. Database Connection Issues
**Problem**: MongoDB connection failures
**Solution**:
- Verify MongoDB container is running
- Check connection string in environment variables
- Ensure proper network access

#### 3. JWT Token Errors
**Problem**: Authentication failures
**Solution**:
- Verify JWT_SECRET is set correctly
- Check token expiration
- Ensure proper token format

#### 4. Service Token Errors
**Problem**: Inter-service communication failures
**Solution**:
- Verify service tokens match in environment variables
- Check service token validation logic
- Ensure proper authorization headers

#### 5. Cache Issues
**Problem**: Redis cache not working
**Solution**:
- Verify Redis container is running
- Check Redis connection string
- Ensure proper cache key generation

### Debug Commands
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs <service_name>

# Access container shell
docker-compose exec <service_name> sh

# Check network connectivity
docker network ls
docker network inspect alphadevs_default

# Restart specific service
docker-compose restart <service_name>
```

---

## 🔄 UPDATES & MAINTENANCE

### Version Management
- **Semantic Versioning**: Follows semantic versioning (MAJOR.MINOR.PATCH)
- **Changelog**: Documented changes and updates
- **Backward Compatibility**: Maintains API compatibility
- **Migration Guides**: Database and API migration documentation

### Backup & Recovery
- **Database Backups**: Regular MongoDB backups
- **Configuration Backups**: Environment and configuration backups
- **Disaster Recovery**: Recovery procedures and documentation
- **Data Retention**: Configurable data retention policies

### Security Updates
- **Dependency Updates**: Regular security dependency updates
- **Security Audits**: Periodic security assessments
- **Vulnerability Scanning**: Automated vulnerability detection
- **Patch Management**: Security patch deployment process

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- **API Reference**: Complete API endpoint documentation
- **Architecture Guide**: System architecture documentation
- **Deployment Guide**: Production deployment instructions
- **Contributing Guide**: Development contribution guidelines

### Community & Support
- **Issue Tracker**: GitHub issues for bug reports
- **Discussion Forum**: Community discussions and support
- **Code Examples**: Sample implementations and use cases
- **Tutorials**: Step-by-step guides and tutorials

### Related Projects
- **Frontend Applications**: React, Vue, or Angular clients
- **Mobile Applications**: React Native or native mobile apps
- **Admin Dashboard**: Administrative interface
- **Analytics Dashboard**: Business intelligence and analytics

---

## 📄 LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 CONTRIBUTORS

- **AlphaDevs Team** - Initial development and architecture
- **Open Source Contributors** - Community contributions and improvements

---

## 🙏 ACKNOWLEDGMENTS

- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Redis** - In-memory data structure store
- **Docker** - Containerization platform
- **Nginx** - Web server and reverse proxy
- **Apache Kafka** - Distributed streaming platform

---

*Last updated: January 2024*
*Version: 1.0.0*