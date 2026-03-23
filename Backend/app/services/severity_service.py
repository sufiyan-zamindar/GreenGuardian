import re


def resolve_severity(raw_severity=None, disease_name: str | None = None) -> str:
    severity = str(raw_severity or "").strip().lower()
    if severity in {"severe", "moderate", "mild", "none"}:
        return severity

    name = re.sub(r"[^a-z0-9]+", "_", str(disease_name or "").lower()).strip("_")
    if not name:
        return "unknown"

    if "healthy" in name:
        return "none"

    severe_keywords = [
        "late_blight",
        "huanglongbing",
        "yellow_leaf_curl",
        "mosaic_virus",
        "black_rot",
        "esca",
        "northern_leaf_blight",
    ]
    moderate_keywords = [
        "early_blight",
        "rust",
        "scab",
        "bacterial_spot",
        "leaf_blight",
        "target_spot",
        "leaf_scorch",
        "powdery_mildew",
        "leaf_mold",
        "septoria",
        "cercospora",
    ]
    mild_keywords = [
        "spider_mites",
        "mites",
    ]

    if any(keyword in name for keyword in severe_keywords):
        return "severe"
    if any(keyword in name for keyword in moderate_keywords):
        return "moderate"
    if any(keyword in name for keyword in mild_keywords):
        return "mild"
    return "moderate"
