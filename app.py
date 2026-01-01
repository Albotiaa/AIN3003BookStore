from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from datetime import datetime

# Initialize Flask app with static folder
app = Flask(__name__, static_folder='static')

# MongoDB Connection Details
MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
MONGO_PORT = int(os.getenv('MONGO_PORT', 27017))
MONGO_USER = os.getenv('MONGO_USER', 'admin')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', 'admin')
MONGO_DB = os.getenv('MONGO_DB', 'BOOKSTORE')

# Connection string with authentication
mongo_uri = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/"

# Connect to MongoDB
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Verify connection
    client.admin.command('ping')
    print("✓ Successfully connected to MongoDB")
except Exception as e:
    print(f"✗ Failed to connect to MongoDB: {e}")

db = client[MONGO_DB]
books_collection = db['books']

# ============== STATIC FILES ==============
@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

# ============== HEALTH CHECK ==============
@app.route('/health', methods=['GET'])
def health_check():
    """Check if the application is running"""
    return jsonify({"status": "healthy", "message": "Application is running"}), 200

# ============== CREATE (C in CRUD) ==============
@app.route('/api/books', methods=['POST'])
def create_book():
    """Create a new book in the database"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'title' not in data or 'author' not in data:
            return jsonify({"error": "Title and Author are required"}), 400
        
        # Create book document
        book = {
            "title": data.get('title'),
            "author": data.get('author'),
            "isbn": data.get('isbn', ''),
            "price": data.get('price', 0),
            "quantity": data.get('quantity', 0),
            "publication_date": data.get('publication_date', ''),
            "created_at": datetime.now().isoformat()
        }
        
        # Insert into MongoDB
        result = books_collection.insert_one(book)
        
        return jsonify({
            "message": "Book created successfully",
            "book_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============== READ (R in CRUD) ==============
@app.route('/api/books', methods=['GET'])
def get_all_books():
    """Get all books from the database"""
    try:
        books = list(books_collection.find())
        
        # Convert MongoDB ObjectId to string for JSON serialization
        for book in books:
            book['_id'] = str(book['_id'])
        
        return jsonify({
            "total_books": len(books),
            "books": books
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book by ID"""
    try:
        # Convert string ID to MongoDB ObjectId
        book = books_collection.find_one({"_id": ObjectId(book_id)})
        
        if not book:
            return jsonify({"error": "Book not found"}), 404
        
        book['_id'] = str(book['_id'])
        return jsonify(book), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============== UPDATE (U in CRUD) ==============
@app.route('/api/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    """Update an existing book"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Update the book
        result = books_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Book not found"}), 404
        
        return jsonify({
            "message": "Book updated successfully",
            "modified_count": result.modified_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============== DELETE (D in CRUD) ==============
@app.route('/api/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book from the database"""
    try:
        result = books_collection.delete_one({"_id": ObjectId(book_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Book not found"}), 404
        
        return jsonify({
            "message": "Book deleted successfully",
            "deleted_count": result.deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============== STATISTICS ==============
@app.route('/api/books/stats/count', methods=['GET'])
def get_stats():
    """Get statistics about books"""
    try:
        total_books = books_collection.count_documents({})
        
        return jsonify({
            "total_books": total_books
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============== ERROR HANDLERS ==============
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============== MAIN ==============
if __name__ == '__main__':
    print("Starting Bookstore Flask Application...")
    print(f"MongoDB Host: {MONGO_HOST}")
    print(f"MongoDB Port: {MONGO_PORT}")
    print(f"Database: {MONGO_DB}")
    app.run(host='0.0.0.0', port=8080, debug=True)