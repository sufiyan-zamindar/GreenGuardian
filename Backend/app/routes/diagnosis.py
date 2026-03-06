from fastapi import APIRouter, UploadFile, File
from PIL import Image

from app.services.prediction_service import predict_disease
from app.services.treatment_service import get_treatment

router = APIRouter()

@router.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):

    image = Image.open(file.file)

    disease,confidence = predict_disease(image)

    treatment = get_treatment(disease)

    return {
        "disease":disease,
        "confidence":confidence,
        "treatment":treatment
    }