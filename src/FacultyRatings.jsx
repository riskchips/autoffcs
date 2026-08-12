import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, AlertTriangle, XCircle, ThumbsUp, Award } from 'lucide-react';
import { FACULTY_RATINGS } from '../data/facultyRatings';

const FacultyRatings = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to render stars
  const renderStars = (count, color) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < count ? color : 'transparent'} 
        color={color} 
        style={{ opacity: i < count ? 1 : 0.3 }}
      />
    ));
  };

  const categories = [
    {
      id: 'exceptional',
      title: 'EXCEPTIONAL',
      icon: <Award size={24} color="#4caf50" />,
      color: '#4caf50',
      stars: 5,
      data: FACULTY_RATINGS.exceptional
    },
    {
      id: 'good',
      title: 'GOOD',
      icon: <ThumbsUp size={24} color="#2196f3" />,
      color: '#2196f3',
      stars: 4,
      data: FACULTY_RATINGS.good
    },
    {
      id: 'bad',
      title: 'BAD',
      icon: <AlertTriangle size={24} color="#ff9800" />,
      color: '#ff9800',
      stars: 2,
      data: FACULTY_RATINGS.bad
    },
    {
      id: 'blacklisted',
      title: 'BLACKLISTED',
      icon: <XCircle size={24} color="#f44336" />,
      color: '#f44336',
      stars: 1,
      data: FACULTY_RATINGS.blacklisted
    }
  ];

  return (
    <div className="faculty-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="brutal-box" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={24} />
        <input 
          type="text" 
          className="brutal-input" 
          placeholder="SEARCH FACULTY BY NAME..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, fontSize: '1.2rem', padding: '0.8rem' }}
        />
      </div>

      <div className="faculty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {categories.map((cat) => {
          const filteredData = cat.data.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
          
          if (filteredData.length === 0) return null;

          return (
            <motion.div 
              key={cat.id} 
              className="brutal-box category-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: cat.color }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #111', paddingBottom: '1rem', borderColor: 'inherit' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: cat.color, fontWeight: 900 }}>
                  {cat.icon} {cat.title}
                </h2>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {renderStars(cat.stars, cat.color)}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }} className="faculty-list-scroll">
                {filteredData.map((name, i) => (
                  <div key={i} style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#f8f8f8', 
                    border: '2px solid #111', 
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }} className="faculty-item">
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FacultyRatings;
