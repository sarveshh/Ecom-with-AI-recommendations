import logging
import random

from flask import Flask, jsonify, request
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample product IDs for recommendations (in a real app, this would come from your database)
SAMPLE_PRODUCT_IDS = [
    "672a1b2c3d4e5f6789012345",
    "672a1b2c3d4e5f6789012346",
    "672a1b2c3d4e5f6789012347",
    "672a1b2c3d4e5f6789012348",
    "672a1b2c3d4e5f6789012349",
    "672a1b2c3d4e5f678901234a",
    "672a1b2c3d4e5f678901234b",
    "672a1b2c3d4e5f678901234c",
]

# Dummy recommendation logic based on user patterns
USER_PREFERENCE_PATTERNS = {
    "electronics": [
        "672a1b2c3d4e5f6789012345",
        "672a1b2c3d4e5f6789012346",
        "672a1b2c3d4e5f6789012347",
    ],
    "accessories": ["672a1b2c3d4e5f6789012348", "672a1b2c3d4e5f6789012349"],
    "gaming": ["672a1b2c3d4e5f678901234a", "672a1b2c3d4e5f678901234b"],
    "default": [
        "672a1b2c3d4e5f6789012345",
        "672a1b2c3d4e5f6789012348",
        "672a1b2c3d4e5f678901234a",
    ],
}


def generate_recommendations(user_id, purchase_history, num_recommendations=5):
    """
    Generate product recommendations based on user ID and purchase history.
    This is a dummy implementation - in production, this would use ML models.

    Args:
        user_id (str): The user identifier
        purchase_history (list): List of previously purchased product IDs
        num_recommendations (int): Number of recommendations to return

    Returns:
        list: List of recommended product IDs
    """
    try:
        recommendations = []

        # Simple recommendation logic based on user ID pattern
        if user_id:
            user_hash = hash(user_id) % len(USER_PREFERENCE_PATTERNS)
            pattern_keys = list(USER_PREFERENCE_PATTERNS.keys())
            preferred_category = pattern_keys[user_hash]

            # Get products from preferred category
            category_products = USER_PREFERENCE_PATTERNS.get(
                preferred_category, USER_PREFERENCE_PATTERNS["default"]
            )
            recommendations.extend(category_products)

        # Add collaborative filtering simulation
        if purchase_history:
            # Simulate "users who bought this also bought" logic
            for product_id in purchase_history[-2:]:  # Look at last 2 purchases
                # Simple hash-based recommendation
                product_hash = hash(product_id) % len(SAMPLE_PRODUCT_IDS)
                similar_products = SAMPLE_PRODUCT_IDS[product_hash : product_hash + 2]
                recommendations.extend(similar_products)

        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for product_id in recommendations:
            if product_id not in seen and product_id not in purchase_history:
                seen.add(product_id)
                unique_recommendations.append(product_id)

        # If we don't have enough recommendations, add random ones
        while len(unique_recommendations) < num_recommendations:
            random_product = random.choice(SAMPLE_PRODUCT_IDS)
            if (
                random_product not in unique_recommendations
                and random_product not in purchase_history
            ):
                unique_recommendations.append(random_product)

        # Return the requested number of recommendations
        return unique_recommendations[:num_recommendations]

    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        # Return default recommendations on error
        return USER_PREFERENCE_PATTERNS["default"][:num_recommendations]


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return (
        jsonify(
            {
                "status": "healthy",
                "service": "recommendation-engine",
                "version": "1.0.0",
            }
        ),
        200,
    )


@app.route("/recommendations", methods=["POST"])
def get_recommendations():
    """
    Get product recommendations for a user.

    Expected JSON payload:
    {
        "userId": "string",
        "purchaseHistory": ["product_id_1", "product_id_2", ...],
        "numRecommendations": 5 (optional, defaults to 5)
    }

    Returns:
    {
        "success": true,
        "recommendations": ["product_id_1", "product_id_2", ...],
        "userId": "string",
        "algorithm": "collaborative_filtering_v1"
    }
    """
    try:
        # Validate request content type
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Request must be JSON",
                        "message": "Content-Type must be application/json",
                    }
                ),
                400,
            )

        # Parse request data
        data = request.get_json()

        if not data:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Empty request body",
                        "message": "Request body cannot be empty",
                    }
                ),
                400,
            )

        # Extract required fields
        user_id = data.get("userId")
        purchase_history = data.get("purchaseHistory", [])
        num_recommendations = data.get("numRecommendations", 5)

        # Validate user_id
        if not user_id:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing userId",
                        "message": "userId is required in the request body",
                    }
                ),
                400,
            )

        # Validate purchase_history format
        if not isinstance(purchase_history, list):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Invalid purchaseHistory format",
                        "message": "purchaseHistory must be an array",
                    }
                ),
                400,
            )

        # Validate num_recommendations
        if (
            not isinstance(num_recommendations, int)
            or num_recommendations < 1
            or num_recommendations > 20
        ):
            num_recommendations = 5  # Default fallback

        # Log the request
        logger.info(
            f"Generating recommendations for user: {user_id}, history length: {len(purchase_history)}"
        )

        # Generate recommendations
        recommendations = generate_recommendations(
            user_id, purchase_history, num_recommendations
        )

        # Prepare response
        response = {
            "success": True,
            "recommendations": recommendations,
            "userId": user_id,
            "algorithm": "collaborative_filtering_v1",
            "numRecommendations": len(recommendations),
            "timestamp": str(int(time.time() * 1000)) if "time" in globals() else None,
        }

        logger.info(
            f"Successfully generated {len(recommendations)} recommendations for user: {user_id}"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {str(e)}")
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Internal server error",
                    "message": "An unexpected error occurred while generating recommendations",
                }
            ),
            500,
        )


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "Endpoint not found",
                "message": "The requested endpoint does not exist",
            }
        ),
        404,
    )


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return (
        jsonify(
            {
                "success": False,
                "error": "Method not allowed",
                "message": "The HTTP method is not allowed for this endpoint",
            }
        ),
        405,
    )


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return (
        jsonify(
            {
                "success": False,
                "error": "Internal server error",
                "message": "An unexpected error occurred",
            }
        ),
        500,
    )


if __name__ == "__main__":
    import time

    logger.info("Starting AI Recommendation Engine...")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /recommendations - Get product recommendations")

    # Run the Flask application
    app.run(
        host="0.0.0.0",  # Allow external connections
        port=5000,
        debug=False,  # Set to False for production
        threaded=True,
    )
