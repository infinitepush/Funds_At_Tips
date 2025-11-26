import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './common';
import { callGeminiApi } from '../api';

const GeminiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([
        { role: 'model', text: 'Hello! I am Wisbee, your financial assistant. How can I help you with your dashboard or market questions today?' }
    ]);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        const onResponse = (data) => {
            setHistory(prev => [...prev, { role: 'model', text: data.text, sources: data.sources }]);
            setIsLoading(false);
        };

        const onError = (errorMessage) => {
            setHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
            setIsLoading(false);
        };

        // Chatbot uses Google Search grounding by default
        await callGeminiApi(userMessage, onResponse, onError);
    };

    // Icon Paths
    const robotIconPath = <path d="M17 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2zM9 13v-2M15 13v-2M12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zM4 9h4M16 9h4M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>;
    const closeIconPath = <path d="M18 6L6 18M6 6l12 12"/>;

    return (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
            {/* Chat Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                title={isOpen ? "Close Chat" : "Open Chat"}
            >
                <Icon className="w-6 h-6" path={isOpen ? closeIconPath : robotIconPath} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-40 md:bottom-20 right-4 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 rounded-t-xl flex items-center">
                        <Icon className="w-5 h-5 mr-2 text-white fill-current" path={robotIconPath} />
                        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Chat with Wisbee</h3>
                    </div>

                    {/* Chat History */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {history.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${msg.role === 'user' 
                                    ? 'bg-indigo-500 text-white rounded-br-none' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                }`}>
                                    <p>{msg.text}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs opacity-70">
                                            <p className="font-semibold mb-1">Sources:</p>
                                            {msg.sources.slice(0, 3).map((source, i) => (
                                                <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block truncate hover:underline text-xs">
                                                    - {source.title}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <span className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        <span className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full delay-100"></span>
                                        <span className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a financial question..."
                                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-l-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className={`px-4 rounded-r-xl font-bold transition duration-300 flex items-center justify-center ${isLoading || !input.trim() 
                                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                                disabled={isLoading || !input.trim()}
                            >
                                <Icon className="w-5 h-5" path={<path d="M5 12l14-5M5 12l14 5M5 12h14"/>} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GeminiChatbot;