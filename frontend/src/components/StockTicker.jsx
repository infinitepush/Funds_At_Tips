import React from 'react';

const StockTicker = ({ stocks }) => {
    // Duplicate the stocks to create a seamless loop
    const tickerContent = [...stocks, ...stocks];

    return (
        <div className="overflow-hidden whitespace-nowrap py-2 bg-indigo-600 dark:bg-indigo-800 shadow-xl">
            <style jsx="true">
                {`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .ticker-animation {
                        animation: scroll 30s linear infinite;
                        display: inline-block;
                        white-space: nowrap;
                    }
                `}
            </style>
            <div className="ticker-animation flex">
                {tickerContent.map((stock, index) => (
                    <button
                        key={index}
                        onClick={() => stock.onClick && stock.onClick(stock)}
                        className="inline-flex items-center mx-4 text-white text-sm font-medium focus:outline-none"
                        title={stock.name}
                    >
                        <span className="mr-2 opacity-90 font-semibold">{stock.ticker}</span>
                        <span className="mr-3 text-xs bg-white/20 px-2 py-0.5 rounded">{stock.priceLabel ?? (stock.price ? `$${Number(stock.price).toFixed(2)}` : 'N/A')}</span>
                        <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded ${stock.changePercent >= 0 ? 'bg-green-700/60 text-green-100' : 'bg-red-700/60 text-red-100'}`}>
                            {stock.changePercent >= 0 ? '▲' : '▼'} {Number(stock.changePercent || 0).toFixed(2)}%
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StockTicker;