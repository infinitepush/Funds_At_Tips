import React, { useState, useMemo, useEffect } from 'react';

// Simple SVG overlay chart component (no external deps)
// Props:
// - funds: array of fund objects; expected to contain { name, one_year_return, three_year_return, five_year_return }
// - maxSelect: max number of funds selectable (default 3)
// - initialSelected: array of fund names to preselect

const ranges = [
  { id: '1M', days: 30 },
  { id: '3M', days: 90 },
  { id: '1Y', days: 365 },
  { id: '3Y', days: 365 * 3 },
  { id: '5Y', days: 365 * 5 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

function parsePercent(v) {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  const s = String(v).replace('%','').replace(',','').trim();
  if (s === '' || /^(NA|N\/A|-|none)$/i.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function synthesizeSeries(totalPct, days) {
  // totalPct is in percent (e.g., 12.5 for +12.5%)
  const r = (isNaN(totalPct) ? 0 : totalPct / 100);
  const factor = Math.pow(1 + r, 1 / Math.max(1, days));
  const pts = [];
  let v = 100;
  for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 120))) { // cap points to ~120 to keep svg small
    pts.push(v);
    v = v * factor;
  }
  // Ensure last point is included
  if (pts[pts.length - 1] !== v) pts.push(v);
  return pts;
}

function computeMetrics(series, days) {
  if (!series || series.length < 2) return null;
  const start = series[0];
  const end = series[series.length - 1];
  const cumulative = (end / start - 1) * 100;
  const annualized = Math.pow(end / start, 365 / Math.max(1, days)) - 1;
  const dailyReturns = [];
  for (let i = 1; i < series.length; i++) {
    dailyReturns.push(series[i] / series[i-1] - 1);
  }
  const mean = dailyReturns.reduce((a,b)=>a+b,0)/dailyReturns.length;
  const variance = dailyReturns.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(dailyReturns.length);
  const vol = Math.sqrt(variance) * Math.sqrt(252); // annualized vol
  return { cumulative, annualized: annualized * 100, vol: vol * 100 };
}

const PerformanceChart = ({ funds = [], maxSelect = 3, initialSelected = [], selectedNames = null, onSelectionChange = null }) => {
  const [selected, setSelected] = useState(() => {
    if (initialSelected && initialSelected.length) return initialSelected.slice(0, maxSelect);
    return funds.slice(0, Math.min(maxSelect, funds.length)).map(f => f.name || f.ticker || '');
  });
  const [tooltip, setTooltip] = useState(null);
  const [rangeId, setRangeId] = useState('1Y');
  const [search, setSearch] = useState('');

  const filteredFunds = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    if (!q) return funds;
    return funds.filter(f => {
      const name = (f.name || f.ticker || '').toLowerCase();
      return name.includes(q);
    });
  }, [funds, search]);

  const days = useMemo(() => (ranges.find(r=>r.id===rangeId)||ranges[2]).days, [rangeId]);

  const fundMap = useMemo(() => {
    const m = {};
    funds.forEach(f => { m[f.name || f.ticker || ''] = f; });
    return m;
  }, [funds]);

  const seriesData = useMemo(() => {
    return selected.map(name => {
      const f = fundMap[name];
      if (!f) return { name, series: [100], metrics: null };
      // choose best field for this days selection
      let total = parsePercent(f.one_year_return);
      if (days > 365 && f.three_year_return) total = parsePercent(f.three_year_return);
      if (days > 365*3 && f.five_year_return) total = parsePercent(f.five_year_return);
      // fallbacks
      if (isNaN(total)) {
        total = parsePercent(f.one_year_return) || parsePercent(f.three_year_return) || parsePercent(f.five_year_return) || 0;
      }
      const series = synthesizeSeries(total, days);
      const metrics = computeMetrics(series, days);
      return { name, series, metrics };
    });
  }, [selected, fundMap, days]);

  // allow controlled selection via props
  useEffect(() => {
    if (Array.isArray(selectedNames)) {
      const next = selectedNames.slice(0, maxSelect);
      if (next.length) setSelected(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNames]);

  // notify parent when selection changes
  useEffect(() => {
    if (typeof onSelectionChange === 'function') onSelectionChange(selected);
  }, [selected, onSelectionChange]);

  // chart sizing (internal coords)
  const widthConst = 700;
  const height = 260;

  // compute global min/max
  const allPoints = seriesData.flatMap(d => d.series.length ? d.series : [100]);
  const min = Math.min(...allPoints, 0);
  const max = Math.max(...allPoints, 100);

  const yScale = (v) => {
    const pad = (max - min) * 0.1;
    const minP = min - pad;
    const maxP = max + pad;
    return height - ((v - minP) / (maxP - minP)) * height;
  };

  const xForIndex = (i, seriesLen) => {
    return (i / (seriesLen - 1)) * widthConst;
  };

  const toggleSelect = (name) => {
    let next = selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name];
    if (next.length > maxSelect) next = next.slice(0, maxSelect);
    if (next.length === 0) next = [name];
    setSelected(next);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <div className="font-semibold">Performance Chart</div>
          <div className="text-xs text-gray-500">Synthesize series from 1Y/3Y/5Y returns</div>
        </div>
        <div className="flex items-center space-x-2">
          {ranges.map(r => (
            <button key={r.id} onClick={() => setRangeId(r.id)} className={`px-3 py-1 rounded ${rangeId===r.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm'}`}>{r.id}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selected.map((name, idx) => (
                <div key={name} className="flex items-center space-x-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{background: COLORS[idx % COLORS.length]}} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
            <div>
              <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
            </div>
          </div>

          <svg width="100%" height={height} viewBox={`0 0 ${widthConst} ${height}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* grid lines and left axis labels */}
            {[0, .25, .5, .75, 1].map((t,i) => {
              const y = t * height;
              // label value
              const val = (max - (max - min) * t).toFixed(0);
              return (
                <g key={i}>
                  <line x1={40} x2={widthConst} y1={y} y2={y} stroke="#e6e6e6" strokeWidth={1} opacity={0.6} />
                  <text x={8} y={y+4} fontSize={11} fill="#9CA3AF">{val}</text>
                </g>
              );
            })}

            {/* series lines */}
            {seriesData.map((d, idx) => {
              const color = COLORS[idx % COLORS.length];
              const series = d.series;
              if (!series || series.length < 2) return null;
              // build path and area for nicer visuals
              const coords = series.map((v,i) => ({ x: xForIndex(i, series.length), y: yScale(v), v }));
              const path = coords.map((p,i) => `${i===0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = `M ${coords[0].x} ${height} ` + coords.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${coords[coords.length-1].x} ${height} Z`;
              return (
                <g key={d.name}>
                  <path d={areaPath} fill={color} opacity={0.06} />
                  <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* points for hover/tooltips */}
                  {coords.map((p, pi) => (
                    <circle key={pi} cx={p.x} cy={p.y} r={3} fill={color} opacity={0.9}
                      onMouseEnter={(e) => setTooltip({ x: p.x, y: p.y, name: d.name, value: p.v })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </g>
              );
            })}

            {/* tooltip */}
            {tooltip && (
              <g>
                <rect x={tooltip.x + 8} y={tooltip.y - 28} width={110} height={36} rx={6} fill="#111827" opacity={0.95} />
                <text x={tooltip.x + 16} y={tooltip.y - 10} fontSize={12} fill="#fff">{tooltip.name}</text>
                <text x={tooltip.x + 16} y={tooltip.y + 6} fontSize={12} fill="#9CA3AF">{Number(tooltip.value).toFixed(2)}%</text>
              </g>
            )}
          </svg>
        </div>

        <div className="w-80">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Selected Funds</div>
              <div className="text-xs text-gray-400">Tip: hover points for details</div>
            </div>
            <div className="mt-2 space-y-1 max-h-44 overflow-auto">
              <div className="mb-2">
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search funds..." className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm mb-2" />
              </div>
              {filteredFunds.map((f,i) => {
                const name = f.name || f.ticker || `Fund ${i+1}`;
                const checked = selected.includes(name);
                const idx = selected.indexOf(name);
                const color = COLORS[idx >=0 ? idx : (i % COLORS.length)];
                return (
                  <label key={name} className="flex items-center justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={checked} onChange={() => toggleSelect(name)} />
                      <div className="text-sm font-medium flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{background: color}} />
                        {name}
                      </div>
                    </div>
                    {selected.includes(name) && (
                      <div className="text-xs text-gray-500">{computeMetrics(synthesizeSeries(parsePercent(f.one_year_return || f.three_year_return || f.five_year_return), days), days)?.cumulative?.toFixed(1) ?? '—'}%</div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {seriesData.map((d, idx) => (
              <div key={d.name} className="p-2 rounded border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="text-sm font-semibold" style={{color: COLORS[idx % COLORS.length]}}>{d.name}</div>
                <div className="text-xs text-gray-400">Cumulative</div>
                <div className="text-lg font-bold">{d.metrics ? `${d.metrics.cumulative.toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-gray-400 mt-2">Ann. {d.metrics ? `${d.metrics.annualized.toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-gray-400">Vol {d.metrics ? `${d.metrics.vol.toFixed(2)}%` : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
