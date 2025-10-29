# batch_predict_dengue.py
import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
from feature_utils import compute_time_features
import pickle
import requests
from io import BytesIO


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from makeClient import Supabase
supabase = Supabase()
# ───────────────────────────────
# LOAD MODEL & CONFIG (RELATIVE PATHS)
# ───────────────────────────────
response = supabase.table("Models").select("model_name").eq("model_status", True).single().execute()
model_name = response.data['model_name']

bucket_name = "models"  # adjust if nested
model_path = f"versions/{model_name}"  # match your storage structure
config_path = f"versions/dengue_config.json"
historical_cases_path = f"main_merged/historical_data.csv"

active_model = supabase.storage.from_(bucket_name).get_public_url(model_path)
model_config = supabase.storage.from_(bucket_name).get_public_url(config_path)
hist_cases = supabase.storage.from_(bucket_name).get_public_url(historical_cases_path)

model_response = requests.get(active_model)
config_response = requests.get(model_config)
hist_response = requests.get(hist_cases)

xgb_model = pickle.load(BytesIO(model_response.content))
config_json = json.loads(config_response.text)


# ───────────────────────────────
# FUNCTION DEFINITION
# ───────────────────────────────
def batch_year_prediction(target_year: int, target_brgy: int, shared_weather=None):
    """
    Predicts dengue cases for a single barangay for all 12 months of the target year.
    Returns a DataFrame with columns: MONTH, BARANGAY, YEAR, Predicted_Cases, Risk_Level
    """

    # Default weather data (if not passed from frontend)
    if shared_weather is None:
        shared_weather = {
            'RAINFALL': 134.6,
            'TMAX': 31.4,
            'TMIN': 23.1,
            'TAVG': 27.3,
            'WIND_SPEED': 3.7,
            'WIND_DIRECTION': 134.0,
            'RH': 77.2
        }

    # Load model and config
    model = xgb_model
    config = config_json

    feature_cols = config['feature_columns']
    monthly_thresh = config['monthly_thresholds']

    def assign_monthly_risk(cases):
        if cases <= monthly_thresh['low_max']:
            return 'Low'
        elif cases <= monthly_thresh['medium_max']:
            return 'Medium'
        else:
            return 'High'

    # Load historical cases
    historical_cases = pd.read_csv(hist_cases)
    historical_cases = historical_cases[historical_cases['BARANGAY'] != 'DASMARIÑAS']

    if target_brgy not in historical_cases['BARANGAY'].unique():
        raise ValueError(f"Barangay '{target_brgy}' not found in historical data.")

    input_rows = []

    # Generate predictions for all 12 months
    for month in range(1, 13):
        try:
            # Compute time features based on the month
            time_feats = compute_time_features(historical_cases, target_brgy, target_year, month)

            row = {
                'YEAR': target_year,
                'MONTH': month,
                'BARANGAY': target_brgy,
                **time_feats,
                **shared_weather
            }

            input_rows.append(row)

        except Exception as e:
            print(f"Skipping month {month}: {str(e)}")
            continue

    input_df = pd.DataFrame(input_rows)
    input_df = input_df[feature_cols]

    # Predict
    predicted_cases = model.predict(input_df)
    predicted_cases = np.clip(predicted_cases, 0, None)
    predicted_cases = np.ceil(predicted_cases).astype(int)

    # Assign risk levels
    risk_levels = [assign_monthly_risk(c) for c in predicted_cases]

    results = pd.DataFrame({
        'BARANGAY': target_brgy,
        'YEAR': target_year,
        'MONTH': range(1, len(predicted_cases) + 1),
        'Predicted_Cases': predicted_cases,
        'Risk_Level': risk_levels
    })

    # Sort by month
    results = results.sort_values('MONTH').reset_index(drop=True)
    return results