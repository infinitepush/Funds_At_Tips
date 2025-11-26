import React, { useState, useEffect } from 'react';
import { fetchNews, fetchLatestNews, fetchBusinessNews, fetchList } from '../api';

const NewsCard = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <h3 className="font-bold text-indigo-600 dark:text-indigo-400">{article.headline}</h3>
        {article.short_description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{article.short_description}</p>}
    </a>
);

const ListItem = ({ item }) => (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <h3 className="font-bold">{item.title}</h3>
    </a>
);

const HomeView = () => {
    const [news, setNews] = useState([]);
    const [latestNews, setLatestNews] = useState([]);
    const [businessNews, setBusinessNews] = useState([]);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [newsData, latestNewsData, businessNewsData, listData] = await Promise.all([
                    fetchNews(),
                    fetchLatestNews(),
                    fetchBusinessNews(),
                    fetchList()
                ]);
                setNews(Array.isArray(newsData) ? newsData : []);
                setLatestNews(Array.isArray(latestNewsData) ? latestNewsData : []);
                setBusinessNews(Array.isArray(businessNewsData) ? businessNewsData : []);
                setList(Array.isArray(listData) ? listData : []);
            } catch (error) {
                console.error("Error fetching home view data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">Loading News...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Market News & Insights</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                
                {/* Latest News Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Latest News</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {latestNews.length > 0 ? latestNews.map((article, index) => <NewsCard key={index} article={article} />) : <p className="text-gray-500">No news available.</p>}
                    </div>
                </section>

                {/* Business News Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Business News</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {businessNews.length > 0 ? businessNews.map((article, index) => <NewsCard key={index} article={article} />) : <p className="text-gray-500">No news available.</p>}
                    </div>
                </section>

                {/* General News Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">News</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {news.length > 0 ? news.map((article, index) => <NewsCard key={index} article={article} />) : <p className="text-gray-500">No news available.</p>}
                    </div>
                </section>

                {/* List Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Market Lists</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {list.length > 0 ? list.map((item, index) => <ListItem key={index} item={item} />) : <p className="text-gray-500">No lists available.</p>}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default HomeView;