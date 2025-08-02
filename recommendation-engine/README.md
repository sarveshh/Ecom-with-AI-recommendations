# AI Product Recommendation Engine

A sophisticated Python microservice that provides **real AI-powered** product recommendations using machine learning algorithms.

## Features

- **RESTful API** - Clean HTTP API for getting product recommendations
- **Advanced Machine Learning** - Real collaborative filtering using Matrix Factorization (SVD)
- **Content-Based Filtering** - TF-IDF vectorization with cosine similarity for product similarity
- **User Behavior Tracking** - Comprehensive tracking of user interactions (views, carts, purchases, likes)
- **Preference Learning** - Dynamic user preference modeling based on behavior patterns
- **Hybrid Recommendations** - Combines multiple ML approaches for better accuracy
- **Real-time Learning** - Models automatically retrain as new data is collected
- **Error Handling** - Comprehensive error handling and logging
- **Health Checks** - Built-in health check endpoint
- **CORS Support** - Cross-origin resource sharing for frontend integration

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "service": "recommendation-engine",
  "version": "1.0.0"
}
```

### Get Recommendations

```
POST /recommendations
```

Request Body:

```json
{
  "userId": "user123",
  "purchaseHistory": ["product_id_1", "product_id_2"],
  "numRecommendations": 5
}
```

Response:

```json
{
  "success": true,
  "recommendations": ["product_id_3", "product_id_4", "product_id_5"],
  "userId": "user123",
  "algorithm": "collaborative_filtering_v1",
  "numRecommendations": 3,
  "timestamp": "1693123456789"
}
```

### Track User Behavior (NEW!)

```http
POST /track-behavior
```

Request Body:

```json
{
  "userId": "user123",
  "action": "view|cart|purchase|like|share",
  "productId": "product_id_1",
  "metadata": {
    "category": "electronics",
    "price": 299.99,
    "brand": "TechBrand",
    "timeSpent": 5000
  }
}
```

### Get Model Status (NEW!)

```http
GET /model-status
```

Response:

```json
{
  "success": true,
  "modelVersion": "1.0.0",
  "lastTraining": "2024-01-01T12:00:00Z",
  "statistics": {
    "numUsers": 150,
    "numProducts": 50,
    "totalBehaviors": 1250
  },
  "modelsTrained": {
    "collaborative_filtering": true,
    "content_based": true,
    "user_preferences": true
  },
  "shouldRetrain": false
}
```

### Retrain Models (NEW!)

```http
POST /retrain-models
```

### Get User Profile (NEW!)

```http
GET /user-profile/{userId}
```

## Installation & Setup

### Prerequisites

- Python 3.8+
- pip

### Install Dependencies

```bash
cd recommendation-engine
pip install -r requirements.txt
```

### Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## Usage Example

### Using curl

```bash
# Health check
curl http://localhost:5000/health

# Get recommendations
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "purchaseHistory": ["672a1b2c3d4e5f6789012345"],
    "numRecommendations": 3
  }'
```

### Integration with Next.js Frontend

```typescript
// Example API call from your Next.js app
const getRecommendations = async (userId: string, purchaseHistory: string[]) => {
  try {
    const response = await fetch('http://localhost:5000/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        purchaseHistory,
        numRecommendations: 5
      })
    });
    
    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};
```

## Algorithm Details

The current implementation uses **real machine learning algorithms**:

### 1. Collaborative Filtering (Matrix Factorization)

- **Algorithm**: Truncated SVD (Singular Value Decomposition)
- **Purpose**: Finds latent factors in user-item interactions
- **How it works**: Decomposes the user-item matrix to discover hidden patterns
- **Output**: Personalized recommendations based on similar users' preferences

### 2. Content-Based Filtering

- **Algorithm**: TF-IDF Vectorization + Cosine Similarity
- **Purpose**: Recommends items similar to those the user has interacted with
- **How it works**: Analyzes product features (name, description, category, brand) to find similar products
- **Output**: "More like this" recommendations

### 3. User Behavior Analysis

- **Real-time Tracking**: Views, cart additions, purchases, likes, shares
- **Preference Learning**: Builds user profiles based on interaction patterns
- **Weighted Actions**: Different actions have different importance (purchase=5, cart=3, view=1)
- **Category Mapping**: Learns user preferences for product categories and brands

### 4. Hybrid Model

- **Combines**: All three approaches with intelligent weighting
- **Collaborative Weight**: 3x (highest priority for user similarities)
- **Behavior Weight**: 2x (medium priority for learned preferences)  
- **Content Weight**: 1x (baseline for product similarities)
- **Deduplication**: Removes already purchased items and duplicates

### 5. Automatic Model Retraining

- **Trigger**: Automatically retrains when 100+ new behaviors are recorded
- **Persistence**: Models are saved/loaded from disk for performance
- **Incremental Learning**: Updates user preferences in real-time

**🚀 This is now a REAL AI system** using scikit-learn, numpy, and pandas for genuine machine learning, not simple algorithmic approaches.

### Future Enhancements

- **Machine Learning Models** - Replace dummy logic with trained ML models
- **Real-time Learning** - Update recommendations based on user interactions
- **A/B Testing** - Support for multiple recommendation algorithms
- **Caching** - Redis integration for faster response times
- **Analytics** - Track recommendation performance and user engagement

## Configuration

The service runs on:

- **Host**: `0.0.0.0` (accepts external connections)
- **Port**: `5000`
- **Debug**: `False` (production ready)

## Logging

The service includes comprehensive logging for:

- Request processing
- Recommendation generation
- Error tracking
- Performance monitoring

## Error Handling

Robust error handling for:

- Invalid JSON requests
- Missing required fields
- Invalid data types
- Server errors
- 404/405 HTTP errors

## Development

### Project Structure

```
recommendation-engine/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

### Adding New Features

1. **New Endpoints** - Add new routes in `app.py`
2. **New Algorithms** - Implement in separate modules
3. **Database Integration** - Add database models for user data
4. **ML Models** - Integrate scikit-learn, TensorFlow, or PyTorch

## Production Deployment

For production deployment, consider:

1. **WSGI Server** - Use Gunicorn or uWSGI instead of Flask dev server
2. **Environment Variables** - Move configuration to environment variables
3. **Database** - Connect to MongoDB for user data and product information
4. **Caching** - Add Redis for recommendation caching
5. **Monitoring** - Add application monitoring and metrics
6. **Security** - Add authentication and rate limiting

### Example Production Setup

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
