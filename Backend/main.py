# # import os
# # import sys
# # sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# # from fastapi import FastAPI
# # from routes import diagnosis

# # app = FastAPI(
# #     title="GreenGuardian API",
# #     description="Plant Disease Detection API",
# #     version="1.0"
# # )

# # app.include_router(diagnosis.router)
# # from fastapi import FastAPI
# # from backend.app.routes import diagnosis

# # app = FastAPI(
# #     title="GreenGuardian API"
# # )

# # app.include_router(diagnosis.router)
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import random
# import json
# import os
# import io
# import traceback

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["*"]}})

# # Enable debug mode
# app.config['DEBUG'] = True

# # Import the prediction service
# try:
#     from app.services.prediction_service import predict_disease
#     AI_AVAILABLE = True
#     print("AI prediction service loaded successfully")
# except ImportError as e:
#     print(f"Failed to import prediction service: {e}")
#     AI_AVAILABLE = False

# # Load disease labels for fallback
# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# LABEL_PATH = os.path.join(BASE_DIR, "ai_model", "models", "class_labels.json")

# try:
#     with open(LABEL_PATH) as f:
#         class_indices = json.load(f)
#     # Get disease NAMES (keys), not indices (values)
#     diseases = list(class_indices.keys())
#     print(f"Loaded {len(diseases)} disease classes")
# except Exception as e:
#     print(f"Failed to load disease labels: {e}")
#     diseases = ['Apple___healthy', 'Tomato___healthy', 'Potato___Early_blight', 'Corn_(maize)___healthy']

# @app.route('/')
# def home():
#     status = "GreenGuardian API is running"
#     if AI_AVAILABLE:
#         status += " (AI Model Connected)"
#     else:
#         status += " (Mock Mode - AI Model Not Available)"
#     return status

# @app.route('/diagnose', methods=['POST', 'OPTIONS'])
# def diagnose():
#     if request.method == 'OPTIONS':
#         return '', 200
    
#     print("\n=== Diagnose endpoint called ===")
#     print(f"Request method: {request.method}")
#     print(f"Request content type: {request.content_type}")
#     print(f"Request headers: {dict(request.headers)}")
#     print(f"Request files keys: {list(request.files.keys()) if request.files else 'None'}")
#     print(f"Request size: {len(request.data) if request.data else 0} bytes")
    
#     try:
#         # Check for file in multiple ways
#         file = None
        
#         if request.files:
#             print(f"Files found: {list(request.files.keys())}")
#             # Try to get 'file' key first
#             if 'file' in request.files:
#                 file = request.files['file']
#                 print("Using 'file' key")
#             else:
#                 # Get the first file
#                 file_key = list(request.files.keys())[0]
#                 file = request.files[file_key]
#                 print(f"Using first file key: {file_key}")
#         else:
#             print("No files in request.files")
#             return jsonify({'error': 'No file provided', 'details': 'Please upload an image file'}), 400
        
#         if not file or file.filename == '':
#             print("File is empty or filename missing")
#             return jsonify({'error': 'Invalid file', 'details': 'File is empty or missing filename'}), 400
        
#         print(f"Processing file: {file.filename} (type: {file.content_type}, size: {file.content_length})")
        
#         # Reset file pointer to beginning
#         file.seek(0)
#         file_content = file.read()
#         print(f"File content size: {len(file_content)} bytes")
        
#         # Get prediction
#         disease = random.choice(diseases)
#         # Confidence as integer percentage (70-95%)
#         confidence = random.randint(70, 95)
        
#         print(f"Returning prediction: disease={disease}, confidence={confidence}%")
#         response_data = {
#             'disease': disease,
#             'confidence': confidence,
#             'success': True
#         }
#         print(f"Response: {response_data}")
#         response = jsonify(response_data)
#         response.headers['Content-Type'] = 'application/json'
#         return response, 200
        
#     except Exception as e:
#         print(f"Exception in diagnose: {e}")
#         print(traceback.format_exc())
#         return jsonify({
#             'error': 'Server error', 
#             'details': str(e),
#             'success': False
#         }), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000, debug=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import diagnosis

app = FastAPI(title="GreenGuardian API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diagnosis.router)

@app.get("/")
def home():
    return {"message": "GreenGuardian API running"}