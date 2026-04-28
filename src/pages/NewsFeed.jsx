import React, { useState } from 'react';
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
  const filters = ['All', 'Official', 'Fact Check', 'General'];

  const filteredNews = activeFilter === 'All' 
    ? mockNews 
    : mockNews.filter(news => news.category === activeFilter);

  return (
    <div className="news-feed-container animate-fade-in">
      <div className="container mt-4 pb-20">
        <div className="page-header mb-6">
          <div className="icon-wrapper bg-blue-light mb-3">
            <Newspaper size={28} color="var(--primary-blue)" />
          </div>
          <h1>Election News</h1>
          <p className="text-muted mt-2">Stay updated with official announcements, fact-checks, and general election news.</p>
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
          {filteredNews.map((news, index) => (
            <Card key={news.id} className="news-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="news-header">
                <span className={`news-category ${news.category.replace(/\s+/g, '-').toLowerCase()}`}>
                  {news.category}
                </span>
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
          ))}
          
          {filteredNews.length === 0 && (
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
