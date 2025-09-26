import pandas as pd
import numpy as np

def compute_time_features(historical_cases_df, barangay, year, month):
    """
    Compute lagged and rolling features for a given (barangay, year, month).
    
    Parameters:
    - historical_cases_df: DataFrame with columns ['BARANGAY', 'YEAR', 'MONTH', 'Cases']
    - barangay: str
    - year, month: int
    
    Returns:
    - dict: {'Cases_Lagged': float, 'Cases_Rolling_Avg_3M': float}
    """
    # Create target date for comparison
    target_date = pd.to_datetime(f"{year}-{month:02d}-01")
    
    # Filter historical data for the barangay and dates BEFORE target
    hist = historical_cases_df[
        (historical_cases_df['BARANGAY'] == barangay) &
        (pd.to_datetime(historical_cases_df[['YEAR', 'MONTH']].assign(DAY=1)) < target_date)
    ].copy()
    
    # If no history, return zeros
    if hist.empty:
        return {'Cases_Lagged': 0.0, 'Cases_Rolling_Avg_3M': 0.0}
    
    # Sort by time
    hist = hist.sort_values(['YEAR', 'MONTH'])
    cases = hist['Cases'].values.astype(float)
    
    # Lagged = most recent month's cases
    lagged = cases[-1]
    
    # Rolling average of last up to 3 months
    rolling_avg = np.mean(cases[-3:])  # Works even if <3 months
    
    return {
        'Cases_Lagged': float(lagged),
        'Cases_Rolling_Avg_3M': float(rolling_avg)
    }