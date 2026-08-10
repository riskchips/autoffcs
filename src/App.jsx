import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, ArrowLeft, ArrowRight, Code2, Briefcase, ExternalLink, Moon, Sun } from 'lucide-react';
import { parseFFCSText } from './utils/parser';
import './index.css';

function App() {
  const [rawData, setRawData] = useState('');
  const [theoryPref, setTheoryPref] = useState('morning');
  const [status, setStatus] = useState({ text: '', type: '' });
  const [timetables, setTimetables] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (!rawData || rawData.trim() === '') {
      setStatus({ text: 'Please paste your VTOP data first.', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ text: 'Parsing data...', type: 'loading' });
      
      const payload = parseFFCSText(rawData);
      payload.preferences.theory = theoryPref;

      if (payload.courses.length === 0) {
        setStatus({ text: 'Could not detect any courses. Make sure to copy the exact format from VTOP.', type: 'error' });
        setIsLoading(false);
        return;
      }

      setStatus({ text: `Found ${payload.courses.length} courses. Generating...`, type: 'loading' });

      const response = await fetch('/api/v1/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait 1 minute.");
        throw new Error("Server error occurred while generating.");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error || "Failed to generate.");
      }

      if (!data.generated_timetables || data.generated_timetables.length === 0) {
        setStatus({ text: 'No valid clash-free timetables could be generated for these constraints.', type: 'error' });
        setIsLoading(false);
        return;
      }

      setTimetables(data.generated_timetables);
      setCurrentIndex(0);
      setStatus({ text: `Successfully generated ${data.generated_timetables.length} timetables!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setStatus({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentTimetable = timetables[currentIndex];

  // Map slots to rendered cells
  const getCellData = (slotNamesArr) => {
    if (!currentTimetable) return null;
    
    // Check if any course allocation matches these slots
    let matchedAlloc = null;
    let matchedCourse = null;
    let colorIndex = 0;
    
    for (let i = 0; i < currentTimetable.courses.length; i++) {
      const course = currentTimetable.courses[i];
      if (course.dropped) continue;
      
      for (let j = 0; j < course.allocations.length; j++) {
        const alloc = course.allocations[j];
        // If the cell's slot list intersects with the allocation's slot list
        if (slotNamesArr.some(s => alloc.slot.includes(s))) {
          matchedAlloc = alloc;
          matchedCourse = course;
          colorIndex = i;
          break;
        }
      }
      if (matchedAlloc) break;
    }

    if (matchedAlloc) {
      const fac = matchedCourse.bundle_faculty === "MIXED" ? matchedAlloc.faculty : matchedCourse.bundle_faculty;
      return {
        isFilled: true,
        courseCode: matchedCourse.course_code,
        venue: matchedAlloc.venue,
        faculty: fac,
        type: matchedAlloc.course_type,
        colorClass: `color-${colorIndex % 8}`
      };
    }

    return { isFilled: false };
  };

  const renderCell = (slots) => {
    const data = getCellData(slots);
    
    return (
      <td className={`slot-cell ${data.isFilled ? `slot-filled ${data.colorClass}` : ''}`}>
        <span className="slot-name">{slots.join(' / ')}</span>
        <AnimatePresence mode="wait">
          {data.isFilled && (
            <motion.div 
              key={data.courseCode + data.type}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>[{data.type}]</span>
              <span style={{ fontWeight: 800 }}>{data.courseCode}</span>
              <span style={{ fontSize: '0.7rem', color: '#ffeb3b', background: '#111', padding: '0 4px', width: 'fit-content', alignSelf: 'center' }}>
                {data.venue}
              </span>
              <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>{data.faculty}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem', maxWidth: '1800px', margin: '0 auto', gap: '2rem' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '4px solid #111', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>AUTOFFCS</h1>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginTop: '0.5rem' }}>
             TIMETABLE GENERATOR
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>MADE BY ARNAB</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="brutal-button" style={{ padding: '0.5rem', fontSize: '0.9rem', background: isDarkMode ? '#fff' : '#111', color: isDarkMode ? '#111' : '#fff' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} {isDarkMode ? 'LIGHT' : 'DARK'}
            </button>
            <a href="https://github.com/riskchips" target="_blank" rel="noreferrer" className="brutal-button" style={{ padding: '0.5rem', fontSize: '0.9rem', background: '#fff' }}>
              <Code2 size={20} color="#111" /> <span style={{ color: '#111' }}>GITHUB</span>
            </a>
            <a href="https://www.linkedin.com/in/arnabdasdev/" target="_blank" rel="noreferrer" className="brutal-button" style={{ padding: '0.5rem', fontSize: '0.9rem', background: '#2196f3', color: '#fff' }}>
              <Briefcase size={20} /> LINKEDIN
            </a>
            <a href="https://arnabdev.space" target="_blank" rel="noreferrer" className="brutal-button" style={{ padding: '0.5rem', fontSize: '0.9rem', background: '#ff5722', color: '#fff' }}>
              <ExternalLink size={20} /> PORTFOLIO
            </a>
          </div>
        </div>
      </header>

      <main className="layout-grid">
        
        {/* SIDEBAR */}
        <div className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="brutal-box">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings /> CONFIG
            </h2>
            
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>PASTE VTOP DATA</label>
            <textarea 
              className="brutal-input" 
              style={{ height: '300px', marginBottom: '1rem', resize: 'vertical' }}
              placeholder="SemesterFall Semester 2026-27..."
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
            
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>THEORY PREFERENCE</label>
            <select 
              className="brutal-input" 
              style={{ marginBottom: '1.5rem', cursor: 'pointer', appearance: 'none' }}
              value={theoryPref}
              onChange={(e) => setTheoryPref(e.target.value)}
            >
              <option value="morning">MORNING THEORY</option>
              <option value="evening">EVENING THEORY</option>
              <option value="mixed">MIXED (ANY)</option>
            </select>

            <motion.button 
              className="brutal-button" 
              style={{ width: '100%' }}
              onClick={handleGenerate}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play fill="currentColor" /> {isLoading ? 'GENERATING...' : 'GENERATE'}
            </motion.button>
          </div>

          {status.text && (
            <motion.div 
              className="brutal-box" 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: status.type === 'error' ? '#ffcdd2' : status.type === 'success' ? '#c8e6c9' : '#fff',
                fontWeight: 700
              }}
            >
              {status.text}
            </motion.div>
          )}
        </div>

        {/* TIMETABLE AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {timetables.length > 0 ? (
            <>
              <div className="brutal-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button className="brutal-button" onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} style={{ padding: '0.5rem' }}><ArrowLeft /></button>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>OPTION {currentIndex + 1} OF {timetables.length}</span>
                  <button className="brutal-button" onClick={() => setCurrentIndex(c => Math.min(timetables.length - 1, c + 1))} disabled={currentIndex === timetables.length - 1} style={{ padding: '0.5rem' }}><ArrowRight /></button>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', background: '#111', color: '#4caf50', padding: '0.5rem 1rem' }}>
                  SCORE: {currentTimetable.totalScore}
                </div>
              </div>

              <div className="timetable-wrapper">
                <table className="timetable">
                  <tr className="theory-header">
                    <th>THEORY (ETH)<br/>HOURS</th>
                    <th>8:00 AM<br/>to<br/>8:50 AM</th>
                    <th>9:00 AM<br/>to<br/>9:50 AM</th>
                    <th>10:00 AM<br/>to<br/>10:50 AM</th>
                    <th>11:00 AM<br/>to<br/>11:50 AM</th>
                    <th>12:00 PM<br/>to<br/>12:50 PM</th>
                    <th></th>
                    <th rowSpan="7" className="lunch-col">L<br/>U<br/>N<br/>C<br/>H</th>
                    <th>2:00 PM<br/>to<br/>2:50 PM</th>
                    <th>3:00 PM<br/>to<br/>3:50 PM</th>
                    <th>4:00 PM<br/>to<br/>4:50 PM</th>
                    <th>5:00 PM<br/>to<br/>5:50 PM</th>
                    <th>6:00 PM<br/>to<br/>6:50 PM</th>
                    <th>6:51 PM<br/>to<br/>7:00 PM</th>
                    <th>7:01 PM<br/>to<br/>7:50 PM</th>
                  </tr>
                  <tr className="lab-header">
                    <th>LAB (ELA)<br/>HOURS</th>
                    <th>08:00 AM<br/>to<br/>08:50 AM</th>
                    <th>08:51 AM<br/>to<br/>09:40 AM</th>
                    <th>09:51 AM<br/>to<br/>10:40 AM</th>
                    <th>10:41 AM<br/>to<br/>11:30 AM</th>
                    <th>11:40 AM<br/>to<br/>12:30 PM</th>
                    <th>12:31 PM<br/>to<br/>1:20 PM</th>
                    <th>2:00 PM<br/>to<br/>2:50 PM</th>
                    <th>2:51 PM<br/>to<br/>3:40 PM</th>
                    <th>3:51 PM<br/>to<br/>4:40 PM</th>
                    <th>4:41 PM<br/>to<br/>5:30 PM</th>
                    <th>5:40 PM<br/>to<br/>6:30 PM</th>
                    <th>6:31 PM<br/>to<br/>7:20 PM</th>
                    <th></th>
                  </tr>
                  <tr>
                    <td className="day-label">MON</td>
                    {renderCell(['A1', 'L1'])}
                    {renderCell(['F1', 'L2'])}
                    {renderCell(['D1', 'L3'])}
                    {renderCell(['TB1', 'L4'])}
                    {renderCell(['TG1', 'L5'])}
                    {renderCell(['L6'])}
                    {renderCell(['A2', 'L31'])}
                    {renderCell(['F2', 'L32'])}
                    {renderCell(['D2', 'L33'])}
                    {renderCell(['TB2', 'L34'])}
                    {renderCell(['TG2', 'L35'])}
                    {renderCell(['L36'])}
                    {renderCell(['V3'])}
                  </tr>
                  <tr>
                    <td className="day-label">TUE</td>
                    {renderCell(['B1', 'L7'])}
                    {renderCell(['G1', 'L8'])}
                    {renderCell(['E1', 'L9'])}
                    {renderCell(['TC1', 'L10'])}
                    {renderCell(['TAA1', 'L11'])}
                    {renderCell(['L12'])}
                    {renderCell(['B2', 'L37'])}
                    {renderCell(['G2', 'L38'])}
                    {renderCell(['E2', 'L39'])}
                    {renderCell(['TC2', 'L40'])}
                    {renderCell(['TAA2', 'L41'])}
                    {renderCell(['L42'])}
                    {renderCell(['V4'])}
                  </tr>
                  <tr>
                    <td className="day-label">WED</td>
                    {renderCell(['C1', 'L13'])}
                    {renderCell(['A1', 'L14'])}
                    {renderCell(['F1', 'L15'])}
                    {renderCell(['V1', 'L16'])}
                    {renderCell(['V2', 'L17'])}
                    {renderCell(['L18'])}
                    {renderCell(['C2', 'L43'])}
                    {renderCell(['A2', 'L44'])}
                    {renderCell(['F2', 'L45'])}
                    {renderCell(['TD2', 'L46'])}
                    {renderCell(['TBB2', 'L47'])}
                    {renderCell(['L48'])}
                    {renderCell(['V5'])}
                  </tr>
                  <tr>
                    <td className="day-label">THU</td>
                    {renderCell(['D1', 'L19'])}
                    {renderCell(['B1', 'L20'])}
                    {renderCell(['G1', 'L21'])}
                    {renderCell(['TE1', 'L22'])}
                    {renderCell(['TCC1', 'L23'])}
                    {renderCell(['L24'])}
                    {renderCell(['D2', 'L49'])}
                    {renderCell(['B2', 'L50'])}
                    {renderCell(['G2', 'L51'])}
                    {renderCell(['TE2', 'L52'])}
                    {renderCell(['TCC2', 'L53'])}
                    {renderCell(['L54'])}
                    {renderCell(['V6'])}
                  </tr>
                  <tr>
                    <td className="day-label">FRI</td>
                    {renderCell(['E1', 'L25'])}
                    {renderCell(['C1', 'L26'])}
                    {renderCell(['TA1', 'L27'])}
                    {renderCell(['TF1', 'L28'])}
                    {renderCell(['TD1', 'L29'])}
                    {renderCell(['L30'])}
                    {renderCell(['E2', 'L55'])}
                    {renderCell(['C2', 'L56'])}
                    {renderCell(['TA2', 'L57'])}
                    {renderCell(['TF2', 'L58'])}
                    {renderCell(['TDD2', 'L59'])}
                    {renderCell(['L60'])}
                    {renderCell(['V7'])}
                  </tr>
                </table>
              </div>
            </>
          ) : (
            <div className="brutal-box" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#eee' }}>
              <h2 style={{ fontSize: '2rem', opacity: 0.5 }}>NO DATA</h2>
              <p style={{ fontWeight: 600, opacity: 0.6 }}>Paste your courses and hit GENERATE to see the magic.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
