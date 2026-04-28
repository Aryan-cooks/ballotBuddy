import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, BatteryWarning, XOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useProgress } from '../context/ProgressContext';
import './MockSimulation.css';

const candidates = [
  { id: 1, name: 'Aarav Sharma', symbol: '🚲', party: 'Progress Party' },
  { id: 2, name: 'Priya Patel', symbol: '🌻', party: 'Green Future' },
  { id: 3, name: 'Vikram Singh', symbol: '🦁', party: 'National Voice' },
  { id: 4, name: 'NOTA', symbol: '❌', party: 'None of the Above' },
];

const MockSimulation = ({ embedded = false, onComplete = null }) => {
  const navigate = useNavigate();
  const { updateModuleProgress, unlockModule } = useProgress();

  const handleCompletionAndNavigate = (path) => {
    if (embedded && onComplete) {
      onComplete('success');
      return;
    }
    unlockModule(3);
    updateModuleProgress(3, 5, 'in-progress');
    navigate(path);
  };
  
  // States: instructions, voting, vvpat, success, error_battery, error_close
  const [step, setStep] = useState('instructions'); 
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isBeeping, setIsBeeping] = useState(false);
  
  // Toggles for educational errors
  const [isLowBattery, setIsLowBattery] = useState(false);

  const handleVote = (candidate) => {
    if (isBeeping || isLowBattery) return; 
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([150, 50, 150]); 
    }
    
    setSelectedCandidate(candidate);
    setIsBeeping(true);
    
    setTimeout(() => {
      setIsBeeping(false);
      setStep('vvpat');
    }, 1500);
  };

  const simulatePrematureClose = () => {
    setStep('error_close');
  };

  useEffect(() => {
    if (step === 'vvpat') {
      // 5-second VVPAT animation per user request (originally 7s per ECI guidelines)
      const timer = setTimeout(() => {
        setStep('success');
        updateModuleProgress(2, 100, 'completed'); // Mark module 2 completely done
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, updateModuleProgress]);

  return (
    <div className="simulation-container animate-slide-up">
      {step === 'instructions' && (
        <div className="container mt-4 pb-8">
          {!embedded && (
            <button className="back-button mb-4" onClick={() => navigate('/')}>
              <ArrowLeft size={20} /> Back
            </button>
          )}
          <div className="instruction-card">
            <h2>Virtual Polling Booth</h2>
            <p className="text-muted mt-2 mb-6">
              Experience the actual <span className="notranslate">EVM</span> and <span className="notranslate">VVPAT</span> process. 
            </p>
            <div className="steps-list mb-8">
              <div className="step-item">
                <div className="step-number">1</div>
                <p>Press the blue button next to your candidate.</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <p>Wait for the red light and the long beep.</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <p>Check the VVPAT window. The printed slip will be visible behind the glass for exactly 5 seconds before cutting and dropping.</p>
              </div>
            </div>
            <Button fullWidth onClick={() => setStep('voting')}>Enter Booth</Button>
            
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="mb-2 text-muted text-sm">Educational Malfunction Scenarios</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setIsLowBattery(!isLowBattery)}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: isLowBattery ? '#fee2e2' : 'var(--bg-color)', border: '1px solid #fca5a5', borderRadius: '4px', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <BatteryWarning size={14} /> {isLowBattery ? 'Fix Battery' : 'Simulate Low Battery'}
                </button>
                <button 
                  onClick={() => setStep('error_close')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'var(--bg-color)', border: '1px solid #fca5a5', borderRadius: '4px', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <XOctagon size={14} /> Officer Pressed Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'voting' && (
        <div className="evm-booth" style={{ flexDirection: 'column' }}>
          <div className="evm-machine" style={{ position: 'relative' }}>
            {isLowBattery && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '4px', textAlign: 'center', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', zIndex: 10 }}>
                <AlertTriangle size={12} /> BATTERY LOW - CALL PRESIDING OFFICER
              </div>
            )}
            <div className="evm-header" style={{ marginTop: isLowBattery ? '24px' : '0' }}>
              <h3>BALLOT UNIT</h3>
              <div className={`ready-light ${isLowBattery ? 'offline' : ''}`} style={isLowBattery ? { color: '#ef4444' } : {}}>
                {isLowBattery ? 'Error' : 'Ready'}
              </div>
            </div>
            <div className="evm-candidates">
              {candidates.map((c) => (
                <div key={c.id} className="evm-row">
                  <div className="evm-details">
                    <span className="candidate-serial">{c.id}</span>
                    <span className="candidate-name">{c.name}</span>
                    <span className="candidate-symbol">{c.symbol}</span>
                  </div>
                  <div className="evm-action">
                    <div className={`evm-light ${selectedCandidate?.id === c.id && isBeeping ? 'active' : ''}`}></div>
                    <button 
                      className="evm-button" 
                      onClick={() => handleVote(c)}
                      disabled={isBeeping || isLowBattery}
                      style={{ opacity: isLowBattery ? 0.5 : 1, cursor: isLowBattery ? 'not-allowed' : 'pointer' }}
                    ></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
             <button 
                onClick={simulatePrematureClose}
                style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'var(--text-muted)' }}
              >
                Troubleshoot: What if the machine stops?
              </button>
          </div>
        </div>
      )}

      {step === 'vvpat' && (
        <div className="vvpat-booth">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>VVPAT Machine</h3>
            <p className="text-white-muted text-sm mt-1" style={{ opacity: 0.8 }}>Verifying your vote... (5 seconds)</p>
          </div>
          <div className="vvpat-machine-casing">
            <div className="vvpat-glass-window">
              <div className="vvpat-slip printing-animation">
                <div className="slip-content">
                  <p className="slip-serial">S.No: {selectedCandidate?.id}</p>
                  <h4 className="slip-name">{selectedCandidate?.name}</h4>
                  <div className="slip-symbol">{selectedCandidate?.symbol}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="container mt-8 text-center success-screen">
          <div className="success-icon animate-bounce">
            <CheckCircle size={64} color="var(--success)" />
          </div>
          <h2 className="mt-4 mb-2">Vote Cast Successfully!</h2>
          <p className="text-muted mb-6">
            You verified your vote on the VVPAT. You have successfully completed the mock voting simulation.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
            <p className="text-sm" style={{ color: '#166534', margin: 0 }}><strong>Milestone Reached!</strong> Module 2 completed. Democracy Score updated.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {embedded ? (
              <Button fullWidth onClick={() => handleCompletionAndNavigate('/')}>Continue To Next Module</Button>
            ) : (
              <>
                <Button fullWidth onClick={() => handleCompletionAndNavigate('/modules')}>Continue To Next Module</Button>
                <Button fullWidth variant="outline" onClick={() => handleCompletionAndNavigate('/')}>Return To Dashboard</Button>
              </>
            )}
          </div>
        </div>
      )}

      {step === 'error_close' && (
        <div className="container mt-8 text-center">
          <div style={{ display: 'inline-flex', padding: '20px', background: '#fee2e2', borderRadius: '50%', marginBottom: '16px' }}>
            <XOctagon size={48} color="#ef4444" />
          </div>
          <h2 className="mb-2" style={{ color: '#b91c1c' }}>Voting Halted</h2>
          <p className="text-muted mb-6" style={{ textAlign: 'left' }}>
            The Presiding Officer has pressed the "Close" button on the Control Unit. The Ballot Unit is now disabled. 
            <br/><br/>
            <strong>Why does this happen?</strong> This is done at the end of the polling day to seal the machine. If this happens while you are voting, immediately alert the polling agents and the Presiding Officer as it is a procedural violation.
          </p>
          <Button fullWidth onClick={() => setStep('instructions')} variant="outline">Restart Simulation</Button>
        </div>
      )}
    </div>
  );
};

export default MockSimulation;
