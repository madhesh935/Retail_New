import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Firebase App
def init_firebase():
    if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
    else:
        logger.warning(f"Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}. Syncing will be disabled.")

# Helper function to get firestore client
def get_firestore_client():
    if not firebase_admin._apps:
        return None
    return firestore.client()

# Example sync function
def sync_item_to_firebase(item_id: int, item_data: dict):
    """
    Called when a local SQLite operation succeeds and needs to be pushed to Cloud Firestore.
    """
    db = get_firestore_client()
    if not db:
        logger.warning("Cannot sync to Firebase, client not initialized.")
        return False
        
    try:
        # Assuming we have an 'items' collection in firestore
        doc_ref = db.collection(u'items').document(str(item_id))
        doc_ref.set(item_data)
        logger.info(f"Item {item_id} successfully synced to Firebase.")
        return True
    except Exception as e:
        logger.error(f"Error syncing item {item_id} to Firebase: {e}")
        return False
