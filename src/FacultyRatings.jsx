import React, { useState, useMemo, useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Building2 } from 'lucide-react';
import { FixedSizeList } from 'react-window';
import vitFacultyData from '../vit-faculty.json';
import { getFacultyScore } from '../data/facultyRatings';

const FacultyRatings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Helper to render stars based on score
  const renderStars = (name) => {
    // Strip ID from name (e.g., "12832 RAMMOHAN A" -> "RAMMOHAN A")
    const cleanName = name.replace(/^\d+\s+/, '');
    const score = getFacultyScore(cleanName);
    
    let count = 3; // default neutral
    let color = '#9e9e9e'; // default grey
    
    if (score === 2) { count = 5; color = '#4caf50'; } // exceptional
    else if (score === 1) { count = 4; color = '#2196f3'; } // good
    else if (score === -1) { count = 2; color = '#ff9800'; } // bad
    else if (score === -2) { count = 1; color = '#f44336'; } // blacklisted

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

  // Filter and process data based on deferredSearchTerm
  const filteredData = useMemo(() => {
    if (!deferredSearchTerm.trim()) {
      return vitFacultyData;
    }
    
    const term = deferredSearchTerm.toLowerCase();
    
    return vitFacultyData.map(school => {
      const matchingFaculty = school.faculty.filter(f => f.name.toLowerCase().includes(term) || f.id.includes(term));
      if (matchingFaculty.length > 0) {
        return { ...school, faculty: matchingFaculty };
      }
      return null;
    }).filter(Boolean);
  }, [deferredSearchTerm]);

  // Row renderer for react-window
  const Row = ({ index, style, data }) => {
    const fac = data[index];
    return (
      <div style={{ ...style, padding: '0.25rem 0.5rem' }}>
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
            <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fac.name.replace(/^\d+\s+/, '')}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>ID: {fac.id}</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', background: '#fff', padding: '0.3rem', border: '2px solid #111', borderRadius: '4px', flexShrink: 0 }}>
            {renderStars(fac.name)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="faculty-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="brutal-box" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={24} />
        <input 
          type="text" 
          className="brutal-input" 
          placeholder="SEARCH FACULTY BY NAME OR ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, fontSize: '1.2rem', padding: '0.8rem' }}
        />
        {searchTerm !== deferredSearchTerm && (
          <span style={{ fontWeight: 700, color: '#ff9800' }}>SEARCHING...</span>
        )}
      </div>

      <div className="faculty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {filteredData.map((school) => (
          <motion.div 
            key={school.schoolId} 
            className="brutal-box category-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #111', paddingBottom: '1rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 900, fontSize: '1.2rem' }}>
                <Building2 size={24} /> {school.schoolName}
              </h2>
              <span style={{ fontWeight: 800, background: '#111', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
                {school.faculty.length}
              </span>
            </div>
            
            <div style={{ height: '400px', width: '100%' }}>
              <FixedSizeList
                height={400}
                itemCount={school.faculty.length}
                itemSize={70}
                width="100%"
                itemData={school.faculty}
                className="faculty-list-scroll"
              >
                {Row}
              </FixedSizeList>
            </div>
          </motion.div>
        ))}
        
        {filteredData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', fontWeight: 800, fontSize: '1.5rem', opacity: 0.5 }}>
            NO FACULTY FOUND
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyRatings;
