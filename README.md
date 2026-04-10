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