"""
Advanced ML-based recommendation engine with real AI capabilities.
Implements collaborative filtering, content-based filtering, and user behavior analysis.
"""

import json
import logging
import os
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class MLRecommendationEngine:
    """
    Advanced ML-based recommendation engine that implements:
    1. Collaborative Filtering (Matrix Factorization)
    2. Content-Based Filtering (TF-IDF + Cosine Similarity)
    3. User Behavior Analysis
    4. Hybrid Model combining multiple approaches
    """

    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        self.ensure_model_directory()

        # ML Models
        self.svd_model = None
        self.content_vectorizer = None
        self.content_similarity_matrix = None
        self.scaler = StandardScaler()

        # Data storage
        self.user_item_matrix = None
        self.product_features = {}
        self.user_behaviors = {}
        self.user_preferences = {}

        # Model metadata
        self.last_training = None
        self.model_version = "1.0.0"

        # Load existing models if available
        self.load_models()

    def ensure_model_directory(self):
        """Create model directory if it doesn't exist"""
        os.makedirs(self.model_path, exist_ok=True)

    def track_user_behavior(
        self, user_id: str, action: str, product_id: str, metadata: Dict = None
    ):
        """
        Track user behavior for learning preferences

        Args:
            user_id: User identifier
            action: Type of action (view, cart, purchase, like, etc.)
            product_id: Product that was interacted with
            metadata: Additional context (time_spent, price, category, etc.)
        """
        if user_id not in self.user_behaviors:
            self.user_behaviors[user_id] = []

        behavior = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "product_id": product_id,
            "metadata": metadata or {},
        }

        self.user_behaviors[user_id].append(behavior)

        # Update user preferences based on behavior
        self._update_user_preferences(user_id, behavior)

        logger.info(
            f"Tracked behavior for user {user_id}: {action} on product {product_id}"
        )

    def _update_user_preferences(self, user_id: str, behavior: Dict):
        """Update user preferences based on their behavior"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                "categories": {},
                "price_range": {"min": float("inf"), "max": 0},
                "brands": {},
                "action_weights": {
                    "view": 1,
                    "cart": 3,
                    "purchase": 5,
                    "like": 2,
                    "share": 2,
                },
            }

        prefs = self.user_preferences[user_id]
        metadata = behavior.get("metadata", {})
        action = behavior["action"]
        weight = prefs["action_weights"].get(action, 1)

        # Update category preferences
        if "category" in metadata:
            category = metadata["category"]
            prefs["categories"][category] = (
                prefs["categories"].get(category, 0) + weight
            )

        # Update price range preferences
        if "price" in metadata:
            price = float(metadata["price"])
            prefs["price_range"]["min"] = min(prefs["price_range"]["min"], price)
            prefs["price_range"]["max"] = max(prefs["price_range"]["max"], price)

        # Update brand preferences
        if "brand" in metadata:
            brand = metadata["brand"]
            prefs["brands"][brand] = prefs["brands"].get(brand, 0) + weight

    def add_product_features(self, product_id: str, features: Dict):
        """
        Add product features for content-based filtering

        Args:
            product_id: Product identifier
            features: Dict with keys like 'name', 'description', 'category', 'price', 'brand'
        """
        self.product_features[product_id] = features
        logger.info(f"Added features for product {product_id}")

    def build_user_item_matrix(self) -> csr_matrix:
        """
        Build user-item interaction matrix from user behaviors
        Actions are weighted: view=1, cart=3, purchase=5, like=2
        """
        if not self.user_behaviors:
            logger.warning("No user behaviors available for matrix construction")
            return csr_matrix((0, 0))

        # Collect all users and products
        all_users = set(self.user_behaviors.keys())
        all_products = set()

        for behaviors in self.user_behaviors.values():
            for behavior in behaviors:
                all_products.add(behavior["product_id"])

        user_list = sorted(list(all_users))
        product_list = sorted(list(all_products))

        # Create mapping dictionaries
        user_to_idx = {user: idx for idx, user in enumerate(user_list)}
        product_to_idx = {product: idx for idx, product in enumerate(product_list)}

        # Build interaction matrix
        matrix = np.zeros((len(user_list), len(product_list)))

        for user, behaviors in self.user_behaviors.items():
            user_idx = user_to_idx[user]
            for behavior in behaviors:
                product_idx = product_to_idx[behavior["product_id"]]
                action = behavior["action"]

                # Weight different actions differently
                weights = {"view": 1, "cart": 3, "purchase": 5, "like": 2, "share": 2}
                weight = weights.get(action, 1)

                matrix[user_idx, product_idx] += weight

        self.user_item_matrix = csr_matrix(matrix)
        self.user_to_idx = user_to_idx
        self.product_to_idx = product_to_idx
        self.idx_to_user = {idx: user for user, idx in user_to_idx.items()}
        self.idx_to_product = {idx: product for product, idx in product_to_idx.items()}

        logger.info(
            f"Built user-item matrix: {matrix.shape[0]} users x {matrix.shape[1]} products"
        )
        return self.user_item_matrix

    def train_collaborative_filtering(self, n_components: int = 50):
        """
        Train collaborative filtering model using Matrix Factorization (SVD)
        """
        if self.user_item_matrix is None:
            self.build_user_item_matrix()

        if self.user_item_matrix.shape[0] == 0 or self.user_item_matrix.shape[1] == 0:
            logger.warning(
                "Cannot train collaborative filtering: empty user-item matrix"
            )
            return

        # Use TruncatedSVD for matrix factorization
        n_components = min(n_components, min(self.user_item_matrix.shape) - 1)
        self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)

        # Fit the model
        self.svd_model.fit(self.user_item_matrix)

        logger.info(
            f"Trained collaborative filtering model with {n_components} components"
        )
        self.last_training = datetime.now()

    def train_content_based_filtering(self):
        """
        Train content-based filtering using TF-IDF and cosine similarity
        """
        if not self.product_features:
            logger.warning("No product features available for content-based filtering")
            return

        # Create content descriptions for each product
        product_descriptions = []
        product_ids = []

        for product_id, features in self.product_features.items():
            # Combine textual features
            description = " ".join(
                [
                    features.get("name", ""),
                    features.get("description", ""),
                    features.get("category", ""),
                    features.get("brand", ""),
                    str(features.get("price", "")),
                ]
            )
            product_descriptions.append(description)
            product_ids.append(product_id)

        # Create TF-IDF vectors
        self.content_vectorizer = TfidfVectorizer(
            max_features=1000, stop_words="english", ngram_range=(1, 2)
        )

        tfidf_matrix = self.content_vectorizer.fit_transform(product_descriptions)

        # Calculate cosine similarity matrix
        self.content_similarity_matrix = cosine_similarity(tfidf_matrix)
        self.content_product_ids = product_ids

        logger.info(f"Trained content-based filtering for {len(product_ids)} products")

    def get_collaborative_recommendations(
        self, user_id: str, n_recommendations: int = 10
    ) -> List[str]:
        """
        Get recommendations using collaborative filtering
        """
        if self.svd_model is None or user_id not in self.user_to_idx:
            return []

        user_idx = self.user_to_idx[user_id]

        # Get user vector from SVD
        user_vector = self.svd_model.transform(self.user_item_matrix[user_idx])

        # Calculate scores for all products
        product_scores = np.dot(user_vector, self.svd_model.components_)

        # Get products user hasn't interacted with
        user_interactions = self.user_item_matrix[user_idx].toarray()[0]
        unseen_products = np.where(user_interactions == 0)[0]

        # Sort unseen products by predicted score
        unseen_scores = [(idx, product_scores[0][idx]) for idx in unseen_products]
        unseen_scores.sort(key=lambda x: x[1], reverse=True)

        # Return top recommendations
        recommendations = [
            self.idx_to_product[idx] for idx, _ in unseen_scores[:n_recommendations]
        ]
        return recommendations

    def get_content_recommendations(
        self, product_id: str, n_recommendations: int = 10
    ) -> List[str]:
        """
        Get recommendations using content-based filtering
        """
        if (
            self.content_similarity_matrix is None
            or product_id not in self.content_product_ids
        ):
            return []

        product_idx = self.content_product_ids.index(product_id)

        # Get similarity scores
        similarity_scores = self.content_similarity_matrix[product_idx]

        # Sort by similarity (excluding the product itself)
        similar_products = [
            (idx, score)
            for idx, score in enumerate(similarity_scores)
            if idx != product_idx
        ]
        similar_products.sort(key=lambda x: x[1], reverse=True)

        # Return top recommendations
        recommendations = [
            self.content_product_ids[idx]
            for idx, _ in similar_products[:n_recommendations]
        ]
        return recommendations

    def get_behavior_based_recommendations(
        self, user_id: str, n_recommendations: int = 10
    ) -> List[str]:
        """
        Get recommendations based on user behavior patterns and preferences
        """
        if user_id not in self.user_preferences:
            return []

        prefs = self.user_preferences[user_id]
        recommendations = []

        # Score products based on user preferences
        product_scores = []

        for product_id, features in self.product_features.items():
            score = 0

            # Category preference
            category = features.get("category", "")
            if category in prefs["categories"]:
                score += prefs["categories"][category] * 0.4

            # Price preference
            price = features.get("price", 0)
            if isinstance(price, (int, float)):
                price_min = prefs["price_range"]["min"]
                price_max = prefs["price_range"]["max"]
                if price_min <= price <= price_max:
                    score += 2

            # Brand preference
            brand = features.get("brand", "")
            if brand in prefs["brands"]:
                score += prefs["brands"][brand] * 0.3

            # Check if user has already interacted with this product
            user_behaviors = self.user_behaviors.get(user_id, [])
            has_interacted = any(b["product_id"] == product_id for b in user_behaviors)

            if not has_interacted and score > 0:
                product_scores.append((product_id, score))

        # Sort by score and return top recommendations
        product_scores.sort(key=lambda x: x[1], reverse=True)
        recommendations = [
            product_id for product_id, _ in product_scores[:n_recommendations]
        ]

        return recommendations

    def get_hybrid_recommendations(
        self,
        user_id: str,
        recent_products: List[str] = None,
        n_recommendations: int = 10,
    ) -> List[str]:
        """
        Get hybrid recommendations combining all approaches
        """
        all_recommendations = []

        # Get collaborative filtering recommendations
        collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations)
        all_recommendations.extend([(rec, "collaborative", 3) for rec in collab_recs])

        # Get behavior-based recommendations
        behavior_recs = self.get_behavior_based_recommendations(
            user_id, n_recommendations
        )
        all_recommendations.extend([(rec, "behavior", 2) for rec in behavior_recs])

        # Get content-based recommendations from recent products
        if recent_products:
            for product_id in recent_products[-3:]:  # Last 3 products
                content_recs = self.get_content_recommendations(
                    product_id, n_recommendations // 2
                )
                all_recommendations.extend(
                    [(rec, "content", 1) for rec in content_recs]
                )

        # Combine and weight recommendations
        recommendation_scores = {}
        for product_id, method, weight in all_recommendations:
            if product_id not in recommendation_scores:
                recommendation_scores[product_id] = 0
            recommendation_scores[product_id] += weight

        # Sort by combined score
        sorted_recommendations = sorted(
            recommendation_scores.items(), key=lambda x: x[1], reverse=True
        )

        # Return top unique recommendations
        final_recommendations = [
            product_id for product_id, _ in sorted_recommendations[:n_recommendations]
        ]

        logger.info(
            f"Generated {len(final_recommendations)} hybrid recommendations for user {user_id}"
        )
        return final_recommendations

    def save_models(self):
        """Save trained models to disk"""
        try:
            # Save SVD model
            if self.svd_model:
                with open(os.path.join(self.model_path, "svd_model.pkl"), "wb") as f:
                    pickle.dump(self.svd_model, f)

            # Save content vectorizer and similarity matrix
            if self.content_vectorizer:
                with open(
                    os.path.join(self.model_path, "content_vectorizer.pkl"), "wb"
                ) as f:
                    pickle.dump(self.content_vectorizer, f)

                with open(
                    os.path.join(self.model_path, "content_similarity.pkl"), "wb"
                ) as f:
                    pickle.dump(self.content_similarity_matrix, f)

                with open(
                    os.path.join(self.model_path, "content_product_ids.pkl"), "wb"
                ) as f:
                    pickle.dump(self.content_product_ids, f)

            # Save user data
            with open(os.path.join(self.model_path, "user_behaviors.json"), "w") as f:
                json.dump(self.user_behaviors, f)

            with open(os.path.join(self.model_path, "user_preferences.json"), "w") as f:
                json.dump(self.user_preferences, f)

            with open(os.path.join(self.model_path, "product_features.json"), "w") as f:
                json.dump(self.product_features, f)

            # Save metadata
            metadata = {
                "last_training": (
                    self.last_training.isoformat() if self.last_training else None
                ),
                "model_version": self.model_version,
                "user_to_idx": self.user_to_idx if hasattr(self, "user_to_idx") else {},
                "product_to_idx": (
                    self.product_to_idx if hasattr(self, "product_to_idx") else {}
                ),
            }

            with open(os.path.join(self.model_path, "metadata.json"), "w") as f:
                json.dump(metadata, f)

            logger.info("Models saved successfully")

        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")

    def load_models(self):
        """Load trained models from disk"""
        try:
            # Load SVD model
            svd_path = os.path.join(self.model_path, "svd_model.pkl")
            if os.path.exists(svd_path):
                with open(svd_path, "rb") as f:
                    self.svd_model = pickle.load(f)

            # Load content models
            vectorizer_path = os.path.join(self.model_path, "content_vectorizer.pkl")
            similarity_path = os.path.join(self.model_path, "content_similarity.pkl")
            products_path = os.path.join(self.model_path, "content_product_ids.pkl")

            if all(
                os.path.exists(p)
                for p in [vectorizer_path, similarity_path, products_path]
            ):
                with open(vectorizer_path, "rb") as f:
                    self.content_vectorizer = pickle.load(f)

                with open(similarity_path, "rb") as f:
                    self.content_similarity_matrix = pickle.load(f)

                with open(products_path, "rb") as f:
                    self.content_product_ids = pickle.load(f)

            # Load user data
            behaviors_path = os.path.join(self.model_path, "user_behaviors.json")
            if os.path.exists(behaviors_path):
                with open(behaviors_path, "r") as f:
                    self.user_behaviors = json.load(f)

            preferences_path = os.path.join(self.model_path, "user_preferences.json")
            if os.path.exists(preferences_path):
                with open(preferences_path, "r") as f:
                    self.user_preferences = json.load(f)

            features_path = os.path.join(self.model_path, "product_features.json")
            if os.path.exists(features_path):
                with open(features_path, "r") as f:
                    self.product_features = json.load(f)

            # Load metadata
            metadata_path = os.path.join(self.model_path, "metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)

                    if metadata.get("last_training"):
                        self.last_training = datetime.fromisoformat(
                            metadata["last_training"]
                        )

                    self.model_version = metadata.get("model_version", "1.0.0")
                    self.user_to_idx = metadata.get("user_to_idx", {})
                    self.product_to_idx = metadata.get("product_to_idx", {})

                    if self.user_to_idx:
                        self.idx_to_user = {
                            int(idx): user for user, idx in self.user_to_idx.items()
                        }
                    if self.product_to_idx:
                        self.idx_to_product = {
                            int(idx): product
                            for product, idx in self.product_to_idx.items()
                        }

            logger.info("Models loaded successfully")

        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")

    def retrain_models(self):
        """Retrain all models with current data"""
        logger.info("Starting model retraining...")

        # Retrain collaborative filtering
        self.train_collaborative_filtering()

        # Retrain content-based filtering
        self.train_content_based_filtering()

        # Save updated models
        self.save_models()

        logger.info("Model retraining completed")

    def should_retrain(self, min_new_behaviors: int = 100) -> bool:
        """
        Check if models should be retrained based on new data
        """
        if self.last_training is None:
            return True

        # Count behaviors since last training
        new_behaviors = 0
        for behaviors in self.user_behaviors.values():
            for behavior in behaviors:
                behavior_time = datetime.fromisoformat(behavior["timestamp"])
                if behavior_time > self.last_training:
                    new_behaviors += 1

        return new_behaviors >= min_new_behaviors
