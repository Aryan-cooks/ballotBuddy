import React, { useState, useEffect } from 'react';
import { Bell, Search, ExternalLink, Filter, RefreshCw, AlertTriangle, ShieldCheck, Newspaper, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './NewsFeed.css';

const NewsFeed = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNews = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      const mockNews = [
        { 
          id: 1, 
          title: "Voter Registration for 2026 General Elections Begins Next Month", 
          source: "Election Commission Official", 
          time: "2h ago", 
          category: "official",
          summary: "The ECI has announced the schedule for the 2026 electoral roll update. All citizens who turn 18 by January 1st are eligible.",
          url: "https://voters.eci.gov.in",
          image: "https://images.unsplash.com/photo-1540910419892-f0c179555e66?auto=format&fit=crop&w=400&q=80"
        },
        { 
          id: 2, 
          title: "Fact Check: Viral Message About 'Online Voting' is FALSE", 
          source: "FactCheck.org", 
          time: "5h ago", 
          category: "fact-check",
          summary: "A message circulating on WhatsApp claims voters can cast their vote via a mobile app. This is completely false. Voting remains in-person.",
          url: "#",
          image: "https://images.unsplash.com/photo-1589262804704-c5aa9e6db891?auto=format&fit=crop&w=400&q=80"
        },
        { 
          id: 3, 
          title: "New ID Card Security Features Explained", 
          source: "Civic Today", 
          time: "8h ago", 
          category: "general",
          summary: "The upcoming batch of EPIC cards will feature enhanced holographic elements and a cryptographically signed QR code.",
          url: "#",
          image: "https://images.unsplash.com/photo-1633158829585-23bb8f628e32?auto=format&fit=crop&w=400&q=80"
        }
      ];
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = activeFilter === 'all' 
    ? news 
    : news.filter(n => n.category === activeFilter);

  return (
    <div className="container mt-4 mb-20 animate-fade-in" style={{ position: 'relative' }}>
      <button 
        onClick={toggleDarkMode}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '50px', // Shifted left to avoid refresh button
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
      <header className="mb-6">
        <div className="flex-between mb-4">
          <div className="flex-start gap-2">
            <Newspaper size={24} className="text-primary" />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Voter News</h2>
          </div>
          <button className={`refresh-btn ${loading ? 'spinning' : ''}`} onClick={fetchNews} disabled={loading}>
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="news-filters">
          <button className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
          <button className={`filter-chip ${activeFilter === 'official' ? 'active' : ''}`} onClick={() => setActiveFilter('official')}>Official</button>
          <button className={`filter-chip ${activeFilter === 'fact-check' ? 'active' : ''}`} onClick={() => setActiveFilter('fact-check')}>Fact Checks</button>
        </div>
      </header>

      <div className="news-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="skeleton-card mb-4 shimmer">
              <div className="skeleton-header"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-summary"></div>
            </Card>
          ))
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
              <Card className={`news-card category-${item.category} animate-slide-up`}>
                <div className="news-content-layout">
                  <div className="news-text">
                    <div className="news-header">
                      <span className={`news-tag tag-${item.category}`}>
                        {item.category === 'official' && <ShieldCheck size={14} />}
                        {item.category === 'fact-check' && <AlertTriangle size={14} />}
                        {item.category.replace('-', ' ')}
                      </span>
                      <span className="news-time">{item.time}</span>
                    </div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-summary">{item.summary}</p>
                    <div className="news-footer">
                      <span className="news-source">{item.source}</span>
                      <ExternalLink size={14} className="text-muted" />
                    </div>
                  </div>
                  <div className="news-thumbnail-wrapper">
                    <img src={item.image} alt="" className="news-thumbnail" />
                  </div>
                </div>
              </Card>
            </a>
          ))
        ) : (
          <div className="text-center py-12">
            <Newspaper size={48} className="text-muted mb-4 mx-auto" style={{ opacity: 0.3 }} />
            <p className="text-muted">No news found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
