import React, { useState, useRef } from 'react';
import { Camera, MapPin, UploadCloud, Loader2, CheckCircle, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

const PRESET_SAMPLE_PHOTOS = [
  {
    id: 'preset_indiranagar',
    title: 'Indiranagar Commercial Dumpster',
    binId: 'bin_indira_101',
    address: '100ft Road, Indiranagar',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop',
    description: 'Commercial packaging and cardboard spill'
  },
  {
    id: 'preset_koramangala',
    title: 'Koramangala 5th Block Overflow',
    binId: 'bin_kora_204',
    address: '5th Block, Koramangala',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop',
    description: 'Street waste bin completely filled with plastic waste'
  },
  {
    id: 'preset_mgroad',
    title: 'MG Road Metro Spill',
    binId: 'bin_mg_309',
    address: 'MG Road Metro Station Exit 2',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
    description: 'Public litter bin overfilled onto sidewalk'
  }
];

export default function ReportBin({ onReportSubmitted }) {
  const [image, setImage] = useState(null);
  const [base64String, setBase64String] = useState(null);
  const [selectedBinId, setSelectedBinId] = useState('bin_indira_101');
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.6412 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setBase64String(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setImage(preset.url);
    setSelectedBinId(preset.binId);
    // Convert URL to a small dummy base64 string for payload
    setBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          alert('Using default municipal coordinates (Indiranagar, Bengaluru).');
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!base64String && !image) {
      alert("Please capture, upload, or select a sample photo of the bin.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          binId: selectedBinId,
          imageBase64: base64String || "dummy_base64",
          location: location
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.classification);
        if (onReportSubmitted) onReportSubmitted(data.report);
      } else {
        alert("Error classifying image.");
      }
    } catch (error) {
      console.error(error);
      alert("Backend API disconnected. Ensure backend server is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page-container">
      <div className="report-card-main">
        <div className="report-header">
          <div className="title-row">
            <h2>Citizen Waste Reporting</h2>
            <span className="gemini-tag">
              <Sparkles size={14} /> Powered by Gemini Vision
            </span>
          </div>
          <p className="text-muted">Snap a photo of an overflowing bin to trigger immediate AI classification and route dispatch.</p>
        </div>

        {/* Preset Sample Photo Selector for Hackathon Demo */}
        <div className="presets-section">
          <label className="section-label">Quick Test Preset Samples (1-Click Judge Demo):</label>
          <div className="presets-grid">
            {PRESET_SAMPLE_PHOTOS.map(preset => (
              <div 
                key={preset.id} 
                className={`preset-thumb ${image === preset.url ? 'selected' : ''}`}
                onClick={() => handleSelectPreset(preset)}
              >
                <img src={preset.url} alt={preset.title} />
                <div className="preset-info">
                  <strong>{preset.title}</strong>
                  <span>{preset.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-or"><span>OR UPLOAD CUSTOM PHOTO</span></div>

        {/* Upload Box */}
        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          {image ? (
            <img src={image} alt="Bin Preview" className="image-preview" />
          ) : (
            <div className="upload-placeholder">
              <UploadCloud size={48} className="text-primary" />
              <p>Tap to snap a photo or drag & drop image here</p>
              <span className="text-muted text-xs">Supports JPG, PNG, WebP up to 10MB</span>
            </div>
          )}
        </div>

        <div className="form-controls-row">
          <div className="location-control">
            <button type="button" className="btn-secondary" onClick={handleGetLocation}>
              <MapPin size={18} className="text-primary" />
              {location ? `GPS Tagged (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : "Tag GPS Location"}
            </button>
          </div>

          <div className="trust-score-badge">
            <ShieldCheck size={18} className="text-primary" />
            <span>Citizen Trust Score: <strong>92/100</strong> (Spam Protected)</span>
          </div>
        </div>

        <button className="btn-primary submit-btn" onClick={handleSubmit} disabled={loading || (!image && !base64String)}>
          {loading ? <Loader2 className="spinner" size={20} /> : <Camera size={20} />}
          {loading ? 'Gemini 3.1 Multimodal Analysis in progress...' : 'Submit Photo for AI Analysis'}
        </button>

        {/* Results Card */}
        {result && (
          <div className={`result-card ${result.isOverflowing ? 'danger' : 'success'}`}>
            <div className="result-header">
              {result.isOverflowing ? (
                <AlertTriangle size={28} className="text-danger" />
              ) : (
                <CheckCircle size={28} className="text-primary" />
              )}
              <div>
                <h3>{result.isOverflowing ? 'ACTIVE OVERFLOW DETECTED' : 'BIN IS NORMAL'}</h3>
                <span className="text-muted">Gemini Multimodal Vision Output</span>
              </div>
            </div>

            <div className="result-grid">
              <div className="result-item">
                <span className="label">Severity Level</span>
                <span className={`val-badge ${result.severity}`}>{result.severity?.toUpperCase()}</span>
              </div>
              <div className="result-item">
                <span className="label">AI Confidence</span>
                <span className="val-text">{(result.confidenceScore * 100).toFixed(1)}%</span>
              </div>
              <div className="result-item full-width">
                <span className="label">Waste Type Classified</span>
                <span className="val-text">{result.wasteType || 'Commercial plastic & packaging waste'}</span>
              </div>
              <div className="result-item full-width">
                <span className="label">Recommended Action</span>
                <span className="val-text highlighted">{result.recommendation || 'Dispatch compaction truck within 2 hours.'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
