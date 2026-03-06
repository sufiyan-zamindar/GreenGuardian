import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

MODEL_PATH = os.path.join(BASE_DIR, "ai_model/models/greenguardian_model.h5")
LABEL_PATH = os.path.join(BASE_DIR, "ai_model/models/class_labels.json")

print("Building model architecture...")

# load class labels
with open(LABEL_PATH) as f:
    class_indices = json.load(f)

num_classes = len(class_indices)

class_names = {v: k for k, v in class_indices.items()}


# rebuild architecture (same as training)
base_model = MobileNetV2(
    weights=None,
    include_top=False,
    input_shape=(224, 224, 3)
)

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)
outputs = Dense(num_classes, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=outputs)

print("Loading trained weights...")

try:
    model.load_weights(MODEL_PATH)
    print("Model weights loaded successfully")

except Exception as e:
    print("Model loading failed:", e)


def predict_disease(image):

    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    predictions = model.predict(image)

    predicted_index = np.argmax(predictions)
    confidence = float(np.max(predictions))

    disease = class_names[predicted_index]

    return disease, confidence