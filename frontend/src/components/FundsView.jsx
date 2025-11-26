import React, { useRef, useEffect, useState } from 'react';
import { downloadTop10CSV } from '../api';
import FundTable from './FundTable';

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

export default FundsView;