import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Icon } from './common';
import { callGeminiApi } from '../api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getElementAtEvent } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const AnalysisView = ({ setActiveView, stocks }) => {
    const [analysisReport, setAnalysisReport] = useState(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCategoryFunds, setSelectedCategoryFunds] = useState([]);
    const chartRef = useRef();

    const generateAnalysis = useCallback(async (category) => {
        if (isAnalysisLoading || !category) return;
        setIsAnalysisLoading(true);
        setAnalysisReport(null);

        const systemPrompt = "You are a senior financial analyst. Provide a concise analysis of the specified mutual fund category in the current market. Your analysis should be easy to understand for a retail investor.";
        
        const prompt = `Provide a concise analysis of the "${category}" mutual fund category in the current market. Include a summary of its recent performance, general outlook, and the typical risks associated with this category. Keep the analysis under 200 words.`;

        const onResponse = (data) => {
            setIsAnalysisLoading(false);
            setAnalysisReport(data.text);
        };

        const onError = (errorMessage) => {
            setIsAnalysisLoading(false);
            setAnalysisReport(`Error generating analysis: ${errorMessage}. Please try again.`);
        };
        
        await callGeminiApi(prompt, onResponse, onError, systemPrompt, true);
    }, [isAnalysisLoading]);

    useEffect(() => {
        if (selectedCategory) {
            generateAnalysis(selectedCategory);
        }
    }, [selectedCategory, generateAnalysis]);

    const chartData = useMemo(() => {
        const categoryCounts = stocks.reduce((acc, stock) => {
            const category = stock.original?.category || 'Unknown';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        return {
            labels,
            datasets: [
                {
                    label: '# of Funds',
                    data,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                    ],
                    borderColor: [
                        'rgba(79, 70, 229, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(139, 92, 246, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [stocks]);

    const riskIconPath = <path d="M12 2L1 21h22z"/>;

    const onClick = (event) => {
        const element = getElementAtEvent(chartRef.current, event);
        if (element.length > 0) {
            const index = element[0].index;
            const category = chartData.labels[index];
            const funds = stocks.filter(s => s.original?.category === category);
            setSelectedCategory(category);
            setSelectedCategoryFunds(funds);
        }
    };

    const chartOptions = {
        cutout: '60%',
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed;
                        }
                        return label + ' funds';
                    }
                }
            }
        }
    };

    return (
        <section className="p-4 md:p-8 space-y-8 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700" style={{ fontFamily: 'var(--font-heading)' }}>
                In-Depth Financial Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <Icon className="w-6 h-6 mr-2 text-indigo-500" path={<path d="M3 15s1-4 4-4 5 2 8 2 4-4 4-4V3"/>} />
                        Current Asset Allocation
                    </h3>
                    
                    <div className="h-96 flex justify-center items-center">
                        <Doughnut data={chartData} ref={chartRef} onClick={onClick} options={chartOptions} />
                    </div>

                    {selectedCategoryFunds.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-xl font-semibold mb-4">Funds in {selectedCategory}</h4>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">1Y Return</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedCategoryFunds.map(fund => (
                                            <tr key={fund.name}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{fund.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{fund.original.one_year_return}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{fund.original.risk}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4 border border-gray-100 dark:border-gray-700">
                         <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                            <Icon className="w-5 h-5 mr-2 text-blue-500" path={riskIconPath} />
                            Category Analysis
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Click on a category in the chart to get an AI-powered analysis of its performance, outlook, and risks.
                        </p>

                        {isAnalysisLoading && (
                            <div className="flex items-center justify-center">
                                <p>Analyzing Category...</p>
                            </div>
                        )}

                        {analysisReport && !isAnalysisLoading && (
                            <div className="mt-4 p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 shadow-inner max-h-96 overflow-y-auto">
                                <p className="font-bold mb-2 text-indigo-700 dark:text-indigo-300">FundsAtTips Category Report for {selectedCategory}:</p>
                                <div dangerouslySetInnerHTML={{ __html: analysisReport.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </section>
    );
};