import React from 'react';

const FundTable = ({ title, funds, period = '1Y', count = 0, isScrollable = true }) => {
    const fieldMap = { '1Y': 'one_year_return', '3Y': 'three_year_return', '5Y': 'five_year_return' };
    const field = fieldMap[period] || 'one_year_return';
    const parseNum = (v) => {
        if (v === null || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        const s = String(v).replace('%','').replace(',','').trim();
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

export default FundTable;