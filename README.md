# PERPX

## 1. Project kya hai

PERPX ek AI chat application hai jo research aur chat ke liye design kiya gaya hai. Yahan aap private aur group/team spaces bana sakte hain jahan AI ke saath ideas discuss kar sakte hain aur apne thoughts ko research kar sakte hain.

## 2. Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose
- **Infrastructure**: AWS
- **Package Manager**: pnpm

## 3. Folder Structure

```
perpx/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # Next.js frontend application
├── packages/
│   └── shared/       # Shared utilities and types
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── infra/            # Infrastructure configurations
├── docker-compose.yml
└── package.json      # Root package.json for monorepo
```

## 4. Local setup kaise karein

### Prerequisites

- Node.js (version 18+)
- pnpm (package manager)
- Docker & Docker Compose

### Installation steps

1. **Repository clone karein:**

   ```bash
   git clone <repository-url>
   cd perpx
   ```

2. **Dependencies install karein:**

   ```bash
   pnpm install
   ```

3. **Environment variables setup karein:**
   `.env` file banayein aur required variables add karein (jaise database connection, API keys, etc.)

### .env setup

Project root mein `.env` file banayein:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/perpx?sslmode=require"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"

# Bcrypt
BCRYPT_ROUNDS="12"

# Resend Email
RESEND_API_KEY="re_xxxxxxxx"

# Other environment variables as needed
```

## 5. Docker se kaise chalayein

Docker Compose ka use karke pura application ek saath run kar sakte hain:

### Steps:

1. **Docker containers build aur start karein:**

   ```bash
   docker-compose up --build
   ```

2. **Background mein run karne ke liye:**

   ```bash
   docker-compose up -d --build
   ```

3. **Services check karein:**
   - Web app: http://localhost:3000
   - API: http://localhost:3001
   - Redis: localhost:6379

4. **Containers stop karne ke liye:**

   ```bash
   docker-compose down
   ```

5. **Logs dekhne ke liye:**
   ```bash
   docker-compose logs -f
   ```

### Services overview:

- **API (NestJS)**: Backend service on port 3001
- **Web (Next.js)**: Frontend service on port 3000
- **Redis**: Caching service on port 6379

Docker setup automatically sabhi dependencies handle karta hai aur application ko isolated environment mein run karta hai.

---

## 6. Authentication System Documentation

### Overview

PERPX mein complete JWT-based authentication system implement kiya gaya hai with refresh token rotation, email verification, aur device-based session management.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    Register/Login      ┌──────────────┐       │
│  │  Client  │ ─────────────────────→ │  Auth API    │       │
│  └──────────┘                        └──────────────┘       │
│       ↑                                     │               │
│       │         Access Token (15m)          │               │
│       └─────────────────────────────────────┘               │
│       │                                     │               │
│       │    Refresh Token (7d, HTTP-only)    │               │
│       └─────────────────────────────────────┘               │
│                                     │                       │
│                          ┌──────────┴──────────┐            │
│                          │   PostgreSQL DB     │            │
│                          │  - User table       │            │
│                          │  - RefreshToken tbl │            │
│                          └─────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Features

#### 1. User Registration (`POST /api/auth/register`)

- **Input Validation**: Full name, username, email, password with strong validation
- **Password Hashing**: Bcrypt ke saath secure hashing (configurable rounds)
- **Duplicate Check**: Email aur username unique hone chahiye
- **Email Verification**: Registration ke baad verification email bheja jaata hai

**Request Body:**

```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special symbol

#### 2. Email Verification

- **Token**: JWT-based verification token (1 day expiry)
- **Endpoint**: `POST /api/auth/verify-email?token=<jwt>`
- **Resend**: `POST /api/auth/send/verification-email` (requires credentials)
- **Template**: HTML email template with verification link

#### 3. User Login (`POST /api/auth/login`)

- **Credentials Check**: Email aur password validate karta hai
- **Email Verification Check**: Unverified users login nahi kar sakte
- **Token Generation**: Access token (15 min) aur Refresh token (7 days)
- **Device Tracking**: Har device ke liye unique deviceId generate hota hai
- **Cookie**: Refresh token HTTP-only secure cookie mein store hota hai

