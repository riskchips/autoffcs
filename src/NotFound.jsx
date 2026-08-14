import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="brutal-box"
        style={{ maxWidth: '500px', background: '#ffcdd2', border: '6px solid #111', boxShadow: '12px 12px 0px #111', padding: '3rem' }}
      >
        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: '#111', margin: '0 0 1rem 0', lineHeight: 1 }}>404</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', background: '#111', color: '#fff', padding: '0.5rem' }}>
          <AlertCircle size={24} color="#ffeb3b" />
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>PAGE NOT FOUND</h2>
        </div>
        <p style={{ fontWeight: 700, color: '#111', fontSize: '1.1rem', marginBottom: '2rem' }}>
          THE ROUTE YOU ARE LOOKING FOR DOES NOT EXIST OR WAS DELETED.
        </p>
        
        <Link 
          to="/" 
          className="brutal-button" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: '#2196f3', 
            color: '#fff',
            fontSize: '1.2rem',
            padding: '1rem 2rem',
            textDecoration: 'none'
          }}
        >
          <Home size={24} /> GO BACK HOME
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
