from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import traceback

from app.services.prediction_service import predict_disease
from app.services.treatment_service import get_treatment
from app.services.history_service import save_prediction

router = APIRouter()

@router.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    """
    Diagnose plant disease from uploaded image
    
    Returns:
        - disease: Detected disease name
        - confidence: Confidence score (0-1)
        - treatment: Treatment recommendations
    """
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Ensure image is in RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        print(f"Processing image: {file.filename} (size: {image.size}, mode: {image.mode})")
        
        # Get prediction from model
        disease, confidence = predict_disease(image)
        
        # Clean up disease name (remove underscores, use readable format)
        disease_display = disease.replace('_', ' ')
        
        # Get treatment information
        treatment = get_treatment(disease)
        
        # Save to database
        try:
            diagnosis_id = save_prediction(disease, confidence)
            print(f"✓ Diagnosis saved: ID={diagnosis_id}, Disease={disease}, Confidence={confidence:.2%}")
        except Exception as e:
            print(f"✗ Failed to save diagnosis: {e}")
        
        return {
            "success": True,
            "disease": disease_display,
            "disease_id": disease,
            "confidence": float(confidence),
            "confidence_percentage": int(confidence * 100),
            "treatment": treatment
        }
        
    except Exception as e:
        print(f"✗ Error in diagnosis: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Diagnosis failed",
                "details": str(e)
            }
        )