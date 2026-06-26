import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Sparkles, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseFFCSData, generateSchedule } from './utils/Parser';
import TimetableGrid from './components/TimetableGrid';
import './index.css';

function App() {
  const [rawText, setRawText] = useState('');
  const [preference, setPreference] = useState('morning_theory');
  const [schedules, setSchedules] = useState([]);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [unscheduledCourses, setUnscheduledCourses] = useState([]);
  const [ignorePreferenceFor, setIgnorePreferenceFor] = useState([]);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const timetableRef = useRef(null);

  const handleGenerate = () => {
    setError('');
    setIsGenerating(true);
    setUnscheduledCourses([]);
    
    setTimeout(() => {
      try {
        const courses = parseFFCSData(rawText);
        if (courses.length === 0) {
          setError('No valid courses found. Please paste valid FFCS course allocation data.');
          setIsGenerating(false);
          return;
        }

        const result = generateSchedule(courses, preference, ignorePreferenceFor);
        
        if (result.success) {
          setSchedules(result.schedules);
          setCurrentScheduleIndex(0);
        } else {
          setSchedules(result.schedules);
          setCurrentScheduleIndex(0);
          setUnscheduledCourses(result.unscheduledCourses);
        }
      } catch (err) {
        setError('An error occurred while parsing the data. Ensure the format matches FFCS.');
        console.error(err);
      }
      setIsGenerating(false);
    }, 500); 
  };

  const handleIgnorePreference = (courseTitle) => {
    setIgnorePreferenceFor(prev => [...prev, courseTitle]);
  };

  const handleClearIgnores = () => {
    setIgnorePreferenceFor([]);
  };

  const handleDownload = async () => {
    if (timetableRef.current) {
      const canvas = await html2canvas(timetableRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#1a1a2e',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'FFCS_Timetable.png';
      link.click();
    }
  };

  return (
    <div className="app-container">
      <div className="background-glow"></div>
      <header className="header">
        <h1>FFCS Timetable <span>Maker</span></h1>
        <h2 style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.8rem',
          fontWeight: '800',
          marginTop: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          ✨ PRETRAINED ON TEACHERS REVIEW ✨
        </h2>
        <p>Paste your course allocation data and let the magic happen.</p>
      </header>

      <main className="main-content">
        <div className="input-section glass-panel">
          <div className="control-group">
            <label>1. Paste FFCS Data Here:</label>
            <textarea
              placeholder="Paste text like 'Course List... BAHUM111... Slot Detail...'"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
            />
          </div>

          <div className="control-group">
            <label>2. Select Preference:</label>
            <div className="toggle-container">
              <button 
                className={`toggle-btn ${preference === 'morning_theory' ? 'active' : ''}`}
                onClick={() => { setPreference('morning_theory'); setIgnorePreferenceFor([]); }}
              >
                Morning Theory & Evening Lab
              </button>
              <button 
                className={`toggle-btn ${preference === 'morning_lab' ? 'active' : ''}`}
                onClick={() => { setPreference('morning_lab'); setIgnorePreferenceFor([]); }}
              >
                Morning Lab & Evening Theory
              </button>
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={!rawText.trim() || isGenerating}
          >
            {isGenerating ? 'Generating...' : (
              <>
                <Sparkles size={18} /> Generate Magic Timetable
              </>
            )}
          </button>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          {ignorePreferenceFor.length > 0 && (
            <div className="ignore-list">
              <p>Ignoring time preference for: {ignorePreferenceFor.map(c => c.split(' - ')[0]).join(', ')}</p>
              <button className="small-btn" onClick={handleClearIgnores}>Reset Rules</button>
            </div>
          )}
        </div>

        {unscheduledCourses.length > 0 && (
          <div className="clash-panel glass-panel">
            <div className="clash-header">
              <AlertCircle size={24} color="#ef4444" />
              <h2>Scheduling Conflicts Detected</h2>
            </div>
            <p>The following courses could not be scheduled due to 100% clashes with your time preference:</p>
            <div className="conflict-list">
              {unscheduledCourses.map((course) => (
                <div key={course} className="conflict-item">
                  <span className="conflict-title">{course}</span>
                  <div className="conflict-actions">
                    <button className="ignore-btn" onClick={() => handleIgnorePreference(course)}>
                      Ignore Time Rule for this Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="clash-hint">Click "Ignore Time Rule" above and then Generate again to let it find a slot in the opposite time block!</p>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="result-section glass-panel">
            <div className="result-header">
              <h2>Your Generated Timetable</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div className="schedule-navigator">
                  <button 
                    className="nav-btn" 
                    onClick={() => setCurrentScheduleIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentScheduleIndex === 0}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="nav-text">
                    Option {currentScheduleIndex + 1} of {schedules.length}
                  </span>
                  <button 
                    className="nav-btn" 
                    onClick={() => setCurrentScheduleIndex(prev => Math.min(schedules.length - 1, prev + 1))}
                    disabled={currentScheduleIndex === schedules.length - 1}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button className="download-btn" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw size={18} /> Regenerate
                </button>
                <button className="download-btn" onClick={handleDownload}>
                  <Download size={18} /> Download Image
                </button>
              </div>
            </div>
            
            <div className="timetable-wrapper-scroll">
               <TimetableGrid schedule={schedules[currentScheduleIndex]} targetRef={timetableRef} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
