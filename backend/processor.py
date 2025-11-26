import re
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple


def parse_percent(v):
    if v is None:
        return np.nan
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if not s:
        return np.nan
    if s.upper() in {'NA', 'N/A', '-'}:
        return np.nan
    try:
        s = s.replace('%', '').replace(',', '').replace('\n', '').replace('1Y', '').replace('3Y', '').replace('5Y', '')
        return float(s)
    except Exception:
        return np.nan


def assign_risk(category: str) -> str:
    """Assign risk level based on fund category."""
    category_low = category.lower()
    if 'small cap' in category_low or 'sectoral' in category_low or 'thematic' in category_low:
        return 'Very High Risk'
    if 'mid cap' in category_low or 'flexi cap' in category_low or 'multi cap' in category_low:
        return 'High Risk'
    if 'large cap' in category_low or 'large & mid cap' in category_low:
        return 'Moderately High Risk'
    if 'hybrid' in category_low or 'balanced advantage' in category_low:
        return 'Moderate Risk'
    if 'debt' in category_low or 'liquid' in category_low or 'money market' in category_low:
        return 'Low Risk'
    if 'equity' in category_low or 'commodities' in category_low:
        return 'Very High Risk' # Fallback for general equity/commodities
    return 'Unknown'


def clean_df(raw: List[Dict]) -> pd.DataFrame:
    """Convert raw list of dicts (from scrapers) into a cleaned DataFrame with standard columns."""
    df = pd.DataFrame(raw)

    # Ensure columns exist
    for col in ['name', 'category', 'one_year_return', 'three_year_return', 'five_year_return', 'expense_ratio', 'aum']:
        if col not in df.columns:
            df[col] = pd.NA

    # Normalize names
    df['name'] = df['name'].astype(str).str.strip()

    # Standardize category
    # Normalize category values: fill missing, strip, and map common variants
    def normalize_category(val):
        if val is None:
            return 'Unknown'
        s = str(val).strip()
        if not s:
            return 'Unknown'
        # If field contains separators (from scraper), take the main token
        # e.g. 'Very High Risk • Commodities • 5 ★' -> 'Commodities'
        parts = [p.strip() for p in re.split(r'•|\\u2022', s) if p.strip()]
        token = parts[0] if len(parts) == 1 else (
            parts[1] if len(parts) > 1 else parts[0])
        token_low = token.lower()
        # canonical mapping
        mapping = {
            'equity': 'Equity',
            'equity - large cap': 'Equity',
            'equity - mid cap': 'Equity',
            'small cap': 'Equity',
            'mid cap': 'Equity',
            'hybrid': 'Hybrid',
            'debt': 'Debt',
            'commodities': 'Commodities',
            'gold': 'Commodities',
            'liquid': 'Debt',
            'tax saver': 'Equity',
        }
        # normalize common patterns
        token_clean = re.sub(r"\b(fund|direct plan|growth|plan)\b",
                             '', token_low, flags=re.IGNORECASE).strip()
        token_clean = re.sub(r'[^a-z0-9\s\-]', '', token_clean)
        # try mapping
        if token_clean in mapping:
            return mapping[token_clean]
        # title case fallback
        return token.strip().title()

    df['category'] = df['category'].apply(normalize_category)
    df['risk'] = df['category'].apply(assign_risk)

    # Parse numeric returns
    df['one_year_return_num'] = df['one_year_return'].apply(parse_percent)
    df['three_year_return_num'] = df['three_year_return'].apply(parse_percent)
    df['cagr_num'] = df['five_year_return'].apply(parse_percent)

    # Expense ratio and AUM cleanup
    def parse_number(x):
        if pd.isna(x):
            return np.nan
        try:
            s = str(x).replace(',', '').replace('%', '').strip()
            return float(s)
        except Exception:
            return np.nan

    df['expense_ratio_num'] = df['expense_ratio'].apply(parse_number)
    df['aum_num'] = df['aum'].apply(parse_number)

    # Remove duplicates by name (keep first)
    df = df.drop_duplicates(subset=['name'])

    # Keep useful columns
    cols = ['name', 'category', 'risk', 'one_year_return', 'three_year_return', 'five_year_return', 'expense_ratio', 'aum',
            'one_year_return_num', 'three_year_return_num', 'cagr_num', 'expense_ratio_num', 'aum_num']
    return df[cols]


