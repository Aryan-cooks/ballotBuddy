import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, CheckCircle, XCircle, BrainCircuit, UploadCloud, FileText, History, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Tesseract from 'tesseract.js';
import './VerifyNews.css';

const VerifyNews = () => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('fact_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsExtractingText(true);
    setOcrProgress(0);
    setResult(null);

    Tesseract.recognize(
      file,
      'eng',
      { 
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.floor(m.progress * 100));
          }
        }
      }
    ).then(({ data: { text } }) => {
      setInputValue(text);
      setIsExtractingText(false);
    }).catch(err => {
      console.error(err);
      setIsExtractingText(false);
      alert('Failed to extract text from image.');
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Call AI Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('fact-check', {
        body: { text: inputValue }
      });

      if (functionError) throw functionError;

      const factCheckResult = data;

      // 2. Save to Database
      if (user) {
        const { error: dbError } = await supabase
          .from('fact_checks')
          .insert({
            user_id: user.id,
            input_text: inputValue,
            verdict: factCheckResult.verdict,
            confidence: factCheckResult.confidence,
            explanation: factCheckResult.explanation,
            keywords: factCheckResult.keywords
          });
        
        if (dbError) console.error('Error saving to DB:', dbError);
        fetchHistory(); // Refresh history
      }

      setResult(factCheckResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openFromHistory = (item) => {
    setResult({
      verdict: item.verdict,
      confidence: item.confidence,
      explanation: item.explanation,
      keywords: item.keywords
    });
    setInputValue(item.input_text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVerdictStyles = (verdict) => {
    switch (verdict) {
      case 'True':
        return { color: 'var(--success)', icon: <ShieldCheck size={20} />, bg: 'rgba(16, 185, 129, 0.1)' };
      case 'False':
        return { color: 'var(--error)', icon: <ShieldAlert size={20} />, bg: 'rgba(239, 68, 68, 0.1)' };
      case 'Misleading':
        return { color: 'var(--secondary-orange)', icon: <AlertTriangle size={20} />, bg: 'rgba(249, 115, 22, 0.1)' };
      default:
        return { color: 'var(--text-muted)', icon: <Info size={20} />, bg: 'rgba(100, 116, 139, 0.1)' };
    }
  };

  return (
    <div className="container mt-4 mb-20 animate-fade-in">
      <header className="mb-6">
        <div className="flex-start gap-3 mb-2">
          <div className="icon-badge bg-primary-light">
            <BrainCircuit size={24} color="var(--primary-blue)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>AI Fact Checker</h2>
        </div>
        <p className="text-muted">Analyze claims, news, or messages for factual accuracy.</p>
      </header>

      <div className="fact-check-grid">
        <div className="main-col">
          <Card className="input-card mb-6">
            <div 
              className={`upload-zone ${isExtractingText ? 'scanning' : ''}`}
              onClick={triggerFileInput}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              {isExtractingText ? (
                <div className="flex-center flex-column py-4">
                  <div className="spinner-border text-primary mb-3" />
                  <p className="font-bold">Scanning image... {ocrProgress}%</p>
                </div>
              ) : (
                <div className="flex-center flex-column py-4">
                  <UploadCloud size={32} className="text-muted mb-2" />
                  <p className="font-bold">Upload Screenshot</p>
                  <p className="text-xs text-muted">Auto-extract text from WhatsApp forwards</p>
                </div>
              )}
            </div>

            <div className="input-wrapper mt-4">
              <label className="text-xs font-bold text-muted mb-2 block uppercase tracking-wider">Claim Text</label>
              <textarea 
                className="fact-check-input"
                placeholder="Paste the claim or message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isAnalyzing || isExtractingText}
                rows={4}
              />
            </div>

            <Button 
              fullWidth 
              className="mt-4" 
              onClick={handleAnalyze} 
              disabled={!inputValue.trim() || isAnalyzing || isExtractingText}
              icon={isAnalyzing ? <RefreshCw className="spinning" size={18} /> : <Search size={18} />}
            >
              {isAnalyzing ? "AI Analyzing..." : "Verify Claim"}
            </Button>
          </Card>

          {result && (
            <Card className="result-card animate-slide-up" style={{ borderTop: `6px solid ${getVerdictStyles(result.verdict).color}` }}>
              <div className="result-header flex-between mb-4">
                <div 
                  className="verdict-badge" 
                  style={{ 
                    backgroundColor: getVerdictStyles(result.verdict).bg,
                    color: getVerdictStyles(result.verdict).color
                  }}
                >
                  {getVerdictStyles(result.verdict).icon}
                  <span className="font-bold uppercase tracking-widest text-xs ml-2">Verdict: {result.verdict}</span>
                </div>
                <div className="text-xs text-muted font-medium italic">
                  AI-generated result. Verify with official sources.
                </div>
              </div>

              <div className="confidence-section mb-6">
                <div className="flex-between mb-2">
                  <span className="text-sm font-bold">AI Confidence Level</span>
                  <span className="text-sm font-bold" style={{ color: getVerdictStyles(result.verdict).color }}>{result.confidence}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${result.confidence}%`, 
                      backgroundColor: getVerdictStyles(result.verdict).color 
                    }}
                  />
                </div>
              </div>

              <div className="explanation-section mb-6">
                <h4 className="text-sm font-bold mb-2">Detailed Explanation</h4>
                <p className="text-sm text-muted leading-relaxed">{result.explanation}</p>
              </div>

              {result.keywords && result.keywords.length > 0 && (
                <div className="keywords-section mb-6">
                  <h4 className="text-sm font-bold mb-2">Key Topics Analyzed</h4>
                  <div className="flex-start flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span key={i} className="keyword-chip">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => { setResult(null); setInputValue(''); }}
              >
                Check Another Claim
              </Button>
            </Card>
          )}
        </div>

        <div className="side-col">
          <Card className="history-card">
            <div className="flex-start gap-2 mb-4">
              <History size={18} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest m-0">Recent Checks</h3>
            </div>

            <div className="history-list">
              {isLoadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="history-skeleton mb-3 shimmer" />
                ))
              ) : history.length === 0 ? (
                <p className="text-xs text-muted text-center py-4 italic">No history found.</p>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="history-item"
                    onClick={() => openFromHistory(item)}
                  >
                    <div className="flex-between mb-1">
                      <span 
                        className="text-xs font-bold" 
                        style={{ color: getVerdictStyles(item.verdict).color }}
                      >
                        {item.verdict}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-truncate">{item.input_text}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="tips-card mt-6 bg-primary-light border-none">
            <h4 className="text-sm font-bold mb-2 flex-start gap-2">
              <Info size={16} className="text-primary" />
              Fact-Checking Tips
            </h4>
            <ul className="text-xs text-muted p-0 m-0" style={{ listStyle: 'none' }}>
              <li className="mb-2">✓ Look for official ECI sources.</li>
              <li className="mb-2">✓ Check the date of the message.</li>
              <li className="mb-2">✓ Beware of sensational language.</li>
              <li>✓ Reverse search images on Google.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyNews;

export default VerifyNews;
