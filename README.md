# AI-Powered E-Commerce Platform

A complete full-stack e-commerce platform with AI-powered product recommendations, advanced analytics, and email marketing, built using modern technologies.

## 🎯 Features

- **🛒 Shopping Cart**: Zustand state management with encrypted localStorage
- **🤖 AI Recommendations**: Real machine learning using collaborative filtering
- **📊 Analytics Dashboard**: Comprehensive business intelligence with MongoDB aggregation
- **📧 Email Marketing**: Newsletter signup, subscriber management, and campaigns
- **👑 Admin Panel**: Product management, analytics, and system monitoring
- **🔒 Security**: Encrypted local storage and secure data handling
- **📱 Responsive Design**: Tailwind CSS with mobile-first approach

## 🏗️ Architecture

**Single Package.json Structure** (Simplified from monorepo):

- **Frontend & API**: Next.js 15 with TypeScript, Tailwind CSS, MongoDB
- **AI Service**: Python Flask microservice for machine learning recommendations

## 🚀 Quick Start

**Get everything running in 3 commands:**

```bash
git clone <your-repo-url> && cd AIEcom
npm install && cd recommendation-engine && pip install -r requirements.txt && cd ..
npm run dev  # Starts both frontend and AI service!
```

**Then visit:**

- 🌐 **Frontend**: `http://localhost:3000`
- 🤖 **AI API**: `http://localhost:5000/health`
- 📊 **Admin Panel**: `http://localhost:3000/admin`
- 📧 **Analytics**: `http://localhost:3000/admin/analytics`
- ✉️ **Email Marketing**: `http://localhost:3000/admin/email`

---

## 📋 Detailed Setup

### Prerequisites

- **Node.js 18+** (for Next.js frontend)
- **Python 3.8+** (for recommendation engine)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd AIEcom
```

### 2. Install Dependencies

```bash
# Install all dependencies (single package.json)
npm install

# Python dependencies
cd recommendation-engine
pip install -r requirements.txt
cd ..
```

### 3. Start Both Services (Single Command!)

```bash
# From root directory - starts both Next.js and Python services
npm run dev
```

This will start:

- ✅ Next.js frontend on `http://localhost:3000`
- ✅ Python recommendation API on `http://localhost:5000`

#### Alternative: Start services individually

```bash
# Terminal 1: Next.js
npm run dev:frontend

# Terminal 2: Python API  
npm run dev:api
```

### 4. Setup Database & Seed Data

#### Option A: Local MongoDB

```bash
mongod  # Start MongoDB service
```

#### Option B: MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string  
3. Update `MONGODB_URI` in `.env.local`

#### Seed with Sample Products

```bash
# Option 1: API endpoint (easiest)
curl -X POST http://localhost:3000/api/seed

# Option 2: Script  
npm run seed

# Option 3: Admin panel
# Visit http://localhost:3000/admin
```

## 📁 Project Structure

**Simplified Single Package.json Structure:**

```text
AIEcom/
├── 📂 src/                        # Next.js Application Source
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   ├── 📂 products/       # Product CRUD API
│   │   │   ├── 📂 analytics/      # Analytics API
│   │   │   ├── 📂 newsletter/     # Email marketing API
│   │   │   └── 📂 recommendations/# AI recommendations API
│   │   ├── 📂 admin/
│   │   │   ├── 📂 analytics/      # Analytics dashboard
│   │   │   └── 📂 email/          # Email management
│   │   ├── 📂 products/[id]/      # Product detail pages
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page with cart & newsletter
│   ├── 📂 components/
│   │   ├── ProductCard.tsx        # Product cards
│   │   ├── CartButton.tsx         # Shopping cart button
│   │   ├── CartSidebar.tsx        # Cart sidebar
│   │   ├── AnalyticsDashboard.tsx # Analytics charts
│   │   ├── EmailManagement.tsx    # Email subscriber management
│   │   └── NewsletterSignup.tsx   # Newsletter subscription
│   ├── 📂 lib/
│   │   ├── mongodb.ts             # Database connection
│   │   └── encryptedStorage.ts    # Secure local storage
│   ├── 📂 models/
│   │   ├── Product.ts             # Product schema
│   │   ├── AnalyticsEvent.ts      # Analytics schema
│   │   └── EmailModels.ts         # Email marketing schemas
│   ├── 📂 store/
│   │   └── cartStore.ts           # Zustand cart store
│   ├── 📂 scripts/
│   │   └── seed.ts                # Database seeding
│   └── 📂 types/
│       └── mongoose.d.ts          # Type definitions
│
├── 📂 public/                     # Static assets
│   ├── favicon.ico
│   └── *.svg                      # UI icons
│
├── 📂 recommendation-engine/      # Python AI Microservice
│   ├── app.py                     # Flask recommendation API
│   ├── ml_recommender.py          # Machine learning models
│   ├── requirements.txt           # Python dependencies
│   ├── test_api.py               # API testing script
│   └── README.md                 # Service documentation
│
├── package.json                  # Single consolidated package.json
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── .env.local                   # Environment variables
├── docker-compose.yml           # Multi-service orchestration
└── README.md                    # This file
```