def _minmax_series(s: pd.Series) -> pd.Series:
    if s.isna().all():
        return pd.Series(np.zeros(len(s)), index=s.index)
    
    # Penalize missing values by filling them with the minimum
    s_filled = s.fillna(s.min())
    
    minv = s_filled.min()
    maxv = s_filled.max()
    
    if pd.isna(minv) or pd.isna(maxv) or maxv == minv:
        return pd.Series(np.zeros(len(s)), index=s.index)
    
    return (s_filled - minv) / (maxv - minv)


def rank_funds(df: pd.DataFrame, top_n: int = 10) -> List[Dict]:
    """Return top_n funds as list of dicts (JSON-serializable).

    Weighted scoring: cagr (0.5), three_year (0.3), one_year (0.2)
    Missing values treated as low scores.
    """
    if df.empty:
        return []

    # Work on numeric columns
    numeric_df = df.copy()
    numeric_df['one_year_return_num'] = numeric_df.get(
        'one_year_return_num', pd.Series([np.nan]*len(numeric_df)))
    numeric_df['three_year_return_num'] = numeric_df.get(
        'three_year_return_num', pd.Series([np.nan]*len(numeric_df)))
    numeric_df['cagr_num'] = numeric_df.get(
        'cagr_num', pd.Series([np.nan]*len(numeric_df)))

    s1 = _minmax_series(numeric_df['cagr_num'])
    s2 = _minmax_series(numeric_df['three_year_return_num'])
    s3 = _minmax_series(numeric_df['one_year_return_num'])

    score = 0.5 * s1 + 0.3 * s2 + 0.2 * s3
    numeric_df['score'] = score

    ranked = numeric_df.sort_values('score', ascending=False).head(top_n)

    # Prepare output
    out = []
    for _, row in ranked.iterrows():
        out.append({
            'name': row['name'],
            'category': row['category'],
            'risk': row['risk'],
            'one_year_return': row['one_year_return'],
            'three_year_return': row['three_year_return'],
            'cagr': row['five_year_return'],
            'expense_ratio': row.get('expense_ratio', None),
            'aum': row.get('aum', None),
            'score': float(row['score']) if not pd.isna(row['score']) else None
        })
    return out
		
def rank_funds_df(df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
    if df.empty:
        return df
    numeric_df = df.copy()
    numeric_df['one_year_return_num'] = numeric_df.get(
        'one_year_return_num', pd.Series([np.nan]*len(numeric_df)))
    numeric_df['three_year_return_num'] = numeric_df.get(
        'three_year_return_num', pd.Series([np.nan]*len(numeric_df)))
    numeric_df['cagr_num'] = numeric_df.get(
        'cagr_num', pd.Series([np.nan]*len(numeric_df)))

    s1 = _minmax_series(numeric_df['cagr_num'])
    s2 = _minmax_series(numeric_df['three_year_return_num'])
    s3 = _minmax_series(numeric_df['one_year_return_num'])

    numeric_df['score'] = 0.5 * s1 + 0.3 * s2 + 0.2 * s3
    ranked = numeric_df.sort_values('score', ascending=False).head(top_n)
    return ranked


def clean_and_normalize(raw: List[Dict]) -> List[Dict]:
    df = clean_df(raw)
    # Replace pandas/numpy NA/NaN with None so JSON serialization works.
    # Convert to object dtype first so None values are preserved (otherwise float
    # columns will coerce None back to NaN).
    df = df.astype(object).where(pd.notnull(df), None)
    # Return list of cleaned dicts
    out = df.to_dict(orient='records')
    return out
