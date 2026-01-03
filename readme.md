# GlobeTrotter - Travel Planning Application

A full-stack travel planning application built with Node.js, Express, Prisma, PostgreSQL, React, and TypeScript.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Trip Management**: Create, edit, and organize trips with sections
- **Smart Sections**: Dynamic itinerary sections with automatic type inference and overlap detection
- **Budget Engine**: Track expenses per day, section, and trip with overbudget indicators
- **Activity Search**: Search for cities and activities with filtering
- **Community**: Share trips publicly and copy trips from other users
- **Calendar View**: Visualize trips on a calendar with budget and overlap indicators
- **Admin Panel**: View analytics and manage the platform

## Tech Stack

### Backend
- Node.js + Express (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React + Vite (TypeScript)
- React Router
- date-fns for date handling
- CSS modules with global dark theme

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE globetrotter;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set:
# DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter?schema=public"
# JWT_SECRET="your-secret-key-change-in-production"
# PORT=3001

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
odooxsnsc/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/         # Screen components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API client
│   │   └── styles/          # CSS files
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - List user's trips
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Sections
- `POST /api/trips/:tripId/sections` - Create section
- `PUT /api/trips/:tripId/sections/:sectionId` - Update section
- `DELETE /api/trips/:tripId/sections/:sectionId` - Delete section

### Activities
- `POST /api/sections/:sectionId/activities` - Add activity to section
- `PUT /api/sections/:sectionId/activities/:id` - Update section activity
- `DELETE /api/sections/:sectionId/activities/:id` - Remove activity

### Search
- `GET /api/search/cities?query=&country=` - Search cities
- `GET /api/search/activities?query=&type=&cityId=&maxCost=` - Search activities

### Public/Community
- `POST /api/public/trips/:id/publish` - Publish trip
- `GET /api/public/trips` - List public trips
- `GET /api/public/trips/:slug` - Get public trip by slug
- `POST /api/public/trips/:slug/copy` - Copy public trip

### Admin
- `GET /api/admin/stats` - Get admin statistics

## Key Features Implementation

### Smart Sections
- Sections automatically infer their type (TRAVEL, STAY, EXPERIENCE, BUFFER) based on activities
- Overlap detection warns when section date ranges overlap
- Visual indicators (red border) show overlap warnings

### Budget Engine
- Calculates daily budgets (trip budget / number of days)
- Tracks expenses per day, section, and trip
- Visual indicators (red border) show overbudget days
- Displays totals: per day, per section, trip total, average per day

### Copy Trip
- Clones trip with all sections and activities
- Shifts dates relative to today while maintaining durations
- Sets ownership to current user

### Calendar Validator
- Highlights overbudget days with subtle background
- Shades gap days (days not covered by any section)
- Shows overlap warnings on relevant days
- Displays trip names on active days

## Seed Data

The seed script creates:
- 50+ cities with coordinates and popularity scores
- 200+ activities linked to cities with types, costs, and durations

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with tsx watch mode
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server
```

### Database Migrations
```bash
cd backend
npm run prisma:migrate  # Create new migration
npm run prisma:studio   # Open Prisma Studio
```

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Notes

- All screens follow a strict dark theme with white outlines
- UI matches provided mockups exactly
- No cursor/label artifacts are included in the UI
- All flows are implemented end-to-end

## License

ISC

## Team Members

1. Kalla Sandeep  
2. Lopinti Gnaneshwar  
3. Vobbina Vamsi  
4. Y L N J Rao Akash
