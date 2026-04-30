import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, CheckCircle, Upload, X, ScanFace, AlertCircle, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import './IDScanner.css';

const IDScanner = ({ onScanSuccess, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [streamReady, setStreamReady] = useState(false); // triggers re-render when stream starts
  // useRef so the cleanup function always sees the live stream, not a stale closure
  const streamRef = useRef(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

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
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setStreamReady(false); // show initializing until stream is live
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStreamReady(true); // hide initializing, show video
    } catch (err) {
      console.error(err);
      setIsCameraOpen(false);
      setStreamReady(false);
      setError("Camera access denied. Please allow camera permissions or upload a file.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setImagePreview(url);
        setCapturedBlob(blob);
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const handleProcessImage = async (fileOrBlob) => {
    const isBlob = fileOrBlob instanceof Blob && !(fileOrBlob instanceof File);
    const file = isBlob ? new File([fileOrBlob], "id_capture.jpg", { type: "image/jpeg" }) : fileOrBlob;
    
    setIsScanning(true);
    setProgress(20);
    setError(null);

    try {
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('id-verifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      setProgress(50);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('id-verifications')
        .getPublicUrl(fileName);

      // 3. Call Edge Function
      setProgress(70);
      const { data, error: functionError } = await supabase.functions.invoke('verify-id', {
        body: { imageUrl: publicUrl }
      });

      if (functionError) throw functionError;
      setProgress(100);

      if (data.result === 'valid') {
        setScanResult({ 
          name: "Verified Citizen", 
          isVerified: true, 
          detectedType: data.detectedType,
          extractedText: data.extractedText 
        });
      } else {
        setScanResult({ 
          name: "Invalid ID", 
          isVerified: false,
          detectedType: data.detectedType,
          error: "Document could not be verified as a valid Government ID."
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Verification failed. Please try again.');
      setScanResult({ isVerified: false });
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Please upload an image under 5MB.');
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    handleProcessImage(file);
  };

  const modalContent = (
    <div className="id-scanner-overlay animate-slide-up">
      <Card className="id-scanner-card">
        <button className="close-btn" onClick={() => { stopCamera(); onCancel(); }}><X size={24} /></button>
        
        <div className="id-scanner-body">
          <header className="text-center mb-6 mt-4">
            <ScanFace size={40} color="var(--primary-blue)" className="mb-2" style={{ margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Identity Verification</h2>
            <p className="text-sm text-muted mt-2">Scan your ID card to pre-fill your voter registration details.</p>
          </header>

          {error && !isScanning && !scanResult && (
            <div className="error-state mb-6 text-center animate-shake">
              <AlertCircle size={32} color="var(--error)" className="mb-2" style={{ margin: '0 auto' }} />
              <p className="text-error-heavy" style={{ fontSize: '0.9rem' }}>{error}</p>
              {isCameraOpen && <Button variant="outline" size="sm" className="mt-2" onClick={stopCamera}>Back to Upload</Button>}
            </div>
          )}

          {!imagePreview && !isCameraOpen ? (
            <div className="upload-section">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }} 
              />
              <Button 
                fullWidth 
                onClick={startCamera} 
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
          ) : isCameraOpen ? (
            <div className="camera-section text-center">
              <div className="video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#000', marginBottom: '16px', width: '100%', minHeight: '200px', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                {!streamReady && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', position: 'absolute', inset: 0 }}>
                    <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', flexShrink: 0 }} />
                    <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap' }}>Initializing camera...</p>
                  </div>
                )}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: streamReady ? 'block' : 'none' }} 
                />
                {streamReady && (
                  <div className="camera-guide" style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', border: '2px dashed rgba(255, 255, 255, 0.5)', borderRadius: '8px', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', width: '80%' }}>
                      ALIGN ID WITHIN FRAME
                    </div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="camera-actions flex-center gap-4">
                <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                <Button onClick={capturePhoto}>Capture Photo</Button>
              </div>
            </div>
          ) : (
            <div className="preview-section text-center">
              <img src={imagePreview} alt="ID Preview" className="id-preview-img" />
              
              {isScanning ? (
                <div className="scanning-state">
                  <p className="mb-3 font-bold text-primary">Verifying with AI OCR...</p>
                  <div className="progress-bar-container" style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              ) : capturedBlob && !scanResult ? (
                <div className="capture-actions flex-center gap-4 mt-4">
                  <Button variant="outline" onClick={() => { setImagePreview(null); setCapturedBlob(null); setError(null); startCamera(); }}>Retake</Button>
                  <Button onClick={() => handleProcessImage(capturedBlob)}>Confirm &amp; Upload</Button>
                </div>
              ) : scanResult ? (
                <div className="result-state animate-slide-up">
                  {scanResult.isVerified ? (
                    <>
                      <CheckCircle size={40} color="var(--success)" className="mb-2" style={{ margin: '0 auto' }} />
                      <h3 className="text-success-heavy mb-2">Verification Successful</h3>
                      <div className="extracted-data text-left p-3 mb-4" style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <p style={{ fontSize: '0.9rem' }}><strong>Detected Type:</strong> {scanResult.detectedType}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Document validated against Government patterns.</p>
                      </div>
                      <Button fullWidth onClick={onScanSuccess}>Continue Registration</Button>
                    </>
                  ) : (
                    <>
                      <X size={40} color="var(--error)" className="mb-2" style={{ margin: '0 auto' }} />
                      <h3 className="text-error-heavy mb-2">Verification Failed</h3>
                      <div className="extracted-data text-left p-3 mb-4" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>{scanResult.error || "The uploaded document does not match a valid Government ID format."}</p>
                      </div>
                      <Button fullWidth onClick={() => { setImagePreview(null); setScanResult(null); setError(null); }}>Try Again</Button>
                    </>
                  )}
                  
                  <div className="mt-4 pt-4 border-top" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      type="button"
                      onClick={() => setShowDebug(!showDebug)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto', cursor: 'pointer' }}
                    >
                      <Terminal size={12} /> {showDebug ? 'Hide' : 'Show'} Extracted Text (Debug)
                    </button>
                    {showDebug && scanResult.extractedText && (
                      <div className="mt-2 p-3 text-left" style={{ background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: '0.7rem', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto', border: '1px solid #333' }}>
                        {scanResult.extractedText}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default IDScanner;
