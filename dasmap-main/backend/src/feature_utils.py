import pandas as pd
import numpy as np


def compute_time_features(brgy_hist, year, month, population, season_weight=1.0):
    """
    Recompute all time-based features exactly like in the training pipeline.
    brgy_hist must contain: YEAR, MONTH, Cases, Trend
    """

    # if no history: return zeros
    if brgy_hist.empty or 'Cases' not in brgy_hist.columns:
        return {c: 0 for c in [
            'Cases_Lag_1','Cases_Lag_2','Cases_Lag_3','Cases_Lag_6','Cases_Lag_12M',
            'Cases_Rolling_Avg_3M','Cases_Rolling_Avg_6M',
            'Trend','Month','Month_sin','Month_cos',
            'Quarter','Quarter_sin','Quarter_cos',
            'Day_of_Week','Is_Weekend',
            'Cases_Pct_Change_1M','Cases_Pct_Change_3M',
            'Cases_per_1000'
        ]}

    # ---------- BASIC SERIES ----------
    last_cases = brgy_hist['Cases'].values
    last_3 = last_cases[-3:] if len(last_cases) >= 3 else np.pad(last_cases, (3 - len(last_cases), 0))
    last_6 = last_cases[-6:] if len(last_cases) >= 6 else np.pad(last_cases, (6 - len(last_cases), 0))

    # ---------- LAG 12M (same month last year) ----------
    last_year_same_month = brgy_hist[
        (brgy_hist['YEAR'] == year - 1) & (brgy_hist['MONTH'] == month)
    ]['Cases'].values
    lag_12m = last_year_same_month[-1] if len(last_year_same_month) else 0
    lag_12m *= season_weight

    # ---------- DIRECT LAGS ----------
    lag_1 = (last_cases[-1] if len(last_cases) >= 1 else 0) * season_weight
    lag_2 = (last_cases[-2] if len(last_cases) >= 2 else 0) * season_weight
    lag_3 = (last_cases[-3] if len(last_cases) >= 3 else 0) * season_weight
    lag_6 = last_6.mean() * season_weight

    # ---------- ROLLING ----------
    roll_3 = last_3.mean() * season_weight
    roll_6 = last_6.mean() * season_weight

    # ---------- TREND ----------
    trend_val = brgy_hist['Trend'].max() + 1

    # ---------- DATE FEATURES ----------
    ts = pd.Timestamp(year=year, month=month, day=1)
    quarter = ts.quarter

    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    quarter_sin = np.sin(2 * np.pi * quarter / 4)
    quarter_cos = np.cos(2 * np.pi * quarter / 4)

    weekday = ts.dayofweek
    is_weekend = int(weekday >= 5)

    # ---------- PERCENTAGE CHANGE ----------
    pct_1m = ((last_cases[-1] - last_cases[-2]) / last_cases[-2]) \
        if len(last_cases) >= 2 and last_cases[-2] != 0 else 0

    pct_3m = ((last_cases[-1] - last_3[0]) / last_3[0]) if last_3[0] != 0 else 0

    # ---------- PER 1000 ----------
    cases_per_1000 = (last_cases[-1] / population) * 1000

    return {
        'Cases_Lag_1': lag_1,
        'Cases_Lag_2': lag_2,
        'Cases_Lag_3': lag_3,
        'Cases_Lag_6': lag_6,
        'Cases_Lag_12M': lag_12m,
        'Cases_Rolling_Avg_3M': roll_3,
        'Cases_Rolling_Avg_6M': roll_6,
        'Trend': trend_val,
        'Month': month,
        'Month_sin': month_sin,
        'Month_cos': month_cos,
        'Quarter': quarter,
        'Quarter_sin': quarter_sin,
        'Quarter_cos': quarter_cos,
        'Day_of_Week': weekday,
        'Is_Weekend': is_weekend,
        'Cases_Pct_Change_1M': pct_1m,
        'Cases_Pct_Change_3M': pct_3m,
        'Cases_per_1000': cases_per_1000
    }
