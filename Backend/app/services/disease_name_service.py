import re
from typing import Optional, Tuple


MODEL_TO_DB_ALIASES = {
    "Cherry_(including_sour)___Powdery_mildew": "Cherry_Powdery_mildew",
    "Cherry_(including_sour)___healthy": "Cherry_healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Corn_Cercospora_leaf_spot",
    "Corn_(maize)___Common_rust_": "Corn_Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight": "Corn_Northern_Leaf_Blight",
    "Corn_(maize)___healthy": "Corn_healthy",
    "Grape___Esca_(Black_Measles)": "Grape_Esca",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Grape_Leaf_blight",
    "Orange___Haunglongbing_(Citrus_greening)": "Orange_Huanglongbing",
    "Pepper,_bell___Bacterial_spot": "Pepper_Bacterial_spot",
    "Pepper,_bell___healthy": "Pepper_healthy",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Tomato_Spider_mites",
}


def _canonicalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def to_readable_name(disease_name: str) -> str:
    cleaned = disease_name.replace("___", " ").replace("_", " ")
    return re.sub(r"\s+", " ", cleaned).strip()


def build_lookup_candidates(disease_name: str) -> list[str]:
    candidates = []

    def add(value: Optional[str]) -> None:
        if value and value not in candidates:
            candidates.append(value)

    add(disease_name)
    add(MODEL_TO_DB_ALIASES.get(disease_name))

    normalized = disease_name.replace("___", "_")
    normalized = normalized.replace(" ", "_")
    normalized = normalized.replace("-", "_")
    normalized = normalized.replace(",", "")
    normalized = re.sub(r"_+", "_", normalized)
    add(normalized)
    add(MODEL_TO_DB_ALIASES.get(normalized))

    return candidates


def find_disease_record(cursor, predicted_name: str) -> Optional[Tuple[int, str]]:
    candidates = build_lookup_candidates(predicted_name)

    for candidate in candidates:
        cursor.execute(
            "SELECT id, disease_name FROM diseases WHERE LOWER(disease_name) = LOWER(%s)",
            (candidate,),
        )
        record = cursor.fetchone()
        if record:
            return record

    cursor.execute("SELECT id, disease_name FROM diseases")
    all_diseases = cursor.fetchall()
    canonical_candidates = {_canonicalize(value) for value in candidates}

    for disease_id, disease_name in all_diseases:
        if _canonicalize(disease_name) in canonical_candidates:
            return disease_id, disease_name

    return None
