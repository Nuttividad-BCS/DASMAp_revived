# batch_predict_dengue.py
import os
import sys
import pandas as pd
import numpy as np
import json
from feature_utils import compute_time_features
import pickle
import requests
from io import BytesIO
from sklearn.preprocessing import StandardScaler, LabelEncoder

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
config_path = f"versions/dengue_config_v3.json"
historical_cases_path = f"main_merged/historical_data_v3.csv"

active_model = supabase.storage.from_(bucket_name).get_public_url(model_path)
model_config = supabase.storage.from_(bucket_name).get_public_url(config_path)
hist_cases = supabase.storage.from_(bucket_name).get_public_url(historical_cases_path)

model_response = requests.get(active_model)
config_response = requests.get(model_config)
hist_response = requests.get(hist_cases)

historical_cases_df = pd.read_csv(BytesIO(hist_response.content))
historical_cases_df = historical_cases_df[historical_cases_df['BARANGAY'] != 'DASMARIÑAS']

future_df = historical_cases_df[(historical_cases_df['YEAR'] >= 2025) & 
                                (historical_cases_df['YEAR'] <= 2026)].copy()

xgb_model = pickle.load(BytesIO(model_response.content))
config_json = json.loads(config_response.text)


# ───────────────────────────────
# FUNCTION DEFINITION
# ───────────────────────────────
def run_batch_prediction(merged_df, future_weather_df, xgb_reg,  config_json,
                         start_year=2025, start_month=1, end_year=2026, end_month=4):
    """
    Clean modular batch prediction for dengue cases.
    - merged_df: full dataset with historical + future weather
    - xgb_reg: trained XGBRegressor
    - xgb_clf: trained XGBClassifier (risk levels)
    - feature_cols: list of columns used for prediction
    """
    # -----------------------------
    # 1. Split historical vs future
    # -----------------------------
    historical_df = merged_df[merged_df['YEAR'] <= 2024].copy()
    future_weather_df = merged_df[(merged_df['YEAR'] >= start_year) & (merged_df['YEAR'] <= end_year)].copy()

    # -----------------------------
    # 2. Encode barangays
    # -----------------------------
    le_brgy = LabelEncoder()
    historical_df['BARANGAY_ID'] = le_brgy.fit_transform(historical_df['BARANGAY'])
    future_weather_df['BARANGAY_ID'] = future_weather_df['BARANGAY'].map(
        lambda x: le_brgy.transform([x])[0] if x in le_brgy.classes_ else np.nan
    )
    future_weather_df = future_weather_df.dropna(subset=['BARANGAY_ID']).copy()
    future_weather_df['BARANGAY_ID'] = future_weather_df['BARANGAY_ID'].astype(int)

    # -----------------------------
    # 3. Scale weather + population
    # -----------------------------
    scale_cols = ['RAINFALL', 'TMAX', 'TMIN', 'WIND_SPEED', 'AvgH', 'Population']
    historical_df['RAINFALL'] = np.log1p(historical_df['RAINFALL'])
    future_weather_df['RAINFALL'] = np.log1p(future_weather_df['RAINFALL'])

    scaler = StandardScaler()
    historical_df[scale_cols] = scaler.fit_transform(historical_df[scale_cols])
    future_weather_df[scale_cols] = scaler.transform(future_weather_df[scale_cols])

    # -----------------------------
    # 4. Prepare historical lags, rolling averages, trend, date features
    # -----------------------------
    historical_df['DATE'] = pd.to_datetime(historical_df[['YEAR','MONTH']].assign(DAY=1))
    historical_df = historical_df.sort_values(['BARANGAY_ID','DATE']).reset_index(drop=True)

    # Lags
    for lag in [1,2,3,6]:
        historical_df[f'Cases_Lag_{lag}'] = historical_df.groupby('BARANGAY_ID')['Cases'].shift(lag).fillna(0)

    # Rolling averages
    historical_df['Cases_Rolling_Avg_3M'] = historical_df.groupby('BARANGAY_ID')['Cases'].rolling(3, min_periods=1).mean().reset_index(level=0, drop=True)
    historical_df['Cases_Rolling_Avg_6M'] = historical_df.groupby('BARANGAY_ID')['Cases'].rolling(6, min_periods=1).mean().reset_index(level=0, drop=True)

    # Trend
    historical_df['Trend'] = historical_df.groupby('BARANGAY_ID').cumcount() + 1

    # Date-derived features
    historical_df['Month'] = historical_df['DATE'].dt.month
    historical_df['Month_sin'] = np.sin(2 * np.pi * historical_df['Month'] / 12)
    historical_df['Month_cos'] = np.cos(2 * np.pi * historical_df['Month'] / 12)
    historical_df['Quarter'] = historical_df['DATE'].dt.quarter
    historical_df['Quarter_sin'] = np.sin(2 * np.pi * historical_df['Quarter'] / 4)
    historical_df['Quarter_cos'] = np.cos(2 * np.pi * historical_df['Quarter'] / 4)
    historical_df['Day_of_Week'] = historical_df['DATE'].dt.dayofweek
    historical_df['Is_Weekend'] = (historical_df['Day_of_Week'] >= 5).astype(int)

    for shift in [1,3]:
        col_shift = f'Cases_Shift_{shift}'
        historical_df[col_shift] = historical_df.groupby('BARANGAY_ID')['Cases'].shift(shift)
        historical_df[f'Cases_Pct_Change_{shift}M'] = ((historical_df['Cases'] - historical_df[col_shift]) / historical_df[col_shift]).replace([np.inf, -np.inf], np.nan).fillna(0)
    historical_df.drop([f'Cases_Shift_{shift}' for shift in [1,3]], axis=1, inplace=True)

    historical_df['Cases_per_1000'] = (historical_df['Cases'] / historical_df['Population']) * 1000
    # Fill any remaining NaNs
    historical_df = historical_df.fillna(0)
    feature_cols = [c for c in historical_df.columns if c not in ['BARANGAY','DATE','Cases','Risk_Level']]
    # -----------------------------
    # 5. Prepare for predictions
    # -----------------------------
    peak_cases_by_brgy = historical_df.groupby('BARANGAY_ID')['Cases'].max().to_dict()
    results = []

    def apply_season_weight(cases, weight, min_threshold=20):
        return cases if cases < min_threshold else cases * weight

    for brgy_id in sorted(future_weather_df['BARANGAY_ID'].unique()):
        future_weather_df['DATE'] = pd.to_datetime(future_weather_df[['YEAR','MONTH']].assign(DAY=1))
        
        brgy_weather = future_weather_df[future_weather_df['BARANGAY_ID']==brgy_id].sort_values('DATE').copy()
        brgy_hist = historical_df[historical_df['BARANGAY_ID']==brgy_id].copy()
        if brgy_hist.empty:
            continue

        for _, weather_row in brgy_weather.iterrows():
            year = int(weather_row['YEAR'])
            month = int(weather_row['MONTH'])
            quarter = pd.Timestamp(year=year, month=month, day=1).quarter
            season_weight = 1.2 if quarter in [3,4] else 0.9 if quarter==1 else 1

            last_cases = brgy_hist['Cases'].values
            last_3 = last_cases[-3:] if len(last_cases)>=3 else np.pad(last_cases,(3-len(last_cases),0))
            last_6 = last_cases[-6:] if len(last_cases)>=6 else np.pad(last_cases,(6-len(last_cases),0))

            last_year_same_month = brgy_hist[(brgy_hist['YEAR']==year-1) & (brgy_hist['MONTH']==month)]['Cases'].values
            lag_12m = last_year_same_month[-1] if len(last_year_same_month)>0 else 0
            lag_12m *= season_weight

            row_dict = {
                'YEAR': year,
                'MONTH': month,
                'BARANGAY_ID': brgy_id,
                'RAINFALL': weather_row['RAINFALL'],
                'TMAX': weather_row['TMAX'],
                'TMIN': weather_row['TMIN'],
                'WIND_SPEED': weather_row['WIND_SPEED'],
                'AvgH': weather_row['AvgH'],
                'Population': weather_row['Population'],
                'Cases_Lag_1': last_cases[-1] * season_weight,
                'Cases_Lag_2': (last_cases[-2] if len(last_cases) >= 2 else 0) * season_weight,
                'Cases_Lag_3': (last_cases[-3] if len(last_cases) >= 3 else 0) * season_weight,
                'Cases_Lag_6': last_6.mean() * season_weight,
                'Cases_Lag_12M': lag_12m,
                'Cases_Rolling_Avg_3M': last_3.mean() * season_weight,
                'Cases_Rolling_Avg_6M': last_6.mean() * season_weight,
                'Trend': brgy_hist['Trend'].max()+1,
                'Month': month,
                'Month_sin': np.sin(2*np.pi*month/12),
                'Month_cos': np.cos(2*np.pi*month/12),
                'Quarter': quarter,
                'Quarter_sin': np.sin(2*np.pi*quarter/4),
                'Quarter_cos': np.cos(2*np.pi*quarter/4),
                'Day_of_Week': pd.Timestamp(year=year, month=month, day=1).dayofweek,
                'Is_Weekend': int(pd.Timestamp(year=year, month=month, day=1).dayofweek >= 5),
                'Cases_Pct_Change_1M': ((last_cases[-1]-last_cases[-2])/last_cases[-2] if len(last_cases)>=2 and last_cases[-2]!=0 else 0),
                'Cases_Pct_Change_3M': ((last_cases[-1]-last_3[0])/last_3[0] if last_3[0]!=0 else 0),
                'Cases_per_1000': (last_cases[-1]/weather_row['Population'])*1000
            }
            
            row_dict['Cases_Lag_1'] = apply_season_weight(last_cases[-1], season_weight)
            row_dict['Cases_Lag_2'] = apply_season_weight(last_cases[-2] if len(last_cases) >= 2 else 0, season_weight)
            row_dict['Cases_Lag_3'] = apply_season_weight(last_cases[-3] if len(last_cases) >= 3 else 0, season_weight)
            row_dict['Cases_Lag_6'] = apply_season_weight(last_6.mean(), season_weight)
            row_dict['Cases_Rolling_Avg_3M'] = apply_season_weight(last_3.mean(), season_weight)
            row_dict['Cases_Rolling_Avg_6M'] = apply_season_weight(last_6.mean(), season_weight)

            X_input = pd.DataFrame([row_dict])[feature_cols]

            # Predict
            pred_cases = xgb_reg.predict(X_input)
            pred_cases = np.clip(pred_cases, 0, peak_cases_by_brgy[brgy_id])

            # Store result
            results.append({
                'YEAR': year,
                'MONTH': month,
                'BARANGAY_ID': brgy_id,
                'Predicted_Cases': round(float(pred_cases[0]),2)
            })

            # --- Append predicted cases to history for next iteration ---
            new_row = row_dict.copy()
            new_row['Cases'] = float(pred_cases[0])
            brgy_hist = pd.concat([brgy_hist, pd.DataFrame([new_row])], ignore_index=True)

    return pd.DataFrame(results).sort_values(['BARANGAY_ID','YEAR','MONTH']).reset_index(drop=True)


results_df = run_batch_prediction(
    merged_df=historical_cases_df,
    future_weather_df=future_df,
    xgb_reg=xgb_model,
    config_json=config_json,
    start_year=2025,
    start_month=1,
    end_year=2026,
    end_month=4
)

print(results_df.head(30))
print(results_df['BARANGAY_ID'])
