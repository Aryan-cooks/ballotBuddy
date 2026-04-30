import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Newspaper, ExternalLink, Clock, Calendar, CheckCircle, AlertCircle, RefreshCw, Info, Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import './NewsFeed.css';

const NewsFeed = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = ['All', 'Official', 'Fact Check', 'General'];

  const fetchNews = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('get-news');
      
      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);

      setNews(data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Unable to load latest news. Please check your connection or try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNews(true);
  };

  const getCategory = (article) => {
    const title = article.title.toLowerCase();
    const source = article.source.toLowerCase();
    
    // Official Keywords
    if (
      title.includes('eci') || title.includes('election commission') || 
      title.includes('pib') || title.includes('government') ||
      source.includes('eci') || source.includes('pib')
    ) {
      return 'Official';
    }
    
    // Fact Check Keywords
    if (
      title.includes('fake') || title.includes('fact check') || 
      title.includes('myth') || title.includes('false') || 
      title.includes('viral') || title.includes('debunk')
    ) {
      return 'Fact Check';
    }
    
    return 'General';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMins} mins ago`;
    }
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const processedNews = news.map(article => ({
    ...article,
    category: getCategory(article),
    timeAgo: getTimeAgo(article.publishedAt)
  }));

  const filteredNews = activeFilter === 'All' 
    ? processedNews 
    : processedNews.filter(n => n.category === activeFilter);

  return (
    <div className="news-feed-container animate-fade-in" style={{ position: 'relative' }}>
      <button 
        onClick={toggleDarkMode}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '36px', 
          height: '36px', 
          borderRadius: '50%', 
          background: darkMode ? 'var(--primary-blue)' : 'var(--surface-color)', 
          color: darkMode ? 'white' : 'var(--text-primary)', 
          border: '1px solid var(--border-color)', 
          cursor: 'pointer', 
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10
        }}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="container mt-0 pb-20">
        <div className="page-header mb-4 mt-2 flex-between">
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Election News</h1>
            <p className="text-muted mt-0">Real-time updates, official notices, and fact-checks.</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            disabled={isLoading}
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="news-filters mb-6">
          {filters.map(filter => (
            <button 
              key={filter}
              className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="news-list">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="news-card skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-tag shimmer"></div>
                  <div className="skeleton-time shimmer"></div>
                </div>
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-summary shimmer"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-source shimmer"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="error-state text-center p-8 bg-surface rounded-xl border">
              <AlertCircle size={40} className="text-error mb-3 mx-auto" />
              <p className="font-bold mb-1">Oops!</p>
              <p className="text-sm text-muted mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state text-center p-12">
              <Newspaper size={48} className="text-muted mb-4 mx-auto opacity-20" />
              <h3 className="text-muted">No news available</h3>
              <p className="text-sm text-muted mt-2">Check back later for fresh updates.</p>
            </div>
          ) : (
            filteredNews.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="news-card-link"
              >
                <Card className={`news-card animate-slide-up category-${article.category.toLowerCase().replace(' ', '-')}`} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="news-header">
                    <div className={`news-tag tag-${article.category.toLowerCase().replace(' ', '-')}`}>
                      {article.category === 'Official' ? '🔵 Official' : 
                       article.category === 'Fact Check' ? '🔴 Fact Check' : 
                       '⚪ General'}
                    </div>
                    <span className="news-time">
                      <Clock size={12} /> {article.timeAgo}
                    </span>
                  </div>
                  
                  <div className="news-content-layout">
                    {article.image && (
                      <div className="news-thumbnail-wrapper">
                        <img src={article.image} alt="" className="news-thumbnail" loading="lazy" />
                      </div>
                    )}
                    <div className="news-text">
                      <h3 className="news-title">{article.title}</h3>
                      <p className="news-summary text-muted text-sm">{article.description}</p>
                      
                      {article.title.split(' ').some(w => ['EVM', 'VVPAT', 'Supreme', 'Verdict'].includes(w)) && (
                        <span className="trending-badge">🔥 Trending</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="news-footer mt-3">
                    <div className="news-source">
                      {article.category === 'Official' && <CheckCircle size={14} color="var(--primary-blue)" />}
                      <span className={article.category === 'Official' ? 'text-primary font-medium' : 'text-muted'}>
                        {article.source}
                      </span>
                    </div>
                    <ExternalLink size={14} className="text-muted" />
                  </div>
                </Card>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
