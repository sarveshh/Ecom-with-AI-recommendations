import logging
import random
import time
from datetime import datetime

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from ml_recommender import MLRecommendationEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize ML recommendation engine
ml_engine = MLRecommendationEngine()

# Configuration
NEXT_JS_API_URL = "http://localhost:3000/api/products"

# Cache for product IDs (refreshed periodically)
PRODUCT_CACHE = {"ids": [], "last_updated": 0, "cache_duration": 300}  # 5 minutes


def get_product_ids():
    """
    Fetch real product IDs and features from the Next.js API
    Uses caching to avoid frequent API calls and updates ML engine with product features
    """
    current_time = time.time()

    # Check if cache is still valid
    if (current_time - PRODUCT_CACHE["last_updated"]) < PRODUCT_CACHE[
        "cache_duration"
    ] and PRODUCT_CACHE["ids"]:
        return PRODUCT_CACHE["ids"]

    try:
        # Fetch products from Next.js API
        response = requests.get(NEXT_JS_API_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data"):
                products = data["data"]
                product_ids = []

                # Update both cache and ML engine
                for product in products:
                    product_id = str(product.get("_id", ""))
                    if product_id:
                        product_ids.append(product_id)

                        # Add product features to ML engine
                        features = {
                            "name": product.get("name", ""),
                            "description": product.get("description", ""),
                            "category": product.get("category", ""),
                            "price": product.get("price", 0),
                            "brand": product.get("brand", ""),
                            "tags": product.get("tags", []),
                        }
                        ml_engine.add_product_features(product_id, features)

                # Update cache
                PRODUCT_CACHE["ids"] = product_ids
                PRODUCT_CACHE["last_updated"] = current_time

                logger.info(
                    f"Updated product cache with {len(product_ids)} products and ML features"
                )
                return product_ids
    except Exception as e:
        logger.warning(f"Failed to fetch products from API: {str(e)}")

    # If no products available, return empty list (don't use fallback fake IDs)
    if not PRODUCT_CACHE["ids"]:
        logger.warning(
            "No products available - database may be empty. Please add products via admin panel."
        )
        PRODUCT_CACHE["ids"] = []
        PRODUCT_CACHE["last_updated"] = current_time

    return PRODUCT_CACHE["ids"]


def generate_recommendations(user_id, purchase_history, num_recommendations=5):
    """
    Generate product recommendations using advanced ML algorithms.

    Args:
        user_id (str): The user identifier
        purchase_history (list): List of previously purchased product IDs
        num_recommendations (int): Number of recommendations to return

    Returns:
        list: List of recommended product IDs
    """
    try:
        # Ensure we have product data
        get_product_ids()

        # Check if we should retrain models
        if ml_engine.should_retrain():
            logger.info("Retraining ML models with new data...")
            ml_engine.retrain_models()

        # Try ML-based hybrid recommendations first
        recommendations = ml_engine.get_hybrid_recommendations(
            user_id=user_id,
            recent_products=purchase_history,
            n_recommendations=num_recommendations,
        )

        # If ML recommendations are insufficient, fall back to content-based
        if len(recommendations) < num_recommendations and purchase_history:
            for product_id in purchase_history[-3:]:  # Last 3 products
                content_recs = ml_engine.get_content_recommendations(
                    product_id, num_recommendations - len(recommendations)
                )
                for rec in content_recs:
                    if rec not in recommendations and rec not in purchase_history:
                        recommendations.append(rec)
                        if len(recommendations) >= num_recommendations:
                            break

        # If still insufficient, add popular products
        if len(recommendations) < num_recommendations:
            product_ids = get_product_ids()
            if product_ids:  # Only if we have actual products
                for product_id in product_ids:
                    if (
                        product_id not in recommendations
                        and product_id not in purchase_history
                        and len(recommendations) < num_recommendations
                    ):
                        recommendations.append(product_id)
            else:
                logger.warning(
                    "No products available for recommendations - database may be empty"
                )

        logger.info(
            f"Generated {len(recommendations)} ML-based recommendations for user {user_id}"
        )
        return recommendations[:num_recommendations]

    except Exception as e:
        logger.error(f"Error generating ML recommendations: {str(e)}")
        # Fallback to simple random recommendations only if products exist
        product_ids = get_product_ids()
        if product_ids:
            available_products = [p for p in product_ids if p not in purchase_history]
            return random.sample(
                available_products, min(num_recommendations, len(available_products))
            )
        else:
            logger.warning("No products available for fallback recommendations")
            return []
        return []


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


@app.route("/track-behavior", methods=["POST"])
def track_user_behavior():
    """
    Track user behavior for ML learning

    Expected JSON payload:
    {
        "userId": "string",
        "action": "view|cart|purchase|like|share",
        "productId": "string",
        "metadata": {
            "category": "string",
            "price": number,
            "brand": "string",
            "timeSpent": number
        }
    }
    """
    try:
        if not request.is_json:
            return (
                jsonify(
                    {"success": False, "error": "Content-Type must be application/json"}
                ),
                400,
            )

        data = request.get_json()

        # Validate required fields
        required_fields = ["userId", "action", "productId"]
        for field in required_fields:
            if field not in data:
                return (
                    jsonify(
                        {"success": False, "error": f"Missing required field: {field}"}
                    ),
                    400,
                )

        user_id = data["userId"]
        action = data["action"]
        product_id = data["productId"]
        metadata = data.get("metadata", {})

        # Validate action type
        valid_actions = ["view", "cart", "purchase", "like", "share"]
        if action not in valid_actions:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Invalid action. Must be one of: {', '.join(valid_actions)}",
                    }
                ),
                400,
            )

        # Track behavior in ML engine
        ml_engine.track_user_behavior(user_id, action, product_id, metadata)

        logger.info(f"Tracked behavior: {user_id} {action} {product_id}")

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Behavior tracked successfully",
                    "userId": user_id,
                    "action": action,
                    "productId": product_id,
                    "timestamp": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error tracking behavior: {str(e)}")
        return (
            jsonify(
                {"success": False, "error": "Internal server error", "message": str(e)}
            ),
            500,
        )


