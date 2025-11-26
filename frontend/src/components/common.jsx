import React from 'react';

export const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {path}
    </svg>
);

export const ThemeToggle = ({ isDark, toggleDark }) => (
    <button
        onClick={toggleDark}
        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
        <Icon className="w-6 h-6" path={isDark ? 
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/> :
            <path d="M12 2a1 1 0 0 0 0 2M12 20a1 1 0 0 0 0 2M20 12a1 1 0 0 0 2 0M2 12a1 1 0 0 0 2 0M18.36 5.64a1 1 0 0 0 0 1.41M5.64 18.36a1 1 0 0 0 0-1.41M5.64 5.64a1 1 0 0 0 1.41 0M18.36 18.36a1 1 0 0 0 1.41 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0 10z"/>
        }/>
    </button>
);