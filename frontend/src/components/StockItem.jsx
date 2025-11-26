import React, { useState, useCallback } from 'react';
import { Icon } from './common';
import { callGeminiApi } from '../api';
import TrendIndicator from './TrendIndicator';

const StockItem = ({ stock }) => {
    const [newsState, setNewsState] = useState({ text: null, isLoading: false, isError: false });

    const fetchNews = useCallback(async () => {
        if (newsState.isLoading) return;

        // Reset state and show loader
        setNewsState({ text: null, isLoading: true, isError: false });
        
        const prompt = `Provide a single, very concise, one-sentence summary of the latest market news and current sentiment for ${stock.ticker} (${stock.name}).`;
        
        const onResponse = (data) => {
            setNewsState({ text: data.text, isLoading: false, isError: false });
        };

        const onError = (errorMessage) => {
            setNewsState({ text: 'Could not fetch news summary.', isLoading: false, isError: true });
        };

        // Use the global utility function for grounded news
        await callGeminiApi(prompt, onResponse, onError);
    }, [stock.ticker, stock.name, newsState.isLoading]);

    const sparkleIconPath = <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.21 1.18-6.88-5-4.87 6.91-1.01L12 2z"/>;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md transition duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
                {/* Left Side: Ticker and Name */}
                <div>
                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{stock.ticker}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                </div>

                {/* Right Side: Price, Trend, and News Button */}
                <div className="flex flex-col items-end">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${stock.price.toFixed(2)}</p>
                    <TrendIndicator changePercent={stock.changePercent} />
                    
                    <button
                        onClick={fetchNews}
                        disabled={newsState.isLoading}
                        className={`mt-2 flex items-center text-xs font-medium px-2 py-1 rounded-full transition duration-300 shadow-sm ${newsState.isLoading 
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800'
                        }`}
                        title="Get Latest News Summary powered by Gemini"
                    >
                        <Icon className="w-3 h-3 mr-1 fill-current" path={sparkleIconPath} />
                        {newsState.isLoading ? 'Loading...' : 'News Summary'}
                    </button>
                </div>
            </div>

            {/* News Summary Display */}
            {(newsState.text || newsState.isError) && (
                <div className={`mt-3 p-3 text-sm rounded-lg border ${newsState.isError 
                    ? 'bg-red-50 dark:bg-red-900/50 border-red-300 text-red-700 dark:text-red-300' 
                    : 'bg-indigo-50 dark:bg-gray-700 border-indigo-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                    <p className="font-semibold text-gray-800 dark:text-white mb-1">Wisbee's Insight:</p>
                    <p>{newsState.text}</p>
                </div>
            )}
        </div>
    );
};

export default StockItem;