import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllFunds, triggerUpdate } from './src/api.js';
import { parsePercentForTicker, abbreviateName } from './src/utils.js';
import Compare from './src/components/Compare.jsx';
import News from './src/components/News.jsx';
import Funds from './src/components/Funds.jsx';

import AccountView from './src/components/Account.jsx';
import { MobileHeader, HeaderNav, FooterNav } from './src/components/Navigation.jsx';
import StockTicker from './src/components/StockTicker.jsx';
import GeminiChatbot from './src/components/GeminiChatbot.jsx';
import PerformanceView from './src/components/PerformanceView.jsx';

// --- Data Simulation ---
const initialStocks = [
    { id: 1, ticker: 'GOOGL', name: 'Alphabet Inc.', price: 175.45, change: 1.25, changePercent: 0.72, trend: 'up', marketCap: 2.2 },
    { id: 2, ticker: 'MSFT', name: 'Microsoft Corp.', price: 410.12, change: -0.88, changePercent: -0.21, trend: 'down', marketCap: 3.0 },
    { id: 3, ticker: 'AMZN', name: 'Amazon Inc.', price: 180.99, change: 2.15, changePercent: 1.20, trend: 'up', marketCap: 1.9 },
    { id: 4, ticker: 'TSLA', name: 'Tesla Inc.', price: 195.60, change: -3.50, changePercent: -1.76, trend: 'down', marketCap: 0.6 },
    { id: 5, ticker: 'NVDA', name: 'NVIDIA Corp.', price: 900.20, change: 15.50, changePercent: 1.75, trend: 'up', marketCap: 2.2 },
    { id: 6, ticker: 'JPM', name: 'JPMorgan Chase', price: 199.10, change: 0.55, changePercent: 0.28, trend: 'up', marketCap: 0.5 },
];

/** Main App Component */
const App = () => {
    // Initial view: show Home which contains the news
    const [activeView, setActiveView] = useState('News');
    const [isDark, setIsDark] = useState(true); // Defaulting to dark mode for modern look

    // Dashboard State
    const [performanceFilter, setPerformanceFilter] = useState('1Y');
    const [dailyUpdateFilter, setDailyUpdateFilter] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');

    // All funds fetched from backend (we compute top lists client-side)
    const [fetchedFunds, setFetchedFunds] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        let mounted = true
        fetchAllFunds()
            .then(data => {
                if (mounted && Array.isArray(data) && data.length > 0) {
                    setFetchedFunds(data)
                    setLastUpdated(new Date().toISOString())
                }
            })
            .catch(err => {
                console.warn('Failed to fetch funds from backend:', err)
            })
        return () => { mounted = false }
    }, [])

    const handleUpdate = useCallback(async () => {
        setIsUpdating(true);
        try {
            // Ask backend to start scraping
            await triggerUpdate();

            // Poll /api/funds until scraper writes data or timeout
            const maxAttempts = 20; // ~20 seconds
            let attempts = 0;
            let data = null;
            while (attempts < maxAttempts) {
                try {
                    data = await fetchAllFunds();
                    if (Array.isArray(data) && data.length > 0) break;
                } catch (e) {
                    // backend may return 404 while scraper runs; swallow and retry
                }
                // wait before retrying
                await new Promise(res => setTimeout(res, 1000));
                attempts += 1;
            }

            if (data && Array.isArray(data)) {
                setFetchedFunds(data);
                setLastUpdated(new Date().toISOString());
            } else {
                console.warn('Update finished but no data returned from /api/funds');
            }
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setIsUpdating(false);
        }
    }, []);

    // Build ticker stocks from fetched funds (fallback to initialStocks)
    const tickerStocks = useMemo(() => {
        if (!Array.isArray(fetchedFunds) || fetchedFunds.length === 0) return initialStocks;

        const sortedFunds = [...fetchedFunds].sort((a, b) => {
            const aReturn = parsePercentForTicker(a.one_year_return);
            const bReturn = parsePercentForTicker(b.one_year_return);

            if (isNaN(aReturn)) return 1;
            if (isNaN(bReturn)) return -1;

            return bReturn - aReturn;
        });
        
        return sortedFunds.slice(0, 10).map(f => {
            const name = f.name || '';
            const short = abbreviateName(name);
            const oneY = f.one_year_return || 'N/A';
            const pct = parsePercentForTicker(oneY);
            return {
                id: name,
                ticker: short,
                name: name,
                priceLabel: `1Y: ${oneY}`, // Clarified label
                changePercent: Number.isFinite(pct) ? pct : 0,
                trend: Number.isFinite(pct) ? (pct >= 0 ? 'up' : 'down') : 'up',
                onClick: null, // will be assigned at render time if needed
            };
        });
    }, [fetchedFunds]);

    // Derived display stocks used in Performance/Analysis views
    const displayStocks = useMemo(() => {
        if (!Array.isArray(fetchedFunds) || fetchedFunds.length === 0) return initialStocks;
        return fetchedFunds.slice(0, 50).map(f => {
            const name = f.name || '';
            const short = abbreviateName(name);
            const oneY = f.one_year_return || f.three_year_return || f.five_year_return || 'N/A';
            const pct = parsePercentForTicker(oneY);
            return {
                ticker: short,
                name: name,
                price: Number.isFinite(pct) ? 100 + pct : 100,
                changePercent: Number.isFinite(pct) ? pct : 0,
                marketCap: f.market_cap || 0,
                original: f,
            };
        });
    }, [fetchedFunds]);

    const [selectedTicker, setSelectedTicker] = useState('');

    const toggleDark = useCallback(() => setIsDark(prev => !prev), []);

    useEffect(() => {
        // Apply or remove 'dark' class to the document root element based on state
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const renderContent = () => {
        switch (activeView) {
            case 'News':
                return <News />;
            case 'Funds':
                return <Funds fetchedFunds={fetchedFunds} lastUpdated={lastUpdated} handleUpdate={handleUpdate} isUpdating={isUpdating} />;
            case 'Performance':
                return <PerformanceView stocks={displayStocks} selectedTickerProp={selectedTicker} />;
            case 'Compare':
                return <Compare />;
            case 'Account':
                return <AccountView />;
            default:
                return <News />;
        }
    };

    return (
        <div className={isDark ? 'dark' : ''}>
            {/* GLOBAL FONT STACK INJECTION: Poppins and DM Sans */}
            <style jsx="true">
                {`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                    
                    :root {
                        --font-body: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        --font-heading: 'Poppins', 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    }

                    html, body, #root {
                        font-family: var(--font-body);
                    }
                    
                    h1, h2, h3, h4, .font-extrabold {
                        font-family: var(--font-heading);
                    }
                `}
            </style>

            <div className="pt-[56px] md:pt-0 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
                <MobileHeader isDark={isDark} toggleDark={toggleDark} setActiveView={setActiveView} />
                <HeaderNav 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    isDark={isDark} 
                    toggleDark={toggleDark}
                    isUpdating={isUpdating}
                    handleUpdate={handleUpdate}
                />

                <StockTicker stocks={tickerStocks.map(s => ({
                    ...s,
                    onClick: (item) => {
                        // set selected ticker to the abbreviation and switch to Performance view
                        setSelectedTicker(item.ticker);
                        setActiveView('Performance');
                    }
                }))} />

                <main className="pb-20 md:pb-0 max-w-7xl mx-auto">
                    {renderContent()}
                </main>

                <FooterNav activeView={activeView} setActiveView={setActiveView} />

                {/* Gemini Chatbot - Renders on Performance view now */}
                {activeView === 'Performance' && <GeminiChatbot />}
            </div>
        </div>
    );
};


export default App;