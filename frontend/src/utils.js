// Lightweight percent parser used for ticker conversions
export const parsePercentForTicker = (v) => {
    if (v === null || v === undefined) return NaN;
    if (typeof v === 'number') return v;
    const s = String(v).split('\n')[0].replace('%','').replace(',','').trim();
    if (s === '' || ['NA', 'N/A', '-', 'none'].includes(s)) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
};

export const abbreviateName = (name) => {
    if (!name) return 'FUND';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0,6).toUpperCase();
    return parts.slice(0,3).map(p => p[0]).join('').toUpperCase();
};