# 🌍 GlobeTrotter

A comprehensive travel planning and itinerary management application that helps users plan, organize, and share their travel experiences. Built with modern web technologies, GlobeTrotter provides an intuitive interface for creating detailed trip itineraries, managing budgets, discovering activities, and exploring destinations.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [How It Works](#-how-it-works)
- [Contributors](#-contributors)
- [License](#-license)

## ✨ Features

### Core Functionality

- **User Authentication & Authorization**
  - Secure user registration and login
  - JWT-based authentication
  - Protected routes and API endpoints
  - User profile management

- **Trip Management**
  - Create, edit, and delete trips
  - Trip status tracking (Upcoming, Ongoing, Completed)
  - Trip sections with date ranges and budgets
  - Overlap detection and warnings
  - Public trip sharing with unique slugs

- **Itinerary Builder**
  - Drag-and-drop section management
  - Activity scheduling within sections
  - Real-time budget tracking
  - Calendar view for trip visualization
  - Section type inference (Travel, Stay, Experience, Buffer)

- **Activity Discovery**
  - Search activities by name, type, city, and cost
  - Browse city-specific activities
  - Add activities to trip sections
  - Activity filtering and sorting

- **City & Destination Management**
  - Search and explore cities worldwide
  - City popularity scoring
  - Save favorite destinations
  - Country information with flags and currencies

- **Budget Management**
  - Trip-level and section-level budgets
  - Multi-currency support with real-time exchange rates
  - Budget breakdown by category
  - Daily expense tracking
  - Budget vs. actual spending analysis

- **Community Features**
  - Browse public trips shared by other users
  - Copy public trips to your account
  - Share your trips with the community

- **Admin Panel**
  - User statistics and analytics
  - Trip distribution metrics
  - Popular destinations tracking
  - Activity usage statistics
  - User registration trends

### External API Integrations

- **Unsplash API** - High-quality destination images
- **OpenWeatherMap** - Real-time weather information
- **OpenTripMap** - Real-world points of interest and attractions
- **ExchangeRate-API** - Multi-currency conversion
- **REST Countries API** - Country flags, currencies, and information
- **Nominatim (OpenStreetMap)** - City geocoding and validation

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with custom design system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### External Services
- PostgreSQL Database
- Unsplash (Image API)
- OpenWeatherMap (Weather API)
- OpenTripMap (POI API)
- ExchangeRate-API (Currency API)
- REST Countries API
- Nominatim (Geocoding API)

## 📁 Project Structure

```
odooxsnsc/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Database seeding script
│   │   ├── cleanup-duplicates.ts  # Duplicate cleanup utility
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── index.ts               # Express app entry point
│   │   ├── middleware/
│   │   │   ├── auth.ts            # Authentication middleware
│   │   │   └── errorHandler.ts    # Error handling middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication routes
│   │   │   ├── trips.ts           # Trip management routes
│   │   │   ├── sections.ts        # Section management routes
│   │   │   ├── activities.ts      # Activity routes
│   │   │   ├── search.ts          # Search routes
│   │   │   ├── public.ts          # Public trip routes
│   │   │   ├── admin.ts           # Admin routes
│   │   │   └── external.ts        # External API routes
│   │   ├── services/
│   │   │   ├── externalApis.ts    # External API integrations
│   │   │   ├── sectionService.ts  # Section business logic
│   │   │   ├── budgetService.ts   # Budget calculations
│   │   │   └── TripService.ts     # Trip business logic
│   │   └── utils/
│   │       └── jwt.ts             # JWT utilities
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # React entry point
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navigation header
│   │   │   ├── SearchBar.tsx     # Search component
│   │   │   └── PrivateRoute.tsx  # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Authentication context
│   │   ├── screens/
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── CreateTrip.tsx    # Trip creation
│   │   │   ├── BuildItinerary.tsx # Itinerary builder
│   │   │   ├── TripListing.tsx   # Trip list view
│   │   │   ├── ItineraryView.tsx # Trip detail view
│   │   │   ├── Search.tsx        # Activity search
│   │   │   ├── CitySearch.tsx    # City search
│   │   │   ├── BudgetBreakdown.tsx # Budget analysis
│   │   │   ├── CalendarView.tsx  # Calendar view
│   │   │   ├── Profile.tsx       # User profile
│   │   │   ├── Community.tsx     # Public trips
│   │   │   ├── PublicTrip.tsx    # Public trip view
│   │   │   └── AdminPanel.tsx   # Admin dashboard
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   ├── utils/
│   │   │   └── images.ts        # Image utilities
│   │   └── styles/
│   │       └── global.css       # Global styles
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd odooxsnsc
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Set Up Database

1. Create a PostgreSQL database:

```sql
CREATE DATABASE globetrotter;
```

2. Configure Prisma:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

3. Seed the database (optional):

```bash
npm run prisma:seed
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/globetrotter"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# External APIs (Optional but recommended)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
OPENWEATHER_API_KEY=your_openweather_api_key
OPENTRIPMAP_API_KEY=your_opentripmap_api_key
EXCHANGERATE_API_KEY=your_exchangerate_api_key
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## 🏃 Running the Application

### Development Mode

1. **Start the Backend Server:**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server:**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

### Production Build

1. **Build the Backend:**

```bash
cd backend
npm run build
npm start
```

2. **Build the Frontend:**

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist/` directory.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile

### Trip Endpoints

- `GET /api/trips` - Get user's trips (optional status filter)
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Section Endpoints

- `POST /api/trips/:tripId/sections` - Create a section
- `PUT /api/trips/:tripId/sections/:sectionId` - Update section
- `DELETE /api/trips/:tripId/sections/:sectionId` - Delete section

### Activity Endpoints

- `POST /api/sections/:sectionId/activities` - Add activity to section
- `PUT /api/sections/:sectionId/activities/:activityId` - Update section activity
- `DELETE /api/sections/:sectionId/activities/:activityId` - Remove activity from section

### Search Endpoints

- `GET /api/search/cities` - Search cities (optional query and country filter)
- `GET /api/search/activities` - Search activities (optional filters: query, type, cityId, maxCost)

### Public Trip Endpoints

- `GET /api/public/trips` - Get all public trips
- `GET /api/public/trips/:slug` - Get public trip by slug
- `POST /api/public/trips/:tripId/publish` - Publish a trip
- `POST /api/public/trips/:slug/copy` - Copy a public trip

### External API Endpoints

- `GET /api/external/country/:countryName` - Get country data
- `GET /api/external/city/:cityId/images` - Get city images
- `GET /api/external/city/:cityId/weather` - Get city weather
- `GET /api/external/city/:cityId/places` - Get nearby places
- `GET /api/external/place/:xid` - Get place details
- `GET /api/external/exchange-rates` - Get exchange rates
- `POST /api/external/geocode` - Geocode a city

### Admin Endpoints

- `GET /api/admin/stats` - Get admin statistics (requires admin role)

## 🔧 How It Works

### Authentication Flow

1. User registers or logs in through the frontend
2. Backend validates credentials and generates a JWT token
3. Token is stored in localStorage on the frontend
4. All subsequent API requests include the token in the Authorization header
5. Middleware validates the token on protected routes

### Trip Creation & Management

1. User creates a trip with basic information (name, dates, budget)
2. Trip is saved with status "UPCOMING"
3. User can add sections to the trip, each with its own date range and budget
4. Sections are validated to ensure dates fall within trip dates
5. Overlap detection warns users if sections have conflicting dates
6. Activities can be added to sections with scheduled dates and expenses

### Itinerary Building

1. Users navigate to the trip builder for a specific trip
2. Sections are displayed in chronological order
3. Users can add activities from the activity database or discover real attractions via OpenTripMap
4. Activities are scheduled within section date ranges
5. Budget is automatically calculated from activity expenses
6. Section types are inferred based on the activities they contain

### Budget Management

1. Trip-level budget is set during trip creation
2. Section budgets can be set individually
3. Activity expenses are tracked and aggregated
4. Real-time currency conversion is available via ExchangeRate-API
5. Budget breakdown shows spending by category and day
6. Warnings are shown when budgets are exceeded

### Search & Discovery

1. City search uses the database and can be enhanced with geocoding
2. Activity search filters by name, type, city, and cost
3. External APIs provide additional data:
   - Unsplash for destination images
   - OpenWeatherMap for weather information
   - OpenTripMap for real-world attractions
   - REST Countries for country information

### Public Sharing

1. Users can publish trips to make them publicly accessible
2. A unique slug is generated for each public trip
3. Public trips can be viewed without authentication
4. Users can copy public trips to their own account
5. Community page displays all public trips

### Admin Features

1. Admin users have access to an admin panel
2. Statistics include user counts, trip distributions, and activity usage
3. Popular destinations are tracked based on usage
4. User registration trends are displayed

## 👥 Contributors

This project was developed by a dedicated team of developers:

- **Sandeep Kalla** - Backend Development
  - Implemented authentication middleware and JWT-based security
  - Developed user authentication and authorization system
  - Created secure API endpoints with proper access control

- **Vamsi** - Backend Development
  - Designed and implemented backend routing architecture
  - Developed service layer for business logic
  - Integrated external APIs and data services

- **Akash** - Frontend Development
  - Created initial screen components and UI layouts
  - Developed reusable React components
  - Implemented frontend routing and navigation

- **Gnaneswar** - Project Management & Full-Stack Development
  - Workflow manager and project coordinator
  - Implemented complete frontend functionality
  - Integrated frontend with backend APIs
  - Repository setup, configuration, and deployment
  - Database schema design and migrations
  - External API integrations
  - Overall project architecture and code organization

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ by the GlobeTrotter Team**

