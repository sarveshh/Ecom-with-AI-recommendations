# AI-Powered E-Commerce Platform

A modern e-commerce platform built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB, featuring AI-powered product recommendations.

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality (coming soon)
- 🤖 AI-powered product recommendations (coming soon)
- 📱 Responsive design with Tailwind CSS
- 🔐 User authentication (coming soon)
- 📊 Admin panel for product management
- 🎨 Modern, clean UI design

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Database**: MongoDB
- **AI/ML**: Python recommendation engine (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd AIEcom/aiecom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The `.env.local` file has been created with default values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/aiecom
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
AIEcom/
├── aiecom/                        # Next.js Frontend & API
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── products/      # Product API routes
│   │   │   ├── admin/             # Admin panel
│   │   │   ├── products/[id]/     # Individual product pages
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Home page
│   │   ├── components/
│   │   │   └── ProductCard.tsx    # Product card component
│   │   ├── lib/
│   │   │   └── mongodb.ts         # Database connection
│   │   ├── models/
│   │   │   └── Product.ts         # Product schema
│   │   └── types/
│   │       └── mongoose.d.ts      # Type definitions
│   ├── scripts/
│   │   └── seed.ts                # Database seeding script
│   └── public/                    # Static assets
└── recommendation-engine/         # Python AI Microservice
    ├── app.py                     # Flask recommendation API
    ├── requirements.txt           # Python dependencies
    ├── README.md                  # Recommendation engine docs
    ├── start.sh                   # Unix start script
    └── start.bat                  # Windows start script
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Get a specific product
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product

## Pages

- **Home (`/`)** - Product catalog and featured products
- **Product Detail (`/products/[id]`)** - Individual product page
- **Admin Panel (`/admin`)** - Add and manage products

## Database Schema

### Product
```typescript
{
  _id: ObjectId,
  name: string,
  price: number,
  description?: string,
  imageUrl?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Seed database with sample data
npm run seed
```

### Python Recommendation Engine

The AI recommendation engine runs as a separate Python microservice:

```bash
# Navigate to recommendation engine
cd ../recommendation-engine

# Install Python dependencies
pip install -r requirements.txt

# Start the recommendation service
python app.py
```

The recommendation engine will run on `http://localhost:5000`

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/aiecom`

### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

## Upcoming Features

### Phase 1 - Core E-commerce
- [ ] User authentication
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Order management

### Phase 2 - AI Integration
- [ ] Python recommendation engine
- [ ] Collaborative filtering
- [ ] Real-time recommendations

### Phase 3 - Advanced Features
- [ ] Payment integration
- [ ] Reviews and ratings
- [ ] Search and filtering
