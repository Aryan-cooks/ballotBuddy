import React, { useState } from 'react';
import { CheckSquare, Square, ExternalLink, FileText, MapPin, Camera, ScanFace, CheckCircle, Search, Send, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import IDScanner from './IDScanner';
import StatusTracker from '../components/StatusTracker';
import './RegistrationGuide.css';

const checklistItems = [
  { id: 'age', text: 'I am 18 years of age or older.', icon: <CheckSquare size={20} /> },
  { id: 'citizen', text: 'I am a citizen of this country.', icon: <CheckSquare size={20} /> },
  { id: 'photo', text: 'I have a passport-sized photograph.', icon: <Camera size={20} /> },
  { id: 'address', text: 'I have proof of address (Utility bill, Aadhaar, etc.).', icon: <MapPin size={20} /> },
];

const RegistrationGuide = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' or 'track'
  const [checkedItems, setCheckedItems] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [hasScannedID, setHasScannedID] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    
    // Generate Reference ID: OJA + 9 random digits
    const refId = `OJA${Math.floor(100000000 + Math.random() * 900000000)}`;
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert([
          { 
            reference_id: refId, 
            name: user?.user_metadata?.full_name || user?.email || 'Anonymous User',
            user_id: user?.id,
            status: 'Submitted'
          }
        ]);

      if (error) throw error;

      // Fake delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmissionResult(refId);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length + (hasScannedID ? 1 : 0);
  const totalItems = checklistItems.length + 1; // +1 for ID Scan
  const progress = (completedCount / totalItems) * 100;

  return (
    <div className="container mt-4 mb-8 animate-slide-up">
      <header className="mb-6">
        <h2>Registration & Tracking</h2>
        <p className="text-muted mt-2">Get your Voter ID or check your application.</p>
        
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface-color)', padding: '4px', borderRadius: '8px', marginTop: '16px' }}>
          <button 
            onClick={() => setActiveTab('guide')}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', background: activeTab === 'guide' ? 'var(--primary-blue)' : 'transparent', color: activeTab === 'guide' ? 'white' : 'var(--text-muted)', fontWeight: 600, border: 'none', transition: 'all 0.2s' }}
          >
            Apply (Form 6)
          </button>
          <button 
            onClick={() => setActiveTab('track')}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', background: activeTab === 'track' ? 'var(--primary-blue)' : 'transparent', color: activeTab === 'track' ? 'white' : 'var(--text-muted)', fontWeight: 600, border: 'none', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          >
            <Search size={16} /> Track Status
          </button>
        </div>
      </header>

      {activeTab === 'guide' ? (
        <>
          {showScanner && (
            <IDScanner 
              onScanSuccess={() => {
                setHasScannedID(true);
                setShowScanner(false);
              }}
              onCancel={() => setShowScanner(false)}
            />
          )}

          <div className="guide-steps">
            <section className="mb-8">
              <div className="step-header">
                <span className="step-badge">Step 1</span>
                <h3>Verify Identity (OCR)</h3>
              </div>
              <Card className="mt-4">
                {hasScannedID ? (
                  <div className="flex-center gap-2" style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                    <CheckCircle size={24} /> ID Verified Successfully!
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-muted">Use our AI-powered ID Scanner to automatically verify your eligibility against the electoral roll simulator.</p>
                    <Button 
                      fullWidth 
                      icon={<ScanFace size={18} />}
                      onClick={() => setShowScanner(true)}
                    >
                      Scan ID Card
                    </Button>
                  </>
                )}
              </Card>
            </section>

            <section className="mb-8">
              <div className="step-header">
                <span className="step-badge">Step 2</span>
                <h3>Check Eligibility & Docs</h3>
              </div>
              
              <Card className="checklist-card mt-4">
                <div className="mb-4">
                  <div className="flex-between mb-2">
                    <span className="text-sm font-bold">Preparation Progress</span>
                    <span className="text-sm font-bold text-primary">{completedCount}/{totalItems}</span>
                  </div>
                  <ProgressBar progress={progress} />
                </div>
                
                <div className="checklist">
                  {checklistItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`checklist-item ${checkedItems[item.id] ? 'checked' : ''}`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      <div className="checkbox-wrapper">
                        {checkedItems[item.id] ? (
                          <CheckSquare size={24} color="var(--success)" />
                        ) : (
                          <Square size={24} color="var(--text-muted)" />
                        )}
                      </div>
                      <div className="item-text-content">
                        <span className="item-text">{item.text}</span>
                        <span className="item-icon-wrapper text-muted">{item.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <section className="mb-8">
              <div className="step-header">
                <span className="step-badge">Step 3</span>
                <h3>Submit Application</h3>
              </div>
              <Card className="mt-4">
                {submissionResult ? (
                  <div className="text-center animate-slide-up">
                    <div className="mb-4" style={{ display: 'inline-flex', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                      <CheckCircle size={48} color="var(--success)" />
                    </div>
                    <h3 className="text-success mb-2">Application Submitted!</h3>
                    <p className="text-sm text-muted mb-4">Your mock application for Voter ID has been successfully recorded.</p>
                    
                    <div className="p-4 mb-4" style={{ background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="text-left">
                        <span className="text-xs text-muted">Reference ID</span>
                        <p className="font-bold text-lg">{submissionResult}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(submissionResult)}
                        style={{ padding: '8px', borderRadius: '8px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                      >
                        {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
                      </button>
                    </div>
                    
                    <Button fullWidth onClick={() => setActiveTab('track')}>
                      Track My Status
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-muted">Once you have completed all steps, submit your application to receive a reference ID for tracking.</p>
                    <Button 
                      fullWidth 
                      variant={progress === 100 ? 'primary' : 'outline'}
                      icon={isSubmitting ? null : <Send size={18} />}
                      disabled={progress < 100 || isSubmitting}
                      onClick={handleSubmitApplication}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    {progress < 100 && (
                      <p className="text-xs text-center text-muted mt-2">
                        Complete identity verification and all checklist items to submit.
                      </p>
                    )}
                  </>
                )}
              </Card>
            </section>
          </div>
        </>
      ) : (
        <StatusTracker />
      )}
    </div>
  );
};

export default RegistrationGuide;
