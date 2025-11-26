import React from 'react';
import { Icon } from './common';

const AccountView = () => (
    <section className="p-4 md:p-8 space-y-8 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            {/* Poppins for main heading */}
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700" style={{ fontFamily: 'var(--font-heading)' }}>
                My FundsAtTips Account
            </h2>
            
            {/* Profile Image and Info */}
            <div className="flex items-center space-x-6 mb-8">
                {/* Simulated Google Photos Aesthetic */}
                <img 
                    src="https://placehold.co/80x80/e0e7ff/4338ca?text=User" 
                    alt="User Profile" 
                    className="w-20 h-20 rounded-full ring-4 ring-indigo-500/50"
                />
                <div>
                    {/* Poppins for name/main info */}
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>Alex Johnson</p>
                    <p className="text-gray-500 dark:text-gray-400">alex.j@FundsAtTips.com</p>
                </div>
            </div>
            
            {/* Settings Cards */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center">
                        <Icon className="w-6 h-6 mr-3 text-indigo-500" path={<path d="M10 12h.01M14 12h.01M18 12h.01M6 12h.01M2 12h.01M22 12h.01M3 21h18"/>} />
                        <span className="font-medium text-gray-800 dark:text-gray-200">Subscription Status</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-green-700 dark:text-green-100">Premium Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center">
                        <Icon className="w-6 h-6 mr-3 text-indigo-500" path={<path d="M12 2l-5 5h10M12 22l5-5h-10"/>} />
                        <span className="font-medium text-gray-800 dark:text-gray-200">Security & Privacy</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">Manage Settings</button>
                </div>
                
                <button className="w-full text-center bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition duration-300 shadow-lg mt-6">
                    Sign Out
                </button>
            </div>
        </div>
    </section>
);

export default AccountView;