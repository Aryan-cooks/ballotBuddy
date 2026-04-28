import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, MapPin, User, FileText } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const mockTrackingData = {
  "OJA123456789": {
    status: 2, // 0: Submitted, 1: BLO Appointed, 2: Verified, 3: EPIC Generated
    dateSubmitted: "12 Oct 2025",
    bloName: "Ramesh Kumar",
    bloPhone: "+91 98765 43210"
  },
  "EPIC98765432": {
    status: 3,
    dateSubmitted: "01 Sep 2025",
    epicNo: "XYZ1234567"
  }
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

  const handleTrack = () => {
    if (refId.length < 10) {
      setError("Please enter a valid Reference ID (min 10 characters).");
      return;
    }
    
    setIsSearching(true);
    setError('');
    setTrackingInfo(null);

    // Simulate API call
    setTimeout(() => {
      const data = mockTrackingData[refId.toUpperCase()];
      if (data) {
        setTrackingInfo(data);
      } else {
        // Mock a default "Submitted" response for any random ID to demonstrate functionality
        setTrackingInfo({
          status: 0,
          dateSubmitted: "Just now",
        });
      }
      setIsSearching(false);
    }, 800);
  };

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
              <p style={{ fontWeight: 700, margin: '4px 0 0 0' }}>{refId.toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge" style={{ background: trackingInfo.status === 3 ? 'var(--success)' : 'var(--secondary-orange)', color: 'white' }}>
                {trackingInfo.status === 3 ? 'APPROVED' : 'IN PROGRESS'}
              </span>
            </div>
          </div>

          <div className="stepper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
            
            {steps.map((step, index) => {
              const isCompleted = index <= trackingInfo.status;
              const isCurrent = index === trackingInfo.status;
              
              return (
                <div key={index} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, opacity: isCompleted ? 1 : 0.5 }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: isCompleted ? 'var(--primary-blue)' : 'var(--bg-color)', 
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    border: `2px solid ${isCompleted ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none'
                  }}>
                    {isCompleted ? <CheckCircle2 size={20} /> : step.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: 0, color: isCurrent ? 'var(--primary-blue)' : 'inherit' }}>{step.label}</h4>
                    {index === 0 && isCompleted && <p className="text-xs text-muted mt-1">Date: {trackingInfo.dateSubmitted}</p>}
                    {index === 1 && isCompleted && trackingInfo.bloName && (
                      <p className="text-xs mt-1" style={{ color: 'var(--primary-blue)' }}>Contact {trackingInfo.bloName}: {trackingInfo.bloPhone}</p>
                    )}
                    {index === 3 && isCompleted && trackingInfo.epicNo && (
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--success)' }}>EPIC No: {trackingInfo.epicNo}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatusTracker;
