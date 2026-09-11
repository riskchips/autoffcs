import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { generateTimetables } from '../src/timetableSolver.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import mysql from 'mysql2/promise';

dotenv.config();

// Database Connection
const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// In-memory cache for used tokens to prevent replay attacks
const usedTokens = new Set();

// Clear tokens every hour to prevent memory leaks
setInterval(() => {
  usedTokens.clear();
}, 60 * 60 * 1000);

// Helper for Turnstile
async function verifyTurnstile(token) {
  if (usedTokens.has(token)) {
    console.warn('Replay attack prevented: Turnstile token already used.');
    return false;
  }

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
    
    if (data.success) {
      usedTokens.add(token);
    }
    
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

// Trust Vercel's reverse proxy so rate limiting works per user IP instead of blocking globally
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Global Rate Limiter: 100 requests per minute for general API usage (generating timetables, fetching ratings)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Strict Rate Limiter: 5 requests per minute for sensitive actions (voting)
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error: 'You are submitting ratings too quickly. Please slow down.'
  }
});

// Daily IP Rate Limiter: 50 requests per day per IP
const dailyIpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50,
  message: {
    error: 'Daily review limit reached for your IP.'
  }
});

// Apply general rate limiter to all APIs by default
app.use('/api/', generalLimiter);

// POST Endpoint for timetable generation
let cachedRatings = null;

async function refreshRatingsCache() {
  try {
    const [rows] = await db.query('SELECT faculty_id, average_rating, total_reviews FROM faculty_averages');
    cachedRatings = rows.map(row => ({
      ...row,
      average_rating: parseFloat(row.average_rating),
      total_reviews: parseInt(row.total_reviews, 10)
    }));
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

// POST a new rating (Protected by strict rate limiter and daily IP limiter)
app.post('/api/v1/faculty/rate', strictLimiter, dailyIpLimiter, async (req, res) => {
  try {
    const encryptedData = req.body._p;
    if (!encryptedData) {
      return res.status(400).json({ error: 'Payload is missing or unencrypted.' });
    }

    let decryptedPayload;
    try {
      const secret = process.env.ENCRYPTION_KEY || 'c3f9b2d8e4a175608c9d4b1a2e3f5c7d8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d';
      const bytes = CryptoJS.AES.decrypt(encryptedData, secret);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      decryptedPayload = JSON.parse(decryptedString);
    } catch (e) {
      return res.status(400).json({ error: 'Payload decryption failed.' });
    }

    const { _f: faculty_id, _r: rating, _t: turnstileToken } = decryptedPayload;

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

    // Handle Anonymous Reviewer Cookie
    let token = req.cookies['__Host-reviewer_id'];
    let isNewToken = false;
    
    if (!token) {
      token = crypto.randomBytes(32).toString('base64url');
      isNewToken = true;
      res.cookie('__Host-reviewer_id', token, {
        maxAge: 31536000000, // 1 year
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      });
    }

    const reviewerTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    let reviewer_id;

    if (isNewToken) {
      // Insert new anonymous reviewer
      const [insertResult] = await db.query(
        'INSERT INTO anonymous_reviewers (reviewer_token_hash) VALUES (?)',
        [reviewerTokenHash]
      );
      reviewer_id = insertResult.insertId;
    } else {
      // Look up existing reviewer
      const [rows] = await db.query(
        'SELECT id FROM anonymous_reviewers WHERE reviewer_token_hash = ?',
        [reviewerTokenHash]
      );
      
      if (rows.length > 0) {
        reviewer_id = rows[0].id;
        // Update last seen
        await db.query('UPDATE anonymous_reviewers SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [reviewer_id]);
        
        // Enforce Daily Cookie Limit (Max 50 per day)
        const [cookieRows] = await db.query(
          "SELECT COUNT(*) as count FROM faculty_reviews WHERE reviewer_id = ? AND created_at >= NOW() - INTERVAL 1 DAY",
          [reviewer_id]
        );
        if (cookieRows[0].count >= 50) {
          return res.status(429).json({ error: 'Daily review limit reached for this browser.' });
        }

      } else {
        // Token exists but not in DB (e.g. DB wiped), recreate it
        const [insertResult] = await db.query(
          'INSERT INTO anonymous_reviewers (reviewer_token_hash) VALUES (?)',
          [reviewerTokenHash]
        );
        reviewer_id = insertResult.insertId;
      }
    }

    // Insert review (will fail if duplicate reviewer_id + faculty_id)
    try {
      await db.query(
        'INSERT INTO faculty_reviews (faculty_id, rating, reviewer_id) VALUES (?, ?, ?)',
        [faculty_id, rating, reviewer_id]
      );
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'You have already reviewed this faculty.' });
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