## 🔗 Services Communication

```mermaid
graph TB
    A[User Browser] --> B[Next.js Frontend :3000]
    B --> C[Next.js API Routes]
    C --> D[MongoDB Database]
    B --> E[Python Recommendation API :5000]
    E --> F[AI/ML Models]
```

## 📚 API Documentation

### Next.js API (Port 3000)

**Products API:**

- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Python Recommendation API (Port 5000)

**Recommendations API:**

- `GET /health` - Health check
- `POST /recommendations` - Get AI recommendations

**Example Request:**

```json
{
  "userId": "user123",
  "purchaseHistory": ["product_id_1", "product_id_2"],
  "numRecommendations": 5
}
```

## 🛠️ Development Commands

### Root Level (Single Package.json Structure)

```bash
npm run dev              # 🚀 Start both frontend + AI API
npm run dev:frontend     # Start only Next.js frontend
npm run dev:api          # Start only Python recommendation API
npm run seed             # Seed database with sample products
npm run build            # Build Next.js for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
npm run docker:up        # Start with Docker Compose
```

### Recommendation Engine Only (recommendation-engine/)

```bash
python app.py           # Start Flask server
python test_api.py      # Test API endpoints
```

### Docker (Entire Stack)

```bash
docker-compose up      # Start all services
docker-compose down    # Stop all services
docker-compose build   # Rebuild images
```

## 🚢 Deployment Options

### Option 1: Traditional Deployment

- **Frontend**: Deploy to Vercel, Netlify, or AWS Amplify
- **API**: Deploy to Railway, Render, or AWS EC2
- **Recommendation Engine**: Deploy to Heroku, AWS Lambda, or Google Cloud Run
- **Database**: MongoDB Atlas

### Option 2: Docker Deployment

```bash
docker-compose up -d    # Run entire stack in containers
```

### Option 3: Kubernetes

- Use the provided Docker images for K8s deployment
- Configure services, ingress, and persistent volumes

## 🧪 Testing

### Frontend Testing

```bash
npm run test           # Run Jest tests (when implemented)
npm run test:e2e       # Run Playwright tests (when implemented)
```

### API Testing

```bash
cd recommendation-engine
python test_api.py     # Test recommendation API endpoints
```

## 🔧 Environment Variables

### Root Directory (.env.local)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/aiecom

# Encryption (generate secure 32-character keys)
ENCRYPTION_KEY=your-32-character-encryption-key-here
ANALYTICS_ENCRYPTION_KEY=your-analytics-encryption-key

# Feature Flags
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_RECOMMENDATIONS_ENABLED=true
NEXT_PUBLIC_EMAIL_MARKETING_ENABLED=true

# Email Configuration (optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password

# AI Services
RECOMMENDATION_API_URL=http://localhost:5000

# Auth (when implemented)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Recommendation Engine

```env
FLASK_ENV=production
FLASK_APP=app.py
```

## 🎯 Roadmap

### Phase 1: Core E-commerce ✅

- [x] Product catalog
- [x] Product CRUD operations
- [x] Admin panel
- [x] MongoDB integration
- [x] Basic recommendation API
- [ ] User authentication
- [ ] Shopping cart
- [ ] Checkout process

### Phase 2: AI/ML Enhancement

- [ ] Advanced recommendation algorithms
- [ ] User behavior tracking
- [ ] Real-time personalization
- [ ] A/B testing framework
- [ ] Analytics dashboard

### Phase 3: Production Features

- [ ] Payment integration (Stripe)
- [ ] Order management
- [ ] Email notifications
- [ ] Search and filtering
- [ ] Reviews and ratings
- [ ] Inventory management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes.

## 🆘 Support

- **Frontend Issues**: Check Next.js documentation or create GitHub issue
- **Recommendation Engine**: Check `recommendation-engine/README.md`  
- **General Issues**: Open GitHub issue

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
