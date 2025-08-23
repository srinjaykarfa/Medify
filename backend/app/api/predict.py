from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.disease import HeartInput
from app.schemas.disease import DiabetesInput
from app.schemas.disease import SkinDiseaseInput

import joblib
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import base64
import io
from PIL import Image

router = APIRouter()

base_path = os.path.join(os.path.dirname(__file__), "..", "ml_models")

# Load models and scalers with error handling
models = {}
scalers = {}

try:
    models["heart"] = joblib.load(os.path.join(base_path, "heart_disease_model.pkl"))
    scalers["heart"] = joblib.load(os.path.join(base_path, "heart_scaler.pkl"))
    print("✅ Heart disease model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load heart disease model: {e}")

try:
    models["diabetes"] = joblib.load(os.path.join(base_path, "diabetes_model_.pkl"))
    scalers["diabetes"] = joblib.load(os.path.join(base_path, "scaler.pkl"))
    print("✅ Diabetes model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load diabetes model: {e}")

try:
    models["skin"] = tf.keras.models.load_model(os.path.join(base_path, "skindisease.h5"))
    print("✅ Skin disease model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load skin disease model: {e}")

@router.post("/{disease}")
def predict_disease(disease: str, input_data: dict):
    print(f"🔍 Received prediction request for: {disease}")
    print(f"📊 Input data: {input_data}")
    
    if disease == "heart":
        try:
            data_obj = HeartInput(**input_data)
            
            # Check if model is loaded
            if "heart" not in models or "heart" not in scalers:
                raise HTTPException(status_code=503, detail="Heart disease model not available")
            
            # Convert to numpy array and scale
            features = np.array([[
                data_obj.age, data_obj.sex, data_obj.chest_pain_type, data_obj.resting_bp,
                data_obj.cholesterol, data_obj.fasting_blood_sugar, data_obj.rest_ecg, data_obj.max_heart_rate,
                data_obj.exercise_angina, data_obj.oldpeak, data_obj.slope, data_obj.major_vessels, data_obj.thal
            ]])
            
            features_scaled = scalers["heart"].transform(features)
            prediction = models["heart"].predict(features_scaled)[0]
            
            # Check if the model supports predict_proba
            try:
                if hasattr(models["heart"], 'predict_proba'):
                    probability = models["heart"].predict_proba(features_scaled)[0]
                    result = {
                        "prediction": "Heart Disease Detected" if prediction == 1 else "No Heart Disease",
                        "probability": {
                            "no_disease": float(probability[0]),
                            "disease": float(probability[1])
                        }
                    }
                elif hasattr(models["heart"], 'decision_function'):
                    # For SVC models, use decision_function to get confidence scores
                    decision_score = models["heart"].decision_function(features_scaled)[0]
                    # Convert decision score to probability-like score (0-1 range)
                    confidence = 1 / (1 + np.exp(-decision_score))  # Sigmoid transformation
                    result = {
                        "prediction": "Heart Disease Detected" if prediction == 1 else "No Heart Disease",
                        "probability": {
                            "no_disease": float(1 - confidence) if prediction == 1 else float(confidence),
                            "disease": float(confidence) if prediction == 1 else float(1 - confidence)
                        },
                        "confidence_score": float(abs(decision_score)),
                        "model_type": "SVC"
                    }
                else:
                    # Fallback for models without probability estimates
                    result = {
                        "prediction": "Heart Disease Detected" if prediction == 1 else "No Heart Disease",
                        "probability": {
                            "no_disease": 0.25 if prediction == 1 else 0.75,
                            "disease": 0.75 if prediction == 1 else 0.25
                        },
                        "note": "Probability estimates not available for this model type"
                    }
            except Exception as prob_error:
                print(f"⚠️ Could not get probability estimates: {prob_error}")
                result = {
                    "prediction": "Heart Disease Detected" if prediction == 1 else "No Heart Disease",
                    "probability": {
                        "no_disease": 0.25 if prediction == 1 else 0.75,
                        "disease": 0.75 if prediction == 1 else 0.25
                    },
                    "note": "Probability estimates not available"
                }
            
            print(f"✅ Heart disease prediction successful: {result}")
            
        except Exception as e:
            print(f"❌ Heart disease prediction error: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Error in heart disease prediction: {str(e)}")

    elif disease == "diabetes":
        try:
            data_obj = DiabetesInput(**input_data)
            
            # Check if model is loaded
            if "diabetes" not in models or "diabetes" not in scalers:
                raise HTTPException(status_code=503, detail="Diabetes model not available")
            
            # Convert to numpy array and scale
            features = np.array([[
                data_obj.Pregnancies, data_obj.Glucose, data_obj.BloodPressure,
                data_obj.SkinThickness, data_obj.Insulin, data_obj.BMI,
                data_obj.DiabetesPedigreeFunction, data_obj.Age
            ]])
            
            features_scaled = scalers["diabetes"].transform(features)
            prediction = models["diabetes"].predict(features_scaled)[0]
            
            # Check if the model supports predict_proba
            try:
                if hasattr(models["diabetes"], 'predict_proba'):
                    probability = models["diabetes"].predict_proba(features_scaled)[0]
                    result = {
                        "prediction": "Diabetes Detected" if prediction == 1 else "No Diabetes",
                        "probability": {
                            "no_diabetes": float(probability[0]),
                            "diabetes": float(probability[1])
                        }
                    }
                elif hasattr(models["diabetes"], 'decision_function'):
                    # For SVC models, use decision_function to get confidence scores
                    decision_score = models["diabetes"].decision_function(features_scaled)[0]
                    # Convert decision score to probability-like score (0-1 range)
                    confidence = 1 / (1 + np.exp(-decision_score))  # Sigmoid transformation
                    result = {
                        "prediction": "Diabetes Detected" if prediction == 1 else "No Diabetes",
                        "probability": {
                            "no_diabetes": float(1 - confidence) if prediction == 1 else float(confidence),
                            "diabetes": float(confidence) if prediction == 1 else float(1 - confidence)
                        },
                        "confidence_score": float(abs(decision_score)),
                        "model_type": "SVC"
                    }
                else:
                    # Fallback for models without probability estimates
                    result = {
                        "prediction": "Diabetes Detected" if prediction == 1 else "No Diabetes",
                        "probability": {
                            "no_diabetes": 0.25 if prediction == 1 else 0.75,
                            "diabetes": 0.75 if prediction == 1 else 0.25
                        },
                        "note": "Probability estimates not available for this model type"
                    }
            except Exception as prob_error:
                print(f"⚠️ Could not get probability estimates: {prob_error}")
                result = {
                    "prediction": "Diabetes Detected" if prediction == 1 else "No Diabetes",
                    "probability": {
                        "no_diabetes": 0.25 if prediction == 1 else 0.75,
                        "diabetes": 0.75 if prediction == 1 else 0.25
                    },
                    "note": "Probability estimates not available"
                }
            
            print(f"✅ Diabetes prediction successful: {result}")
            
        except Exception as e:
            print(f"❌ Diabetes prediction error: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Error in diabetes prediction: {str(e)}")

    elif disease == "skin":
        try:
            # Handle image-based prediction
            if 'image' not in input_data:
                raise HTTPException(status_code=422, detail="Image is required for skin disease prediction")
            
            # Check if model is loaded
            if "skin" not in models:
                raise HTTPException(status_code=503, detail="Skin disease model not available")
            
            # Decode base64 image
            image_data = input_data['image']
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image exactly like the original Flask app
            img = img.resize((64, 64))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            
            # Make prediction
            preds = models["skin"].predict(x)
            index = ['Acne', 'Melanoma', 'Peeling skin', 'Ring worm', 'Vitiligo']
            label = np.argmax(preds, axis=1)[0]
            confidence = float(np.max(preds, axis=1)[0])
            
            result = {
                "prediction": index[label],
                "confidence": confidence,
                "all_probabilities": {
                    index[i]: float(preds[0][i]) for i in range(len(index))
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error in skin disease prediction: {str(e)}")

    else:
        raise HTTPException(status_code=404, detail=f"Model not found for disease: {disease}")

    return {"disease": disease, "result": result}

@router.post("/skin/upload")
async def predict_skin_disease_upload(file: UploadFile = File(...)):
    """Alternative endpoint for direct file upload"""
    try:
        # Check if model is loaded
        if "skin" not in models:
            raise HTTPException(status_code=503, detail="Skin disease model not available")
        
        # Read and preprocess the uploaded image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Preprocess image exactly like the original Flask app
        img = img.resize((64, 64))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        
        # Make prediction
        model = models["skin"]
        preds = model.predict(x)
        index = ['Acne', 'Melanoma', 'Peeling skin', 'Ring worm', 'Vitiligo']
        label = np.argmax(preds, axis=1)[0]
        confidence = float(np.max(preds, axis=1)[0])
        
        result = {
            "prediction": index[label],
            "confidence": confidence,
            "all_probabilities": {
                index[i]: float(preds[0][i]) for i in range(len(index))
            }
        }
        
        return {"disease": "skin", "result": result}
        
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error processing image: {str(e)}")
