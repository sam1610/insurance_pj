import json
import boto3
import joblib 
import pandas as pd
import io
import os

s3 = boto3.client('s3')
model_cache = None

def load_model():
    global model_cache
    if model_cache is None:
        bucket = 'datastream-aai-bh' 
        # Ensure this matches the actual file name in S3
        obj = s3.get_object(Bucket=bucket, Key='premiumModel.pkl')
        with io.BytesIO(obj['Body'].read()) as f:
            model_cache = joblib.load(f)
    return model_cache

def map_vehicle_age(age_int):
    # Maps React number input (0, 1, 2) to Model's expected string categories
    # Matches dataset values shown in
    if age_int < 1: return "< 1 Year"
    if 1 <= age_int <= 2: return "1-2 Year"
    return "> 2 Years"

def handler(event, context):
    try:
        model = load_model()
        
        # 'features' comes from the Node.js Lambda/AppSync event
        data = event.get('features', {})
        
        # FIX: Create DataFrame with ONLY the 6 columns the model knows
        # The pipeline handles scaling/encoding automatically based on these raw values
        input_df = pd.DataFrame([{
            'Gender': data.get('gender'),                    # Expects "Male" or "Female"
            'Age': int(data.get('age')),                     # Expects Integer
            'Vehicle_Age': map_vehicle_age(data.get('carAge')), # Mapped to "< 1 Year", etc.
            'Vehicle_Damage': data.get('vehicleDamage'),     # Expects "Yes" or "No"
            'Annual_Premium': float(data.get('annualPremium')), # Expects Float
            'Vintage': int(data.get('vintage', 150))         # Expects Integer
        }])

        # Get the probability of Class 1 (Positive Response)
        # pipeline.predict_proba handles the transformations internally
        probability = float(model.predict_proba(input_df)[0][1])
        
        return {
            "statusCode": 200,
            "body": json.dumps({ "probability": probability })
        }

    except Exception as e:
        print(f"ML Error: {str(e)}")
        # Return 0.0 probability on error so the frontend doesn't crash
        return { "statusCode": 200, "body": json.dumps({ "probability": 0.0 }) }