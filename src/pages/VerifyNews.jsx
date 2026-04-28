import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, CheckCircle, XCircle, BrainCircuit, UploadCloud, FileText } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Tesseract from 'tesseract.js';
import './VerifyNews.css';

const VerifyNews = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  const analysisSteps = [
    "Parsing input text and extracting key claims...",
    "Cross-referencing with verified news databases...",
    "Analyzing semantic tone for sensationalism...",
    "Calculating misinformation probability score..."
  ];

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

  const handleAnalyze = () => {
    if (!inputValue.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisStep(0);

    // Simulate AI processing steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < analysisSteps.length) {
        setAnalysisStep(step);
      } else {
        clearInterval(interval);
        // Generate simulated result based on input length/keywords (just for demo)
        const isLikelyFake = inputValue.toLowerCase().includes('urgent') || inputValue.toLowerCase().includes('secret') || inputValue.length < 50;
        
        setResult({
          score: isLikelyFake ? 85 : 12,
          verdict: isLikelyFake ? "High Risk of Misinformation" : "Likely Authentic",
          color: isLikelyFake ? "var(--error)" : "var(--success)",
          icon: isLikelyFake ? <AlertTriangle size={24} color="var(--error)" /> : <ShieldCheck size={24} color="var(--success)" />,
          details: [
            { label: "Source Reliability", value: isLikelyFake ? "Unknown/Suspicious" : "Verified Domain" },
            { label: "Emotional Tone", value: isLikelyFake ? "Highly Sensational" : "Neutral/Objective" },
            { label: "Factual Consistency", value: isLikelyFake ? "Conflicting reports found" : "Corroborated by multiple sources" }
          ]
        });
        setIsAnalyzing(false);
      }
    }, 1200); // 1.2s per step
  };

  return (
    <div className="container mt-4 mb-8 animate-slide-up">
      <header className="mb-6">
        <div className="flex-center gap-2">
          <BrainCircuit size={28} color="var(--primary-blue)" />
          <h2>AI Fact Checker</h2>
        </div>
        <p className="text-muted mt-2">Paste text or upload a screenshot of a WhatsApp forward to verify its authenticity.</p>
      </header>

      <Card className="input-card mb-6">
        {/* Upload Zone */}
        <div 
          onClick={triggerFileInput}
          style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', background: 'var(--bg-color)', transition: 'background 0.2s' }}
        >
          {isExtractingText ? (
            <div>
              <FileText size={32} color="var(--primary-blue)" className="mb-2" />
              <p className="text-sm font-bold text-primary">Scanning image... {ocrProgress}%</p>
            </div>
          ) : (
            <div>
              <UploadCloud size={32} color="var(--text-muted)" className="mb-2" />
              <p className="text-sm font-bold">Upload Screenshot</p>
              <p className="text-xs text-muted">Auto-extract text from images</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        <textarea 
          className="fact-check-input"
          placeholder="Or paste text here... e.g., 'BREAKING: Secret ballot rule changed!'"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isAnalyzing || isExtractingText}
          rows={4}
        />
        <Button 
          fullWidth 
          className="mt-4" 
          onClick={handleAnalyze} 
          disabled={!inputValue.trim() || isAnalyzing || isExtractingText}
          icon={<Search size={18} />}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </Card>

      {isAnalyzing && (
        <Card className="analysis-loading-card animate-pulse">
          <div className="flex-center flex-column">
            <BrainCircuit size={40} color="var(--primary-blue)" className="mb-4 rotating-icon" />
            <h3 className="text-primary mb-2">AI is working...</h3>
            <p className="text-sm text-muted text-center">{analysisSteps[analysisStep]}</p>
            <div className="progress-bar-container mt-4" style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 1s ease' }}
              />
            </div>
          </div>
        </Card>
      )}

      {result && !isAnalyzing && (
        <Card className="result-card animate-slide-up" style={{ borderTop: `4px solid ${result.color}` }}>
          <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {result.icon}
            <div>
              <h3 style={{ margin: 0, color: result.color }}>{result.verdict}</h3>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
                Misinformation Score: <span style={{ color: result.color }}>{result.score}%</span>
              </p>
            </div>
          </div>
          
          <div className="result-details">
            {result.details.map((detail, idx) => (
              <div key={idx} className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < result.details.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span className="text-sm text-muted">{detail.label}</span>
                <span className="text-sm font-bold" style={{ textAlign: 'right', maxWidth: '60%' }}>{detail.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3" style={{ background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>AI Note:</strong> This is a simulated analysis. Always verify important election information on the official Election Commission website.
          </div>
        </Card>
      )}
    </div>
  );
};

export default VerifyNews;
