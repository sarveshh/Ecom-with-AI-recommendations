# AI Product Recommendation Engine

A standalone Python microservice that provides AI-powered product recommendations for the e-commerce platform.

## Features

- **RESTful API** - Clean HTTP API for getting product recommendations
- **Collaborative Filtering** - Dummy implementation of collaborative filtering algorithm
- **User-based Recommendations** - Personalized recommendations based on user ID and purchase history
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

The current implementation uses a dummy collaborative filtering approach:

1. **User Pattern Analysis** - Maps user IDs to preference categories
2. **Purchase History Analysis** - Analyzes recent purchases for similar products
3. **Collaborative Filtering Simulation** - "Users who bought this also bought" logic
4. **Deduplication** - Removes duplicates and already purchased items

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
