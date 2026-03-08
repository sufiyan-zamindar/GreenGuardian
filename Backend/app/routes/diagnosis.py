from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from PIL import Image, UnidentifiedImageError
import io
import traceback

from app.services.prediction_service import predict_disease
from app.services.treatment_service import get_treatment
from app.services.history_service import save_prediction
from app.services.disease_name_service import to_readable_name

router = APIRouter()


@router.post("/diagnose")
async def diagnose(file: UploadFile = File(...), user_id: int | None = Form(None)):
    """
    Diagnose plant disease from uploaded image

    Returns:
        - disease: Detected disease name
        - confidence: Confidence score (0-1)
        - treatment: Treatment recommendations
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image uploads are supported")

        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        try:
            image = Image.open(io.BytesIO(contents))
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Invalid image file")

        if image.mode != "RGB":
            image = image.convert("RGB")

        print(f"Processing image: {file.filename} (size: {image.size}, mode: {image.mode})")

        disease_id, confidence = predict_disease(image)
        disease_display = to_readable_name(disease_id)

        treatment = get_treatment(disease_id)

        diagnosis_id = None
        save_error = None
        try:
            diagnosis_id, save_error = save_prediction(
                disease_id,
                confidence,
                user_id=user_id,
                image_path=file.filename,
                return_error=True,
            )
            if diagnosis_id is None:
                print(f"Diagnosis not persisted for label={disease_id}. reason={save_error}")
            else:
                print(f"Diagnosis saved: ID={diagnosis_id}, Disease={disease_id}, Confidence={confidence:.2%}")
        except Exception as e:
            save_error = str(e)
            print(f"Failed to save diagnosis: {e}")

        return {
            "success": True,
            "disease": disease_display,
            "disease_id": disease_id,
            "confidence": float(confidence),
            "confidence_percentage": int(confidence * 100),
            "treatment": treatment,
            "diagnosis_id": diagnosis_id,
            "history_saved": diagnosis_id is not None,
            "history_save_error": save_error,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in diagnosis: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Diagnosis failed",
                "details": str(e)
            }
        )


