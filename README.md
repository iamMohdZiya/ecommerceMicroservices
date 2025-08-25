# AlphaDevs Microservices Project

A microservices-based application with centralized authentication service.

## Architecture

- **Auth Service**: Centralized authentication and token management
- **Users Service**: User management and registration
- **Items Service**: Item management
- **Orders Service**: Order processing
- **Gateway**: Nginx reverse proxy for routing requests
- **MongoDB**: Primary database
- **Redis**: Caching layer

## Services

### Auth Service (Port 4004)
- Token validation
- Token refresh
- Service-to-service authentication
- Token generation for users

### Users Service (Port 4001)
- User registration
- User login
- User management

### Items Service (Port 4002)
- Item management
- Item catalog

### Orders Service (Port 4003)
- Order processing
- Order management

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

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

### 2. Install Dependencies
```bash
# Install dependencies for each service
cd services/auth && npm install
cd ../users && npm install
cd ../items && npm install
cd ../orders && npm install
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

## API Documentation

### Auth Service (Port 4004)

#### Validate Token
- **Endpoint**: `POST /api/auth/validate`
- **Description**: Validates a JWT token
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "token": "your.jwt.token"
  }
  ```
- **Response (200)**:
  ```json
  {
    "valid": true,
    "user": {
      "id": "user_id",
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

#### Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Description**: Refreshes an existing JWT token
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer <current_token>
  ```
- **Response (200)**:
  ```json
  {
    "token": "new.jwt.token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

#### Generate Token (Service to Service)
- **Endpoint**: `POST /api/auth/generate`
- **Description**: Generates a new token for a user (service-to-service communication)
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer <service_token>
  ```
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "new.jwt.token"
  }
  ```

### Users Service (Port 4001)

#### Register User
- **Endpoint**: `POST /api/auth/register`
- **Description**: Register a new user
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Response (201)**:
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt.token.here"
  }
  ```

#### Login User
- **Endpoint**: `POST /api/auth/login`
- **Description**: Login with existing credentials
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response (200)**:
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt.token.here"
  }
  ```

#### Get User Profile
- **Endpoint**: `GET /api/users/profile`
- **Description**: Get current user's profile
- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response (200)**:
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-08-24T12:00:00Z"
  }
  ```

### Items Service (Port 4002)

#### List Items
- **Endpoint**: `GET /api/items`
- **Description**: Get list of items
- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response (200)**:
  ```json
  {
    "items": [
      {
        "id": "item_id",
        "name": "Item Name",
        "price": 29.99,
        "description": "Item description"
      }
    ],
    "total": 100,
    "page": 1,
    "pages": 10
  }
  ```

#### Create Item
- **Endpoint**: `POST /api/items`
- **Description**: Create a new item
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "New Item",
    "price": 29.99,
    "description": "Item description"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "item_id",
    "name": "New Item",
    "price": 29.99,
    "description": "Item description",
    "createdAt": "2025-08-24T12:00:00Z"
  }
  ```

### Orders Service (Port 4003)

#### Create Order
- **Endpoint**: `POST /api/orders`
- **Description**: Create a new order
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
        "itemId": "item_id",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Example City",
      "country": "Country"
    }
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "order_id",
    "items": [
      {
        "itemId": "item_id",
        "name": "Item Name",
        "price": 29.99,
        "quantity": 2
      }
    ],
    "total": 59.98,
    "status": "pending",
    "createdAt": "2025-08-24T12:00:00Z"
  }
  ```

#### List Orders
- **Endpoint**: `GET /api/orders`
- **Description**: Get user's orders
- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Orders per page (default: 10)
- **Response (200)**:
  ```json
  {
    "orders": [
      {
        "id": "order_id",
        "items": [
          {
            "itemId": "item_id",
            "name": "Item Name",
            "price": 29.99,
            "quantity": 2
          }
        ],
        "total": 59.98,
        "status": "pending",
        "createdAt": "2025-08-24T12:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pages": 5
  }
  ```

#### Get Order Status
- **Endpoint**: `GET /api/orders/:orderId`
- **Description**: Get status of a specific order
- **Headers**:
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response (200)**:
  ```json
  {
    "id": "order_id",
    "status": "processing",
    "updatedAt": "2025-08-24T12:05:00Z",
    "estimatedDelivery": "2025-08-26T12:00:00Z"
  }
  ```

## Testing with cURL

Here are some example cURL commands to test the APIs:

### 1. Register a New User
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword",
    "name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword"
  }'
```

### 3. Create an Item
```bash
# Replace <token> with the JWT token from login
curl -X POST http://localhost:4002/api/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "price": 29.99,
    "description": "Test item description"
  }'
```

### 4. Create an Order
```bash
# Replace <token> with the JWT token from login
curl -X POST http://localhost:4003/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "itemId": "<item_id>",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Test City",
      "country": "Test Country"
    }
  }'
```

## Authentication Flow

1. **User Registration/Login**: Users register/login through the Users Service
2. **Token Generation**: Users Service calls Auth Service to generate JWT tokens
3. **Token Validation**: Other services validate tokens through Auth Service
4. **Token Refresh**: When tokens expire, clients can refresh them through the Auth Service

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": {} // Optional additional error details
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
4. **Service Communication**: Services use service tokens for inter-service communication

## Health Checks

- **Gateway**: `GET /health`
- **Auth Service**: `GET /health`
- **Users Service**: `GET /api/auth` or `GET /api/yoo`
- **Items Service**: `GET /api/items`
- **Orders Service**: Available through gateway

## Troubleshooting

### Common Issues

1. **Service Connection Errors**: Ensure all services are running and ports are correctly mapped
2. **Database Connection**: Check MongoDB connection string and ensure MongoDB is running
3. **JWT Errors**: Verify JWT_SECRET is set correctly
4. **Service Token Errors**: Ensure service tokens match between services and environment variables
5. **Module Not Found Errors**: Ensure all dependencies are installed and Docker build is successful

### Recent Fixes Applied

- Fixed shared file import paths in Docker containers
- Updated all services to use centralized authentication
- Fixed package.json names and dependencies
- Updated Dockerfiles to properly copy shared files
- Removed volume mounts that were causing import issues

### Logs
```bash
# View logs for specific service
docker-compose logs auth
docker-compose logs users
docker-compose logs items
docker-compose logs orders
docker-compose logs nginx
```

## Development

### Running Individual Services
```bash
# Auth Service
cd services/auth && npm run dev

# Users Service
cd services/users && npm run dev

# Items Service
cd services/items && npm run dev

# Orders Service
cd services/orders && npm run dev
```

### Adding New Services
1. Create service directory in `services/`
2. Add Dockerfile
3. Update `docker-compose.yml`
4. Update nginx configuration
5. Add service token to environment variables

## Docker Build Process

The project uses a multi-stage Docker build process where:
1. Each service has its own Dockerfile
2. Shared files are copied to `./shared/` in each service container
3. Dependencies are installed before copying shared files
4. No volume mounts are used for shared files (they're copied during build)

This ensures that all services have access to the shared authentication utilities and dependencies.
