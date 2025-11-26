import React from 'react';
import { Icon } from './common';

const TrendIndicator = ({ changePercent }) => {
    const isPositive = changePercent >= 0;
    const color = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const arrow = isPositive ? 
        <Icon className="w-4 h-4 mr-1 fill-current" path={<path d="M12 19V5M5 12l7-7 7 7"/>} /> : 
        <Icon className="w-4 h-4 mr-1 fill-current" path={<path d="M12 5v14M5 12l7 7 7-7"/>} />;

    return (
        <span className={`flex items-center font-bold ${color}`}>
            {arrow}
            {Math.abs(changePercent).toFixed(2)}%
        </span>
    );
};

export default TrendIndicator;