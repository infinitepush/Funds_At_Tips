import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { downloadTop10CSV, triggerUpdate, fetchAllFunds } from '../api.js';


const parsePercentForTicker = (v) => {
    if (v === null || v === undefined) return NaN;
    if (typeof v === 'number') return v;
    const s = String(v).split('\n')[0].replace('%','').replace(',','').trim();
    if (s === '' || ['NA', 'N/A', '-', 'none'].includes(s)) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
};

const abbreviateName = (name) => {
    if (!name) return 'FUND';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0,6).toUpperCase();
    return parts.slice(0,3).map(p => p[0]).join('').toUpperCase();
};


const FundTable = ({ title, funds, period = '1Y', count = 0, isScrollable = true }) => {
    const fieldMap = { '1Y': 'one_year_return', '3Y': 'three_year_return', '5Y': 'five_year_return' };
    const field = fieldMap[period] || 'one_year_return';
    const parseNum = (v) => {
        if (v === null || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        const s = String(v).split('\n')[0].replace('%','').replace(',','').trim();
        if (s === '' || ['NA', 'N/A', '-', 'none'].includes(s)) return NaN;
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
    };
    const scrollableClass = isScrollable ? 'flex-grow overflow-y-auto' : '';

    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col ${isScrollable ? 'h-full' : ''}`}>
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{title}</h3>
            <div className={scrollableClass}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700/50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Rank
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {period} Return
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {funds.map((item, index) => {
                            const valRaw = item[field];
                            const valNum = parseNum(valRaw);
                            const positive = !Number.isNaN(valNum) && valNum >= 0;
                            return (
                                <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <span className={`font-bold text-lg ${positive ? 'text-green-500' : 'text-red-500'}`}>
                                            {valRaw ?? 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Showing {count > 0 ? `${funds.length} of ${count}` : funds.length} funds.
            </p>
        </div>
    );
};


/** Funds View Component */
const FundsView = ({ allFunds, top10Funds, performanceFilter, setPerformanceFilter, dailyUpdateFilter, setDailyUpdateFilter, searchTerm, setSearchTerm, setActiveView, handleUpdate, isUpdating, lastUpdated, selectedCategories, setSelectedCategories, categories, categoryCounts }) => {
    const [catOpen, setCatOpen] = useState(false);
    const catRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!catRef.current) return;
            if (!catRef.current.contains(e.target)) {
                setCatOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [catRef]);

    return (
        <section className="p-4 md:p-8 space-y-8 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Groww — Mutual Funds</h2>
                    {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(lastUpdated).toLocaleString()}</p>}
                </div>

                <div className="flex items-center space-x-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance:</label>
                        <div className="flex space-x-2 mt-1">
                            {['1Y','3Y','5Y'].map(f => (
                                <button key={f} onClick={() => setPerformanceFilter(f)} className={`px-3 py-1 rounded-lg text-sm ${performanceFilter===f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{f}</button>
                            ))}
                        </div>
                    </div>

                    <div ref={catRef} className="relative">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
                        <div className="mt-1">
                            <button type="button" onClick={() => setCatOpen(s => !s)} className="w-52 text-left px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {selectedCategories && selectedCategories.length === 1 && selectedCategories[0] === 'All' ? (
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs">All</span>
                                    ) : (
                                        (selectedCategories || []).slice(0,3).map(c => (
                                            <span key={c} className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs">{c}</span>
                                        ))
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">▾</div>
                            </button>

                            {catOpen && (
                                <div className="absolute z-40 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-semibold">Select categories</div>
                                        <div className="text-xs text-gray-500">{(selectedCategories && selectedCategories[0] === 'All') ? 'All' : `${selectedCategories.length} selected`}</div>
                                    </div>
                                    <div className="max-h-40 overflow-auto space-y-1">
                                        {(categories || []).map(c => (
                                            <label key={c} className="flex items-center justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories && (selectedCategories.includes(c) || (selectedCategories[0] === 'All'))}
                                                        onChange={(e) => {
                                                            if (c === 'All') {
                                                                if (e.target.checked) setSelectedCategories(['All']);
                                                                else setSelectedCategories([]);
                                                                return;
                                                            }
                                                            let next = Array.isArray(selectedCategories) ? [...selectedCategories] : [];
                                                            next = next.filter(x => x !== 'All');
                                                            if (e.target.checked) next.push(c); else next = next.filter(x => x !== c);
                                                            if (next.length === 0) next = ['All'];
                                                            setSelectedCategories(next);
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-200">{c}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{categoryCounts?.[c] ?? 0}</div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                        <button type="button" onClick={() => setSelectedCategories(['All'])} className="text-xs text-indigo-600 hover:underline">Select All</button>
                                        <button type="button" onClick={() => setSelectedCategories(['All'])} className="text-xs text-red-600 hover:underline">Clear</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleUpdate} disabled={isUpdating} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-blue-400 mr-2">
                        {isUpdating ? 'Updating...' : 'Update Data'}
                    </button>
                    <button onClick={() => downloadTop10CSV()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Export CSV</button>
                </div>
            </div>

            <div className="mt-4 flex flex-col lg:flex-row gap-8 items-start">
                <div className="lg:w-1/3">
                    <FundTable title="Top 10 Performers" funds={top10Funds} period={performanceFilter} count={10} isScrollable={false} />
                </div>
                <div className="lg:w-2/3">
                    <FundTable title="All Funds" funds={allFunds} period={performanceFilter} isScrollable={false} />
                </div>
            </div>
        </section>
    );
};

const computeFundsByPeriod = (fetchedFunds, period, topN = 20, categories = null) => {
    if (!Array.isArray(fetchedFunds) || fetchedFunds.length === 0) return [];

    const parsePercent = (v) => {
        if (v === null || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        const s = String(v).replace('%','').replace(',','').trim();
        if (s === '' || ['NA', 'N/A', '-', 'none'].includes(s)) return NaN;
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
    };

    const fieldMap = {
        '1Y': 'one_year_return',
        '3Y': 'three_year_return',
        '5Y': 'five_year_return'
    };

    const field = fieldMap[period] || 'one_year_return';

    let pool = fetchedFunds;
    if (Array.isArray(categories) && categories.length > 0 && !(categories.length === 1 && categories[0] === 'All')) {
        pool = fetchedFunds.filter(f => {
            const c = (f && f.category) ? String(f.category).trim() : 'Unknown';
            return categories.includes(c);
        });
    }

    const list = pool.map(f => ({
        ...f,
        _period_num: parsePercent(f[field])
    }));

    // Sort by numeric period descending, fallback NaN to -Infinity so they go to bottom
    list.sort((a,b) => {
        const an = Number.isFinite(a._period_num) ? a._period_num : -Infinity;
        const bn = Number.isFinite(b._period_num) ? b._period_num : -Infinity;
        return bn - an;
    });

    if (topN === -1) {
        return list;
    }
    return list.slice(0, topN);
};

const computeTopPerformers = (fetchedFunds, topN = 10, categories = null, period = '1Y') => {
    if (!Array.isArray(fetchedFunds) || fetchedFunds.length === 0) return [];

    const parsePercent = (v) => {
        if (v === null || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        const s = String(v).split('\n')[0].replace('%','').replace(',','').trim();
        if (s === '' || ['NA', 'N/A', '-', 'none'].includes(s)) return NaN;
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
    };

    const fieldMap = { '1Y': 'one_year_return', '3Y': 'three_year_return', '5Y': 'five_year_return' };
    const periodField = fieldMap[period] || 'one_year_return';

    let pool = fetchedFunds;
    if (Array.isArray(categories) && categories.length > 0 && !(categories.length === 1 && categories[0] === 'All')) {
        pool = fetchedFunds.filter(f => {
            const c = (f && f.category) ? String(f.category).trim() : 'Unknown';
            return categories.includes(c);
        });
    }

    const sorted_list = pool.map(f => ({
        ...f,
        _period_num: parsePercent(f[periodField])
    }))
    .filter(f => Number.isFinite(f._period_num))
    .sort((a,b) => b._period_num - a._period_num);
    
    return sorted_list.slice(0, topN);
};

const Funds = ({ fetchedFunds, lastUpdated, handleUpdate, isUpdating }) => {
    // Dashboard State
    const [performanceFilter, setPerformanceFilter] = useState('1Y');
    const [dailyUpdateFilter, setDailyUpdateFilter] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');

    // Category filter state (multi-select)
    const [selectedCategories, setSelectedCategories] = useState(['All']);

    const uniqueCategories = useMemo(() => {
        if (!Array.isArray(fetchedFunds)) return [];
        const s = new Set(fetchedFunds.map(f => (f && f.category) ? String(f.category).trim() : 'Unknown'));
        return ['All', ...Array.from(s).sort((a,b) => a.localeCompare(b))];
    }, [fetchedFunds]);

    const categoryCounts = useMemo(() => {
        const counts = {};
        if (!Array.isArray(fetchedFunds)) return counts;
        fetchedFunds.forEach(f => {
            const c = (f && f.category) ? String(f.category).trim() : 'Unknown';
            counts[c] = (counts[c] || 0) + 1;
        });
        return counts;
    }, [fetchedFunds]);

    const allFunds = useMemo(() => computeFundsByPeriod(fetchedFunds, performanceFilter || '1Y', -1, selectedCategories), [fetchedFunds, performanceFilter, selectedCategories]);
    const top10Funds = useMemo(() => computeTopPerformers(fetchedFunds, 10, selectedCategories, performanceFilter), [fetchedFunds, selectedCategories, performanceFilter]);

    return (
        <FundsView
            allFunds={allFunds}
            top10Funds={top10Funds}
            performanceFilter={performanceFilter}
            setPerformanceFilter={setPerformanceFilter}
            dailyUpdateFilter={dailyUpdateFilter}
            setDailyUpdateFilter={setDailyUpdateFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleUpdate={handleUpdate}
            isUpdating={isUpdating}
            lastUpdated={lastUpdated}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={uniqueCategories}
            categoryCounts={categoryCounts}
        />
    )
}


export default Funds;