@app.route("/retrain-models", methods=["POST"])
def retrain_models():
    """
    Manually trigger model retraining
    """
    try:
        logger.info("Manual model retraining triggered")

        # Ensure we have product data
        get_product_ids()

        # Retrain models
        ml_engine.retrain_models()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Models retrained successfully",
                    "timestamp": datetime.now().isoformat(),
                    "modelVersion": ml_engine.model_version,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retraining models: {str(e)}")
        return (
            jsonify(
                {"success": False, "error": "Internal server error", "message": str(e)}
            ),
            500,
        )


@app.route("/model-status", methods=["GET"])
def get_model_status():
    """
    Get current ML model status and statistics
    """
    try:
        # Get basic statistics
        num_users = len(ml_engine.user_behaviors)
        num_products = len(ml_engine.product_features)

        total_behaviors = sum(
            len(behaviors) for behaviors in ml_engine.user_behaviors.values()
        )

        # Check if models are trained
        models_trained = {
            "collaborative_filtering": ml_engine.svd_model is not None,
            "content_based": ml_engine.content_vectorizer is not None,
            "user_preferences": len(ml_engine.user_preferences) > 0,
        }

        return (
            jsonify(
                {
                    "success": True,
                    "modelVersion": ml_engine.model_version,
                    "lastTraining": (
                        ml_engine.last_training.isoformat()
                        if ml_engine.last_training
                        else None
                    ),
                    "statistics": {
                        "numUsers": num_users,
                        "numProducts": num_products,
                        "totalBehaviors": total_behaviors,
                    },
                    "modelsTrained": models_trained,
                    "shouldRetrain": ml_engine.should_retrain(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        return (
            jsonify(
                {"success": False, "error": "Internal server error", "message": str(e)}
            ),
            500,
        )


@app.route("/user-profile/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    """
    Get user profile and preferences
    """
    try:
        if user_id not in ml_engine.user_preferences:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "User not found",
                        "message": f"No profile found for user {user_id}",
                    }
                ),
                404,
            )

        user_behaviors = ml_engine.user_behaviors.get(user_id, [])
        user_preferences = ml_engine.user_preferences.get(user_id, {})

        # Calculate behavior summary
        behavior_summary = {}
        for behavior in user_behaviors:
            action = behavior["action"]
            behavior_summary[action] = behavior_summary.get(action, 0) + 1

        return (
            jsonify(
                {
                    "success": True,
                    "userId": user_id,
                    "totalBehaviors": len(user_behaviors),
                    "behaviorSummary": behavior_summary,
                    "preferences": user_preferences,
                    "profileCreated": (
                        user_behaviors[0]["timestamp"] if user_behaviors else None
                    ),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return (
            jsonify(
                {"success": False, "error": "Internal server error", "message": str(e)}
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
