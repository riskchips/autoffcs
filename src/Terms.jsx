import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
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
          <ShieldAlert size={40} color="#f44336" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1, textTransform: 'uppercase' }}>
            Terms & Disclaimer
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              1. NO AFFILIATION
            </h2>
            <p>
              AutoFFCS is an independent, student-built utility project. It is <strong>NOT</strong> affiliated with, endorsed by, or sponsored by Vellore Institute of Technology (VIT) or any of its campuses. All trademarks and registered trademarks are the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              2. CROWDSOURCED DATA
            </h2>
            <p>
              All faculty names, details, and ratings displayed on this platform are 100% crowdsourced and submitted anonymously by students. The creator(s) of this website do not generate, endorse, or verify any of the reviews, opinions, or ratings provided. 
            </p>
            <p>
              The ratings represent the subjective opinions of individual students and do not reflect the opinions of the website creator(s). We hold no liability for any perceived inaccuracies or defamatory content.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              3. AS-IS USAGE
            </h2>
            <p>
              The Timetable Generator algorithm is provided on an "AS-IS" basis. While we strive to generate clash-free and optimal schedules, we make no guarantees about the accuracy or success of course registration based on these outputs. Students are solely responsible for verifying their own schedules and credits on the official VTOP portal.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              4. ABUSE PROTECTION
            </h2>
            <p>
              We employ standard IP and User-Agent hashing to prevent spam and duplicate ratings. By submitting a rating, you consent to these standard bot-protection mechanisms. We actively block known proxies, VPNs, and malicious traffic to maintain the integrity of the data.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
