import json
import os
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
MODEL_PATH = os.path.join(BASE_DIR, "ai_model/models/greenguardian_model.h5")
LABEL_PATH = os.path.join(BASE_DIR, "ai_model/models/class_labels.json")

if not Path(LABEL_PATH).exists():
    raise FileNotFoundError(f"Class label file not found: {LABEL_PATH}")

with open(LABEL_PATH, "r", encoding="utf-8") as f:
    class_indices = json.load(f)

num_classes = len(class_indices)
class_names = {v: k for k, v in class_indices.items()}


def _build_architecture() -> Model:
    base_model = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation="softmax")(x)
    return Model(inputs=base_model.input, outputs=outputs)


def _try_load_full_model(model_path: str):
    try:
        loaded_model = tf.keras.models.load_model(model_path, compile=False, safe_mode=False)
        print("Model loaded using load_model(safe_mode=False)")
        return loaded_model, "full_model_safe_mode_off"
    except Exception as e:
        print(f"Full model load (safe_mode=False) failed: {e}")

    try:
        loaded_model = tf.keras.models.load_model(model_path, compile=False)
        print("Model loaded using load_model")
        return loaded_model, "full_model"
    except Exception as e:
        print(f"Full model load failed: {e}")

    return None, "full_model_failed"


def _try_load_weights(model_path: str):
    rebuilt = _build_architecture()

    try:
        rebuilt.load_weights(model_path)
        print("Model weights loaded strictly")
        return rebuilt, "weights_strict"
    except Exception as strict_error:
        print(f"Strict weight load failed: {strict_error}")

    try:
        rebuilt.load_weights(model_path, by_name=True, skip_mismatch=True)
        print("Model weights loaded with by_name=True, skip_mismatch=True")
        return rebuilt, "weights_by_name_skip_mismatch"
    except Exception as tolerant_error:
        print(f"Tolerant weight load failed: {tolerant_error}")
        return None, f"weights_failed: {tolerant_error}"


def _load_model() -> tuple[Model | None, str]:
    if not Path(MODEL_PATH).exists():
        return None, f"Model file not found: {MODEL_PATH}"

    model_obj, source = _try_load_full_model(MODEL_PATH)
    if model_obj is not None:
        return model_obj, source

    return _try_load_weights(MODEL_PATH)


model, model_source = _load_model()
if model is None:
    print(f"Model initialization failed: {model_source}")
else:
    print(f"Model ready (source={model_source}, classes={len(class_names)})")


def predict_disease(image: Image.Image):
    if model is None:
        raise RuntimeError("AI model is not loaded. Check backend startup logs.")

    image = image.resize((224, 224))
    image_arr = np.array(image, dtype=np.float32) / 255.0
    image_arr = np.expand_dims(image_arr, axis=0)

    predictions = model.predict(image_arr, verbose=0)

    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions))
    disease = class_names[predicted_index]

    return disease, confidence
