import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { generateTimetables } from '../src/timetableSolver.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

dotenv.config();

// Database Connection
const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for Turnstile
async function verifyTurnstile(token) {
  const secretKey = process.env.TURNSTILE_TOKEN || process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
    });
    const data = await response.json();
    return data.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

// Helper for VPN/Proxy Detection
async function checkVPN(ip) {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return false;
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,hosting`);
    const data = await response.json();
    return data.proxy === true || data.hosting === true;
  } catch (err) {
    console.error('VPN Check error:', err);
    return false; // Fail open to not block legitimate users if the API drops
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global Rate Limiter: 5 requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiter to the API
app.use('/api/', limiter);

// POST Endpoint for timetable generation
let cachedRatings = null;

async function refreshRatingsCache() {
  try {
    const [rows] = await db.query('SELECT faculty_id, average_rating, total_reviews FROM faculty_averages');
    cachedRatings = rows;
  } catch (dbErr) {
    console.error('Error fetching live scores from DB for cache:', dbErr);
  }
}

app.post('/api/v1/timetable/generate', async (req, res) => {
  try {
    const payload = req.body;
    
    // Strip PII (student data)
    if (payload.student) {
      delete payload.student;
    }
    
    // Check if courses exist
    if (!payload.courses || !Array.isArray(payload.courses)) {
      return res.status(400).json({ error: 'Invalid payload: courses array is missing.' });
    }
    
    // Fetch Live Scores from Cache
    if (!cachedRatings) {
      await refreshRatingsCache();
    }
    let liveScores = null;
    if (cachedRatings) {
      liveScores = {};
      for (const row of cachedRatings) {
        liveScores[row.faculty_id] = row.average_rating;
      }
    }
    
    // Generate timetables
    const result = generateTimetables(payload, liveScores);
    
    // Build clean response (no PII, just the generated data)
    const responseData = {
      semester: payload.semester,
      campus: payload.campus,
      globally_dropped_courses: result.globallyDropped,
      generated_timetables: result.timetables
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('Error generating timetables:', err);
    res.status(500).json({ error: 'Internal server error while generating timetables.' });
  }
});

// --- Faculty Ratings Endpoints ---

// GET all faculty averages
app.get('/api/v1/faculty/ratings', async (req, res) => {
  try {
    if (!cachedRatings) {
      await refreshRatingsCache();
    }
    res.json(cachedRatings || []);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// POST a new rating
app.post('/api/v1/faculty/rate', async (req, res) => {
  try {
    const { faculty_id, rating, turnstileToken } = req.body;

    if (!faculty_id || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid faculty ID or rating (must be 1-5).' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ error: 'Turnstile token is required.' });
    }

    // Verify Turnstile
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return res.status(403).json({ error: 'CAPTCHA verification failed.' });
    }

    // Extract IP Address
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ip = rawIp.split(',')[0].trim();
    
    // VPN / Proxy Check
    const isVPN = await checkVPN(ip);
    if (isVPN) {
      return res.status(403).json({ error: 'VPNs and Proxies are not allowed.' });
    }

    // Generate Voter Hash
    const userAgent = req.headers['user-agent'] || 'unknown';
    const voterHash = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');

    // Insert review (will fail if duplicate voterHash + faculty_id)
    try {
      await db.query(
        'INSERT INTO faculty_reviews (faculty_id, rating, voter_hash) VALUES (?, ?, ?)',
        [faculty_id, rating, voterHash]
      );
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(429).json({ error: 'You have already rated this faculty.' });
      }
      throw dbErr;
    }

    // Update Average Rating caching table
    // Calculate new average
    const [[avgResult]] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM faculty_reviews WHERE faculty_id = ?',
      [faculty_id]
    );

    const newAvg = avgResult.avg_rating || 0;
    const newCount = avgResult.count || 0;

    await db.query(
      `INSERT INTO faculty_averages (faculty_id, average_rating, total_reviews)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE average_rating = ?, total_reviews = ?`,
      [faculty_id, newAvg, newCount, newAvg, newCount]
    );

    // Update Cache
    if (cachedRatings) {
      const existing = cachedRatings.find(r => r.faculty_id === faculty_id);
      if (existing) {
        existing.average_rating = newAvg;
        existing.total_reviews = newCount;
      } else {
        cachedRatings.push({ faculty_id, average_rating: newAvg, total_reviews: newCount });
      }
    }

    res.json({ success: true, message: 'Rating submitted successfully.', newAverage: newAvg, newCount });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Internal server error while submitting rating.' });
  }
});

// Export the Express app for Vercel Serverless
export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend API server is running on http://localhost:${PORT}`);
  });
}