**Response:**

```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "user": {
      "id": "cuid",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "emailVerified": true,
      "avatar": null,
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "access_token": "eyJhbG...",
  "error": null
}
```

#### 4. Token Refresh (`POST /api/auth/refresh`)

- **Rotation**: Har refresh pe naye tokens generate hote hain
- **Device Binding**: Token specific device pe hi valid hai
- **Database Storage**: Refresh token hash karke PostgreSQL mein store hota hai
- **Cookie**: New refresh token cookie mein update hota hai

#### 5. Bearer Auth Guard (`@UseGuards(AuthGuard)`)

- **Protected Routes**: JWT Bearer token se routes protect kare
- **Token Verification**: JWT signature aur expiry check
- **User Attachment**: Request mein user object attach karta hai

**Usage:**

```typescript
@Get('me')
@UseGuards(AuthGuard)
getMe(@Req() request: Request) {
  return request.user;
}
```

#### 6. Logout

- **Single Device**: `POST /api/auth/logout` - Current device se logout
- **All Devices**: `POST /api/auth/logout-all` - Sabhi devices se logout
- **Token Cleanup**: Database se refresh token delete hota hai
- **Cookie Clear**: HTTP-only cookie clear ho jaati hai

#### 7. Get Current User (`GET /api/auth/me`)

- **Protected Route**: AuthGuard se protected
- **Returns**: Current logged-in user ka info

### Database Schema

#### User Table

```prisma
model User {
  id              String           @id @default(cuid())
  fullname        String
  username        String           @unique
  email           String           @unique
  emailVerified   Boolean          @default(false)
  password        String           // Bcrypt hashed
  avatar          String?
  role            UserRole         @default(USER)
  subscription    SubscriptionPlan @default(NORMAL)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  refreshToken    RefreshToken[]
  // ... relations
}
```

#### RefreshToken Table

```prisma
model RefreshToken {
  id          String   @id @default(cuid())
  hashedToken String   @unique  // Bcrypt hashed refresh token
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  deviceId    String?
  revoked     Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([userId])
}
```

### API Endpoints Summary

| Method | Endpoint                            | Description               | Auth Required |
| ------ | ----------------------------------- | ------------------------- | ------------- |
| POST   | `/api/auth/register`                | New user registration     | No            |
| POST   | `/api/auth/login`                   | User login                | No            |
| GET    | `/api/auth/me`                      | Get current user          | Yes (Bearer)  |
| POST   | `/api/auth/refresh`                 | Refresh access token      | No (Cookie)   |
| POST   | `/api/auth/logout`                  | Logout current device     | No (Cookie)   |
| POST   | `/api/auth/logout-all`              | Logout all devices        | No (Cookie)   |
| POST   | `/api/auth/send/verification-email` | Resend verification email | No            |
| POST   | `/api/auth/verify-email`            | Verify email with token   | No            |

### Security Features

1. **Password Security**
   - Bcrypt hashing with configurable rounds (default: 12)
   - Strong password validation rules
   - Password never returned in API responses

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days) with rotation
   - HTTP-only cookies for refresh tokens (XSS protection)
   - Tokens stored as hashes in database
   - Device-specific token binding

3. **Email Verification**
   - Mandatory email verification before login
   - Time-limited verification tokens (1 day)
   - Resend capability with credentials verification

4. **Session Management**
   - Multi-device support with separate sessions
   - Individual device logout capability
   - Global logout (all devices) support
   - Token expiration enforcement

### Environment Variables Required

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=15m

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key

# Database
DATABASE_URL=postgresql://...
```

### Usage Examples

#### Register a new user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Access protected route

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbG..."
```

#### Refresh token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Cookie: token=<refresh_token>"
```

### Error Handling

All auth endpoints consistent error response format follow karte hain:

```json
{
  "success": false,
  "message": "Error message here",
  "data": {},
  "error": "Detailed error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (invalid credentials)
- `404` - Not Found (user not found)
