import React, { useState, useMemo, useDeferredValue, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Star, Building2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import vitFacultyData from '../vit-faculty.json';
import { getFacultyScore } from '../data/facultyRatings';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITEKEY || import.meta.env.TURNSTILE_SITEKEY;
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'; // Relative path works for both Vite proxy and Vercel

// Dependency-free Virtual List
const VirtualList = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef(null);
  
  // Reset scroll when items change (e.g. during search)
  useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [items]);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  
  const renderStartIndex = Math.max(0, startIndex - 2);
  const renderEndIndex = Math.min(items.length - 1, startIndex + visibleItemCount + 2);
  
  const visibleItems = [];
  for (let i = renderStartIndex; i <= renderEndIndex; i++) {
    if (items[i]) {
      visibleItems.push(
        <div key={i} style={{ position: 'absolute', top: i * itemHeight, width: '100%', height: itemHeight, padding: '0.25rem 0.5rem' }}>
          {renderItem(items[i], i)}
        </div>
      );
    }
  }
  
  return (
    <div 
      ref={scrollRef}
      style={{ height: containerHeight, width: '100%', overflowY: 'auto', position: 'relative' }} 
      onScroll={e => setScrollTop(e.target.scrollTop)}
      className="faculty-list-scroll"
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
};

const RatingModal = ({ faculty, onClose, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef();

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/faculty/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faculty_id: faculty.id,
          rating,
          turnstileToken
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      setSuccess(true);
      onRatingSubmitted(faculty.id, data.newAverage, data.newCount);
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
      if (turnstileRef.current) {
        turnstileRef.current.reset(); // Reset CAPTCHA on error
        setTurnstileToken(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="brutal-box"
        style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <X size={24} color="var(--border-color)" />
        </button>

        <h2 style={{ margin: 0, borderBottom: '4px solid var(--border-color)', paddingBottom: '0.5rem', paddingRight: '2rem' }}>
          RATE FACULTY
        </h2>

        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{faculty.name.replace(/^\d+\s+/, '')}</h3>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7 }}>{faculty.schoolName}</span>
        </div>

        {success ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4caf50', fontWeight: 'bold', padding: '1rem', background: '#e8f5e9', border: '2px solid #4caf50' }}>
            <CheckCircle size={24} />
            Rating submitted successfully!
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={40}
                  fill={(hoverRating || rating) >= star ? '#ff9800' : 'transparent'}
                  color={(hoverRating || rating) >= star ? '#ff9800' : 'var(--border-color)'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', opacity: (hoverRating || rating) >= star ? 1 : 0.4 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', minHeight: '65px' }}>
              <Turnstile 
                siteKey={SITE_KEY} 
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'auto' }}
                ref={turnstileRef}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f44336', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              className="brutal-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !turnstileToken || rating === 0}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.2rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                border: '4px solid var(--border-color)',
                background: (isSubmitting || !turnstileToken || rating === 0) ? '#e0e0e0' : '#b2ff59',
                color: (isSubmitting || !turnstileToken || rating === 0) ? '#9e9e9e' : '#111',
                cursor: (isSubmitting || !turnstileToken || rating === 0) ? 'not-allowed' : 'pointer',
                boxShadow: (isSubmitting || !turnstileToken || rating === 0) ? 'none' : '4px 4px 0px var(--border-color)',
                transition: 'all 0.1s ease',
                marginTop: '1rem'
              }}
              onMouseDown={(e) => {
                if (!isSubmitting && turnstileToken && rating > 0) {
                  e.currentTarget.style.boxShadow = '0px 0px 0px var(--border-color)';
                  e.currentTarget.style.transform = 'translate(4px, 4px)';
                }
              }}
              onMouseUp={(e) => {
                if (!isSubmitting && turnstileToken && rating > 0) {
                  e.currentTarget.style.boxShadow = '4px 4px 0px var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && turnstileToken && rating > 0) {
                  e.currentTarget.style.boxShadow = '4px 4px 0px var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT RATING'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};


const FacultyRatings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const [apiRatings, setApiRatings] = useState({});
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Fetch real ratings from API
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch(`${API_BASE}/faculty/ratings`);
        if (res.ok) {
          const data = await res.json();
          const ratingsMap = {};
          data.forEach(item => {
            ratingsMap[item.faculty_id] = {
              average: parseFloat(item.average_rating),
              count: item.total_reviews
            };
          });
          setApiRatings(ratingsMap);
        }
      } catch (err) {
        console.error("Failed to fetch API ratings:", err);
      } finally {
        setIsLoadingRatings(false);
      }
    };
    fetchRatings();
  }, []);

  const handleRatingSubmitted = (facultyId, newAvg, newCount) => {
    setApiRatings(prev => ({
      ...prev,
      [facultyId]: { average: parseFloat(newAvg), count: newCount }
    }));
  };

  // Scroll to top of the page when search changes
  useEffect(() => {
    if (deferredSearchTerm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [deferredSearchTerm]);

  // Helper to render stars based on score
  const renderStars = (fac) => {
    let count = 0; 
    let color = '#ccc'; 
    let displayRating = "";
    
    // Check if we have real API rating
    if (apiRatings[fac.id]) {
      const { average, count: reviewsCount } = apiRatings[fac.id];
      displayRating = average.toFixed(1);
      count = Math.round(average); // 1 to 5
      
      if (average >= 4.0) color = '#4caf50';
      else if (average >= 2.5) color = '#ff9800';
      else color = '#f44336';
      
    } else if (!isLoadingRatings) {
      // Fallback to hardcoded scores only after loading finishes
      const cleanName = fac.name.replace(/^\d+\s+/, '');
      const score = getFacultyScore(cleanName);
      
      if (score === 2) { count = 5; color = '#4caf50'; displayRating = "5.0"; } 
      else if (score === 1) { count = 4; color = '#2196f3'; displayRating = "4.0"; } 
      else if (score === -1) { count = 2; color = '#ff9800'; displayRating = "2.0"; } 
      else if (score === -2) { count = 1; color = '#f44336'; displayRating = "1.0"; } 
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', minWidth: '95px' }}>
        {displayRating && (
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', width: '22px', textAlign: 'right' }}>
            {displayRating}
          </span>
        )}
        <div style={{ display: 'flex', gap: '2px' }}>
          {Array(5).fill(0).map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < count ? color : 'transparent'} 
              color={i < count ? color : 'var(--border-color)'} 
              style={{ opacity: i < count ? 1 : 0.4 }}
            />
          ))}
        </div>
        {apiRatings[fac.id] && (
          <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 700, minWidth: '24px' }}>
            ({apiRatings[fac.id].count})
          </span>
        )}
      </div>
    );
  };

  const filteredData = useMemo(() => {
    if (!deferredSearchTerm.trim()) {
      const allSchools = vitFacultyData.filter(school => school.faculty && school.faculty.length > 0);
      
      const priorityPrefixes = [
        'SCOPE', 'SCORE', 'SENSE', 'SELECT', 'SMEC', 'SCALE', 'SCE', 'SBST', 'SAS', 'VITBS'
      ];
      
      allSchools.sort((a, b) => {
        const getPriority = (name) => {
          const match = priorityPrefixes.findIndex(prefix => name.startsWith(prefix));
          return match === -1 ? 999 : match;
        };
        
        const priorityA = getPriority(a.schoolName);
        const priorityB = getPriority(b.schoolName);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.schoolName.localeCompare(b.schoolName);
      });
      
      return allSchools;
    }
    
    const term = deferredSearchTerm.toLowerCase();
    
    const mapped = vitFacultyData.map(school => {
      const matchingFaculty = school.faculty.filter(f => f.name.toLowerCase().includes(term));
      if (matchingFaculty.length > 0) {
        let exactMatches = 0;
        matchingFaculty.forEach(f => {
          const cleanName = f.name.replace(/^\d+\s+/, '').toLowerCase();
          if (cleanName === term || cleanName.startsWith(term)) {
            exactMatches++;
          }
        });

        return { ...school, faculty: matchingFaculty, exactMatches, matchCount: matchingFaculty.length };
      }
      return null;
    }).filter(Boolean);

    // Sort: Schools with exact/starts-with matches first, then by total matches
    mapped.sort((a, b) => {
      if (b.exactMatches !== a.exactMatches) return b.exactMatches - a.exactMatches;
      return b.matchCount - a.matchCount;
    });

    return mapped;
  }, [deferredSearchTerm]);

  const flatSearchResults = useMemo(() => {
    if (!deferredSearchTerm.trim()) return [];
    const flat = [];
    filteredData.forEach(school => {
      school.faculty.forEach(fac => {
        flat.push({ ...fac, schoolName: school.schoolName });
      });
    });
    return flat;
  }, [filteredData, deferredSearchTerm]);

  return (
    <div className="faculty-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      <AnimatePresence>
        {selectedFaculty && (
          <RatingModal 
            faculty={selectedFaculty} 
            onClose={() => setSelectedFaculty(null)} 
            onRatingSubmitted={handleRatingSubmitted}
          />
        )}
      </AnimatePresence>

      <div className="brutal-box" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={24} />
          <input 
            type="text" 
            className="brutal-input" 
            placeholder="SEARCH BY NAME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem', paddingRight: '3rem' }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ position: 'absolute', right: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#111', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Clear Search"
            >
              <X size={24} />
            </button>
          )}
        </div>
        {searchTerm !== deferredSearchTerm && (
          <span style={{ fontWeight: 700, color: '#ff9800', whiteSpace: 'nowrap' }}>SEARCHING...</span>
        )}
      </div>

      {deferredSearchTerm.trim() ? (
        <motion.div 
          className="brutal-box category-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #111', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>SEARCH RESULTS</h2>
            <span style={{ fontWeight: 800, background: '#111', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>
              {flatSearchResults.length} FOUND
            </span>
          </div>
          
          <VirtualList 
            items={flatSearchResults}
            itemHeight={110}
            containerHeight={600}
            renderItem={(fac) => (
              <div 
                onClick={() => setSelectedFaculty(fac)}
                style={{ 
                  height: '100%',
                  padding: '0 1rem', 
                  background: '#f8f8f8', 
                  border: '2px solid #111', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer'
                }} 
                className="faculty-item hover-scale"
                title="Click to rate this faculty"
              >
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '1rem', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                    {fac.name.replace(/^\d+\s+/, '')}
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 800, color: '#2196f3', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2' }}>
                    {fac.schoolName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', background: 'transparent', padding: '0.3rem', border: '2px solid var(--border-color)', borderRadius: '4px', flexShrink: 0 }}>
                  {renderStars(fac)}
                </div>
              </div>
            )}
          />
        </motion.div>
      ) : (
        <div className="faculty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
          {filteredData.map((school) => (
            <motion.div 
              key={school.schoolId} 
              className="brutal-box category-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #111', paddingBottom: '1rem', gap: '1rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 900, fontSize: '1.2rem', lineHeight: '1.2' }}>
                  <Building2 size={24} style={{ flexShrink: 0 }} /> 
                  <span style={{ wordBreak: 'break-word' }}>{school.schoolName}</span>
                </h2>
                <span style={{ fontWeight: 800, background: '#111', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.8rem', flexShrink: 0 }}>
                  {school.faculty.length}
                </span>
              </div>
              
              <VirtualList 
                items={school.faculty}
                itemHeight={85}
                containerHeight={400}
                renderItem={(fac) => (
                  <div 
                    onClick={() => setSelectedFaculty({ ...fac, schoolName: school.schoolName })}
                    style={{ 
                      height: '100%',
                      padding: '0 1rem', 
                      background: '#f8f8f8', 
                      border: '2px solid #111', 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }} 
                    className="faculty-item hover-scale"
                    title="Click to rate this faculty"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.2' }}>
                        {fac.name.replace(/^\d+\s+/, '')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', background: 'transparent', padding: '0.3rem', border: '2px solid var(--border-color)', borderRadius: '4px', flexShrink: 0 }}>
                      {renderStars(fac)}
                    </div>
                  </div>
                )}
              />
            </motion.div>
          ))}
          
          {filteredData.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', fontWeight: 800, fontSize: '1.5rem', opacity: 0.5 }}>
              NO FACULTY FOUND
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyRatings;
