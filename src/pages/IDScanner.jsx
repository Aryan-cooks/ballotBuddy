import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, CheckCircle, Upload, X, ScanFace } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './IDScanner.css';

const IDScanner = ({ onScanSuccess, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
      if (mainContent) {
        mainContent.style.overflow = '';
      }
    };
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsScanning(true);
    setProgress(10);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(parseInt(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      // Simulate text extraction and database check
      const nameMatch = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/);
      const name = nameMatch ? nameMatch[0] : "Verified Citizen";
      
      setScanResult({ name, dob: "01/01/1990", isVerified: true });
    } catch (error) {
      console.error(error);
      setScanResult({ name: "Unknown", dob: "Unknown", isVerified: false });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="id-scanner-overlay animate-slide-up">
      <Card className="id-scanner-card">
        <button className="close-btn" onClick={onCancel}><X size={24} /></button>
        
        <header className="text-center mb-6 mt-4">
          <ScanFace size={40} color="var(--primary-blue)" className="mb-2" style={{ margin: '0 auto' }} />
          <h2>Identity Verification</h2>
          <p className="text-sm text-muted mt-2">Scan your ID card to pre-fill your voter registration details.</p>
        </header>

        {!imagePreview ? (
          <div className="upload-section">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }} 
            />
            <Button 
              fullWidth 
              onClick={() => fileInputRef.current.click()} 
              icon={<Camera size={20} />}
              className="mb-4"
            >
              Take Photo of ID
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              onClick={() => fileInputRef.current.click()} 
              icon={<Upload size={20} />}
            >
              Upload from Gallery
            </Button>
          </div>
        ) : (
          <div className="preview-section text-center">
            <img src={imagePreview} alt="ID Preview" className="id-preview-img mb-4" />
            
            {isScanning ? (
              <div className="scanning-state">
                <p className="mb-2 font-bold text-primary">Scanning Document with AI...</p>
                <div className="progress-bar-container" style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            ) : scanResult && (
              <div className="result-state animate-slide-up">
                {scanResult.isVerified ? (
                  <>
                    <CheckCircle size={40} color="var(--success)" className="mb-2" style={{ margin: '0 auto' }} />
                    <h3 className="text-success mb-4">Verification Successful</h3>
                    <div className="extracted-data text-left p-3 mb-4" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <p><strong>Name:</strong> {scanResult.name}</p>
                      <p className="text-xs text-muted mt-2">Checked against Electoral Roll Simulator</p>
                    </div>
                    <Button fullWidth onClick={onScanSuccess}>Continue Registration</Button>
                  </>
                ) : (
                  <>
                    <X size={40} color="var(--error)" className="mb-2" style={{ margin: '0 auto' }} />
                    <h3 className="text-error mb-4">Scan Failed</h3>
                    <Button fullWidth onClick={() => { setImagePreview(null); setScanResult(null); }}>Try Again</Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default IDScanner;
