import pandas as pd
import numpy as np

def compute_time_features(historical_cases_df, barangay, year, month):
    """
    Compute lagged and rolling features for a given barangay, year, and month.

    Expected historical_cases_df columns: ['BARANGAY', 'YEAR', 'MONTH', 'Cases']
    """
    # Create datetime for filtering
    target_date = pd.to_datetime(f"{year}-{month:02d}-01")

    # Filter only data before the target date
    hist = historical_cases_df[
        (historical_cases_df['BARANGAY'] == barangay) &
        (pd.to_datetime(historical_cases_df[['YEAR', 'MONTH']].assign(DAY=1)) < target_date)
    ].copy()

    if hist.empty or len(hist) < 2:
        # Not enough data, return NaNs or zeros (depending on how model trained)
        return {
            'Cases_Lag_1': 0.0,
            'Cases_Lag_2': 0.0,
            'Cases_Lag_3': 0.0,
            'Cases_Lag_6': 0.0,
            'Cases_Lag_12': 0.0,
            'Cases_Lag_24': 0.0,
            'Cases_Rolling_Avg_3M': 0.0,           
            'Cases_Rolling_Avg_6M': 0.0,
            'Cases_Rolling_Avg_12M': 0.0,
            'Cases_Rolling_Avg_24M': 0.0
        }

    # Sort chronologically
    hist = hist.sort_values(['YEAR', 'MONTH'])
    hist['Cases'] = hist['Cases'].astype(float)

    # Compute lag features
    for lag in [1, 2, 3, 6, 12, 24]:
        hist[f'Cases_Lag_{lag}'] = hist['Cases'].shift(lag)

    # Compute rolling averages
    hist['Cases_Rolling_Avg_3M'] = hist['Cases'].rolling(window=3, min_periods=1).mean()
    hist['Cases_Rolling_Avg_6M'] = hist['Cases'].rolling(window=6, min_periods=1).mean()
    hist['Cases_Rolling_Avg_12M'] = hist['Cases'].rolling(window=12, min_periods=1).mean()
    hist['Cases_Rolling_Avg_24M'] = hist['Cases'].rolling(window=24, min_periods=1).mean()

    # Get last available row (most recent historical data)
    last_row = hist.iloc[-1]

    return {
        'Cases_Lag_1': float(last_row.get('Cases_Lag_1', 0)),
        'Cases_Lag_2': float(last_row.get('Cases_Lag_2', 0)),
        'Cases_Lag_3': float(last_row.get('Cases_Lag_3', 0)),
        'Cases_Lag_6': float(last_row.get('Cases_Lag_6', 0)),
        'Cases_Lag_12': float(last_row.get('Cases_Lag_12', 0)),
        'Cases_Lag_24': float(last_row.get('Cases_Lag_24', 0)),
        'Cases_Rolling_Avg_3M': float(last_row.get('Cases_Rolling_Avg_3M', 0)),
        'Cases_Rolling_Avg_6M': float(last_row.get('Cases_Rolling_Avg_6M', 0)),
        'Cases_Rolling_Avg_12M': float(last_row.get('Cases_Rolling_Avg_12M', 0)),
        'Cases_Rolling_Avg_24M': float(last_row.get('Cases_Rolling_Avg_24M', 0)),
    }
