import React, { useState, useMemo, useDeferredValue, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Building2 } from 'lucide-react';
import vitFacultyData from '../vit-faculty.json';
import { getFacultyScore } from '../data/facultyRatings';

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

const FacultyRatings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Scroll to top of the page when search changes
  useEffect(() => {
    if (deferredSearchTerm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [deferredSearchTerm]);

  // Helper to render stars based on score
  const renderStars = (name) => {
    const cleanName = name.replace(/^\d+\s+/, '');
    const score = getFacultyScore(cleanName);
    
    let count = 3; 
    let color = '#9e9e9e'; 
    
    if (score === 2) { count = 5; color = '#4caf50'; } 
    else if (score === 1) { count = 4; color = '#2196f3'; } 
    else if (score === -1) { count = 2; color = '#ff9800'; } 
    else if (score === -2) { count = 1; color = '#f44336'; } 

    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < count ? color : 'transparent'} 
        color={color} 
        style={{ opacity: i < count ? 1 : 0.3 }}
      />
    ));
  };

  const filteredData = useMemo(() => {
    if (!deferredSearchTerm.trim()) return vitFacultyData;
    
    const term = deferredSearchTerm.toLowerCase();
    
    const mapped = vitFacultyData.map(school => {
      const matchingFaculty = school.faculty.filter(f => f.name.toLowerCase().includes(term) || f.id.includes(term));
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
      <div className="brutal-box" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
          <Search size={24} />
          <input 
            type="text" 
            className="brutal-input" 
            placeholder="SEARCH BY NAME OR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem' }}
          />
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
            itemHeight={85}
            containerHeight={600}
            renderItem={(fac) => (
              <div style={{ 
                height: '100%',
                padding: '0 1rem', 
                background: '#f8f8f8', 
                border: '2px solid #111', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }} className="faculty-item">
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1rem' }}>
                    {fac.name.replace(/^\d+\s+/, '')} <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>({fac.id})</span>
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 800, color: '#2196f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fac.schoolName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', background: '#fff', padding: '0.3rem', border: '2px solid #111', borderRadius: '4px', flexShrink: 0 }}>
                  {renderStars(fac.name)}
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
                itemHeight={70}
                containerHeight={400}
                renderItem={(fac) => (
                  <div style={{ 
                    height: '100%',
                    padding: '0 1rem', 
                    background: '#f8f8f8', 
                    border: '2px solid #111', 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }} className="faculty-item">
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
                        {fac.name.replace(/^\d+\s+/, '')}
                      </span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>ID: {fac.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', background: '#fff', padding: '0.3rem', border: '2px solid #111', borderRadius: '4px', flexShrink: 0 }}>
                      {renderStars(fac.name)}
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
