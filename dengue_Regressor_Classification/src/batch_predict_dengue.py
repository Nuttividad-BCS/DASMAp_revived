# batch_predict_dengue.py
import os
import pandas as pd
import numpy as np
import joblib
import json
from feature_utils import compute_time_features

# ───────────────────────────────
# LOAD MODEL & CONFIG (with RELATIVE PATHS)
# ───────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'dengue_xgb_model.pkl')
CONFIG_PATH = os.path.join(PROJECT_ROOT, 'models', 'dengue_config.json')
HISTORICAL_CASES_PATH = os.path.join(PROJECT_ROOT, 'data', 'historical_data.csv')



# Load model and config
model = joblib.load(MODEL_PATH)
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

feature_cols = config['feature_columns']
monthly_thresh = config['monthly_thresholds']

def assign_monthly_risk(cases):
    if cases <= monthly_thresh['low_max']:
        return 'Low'
    elif cases <= monthly_thresh['medium_max']:
        return 'Medium'
    else:
        return 'High'

# ───────────────────────────────
# USER INPUT
# ───────────────────────────────
TARGET_YEAR = 2024
TARGET_MONTH = 1

# Shared weather data for ALL barangays (same city/municipality)
SHARED_WEATHER = {
    'RAINFALL': 135.6,
    'TMAX': 32.4,
    'TMIN': 24.1,
    'TAVG': 28.3,
    'WIND_SPEED': 4.7,
    'WIND_DIRECTION': 135.0,
    'RH': 78.2
}

# ───────────────────────────────
# BATCH PREDICTION FOR ALL BARANGAYS
# ───────────────────────────────
# Load historical cases
historical_cases = pd.read_csv(HISTORICAL_CASES_PATH)
# Remove rows where BARANGAY is 'DASMARIÑAS'
historical_cases = historical_cases[historical_cases['BARANGAY'] != 'DASMARIÑAS']

# Get all unique barangays from the dataset
barangays = historical_cases['BARANGAY'].unique()
print(f"Predicting for {len(barangays)} barangays...")

# Build input for all barangays
input_rows = []
valid_barangays = []  # Track barangays with valid features

for brgy in barangays:
    try:
        # Compute time-based features for this barangay
        time_feats = compute_time_features(historical_cases, brgy, TARGET_YEAR, TARGET_MONTH)
        
        # Combine with shared weather
        row = {
            'YEAR': TARGET_YEAR,
            'MONTH': TARGET_MONTH,
            **time_feats,
            **SHARED_WEATHER
        }
        input_rows.append(row)
        valid_barangays.append(brgy)
    except Exception as e:
        print(f"Skipping {brgy}: {str(e)}")
        continue

# Create DataFrame
input_df = pd.DataFrame(input_rows)

# Ensure correct column order (critical for XGBoost)
input_df = input_df[feature_cols]

# Predict all at once
predicted_cases = model.predict(input_df)
predicted_cases = np.clip(predicted_cases, 0, None)  # Ensure non-negative

# Assign risk levels
risk_levels = [assign_monthly_risk(c) for c in predicted_cases]

# Create results DataFrame
results = pd.DataFrame({
    'BARANGAY': valid_barangays,
    'YEAR': TARGET_YEAR,
    'MONTH': TARGET_MONTH,
    'Predicted_Cases': predicted_cases,
    'Risk_Level': risk_levels
})

# Sort by risk (High → Medium → Low) then by cases
risk_order = {'High': 0, 'Medium': 1, 'Low': 2}
results['Risk_Sort'] = results['Risk_Level'].map(risk_order)
results = results.sort_values(['Risk_Sort', 'Predicted_Cases'], ascending=[True, False]).drop('Risk_Sort', axis=1)

# ───────────────────────────────
# OUTPUT RESULTS
# ───────────────────────────────
print(f"\n=== DENGUE RISK FORECAST: {TARGET_YEAR}-{TARGET_MONTH:02d} ===")
print(results.to_string(index=False))

# Optional: Save to CSV
output_path = os.path.join(PROJECT_ROOT, 'output', f'dengue_forecast_{TARGET_YEAR}_{TARGET_MONTH:02d}.csv')
os.makedirs(os.path.dirname(output_path), exist_ok=True)
results.to_csv(output_path, index=False)
print(f"\nSaved full report to: {output_path}")

# Summary stats
print(f"\nSUMMARY:")
print(f"- High Risk: {len(results[results['Risk_Level'] == 'High'])} barangays")
print(f"- Medium Risk: {len(results[results['Risk_Level'] == 'Medium'])} barangays")
print(f"- Low Risk: {len(results[results['Risk_Level'] == 'Low'])} barangays")