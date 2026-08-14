import React, { useEffect } from 'react';
import { HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HowToUse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      id: 1,
      text: "Copy the VTOP whole page then",
      img: "/usage/1.png"
    },
    {
      id: 2,
      text: "Paste the data there then",
      img: "/usage/2.png"
    },
    {
      id: 3,
      text: "Copy the data again then",
      img: "/usage/3.png"
    },
    {
      id: 4,
      text: "Paste these data also now after that say paste all the subjects you want to take and then click on generate button",
      img: "/usage/4.png"
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link 
        to="/" 
        className="brutal-button" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', background: '#111', color: '#fff' }}
      >
        <ArrowLeft size={20} /> BACK TO HOME
      </Link>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="brutal-box" 
        style={{ padding: '2rem', background: '#fff', border: '4px solid #111', boxShadow: '8px 8px 0px #111', color: '#111' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #111', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <HelpCircle size={40} color="#2196f3" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1, textTransform: 'uppercase' }}>
            How to Use
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: '#ffeb3b', 
                  border: '3px solid #111', 
                  boxShadow: '4px 4px 0px #111',
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  {step.id}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, paddingTop: '0.4rem', lineHeight: 1.4 }}>
                  {step.text}
                </h2>
              </div>
              
              <div style={{ 
                border: '4px solid #111', 
                boxShadow: '6px 6px 0px #111',
                background: '#f5f5f5',
                padding: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <img 
                  src={step.img} 
                  alt={`Step ${step.id}`} 
                  style={{ width: '100%', height: 'auto', display: 'block', border: '2px solid #ccc' }} 
                />
              </div>
            </motion.div>
          ))}

          <div style={{ background: '#c8e6c9', border: '4px solid #111', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', boxShadow: '6px 6px 0px #111' }}>
            <CheckCircle2 size={32} color="#4caf50" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>
              Once you click generate, the algorithm will automatically prioritize the best faculty and find a clash-free schedule for you!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HowToUse;
