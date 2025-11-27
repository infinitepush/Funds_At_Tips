import React from 'react';
import { Icon, ThemeToggle } from './common';

export const MobileHeader = ({ isDark, toggleDark, setActiveView }) => (
    <header className="md:hidden sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center px-4 py-3">
            <h1
                className="text-2xl font-extrabold text-indigo-600 cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
                onClick={() => setActiveView('News')}
            >
                FundsAtTips
            </h1>
            <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
        </div>
    </header>
);

export const HeaderNav = ({ activeView, setActiveView, isDark, toggleDark, isUpdating, handleUpdate }) => {

    const navItems = [
        { name: 'News', view: 'News' },
        { name: 'Funds', view: 'Funds' },
        { name: 'Performance', view: 'Performance' },
        { name: 'Compare', view: 'Compare' },
    ];

    return (
        <header className="hidden md:block sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-5">
                <h1
                    className="text-4xl font-extrabold text-indigo-600 cursor-pointer"
                    style={{ fontFamily: 'var(--font-heading)' }}
                    onClick={() => setActiveView('News')}
                >
                    FundsAtTips
                </h1>
                <nav className="flex space-x-4">
                    {navItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveView(item.view)}
                            className={`font-semibold py-2 px-4 rounded-xl transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${activeView === item.view 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center space-x-4">
                    <button onClick={handleUpdate} disabled={isUpdating} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-blue-400 mr-2">
                        {isUpdating ? 'Updating...' : 'Update Data'}
                    </button>
                    <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
                </div>
            </div>
        </header>
    );
};

export const FooterNav = ({ activeView, setActiveView }) => {
    const navItems = [
        { name: 'News', icon: <path d="M3 3v18h18M18 17l-5-5-4 4-2-2M13 5h6v6"/>, view: 'News' },
        { name: 'Funds', icon: <path d="M2 13h4M18 13h4M7 3v18M17 3v18M10 8h4V5h-4zM10 19h4v-3h-4zM10 15h4v-2h-4z"/>, view: 'Funds' },
        { name: 'Analysis', icon: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.74 1.74M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.74-1.74"/>, view: 'Analysis' },
        { name: 'Compare', icon: <path d="M3 3v18h18M18 17l-5-5-4 4-2-2M13 5h6v6"/>, view: 'Compare' },
    ];

    return (
        <footer className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-20 shadow-2xl">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => setActiveView(item.view)}
                        className={`flex flex-col items-center p-2 transition duration-300 ${activeView === item.view ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                        <Icon className="w-5 h-5" path={item.icon} />
                        <span className="text-xs font-medium mt-1">{item.name}</span>
                    </button>
                ))}
            </div>
        </footer>
    );
};