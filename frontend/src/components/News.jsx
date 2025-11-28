import React, { useState, useEffect } from 'react';
import { fetchNews, fetchLatestNews, fetchBusinessNews } from '../api';

const News = () => {
  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newsData = await fetchNews();
        setNews(Array.isArray(newsData) ? newsData : [newsData]);

        const latestNewsData = await fetchLatestNews();
        setLatestNews(Array.isArray(latestNewsData) ? latestNewsData : [latestNewsData]);

        const businessNewsData = await fetchBusinessNews();
        setBusinessNews(Array.isArray(businessNewsData) ? businessNewsData : [businessNewsData]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">News</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">News</h1>
        <p className="text-red-500">Error fetching news: {error}</p>
        <p>The news service is currently unavailable. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">News</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-1">
          <h2 className="text-2xl font-bold mb-2">Top News</h2>
          <ul>
            {news.length > 0 && news[0]['Title:'] ? (
              news.map((item, index) => (
                <li key={index} className="mb-2">
                  <a href={item['Link:']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {item['Title:']}
                  </a>
                </li>
              ))
            ) : (
              <li>No top news available.</li>
            )}
          </ul>
        </div>

        <div className="col-span-1">
          <h2 className="text-2xl font-bold mb-2">Latest News</h2>
          <ul>
            {latestNews.length > 0 && latestNews[0]['Title:'] ? (
              latestNews.map((item, index) => (
                <li key={index} className="mb-2">
                  <a href={item['Link:']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {item['Title:']}
                  </a>
                </li>
              ))
            ) : (
              <li>No latest news available.</li>
            )}
          </ul>
        </div>

        <div className="col-span-1">
          <h2 className="text-2xl font-bold mb-2">Business News</h2>
          <ul>
            {businessNews.length > 0 && businessNews[0]['Title:'] ? (
              businessNews.map((item, index) => (
                <li key={index} className="mb-2">
                  <a href={item['Link:']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {item['Title:']}
                  </a>
                </li>
              ))
            ) : (
              <li>No business news available.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default News;