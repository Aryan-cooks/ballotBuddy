import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, Calendar, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import './NewsFeed.css';

const mockNews = [
  {
    id: 1,
    title: 'Election Commission Announces Final Dates for Upcoming State Assembly Elections',
    source: 'ECI Official Press Release',
    date: '2 Hours Ago',
    category: 'Official',
    readTime: '3 min read',
    summary: 'The Election Commission of India has officially released the schedule for the upcoming assembly elections. Polling will take place in three phases starting next month.',
    isOfficial: true,
  },
  {
    id: 2,
    title: 'Fact Check: Viral message claiming EVs can be hacked via Bluetooth is FALSE',
    source: 'BallotBuddy Fact Checkers',
    date: '5 Hours Ago',
    category: 'Fact Check',
    readTime: '4 min read',
    summary: 'A viral WhatsApp forward claims that EVMs can be manipulated using Bluetooth signals. The ECI has confirmed EVMs are standalone machines with no wireless communication capabilities.',
    isOfficial: false,
  },
  {
    id: 3,
    title: 'Voter Registration Drive Hits Record Numbers Among Youth',
    source: 'National Daily News',
    date: '1 Day Ago',
    category: 'General',
    readTime: '2 min read',
    summary: 'A surge in first-time voters has been recorded following the recent nationwide awareness campaigns. Over 5 million new voters aged 18-19 have registered.',
    isOfficial: false,
  },
  {
    id: 4,
    title: 'Understanding VVPAT: How the Paper Trail Ensures Transparency',
    source: 'Democracy Watch',
    date: '2 Days Ago',
    category: 'Education',
    readTime: '5 min read',
    summary: 'Voter Verifiable Paper Audit Trail (VVPAT) machines are attached to every EVM. Heres how they provide a physical paper record of your vote.',
    isOfficial: false,
  }
];

const NewsFeed = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const filters = ['All', 'Official', 'Fact Check', 'General'];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeFilter]);

  const filteredNews = activeFilter === 'All' 
    ? mockNews 
    : mockNews.filter(news => news.category === activeFilter);

  return (
    <div className="news-feed-container animate-fade-in">
      <div className="container mt-0 pb-20">
        <div className="page-header mb-4 mt-2">
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Election News</h1>
          <p className="text-muted mt-0">Stay updated with official announcements, fact-checks, and general election news.</p>
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
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="news-card skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-tag shimmer"></div>
                  <div className="skeleton-time shimmer"></div>
                </div>
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-title short shimmer"></div>
                <div className="skeleton-summary shimmer"></div>
                <div className="skeleton-summary shimmer"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-source shimmer"></div>
                  <div className="skeleton-read-time shimmer"></div>
                </div>
              </div>
            ))
          ) : (
            filteredNews.map((news, index) => (
              <Card key={news.id} className={`news-card animate-slide-up category-${news.category.replace(/\s+/g, '-').toLowerCase()}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="news-header">
                <div className={`news-tag tag-${news.category.replace(/\s+/g, '-').toLowerCase()}`}>
                  {news.category === 'Official' ? '🔵 Official Update' : 
                   news.category === 'Fact Check' ? '🔴 Fact Check' : 
                   news.category === 'Education' ? '🟠 Education' :
                   '⚪ General'}
                </div>
                <span className="news-time">
                  <Clock size={12} /> {news.date}
                </span>
              </div>
              
              <h3 className="news-title">{news.title}</h3>
              
              <p className="news-summary text-muted text-sm">{news.summary}</p>
              
              <div className="news-footer">
                <div className="news-source">
                  {news.isOfficial && <CheckCircle size={14} color="var(--primary-blue)" />}
                  <span className={news.isOfficial ? 'text-primary font-medium' : 'text-muted'}>{news.source}</span>
                </div>
                <div className="news-read-time text-xs text-muted">
                  {news.readTime}
                </div>
              </div>
            </Card>
          ))
          )}
          
          {!isLoading && filteredNews.length === 0 && (
            <div className="text-center p-8 text-muted">
              <p>No news found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
