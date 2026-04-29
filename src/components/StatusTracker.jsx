import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, MapPin, User, FileText, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from './Card';
import Button from './Button';

const STATUS_CONFIG = {
  'Submitted': { color: '#6b7280', icon: <FileText size={20} />, stepIndex: 0 },
  'Under Verification': { color: '#eab308', icon: <Clock size={20} />, stepIndex: 1 },
  'Approved': { color: '#10b981', icon: <CheckCircle2 size={20} />, stepIndex: 3 },
  'Rejected': { color: '#ef4444', icon: <AlertCircle size={20} />, stepIndex: -1 }
};

const steps = [
  { label: "Form Submitted", icon: <FileText size={20} /> },
  { label: "BLO Appointed", icon: <User size={20} /> },
  { label: "Field Verified", icon: <MapPin size={20} /> },
  { label: "EPIC Generated", icon: <CheckCircle2 size={20} /> }
];

const StatusTracker = () => {
  const [refId, setRefId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async () => {
    if (refId.length < 5) {
      setError("Please enter a valid Reference ID.");
      return;
    }
    
    setIsSearching(true);
    setError('');
    setTrackingInfo(null);

    try {
      // Fake delay for realism
      await new Promise(resolve => setTimeout(resolve, 1200));

      const { data, error: queryError } = await supabase
        .from('applications')
        .select('*')
        .eq('reference_id', refId.toUpperCase())
        .single();

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          setError("No application found with this Reference ID.");
        } else {
          throw queryError;
        }
      } else {
        setTrackingInfo(data);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const statusData = trackingInfo ? STATUS_CONFIG[trackingInfo.status] : null;

  return (
    <div className="status-tracker mt-4">
      <Card className="bg-gray-light mb-6">
        <h3 className="mb-2">Track Application Status</h3>
        <p className="text-sm text-muted mb-4">Enter the Reference ID you received after submitting Form 6.</p>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="e.g. OJA123456789"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', textTransform: 'uppercase' }}
          />
          <Button onClick={handleTrack} disabled={!refId || isSearching} icon={<Search size={18} />}>
            {isSearching ? '...' : 'Track'}
          </Button>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
      </Card>

      {trackingInfo && (
        <Card className="tracking-results animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ margin: 0, color: 'var(--primary-blue-dark)' }}>Reference ID</h4>
              <p style={{ fontWeight: 700, margin: '4px 0 0 0' }}>{trackingInfo.reference_id}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge" style={{ background: statusData?.color || '#000', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                {trackingInfo.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mb-6 flex-between">
            <div className="flex-center gap-2 text-muted">
              <Calendar size={14} />
              <span className="text-xs">Applied on: {new Date(trackingInfo.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex-center gap-2">
              <User size={14} className="text-muted" />
              <span className="text-xs font-bold">{trackingInfo.name}</span>
            </div>
          </div>

          {trackingInfo.status === 'Rejected' ? (
            <div className="p-4 text-center" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#ef4444' }}>Application Rejected</h4>
              <p className="text-xs text-muted">Please contact your local ERO for more details or re-apply with corrected documents.</p>
            </div>
          ) : (
            <div className="stepper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              {steps.map((step, index) => {
                const stepIdx = statusData?.stepIndex ?? 0;
                const isCompleted = index <= stepIdx;
                const isCurrent = index === stepIdx;
                
                return (
                  <div key={index} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, opacity: isCompleted ? 1 : 0.4 }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: isCompleted ? (isCurrent ? statusData?.color : 'var(--primary-blue)') : 'var(--bg-color)', 
                      color: isCompleted ? 'white' : 'var(--text-muted)',
                      border: `2px solid ${isCompleted ? (isCurrent ? statusData?.color : 'var(--primary-blue)') : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? `0 0 0 4px ${statusData?.color}33` : 'none'
                    }}>
                      {isCompleted ? <CheckCircle2 size={20} /> : step.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ margin: 0, color: isCurrent ? statusData?.color : 'inherit', fontSize: '0.9rem' }}>{step.label}</h4>
                      {isCurrent && <p className="text-xs text-muted mt-1">Current processing stage</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StatusTracker;
