import pandas as pd
import numpy as np
import joblib
import json
from src.feature_utils import compute_time_features

# ───────────────────────────────
# LOAD MODEL & CONFIG
# ───────────────────────────────
MODEL_PATH = 'dengue_xgb_model.pkl'
CONFIG_PATH = 'dengue_config.json'

model = joblib.load(MODEL_PATH)
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

feature_cols = config['feature_columns']
monthly_thresh = config['monthly_thresholds']
yearly_thresh = config['yearly_thresholds']

# ───────────────────────────────
# RISK ASSIGNMENT FUNCTIONS
# ───────────────────────────────
def assign_monthly_risk(cases):
    if cases <= monthly_thresh['low_max']:
        return 'Low'
    elif cases <= monthly_thresh['medium_max']:
        return 'Medium'
    else:
        return 'High'

def assign_yearly_risk(cases):
    if cases <= yearly_thresh['low_max']:
        return 'Low'
    elif cases <= yearly_thresh['medium_max']:
        return 'Medium'
    else:
        return 'High'

# ───────────────────────────────
# USER INPUT SECTION
# ───────────────────────────────
barangay = "SAMPALOC IV"   # ← CHANGE THIS
year = 2024                # ← CHANGE THIS
month = 1                  # ← CHANGE THIS

# Load updated historical case data (must include all past months)
HISTORICAL_CASES_PATH = 'merged.csv'
historical_cases = pd.read_csv(HISTORICAL_CASES_PATH)

# Provide other features for the target month (e.g., weather forecast)
other_features = {
#// Replace these example values with actual forecasted data

     # Rainfall (mm)
    'RAINFALL': 135.6,
    
    # Temperature (°C)
    'TMAX': 32.4,   # Max temperature
    'TMIN': 24.1,   # Min temperature
    'TAVG': 28.3,   # Average temperature
    
    # Wind
    'WIND_SPEED': 4.7,        # km/h or m/s (match your training unit)
    'WIND_DIRECTION': 135.0,  # Degrees (e.g., 0=N, 90=E, 180=S, 270=W)
    
    # Humidity
    'RH': 78.2,     # Relative Humidity (%)
    
}

# ───────────────────────────────
# BUILD INPUT & PREDICT
# ───────────────────────────────
# Compute time-based features
time_features = compute_time_features(historical_cases, barangay, year, month)

# Combine all features
input_dict = {
    'YEAR': year,
    'MONTH': month,
    **time_features,
    **other_features
}

# Create DataFrame and ensure correct column order
input_df = pd.DataFrame([input_dict])
input_df = input_df[feature_cols]  # Critical: match training order

# Predict
predicted_cases = model.predict(input_df)[0]
predicted_cases = max(0.0, predicted_cases)  # Ensure non-negative
risk_level = assign_monthly_risk(predicted_cases)

# ───────────────────────────────
# OUTPUT
# ───────────────────────────────
print(f"\nDengue Forecast for {barangay}")
print(f"Date: {year}-{month:02d}")
print(f"Predicted Cases: {predicted_cases:.2f}")
print(f"Risk Level: {risk_level}")
