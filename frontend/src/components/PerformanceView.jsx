import React from 'react';
import PerformanceChart from './PerformanceChart';
import { downloadTop10CSV } from '../api';

const PerformanceView = ({ stocks = [], selectedTickerProp = '' }) => {
    // Map incoming stocks to the shape expected by PerformanceChart
    const funds = (stocks || []).map(s => {
        const orig = s.original || s;
        return {
            name: s.name || s.ticker || orig?.name || '',
            ticker: s.ticker || orig?.ticker || '',
            one_year_return: orig?.one_year_return ?? orig?.oneYear ?? null,
            three_year_return: orig?.three_year_return ?? orig?.threeYear ?? null,
            five_year_return: orig?.five_year_return ?? orig?.fiveYear ?? null,
        };
    });

    const initialSelected = selectedTickerProp ? [selectedTickerProp] : [];

    return (
        <section className="p-6 md:p-10 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare recent performance across funds. Use the chart to inspect returns and volatility.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => downloadTop10CSV && downloadTop10CSV()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow">Export CSV</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <PerformanceChart funds={funds} initialSelected={initialSelected} />
                </div>
            </div>
        </section>
    );
};

export default PerformanceView;