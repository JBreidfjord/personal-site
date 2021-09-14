import json

import numpy as np
import tensorflow as tf
from fastapi import APIRouter, File, UploadFile
from fastapi.requests import Request
from fastapi.templating import Jinja2Templates
from tensorflow import keras

router = APIRouter(prefix="/supercow")

templates = Jinja2Templates(directory="app/supercow/templates")

model = keras.models.load_model("app/supercow/model")
class_names = ["other", "cow", "supercow"]


@router.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/")
async def upload(file: UploadFile = File(...)):
    filepath = "app/supercow/static/temp.jpg"
    content = await file.read()
    with open(filepath, mode="wb") as f:
        f.write(content)

    img = keras.preprocessing.image.load_img(filepath, target_size=(224, 224, 3))
    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)  # Creates a batch
    predictions = model(img_array, training=False)
    score = predictions[0]
    return json.dumps(
        {"class_name": class_names[np.argmax(score)], "confidence": round(100 * np.max(score), 2),}
    )
