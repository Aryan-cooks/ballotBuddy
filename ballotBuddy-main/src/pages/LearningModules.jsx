import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Lock, Unlock, ArrowRight, UserCheck, FileSignature, Box, MapPin, ShieldCheck, FileText, X, Cpu, RotateCcw, Circle, BatteryCharging, BluetoothOff, WifiOff, AlertTriangle, Trophy, Check, Settings, Fingerprint, Moon, Sun } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import MockSimulation from './MockSimulation';
import './LearningModules.css';

const LearningModules = () => {
  const navigate = useNavigate();
  const { modules, updateModuleProgress, unlockModule, resetProgress } = useProgress();
  const { darkMode, toggleDarkMode } = useTheme();

  const [selectedModule, setSelectedModule] = useState(null);
  
  // Track where the user is inside Module 2
  const [moduleTwoStep, setModuleTwoStep] = useState(() => {
    const savedStep = localStorage.getItem('moduleTwoStep');
    return savedStep ? parseInt(savedStep) : 0;
  });

  // Track where the user is inside Module 3
  const [moduleThreeStep, setModuleThreeStep] = useState(() => {
    const savedStep = localStorage.getItem('moduleThreeStep');
    return savedStep ? parseInt(savedStep) : 0;
  });

  // Mini-game states for Module 3
  const [agentVerified, setAgentVerified] = useState(false);
  const [vvpatVerified, setVvpatVerified] = useState(false);

  // Calculate overall progress based on individual module progress
  const overallProgress = Math.round(modules.reduce((acc, mod) => acc + mod.progress, 0) / modules.length);

  // Save steps whenever they change
  useEffect(() => {
    localStorage.setItem('moduleTwoStep', moduleTwoStep.toString());
    localStorage.setItem('moduleThreeStep', moduleThreeStep.toString());
  }, [moduleTwoStep, moduleThreeStep]);

  const advanceModuleTwo = () => {
    const nextStep = moduleTwoStep + 1;
    setModuleTwoStep(nextStep);
    
    // Update module 2 progress using context
    let newProgress = modules[1].progress;
    let newStatus = modules[1].status;
    
    if (nextStep === 1) newProgress = 60;
    if (nextStep === 2) newProgress = 90;
    
    if (nextStep >= 3) {
      newProgress = 100;
      newStatus = 'completed';
      
      // Also unlock Module 3 if it was locked
      setTimeout(() => {
        unlockModule(3);
        updateModuleProgress(3, 5, 'in-progress');
      }, 1000);
    }
    
    updateModuleProgress(2, newProgress, newStatus);

    if (nextStep >= 3) {
      setSelectedModule(null);
    }
  };

  const advanceModuleThree = () => {
    const nextStep = moduleThreeStep + 1;
    setModuleThreeStep(nextStep);
    
    let newProgress = modules[2].progress;
    let newStatus = modules[2].status;
    
    if (nextStep === 1) newProgress = 30;
    if (nextStep === 2) newProgress = 60;
    if (nextStep === 3) newProgress = 90;
    
    if (nextStep >= 4) {
      newProgress = 100;
      newStatus = 'completed';
    }
    
    updateModuleProgress(3, newProgress, newStatus);

    if (nextStep >= 4) {
      setSelectedModule(null);
    }
  };

  return (
    <>
    <div className="container mt-4 mb-8 animate-slide-up" style={{ position: 'relative' }}>
      <button 
        onClick={toggleDarkMode}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '20px', 
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
      <header className="mb-6 text-center">
        <h2>Your Journey</h2>
        <p className="text-muted">Master the election process</p>
        <div className="overall-progress mt-4">
          <div className="progress-label">
            <span className="text-sm font-semibold text-primary">Course Progress</span>
            <span className="text-sm font-semibold">{overallProgress}%</span>
          </div>
          <ProgressBar progress={overallProgress} color="var(--primary-blue)" height="12px" />
        </div>
      </header>

      <div className="module-timeline">
        {modules.map((mod, index) => (
          <div key={mod.id} className={`timeline-item ${mod.status}`}>
            <div className="timeline-connector">
              <div className="timeline-icon">
                {mod.status === 'completed' && <CheckCircle2 size={24} color="white" fill="var(--success)" />}
                {mod.status === 'in-progress' && <div className="active-dot"></div>}
                {mod.status === 'locked' && <Lock size={16} color="var(--text-muted)" />}
              </div>
              {index < modules.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <Card 
              variant={mod.status !== 'locked' ? 'interactive' : 'default'}
              className={`timeline-card ${mod.status === 'locked' ? 'opacity-75' : ''}`}
            >
              <div className="card-header-status">
                <span className="text-xs uppercase font-bold text-muted"><span className="notranslate">Module</span> {mod.id}</span>
                {mod.status === 'completed' && <span className="status-badge success">Done</span>}
                {mod.status === 'in-progress' && <span className="status-badge active">In Progress</span>}
              </div>
              <h3 className="mt-2 mb-1">{mod.title}</h3>
              <p className="text-sm text-muted mb-4">{mod.description}</p>
              
              {mod.status === 'in-progress' && (
                <div className="mb-4">
                  <ProgressBar progress={mod.progress} color="var(--secondary-orange)" />
                </div>
              )}
              
              {mod.status !== 'locked' && (
                <Button 
                  variant={mod.status === 'completed' ? 'outline' : 'primary'} 
                  size="sm" 
                  fullWidth
                  icon={mod.id === 2 && mod.status === 'completed' ? <Box size={16} /> : <ArrowRight size={16} />}
                  onClick={() => {
                    setSelectedModule(mod);
                    if (mod.id === 2 && mod.status === 'completed') {
                      setModuleTwoStep(2);
                    }
                  }}
                >
                  {mod.status === 'completed' ? (mod.id === 2 ? 'Simulate Booth' : 'Review') : 'Continue'}
                </Button>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>

      {/* Module 1 Content Modal */}
      {selectedModule && selectedModule.id === 1 && (
        <div className="modal-overlay animate-slide-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-color)', zIndex: 100, overflowY: 'auto', overscrollBehavior: 'none', padding: 'var(--space-4)', paddingBottom: '80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedModule(null)}
              style={{ position: 'absolute', top: 0, right: 0, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} color="var(--text-primary)" />
            </button>
            
            <h2 className="mb-2" style={{ color: 'var(--primary-blue-dark)', paddingRight: '40px' }}>Voter Registration in India</h2>
            <p className="text-muted mb-6">Registering to vote in India is a straightforward process that can be completed either online or offline. According to the Election Commission of India, any Indian citizen who is 18 years or older on the qualifying date (January 1st, April 1st, July 1st, or October 1st) is eligible.</p>
            
            <Card className="mb-6" style={{ borderLeft: '4px solid var(--success)' }}>
              <h3 className="mb-3" style={{ color: 'var(--success)' }}>🌐 Online Registration (Fastest)</h3>
              <p className="text-sm mb-3">You can register through the Voters' Service Portal or the Voter Helpline App.</p>
              <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li><strong>Sign Up:</strong> Create an account using your mobile number and email.</li>
                <li><strong>Select Form 6:</strong> This is the specific form for new voters.</li>
                <li><strong>Enter Details:</strong> Fill in your name, date of birth, and current address.</li>
                <li><strong>Upload Documents:</strong> You will need to upload digital copies (under 2MB) of:
                  <ul style={{ paddingLeft: '20px', marginTop: '4px', color: 'var(--text-muted)' }}>
                    <li>Passport-sized photo (White background).</li>
                    <li>Age Proof: (e.g., Aadhaar, PAN Card, Birth Certificate).</li>
                    <li>Address Proof: (e.g., Water/Electricity bill, Aadhaar, Bank Passbook).</li>
                  </ul>
                </li>
                <li><strong>Submit & Track:</strong> Once submitted, you will receive a Reference ID to track your application status.</li>
              </ul>
            </Card>

            <Card className="mb-6" style={{ borderLeft: '4px solid var(--secondary-orange)' }}>
              <h3 className="mb-3" style={{ color: 'var(--secondary-orange)' }}>🏢 Offline Registration</h3>
              <p className="text-sm mb-3">If you prefer a physical application:</p>
              <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li><strong>Visit the Office:</strong> Go to your nearest Electoral Registration Office (ERO) or contact your Booth Level Officer (BLO).</li>
                <li><strong>Submit Form 6:</strong> Fill out the paper Form 6 and attach self-attested photocopies of your documents.</li>
                <li><strong>Verification:</strong> A BLO may visit your home to verify your identity and residence.</li>
              </ul>
            </Card>

            <h3 className="mb-4">📋 Quick Checklist of Documents</h3>
            <div style={{ background: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: 'var(--gray-light)' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Proof Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Accepted Documents</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Age Proof</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Aadhaar Card, PAN Card, Driving License, Class X/XII Marksheet.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Address Proof</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Aadhaar, Current Passbook, Indian Passport, Gas/Water Bill (at least 1 year old).</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', fontWeight: 600 }}>Identity</td>
                    <td style={{ padding: '12px' }}>Passport-size color photograph (frontal view).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mb-3">📝 Key Forms for Other Needs</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              <li><strong>Form 6A:</strong> For Non-Resident Indians (NRIs).</li>
              <li><strong>Form 7:</strong> To delete a name from the list (e.g., due to death or relocation).</li>
              <li><strong>Form 8:</strong> To correct errors or update details like a change of address.</li>
            </ul>

            <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', borderLeft: '4px solid var(--primary-blue)', padding: '16px', borderRadius: '4px', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
              <strong style={{ color: 'var(--primary-blue)' }}>Note:</strong> Registration is entirely free. After approval, your Electoral Photo Identity Card (EPIC) will be delivered to your address, and you can also download a digital version called an e-EPIC through the portal.
            </div>

            <Button 
              fullWidth 
              onClick={() => {
                updateModuleProgress(1, 100, 'completed');
                unlockModule(2);
                setSelectedModule(null);
              }}
            >
              Continue to Next Module
            </Button>
            {/* Spacer to clear the bottom navigation bar */}
            <div style={{ height: '90px', width: '100%', flexShrink: 0 }}></div>
          </div>
        </div>
      )}

      {/* Module 2 Content Modal (Interactive Step-by-Step) */}
      {selectedModule && selectedModule.id === 2 && (
        <div className="modal-overlay animate-slide-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-color)', zIndex: 100, overflowY: 'auto', overscrollBehavior: 'none', padding: 'var(--space-4)', paddingBottom: '80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSelectedModule(null)}
              style={{ position: 'absolute', top: 0, right: 0, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={20} color="var(--text-primary)" />
            </button>
            
            <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
              <span className="text-xs uppercase font-bold text-primary mb-1" style={{ display: 'block' }}>Step {moduleTwoStep + 1} of 3</span>
              <h2 style={{ color: 'var(--primary-blue-dark)', margin: 0 }}>The Polling Booth</h2>
            </div>
            
            <div style={{ flex: 1 }}>
              {moduleTwoStep === 0 && (
                <div className="animate-slide-up">
                  <div style={{ background: '#e0e7ff', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <UserCheck size={80} color="var(--primary-blue)" />
                  </div>
                  <h3>1. Officer Verification</h3>
                  <p className="text-muted mt-2 mb-4" style={{ lineHeight: 1.6 }}>First, you will present your Voter ID (EPIC) or another valid photo ID to the First Polling Officer. They will read your name aloud to verify it against the Electoral Roll.</p>
                  <Card className="bg-gray-light" style={{ border: 'none' }}>
                    <p className="text-sm font-semibold mb-1">Did you know?</p>
                    <p className="text-xs text-muted">Polling agents from political parties are present to cross-check identities and ensure fair voting.</p>
                  </Card>
                </div>
              )}

              {moduleTwoStep === 1 && (
                <div className="animate-slide-up">
                  <div style={{ background: '#ffedd5', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <FileSignature size={80} color="var(--secondary-orange)" />
                  </div>
                  <h3>2. Signature & Inking</h3>
                  <p className="text-muted mt-2 mb-4" style={{ lineHeight: 1.6 }}>The Second Polling Officer will ink your left forefinger, ask you to sign the register (Form 17A), and hand you a small slip.</p>
                  <Card className="bg-gray-light" style={{ border: 'none' }}>
                    <p className="text-sm font-semibold mb-1">Indelible Ink</p>
                    <p className="text-xs text-muted">The ink contains silver nitrate, which reacts to sunlight to leave a mark that lasts for weeks, preventing double voting.</p>
                  </Card>
                </div>
              )}

              {moduleTwoStep === 2 && (
                <div className="animate-slide-up" style={{ margin: '0 -16px' }}>
                  <MockSimulation embedded={true} onComplete={() => advanceModuleTwo()} />
                </div>
              )}
            </div>

            {moduleTwoStep !== 2 && (
              <div style={{ marginTop: '32px' }}>
                <ProgressBar progress={(moduleTwoStep / 2) * 100} color="var(--primary-blue)" height="8px" className="mb-4" />
                <Button 
                  fullWidth 
                  icon={<ArrowRight size={18} />} 
                  onClick={advanceModuleTwo}
                >
                  Next Step
                </Button>
              </div>
            )}
            {/* Spacer to clear the bottom navigation bar */}
            <div style={{ height: '90px', width: '100%', flexShrink: 0 }}></div>
          </div>
        </div>
      )}

      {/* Module 3 Content Modal (How Votes Are Counted) */}
      {selectedModule && selectedModule.id === 3 && (
        <div className="modal-overlay animate-slide-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-color)', zIndex: 100, overflowY: 'auto', overscrollBehavior: 'none', padding: 'var(--space-4)', paddingBottom: '80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSelectedModule(null)}
              style={{ position: 'absolute', top: 0, right: 0, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={20} color="var(--text-primary)" />
            </button>
            
            <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
              <span className="text-xs uppercase font-bold text-primary mb-1" style={{ display: 'block' }}>Step {moduleThreeStep + 1} of 4</span>
              <h2 style={{ color: 'var(--primary-blue-dark)', margin: 0 }}>How Votes Are Counted</h2>
            </div>
            
            <div style={{ flex: 1 }}>
              {moduleThreeStep === 0 && (
                <div className="animate-slide-up">
                  <h3>1. Anatomy of the Count</h3>
                  <p className="text-muted mt-2 mb-4" style={{ lineHeight: 1.6 }}>What exactly is being counted? The Electronic Voting Machine (EVM) system consists of three main parts.</p>
                  
                  <div className="anatomy-diagram mb-6" style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '8px' }}><Box size={24} color="var(--primary-blue)" /></div>
                      <div>
                        <h4 style={{ margin: 0 }}>Balloting Unit (BU)</h4>
                        <p className="text-xs text-muted">Where you press the button.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0', zIndex: 1 }}>
                      <ArrowRight size={20} color="var(--border-color)" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px' }}><FileText size={24} color="var(--success)" /></div>
                      <div>
                        <h4 style={{ margin: 0 }}>VVPAT</h4>
                        <p className="text-xs text-muted">Prints the verification slip.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0', zIndex: 1 }}>
                      <ArrowRight size={20} color="var(--border-color)" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '12px', borderRadius: '8px' }}><Cpu size={24} color="var(--secondary-orange)" /></div>
                      <div>
                        <h4 style={{ margin: 0 }}>Control Unit (CU)</h4>
                        <p className="text-xs text-muted">The "brain" that stores the final tally. This is what is opened on Counting Day.</p>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-gray-light" style={{ border: 'none' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <Lock size={20} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p className="text-sm font-semibold mb-1">Pink Paper Seals</p>
                        <p className="text-xs text-muted">Before the CU is transported, it is sealed with a special Pink Paper Seal bearing the signatures of the polling agents.</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {moduleThreeStep === 1 && (
                <div className="animate-slide-up">
                  <h3>2. The Counting Timeline</h3>
                  <p className="text-muted mt-2 mb-6" style={{ lineHeight: 1.6 }}>The process is designed for maximum transparency and security.</p>
                  
                  <div className="timeline-container" style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                    
                    {[
                      { title: "Strongroom Transport", desc: "EVMs are moved to strongrooms guarded 24/7 by central paramilitary forces." },
                      { title: "Opening the Seals", desc: "Strongrooms are opened only in the presence of candidates or their authorized agents." },
                      { title: "Result Button Press", desc: "The 'Result' button on the Control Unit is pressed. It immediately displays the total votes per candidate." },
                      { title: "Mandatory VVPAT Check", desc: "Paper slips from 5 randomly selected polling stations per assembly constituency are manually counted to verify the EVM tally." }
                    ].map((step, idx) => (
                      <div key={idx} style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
                        <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-blue)', border: '3px solid var(--bg-color)' }}></div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{step.title}</h4>
                        <p className="text-xs text-muted mt-1">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {moduleThreeStep === 2 && (
                <div className="animate-slide-up">
                  <h3>3. Interactive Transparency</h3>
                  <p className="text-muted mt-2 mb-4" style={{ lineHeight: 1.6 }}>Experience the verification processes performed by counting agents.</p>
                  
                  {/* Mini-Game 1: Agent Simulator */}
                  <Card className="mb-4" style={{ border: agentVerified ? '2px solid var(--success)' : '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Agent Simulator</h4>
                      {agentVerified && <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>VERIFIED</span>}
                    </div>
                    <p className="text-xs text-muted mb-4">You are a Counting Agent. Inspect the Control Unit seal before it is opened.</p>
                    <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                      <Lock size={32} color={agentVerified ? "var(--success)" : "var(--text-muted)"} />
                      <p className="text-sm font-mono" style={{ background: 'var(--surface-color)', margin: 0, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>SEAL ID: IND-77X92</p>
                    </div>
                    <Button 
                      fullWidth 
                      variant={agentVerified ? "outline" : "primary"}
                      onClick={() => setAgentVerified(true)}
                      disabled={agentVerified}
                      icon={<ShieldCheck size={16} />}
                    >
                      {agentVerified ? "Seal Intact" : "Verify Seal is Intact"}
                    </Button>
                  </Card>

                  {/* Mini-Game 2: VVPAT Match */}
                  <Card style={{ border: vvpatVerified ? '2px solid var(--success)' : '1px solid var(--border-color)', opacity: agentVerified ? 1 : 0.5, pointerEvents: agentVerified ? 'auto' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>VVPAT Match Game</h4>
                      {vvpatVerified && <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>MATCHED</span>}
                    </div>
                    <p className="text-xs text-muted mb-4">Compare the digital tally with the manual paper slip count.</p>
                    
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, background: 'var(--primary-blue-dark)', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        <p className="text-xs text-white-muted mb-1">EVM Digital Tally</p>
                        <h3 style={{ margin: 0, color: '#38bdf8' }}>450</h3>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(217, 119, 6, 0.15)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--warning)' }}>
                        <p className="text-xs mb-1">VVPAT Slips Counted</p>
                        <h3 style={{ margin: 0 }}>{vvpatVerified ? '450' : '???'}</h3>
                      </div>
                    </div>
                    
                    <Button 
                      fullWidth 
                      variant={vvpatVerified ? "outline" : "primary"}
                      onClick={() => setVvpatVerified(true)}
                      disabled={vvpatVerified}
                      icon={<CheckCircle2 size={16} />}
                    >
                      {vvpatVerified ? "Match Confirmed!" : "Count Slips & Match"}
                    </Button>
                  </Card>
                </div>
              )}

              {moduleThreeStep === 3 && (
                <div className="animate-slide-up">
                  <h3>4. Myth-Busting</h3>
                  <p className="text-muted mt-2 mb-4" style={{ lineHeight: 1.6 }}>Clearing up common misconceptions about the EVM system.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Card style={{ borderLeft: '4px solid var(--secondary-orange)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <BluetoothOff size={24} color="var(--secondary-orange)" style={{ flexShrink: 0 }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Can EVMs be hacked wirelessly?</h4>
                          <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}><strong>No.</strong> EVMs are standalone machines. They have no internet, Bluetooth, Wi-Fi, or USB connectivity, making remote hacking physically impossible.</p>
                        </div>
                      </div>
                    </Card>

                    <Card style={{ borderLeft: '4px solid var(--primary-blue)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <BatteryCharging size={24} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>What if the power goes out?</h4>
                          <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>EVMs do not rely on local electricity. They run on specially designed, sealed alkaline batteries, ensuring voting continues uninterrupted during power cuts.</p>
                        </div>
                      </div>
                    </Card>

                    <Card style={{ borderLeft: '4px solid var(--success)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <ShieldCheck size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Are the microchips secure?</h4>
                          <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>The software is burnt into a One Time Programmable (OTP) chip. Once programmed, the code cannot be altered, read, or rewritten.</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '32px' }}>
              <ProgressBar progress={(moduleThreeStep / 3) * 100} color="var(--primary-blue)" height="8px" className="mb-4" />
              <Button 
                fullWidth 
                icon={moduleThreeStep === 3 ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />} 
                onClick={advanceModuleThree}
                disabled={moduleThreeStep === 2 && (!agentVerified || !vvpatVerified)}
              >
                {moduleThreeStep === 3 ? 'Complete Journey' : 'Next Step'}
              </Button>
            </div>
            {/* Spacer to clear the bottom navigation bar */}
            <div style={{ height: '90px', width: '100%', flexShrink: 0 }}></div>
          </div>
        </div>
      )}

      {/* Completion Overlay */}
      {overallProgress === 100 && !selectedModule && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', animation: 'slideUpFade 0.3s ease-out' }}>
          <Card style={{ textAlign: 'center', padding: '40px 24px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-glow)', transform: 'scale(1)', animation: 'slideUpFade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--success-light)', padding: '24px', borderRadius: '50%', boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' }}>
                <Trophy size={72} color="var(--success)" />
              </div>
            </div>
            <h1 className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>100% Ready!</h1>
            <p className="text-muted mb-6" style={{ fontSize: '1.05rem' }}>Democracy score maxed out. You are officially election-ready.</p>
            
            <div style={{ background: 'var(--bg-color)', padding: '16px 20px', borderRadius: '12px', textAlign: 'left', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Voting Basics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Election Process</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fact Checking</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                fullWidth 
                icon={<ArrowRight size={18} />}
                onClick={() => navigate('/news')}
              >
                Stay Updated
              </Button>
              <Button 
                fullWidth 
                variant="outline"
                onClick={() => {
                  resetProgress();
                  setModuleTwoStep(0);
                  setModuleThreeStep(0);
                }}
              >
                Retake Course
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default LearningModules;
