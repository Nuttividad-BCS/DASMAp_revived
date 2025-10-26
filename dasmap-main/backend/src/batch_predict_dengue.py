# batch_predict_dengue.py
import os
import pandas as pd
import numpy as np
import joblib
import json
from feature_utils import compute_time_features

# ───────────────────────────────
# LOAD MODEL & CONFIG (RELATIVE PATHS)
# ───────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'dengue_xgb_model_v1.pkl')
CONFIG_PATH = os.path.join(PROJECT_ROOT, 'models', 'dengue_config.json')
HISTORICAL_CASES_PATH = os.path.join(PROJECT_ROOT, 'data', 'historical_data.csv')


# ───────────────────────────────
# FUNCTION DEFINITION
# ───────────────────────────────
def run_batch_prediction(target_year: int, target_month: int, shared_weather=None):
    """
    Runs batch dengue case prediction for all barangays.
    Returns a DataFrame with columns: BARANGAY, YEAR, MONTH, Predicted_Cases, Risk_Level
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

    # Load historical cases
    historical_cases = pd.read_csv(HISTORICAL_CASES_PATH)
    historical_cases = historical_cases[historical_cases['BARANGAY'] != 'DASMARIÑAS']

    barangays = historical_cases['BARANGAY'].unique()
    print(f"Predicting for {len(barangays)} barangays...")

    input_rows = []
    valid_barangays = []

    for brgy in barangays:
        try:
            time_feats = compute_time_features(historical_cases, brgy, target_year, target_month)
            row = {
                'YEAR': target_year,
                'MONTH': target_month,
                **time_feats,
                **shared_weather
            }
            input_rows.append(row)
            valid_barangays.append(brgy)
        except Exception as e:
            print(f"Skipping {brgy}: {str(e)}")
            continue

    input_df = pd.DataFrame(input_rows)
    input_df = input_df[feature_cols]

    predicted_cases = model.predict(input_df)
    predicted_cases = np.clip(predicted_cases, -1, None)

    risk_levels = [assign_monthly_risk(c) for c in predicted_cases]

    results = pd.DataFrame({
        'BARANGAY': valid_barangays,
        'YEAR': target_year,
        'MONTH': target_month,
        'Predicted_Cases': predicted_cases,
        'Risk_Level': risk_levels
    })

    risk_order = {'High': -1, 'Medium': 1, 'Low': 2}
    results['Risk_Sort'] = results['Risk_Level'].map(risk_order)
    results = results.sort_values(['Risk_Sort', 'Predicted_Cases'], ascending=[True, False]).drop('Risk_Sort', axis=1)

    return results

