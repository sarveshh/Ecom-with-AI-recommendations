# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Windows Installation

1. Download MongoDB Community Server from: <https://www.mongodb.com/try/download/community>
2. Run the installer (choose "Complete" installation)
3. Install as a Windows Service (recommended)
4. Install MongoDB Compass (GUI tool) when prompted

### Start MongoDB Service

```bash
# Windows (if installed as service - starts automatically)
net start MongoDB

# Or manually start:
mongod --dbpath="C:\data\db"
```

### Verify Installation

```bash
# Open command prompt and run:
mongo --version
# or
mongosh --version  # for newer versions

# Connect to MongoDB:
mongosh
# You should see: test>
```

### Create Database

```javascript
// In mongosh:
use aiecom
db.products.insertOne({name: "test", price: 1})
show dbs  // Should show 'aiecom' database
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Setup Steps

1. Go to: <https://www.mongodb.com/atlas>
2. Click "Try Free" and create account
3. Create a new cluster (select M0 Sandbox - FREE)
4. Wait for cluster creation (2-3 minutes)
5. Create database user:
   - Go to "Database Access"
   - Add new user with username/password
   - Give "Read and write to any database" permission
6. Configure network access:
   - Go to "Network Access"
   - Add IP Address (0.0.0.0/0 for development, or your specific IP)
7. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace <password> with your user password

### Example Atlas Connection String

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aiecom?retryWrites=true&w=majority
```

## Option 3: Docker MongoDB (For Development)

### Using Docker Compose (Already configured in your project)

```bash
# Start just MongoDB:
docker-compose up mongodb

# Or start everything:
docker-compose up
```

### Manual Docker Setup

```bash
# Pull MongoDB image:
docker pull mongo:6.0

# Run MongoDB container:
docker run -d \
  --name aiecom-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=aiecom \
  -v mongodb_data:/data/db \
  mongo:6.0

# Connect to MongoDB:
docker exec -it aiecom-mongodb mongosh
```

## Testing Your MongoDB Connection

### Test with MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017 (or your Atlas string)
3. Create database: aiecom
4. Create collection: products

### Test with Your Application

```bash
cd aiecom
npm run seed  # This will test the connection and add sample data
```

## Python Dependencies

### For Recommendation Engine

```bash
cd recommendation-engine
pip install -r requirements.txt

# Or install Python packages individually:
pip install Flask==2.3.3 Flask-CORS==4.0.0 requests==2.31.0
```

## Node.js Dependencies

### For Frontend

```bash
cd aiecom
npm install  # Should already be done if you followed setup
```

## Environment Variables Setup

### Update your .env.local based on chosen option

**Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/aiecom
```

**MongoDB Atlas:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aiecom?retryWrites=true&w=majority
```

**Docker MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/aiecom
```

## Verification Checklist

- [ ] MongoDB is running (local, Atlas, or Docker)
- [ ] Connection string is correct in .env.local
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Can run `npm run seed` without errors
- [ ] Can access MongoDB with Compass or mongosh
- [ ] Frontend starts: `npm run dev`
- [ ] Recommendation engine starts: `python app.py`

## Common Issues & Solutions

### Issue: "MongoNetworkError: failed to connect to server"

**Solution:**

- Check if MongoDB service is running
- Verify connection string in .env.local
- Check firewall/network settings

### Issue: "Authentication failed"

**Solution:**

- Check username/password in Atlas connection string
- Verify database user permissions

### Issue: "Python module not found"

**Solution:**

```bash
cd recommendation-engine
pip install -r requirements.txt
```

### Issue: "Cannot connect to recommendation engine"

**Solution:**

- Make sure Python service is running on port 5000
- Check if port 5000 is already in use
- Verify Flask app starts without errors
