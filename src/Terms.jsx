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
            Terms & Conditions
          </h1>
        </div>

        <p style={{ fontWeight: 800, marginBottom: '2rem' }}>Last Updated: August 14, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              1. PURPOSE OF THE PLATFORM
            </h2>
            <p>This website is an independent, student-oriented platform designed to help students make academic and timetable-related decisions using student-submitted faculty ratings, reviews, and other information.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              2. NO UNIVERSITY AFFILIATION
            </h2>
            <p>This website is an independent platform and is not affiliated with, endorsed by, sponsored by, or officially associated with any university, college, educational institution, faculty member, or academic organization, unless explicitly stated otherwise.</p>
            <p>The information, ratings, reviews, and recommendations available on this website do not represent the official views, opinions, evaluations, or recommendations of any educational institution or faculty member.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              3. FACULTY INFORMATION
            </h2>
            <p>Faculty names and related academic information may be displayed for the purpose of identifying faculty members and allowing users to submit ratings or reviews.</p>
            <p>The inclusion of a faculty member on this website does not imply any positive or negative judgment about that individual.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              4. STUDENT RATINGS AND REVIEWS
            </h2>
            <p>Ratings and reviews submitted by users represent the individual opinions and personal experiences of those users.</p>
            <p>User-submitted ratings and reviews do not necessarily represent the views or opinions of the website owner or operator.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              5. HONEST SUBMISSIONS
            </h2>
            <p>Users are expected to submit ratings and reviews based on their genuine academic experiences.</p>
            <p>Users must not submit content that is intentionally false, misleading, abusive, discriminatory, harassing, or intended to unfairly damage the reputation of another person.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              6. PROHIBITED USE
            </h2>
            <p>Users must not:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Manipulate or artificially influence faculty ratings.</li>
              <li>Submit multiple ratings for the purpose of manipulating results.</li>
              <li>Submit ratings on behalf of another person without authorization.</li>
              <li>Impersonate another student or person.</li>
              <li>Use the platform to harass, threaten, or target faculty members or other users.</li>
              <li>Submit knowingly false or malicious allegations.</li>
              <li>Use bots, scripts, automated tools, or other methods to manipulate ratings or platform data.</li>
              <li>Attempt to interfere with the normal operation or security of the website.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              7. MODERATION AND REMOVAL
            </h2>
            <p>We reserve the right to review, hide, modify, or remove ratings, reviews, or other content that we reasonably believe violates these Terms & Conditions, is abusive or inappropriate, appears to manipulate the rating system, or otherwise constitutes misuse of the platform.</p>
            <p>We may also restrict or suspend access to users who repeatedly violate these Terms & Conditions.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              8. ACCURACY OF INFORMATION
            </h2>
            <p>We do not guarantee that faculty information, ratings, reviews, course information, recommendations, or other information available through the website is accurate, complete, or current.</p>
            <p>Users should independently verify important academic information before making decisions.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              9. FACULTY AND TIMETABLE RECOMMENDATIONS
            </h2>
            <p>Any faculty ratings, rankings, scores, or timetable recommendations generated by the website are based on available data and user-submitted information.</p>
            <p>Such recommendations are provided for informational purposes only and are not official academic recommendations.</p>
            <p>The website does not guarantee that following any recommendation will result in a particular academic outcome, timetable, grade, or experience.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              10. USER-SUBMITTED CONTENT
            </h2>
            <p>By submitting a rating or review, you confirm that you have the right to submit that content and that it is based on your genuine experience.</p>
            <p>You grant the website permission to store, display, process, and use the submitted rating or review for operating and improving the platform.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              11. PRIVACY
            </h2>
            <p>We may collect information necessary to operate the platform, prevent abuse, process ratings, and maintain website security.</p>
            <p>Users should not include unnecessary personal information, private information, or sensitive information about themselves or other individuals in reviews.</p>
            <p>Any personal information collected through the website will be handled according to our Privacy Policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              12. REPORTING CONTENT
            </h2>
            <p>Users may report ratings, reviews, or other content that they believe violates these Terms & Conditions or is otherwise inappropriate.</p>
            <p>Reported content may be reviewed and removed or restricted where appropriate.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              13. INTELLECTUAL PROPERTY
            </h2>
            <p>The website's original software, source code, design, branding, graphics, and other original materials are owned by the website operator unless otherwise stated.</p>
            <p>Users may not copy, reproduce, redistribute, modify, or commercially exploit the website's original materials without appropriate permission.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              14. THIRD-PARTY INFORMATION
            </h2>
            <p>The website may contain information obtained from publicly available sources or submitted by users.</p>
            <p>We do not guarantee the accuracy, completeness, legality, or continued availability of information obtained from third parties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              15. LIMITATION OF LIABILITY
            </h2>
            <p>The website and its operator are not responsible for decisions made by users based on faculty ratings, reviews, recommendations, rankings, timetable suggestions, or other information provided through the platform.</p>
            <p>Users are responsible for independently evaluating information before relying upon it.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              16. CHANGES TO THESE TERMS
            </h2>
            <p>We may update or modify these Terms & Conditions from time to time.</p>
            <p>Any updated version will be published on this page with the updated date. Continued use of the website after changes are published constitutes acceptance of the updated Terms & Conditions.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, background: '#111', color: '#ffeb3b', display: 'inline-block', padding: '0.2rem 0.5rem', marginBottom: '0.5rem' }}>
              17. ACCEPTANCE OF THESE TERMS
            </h2>
            <p>By accessing or using this website, or by submitting a faculty rating or review, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
            <p>If you do not agree with these Terms & Conditions, please do not use the website or submit ratings or reviews.</p>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
