import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { generateTimetables } from '../src/timetableSolver.js';

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
app.post('/api/v1/timetable/generate', (req, res) => {
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
    
    // Generate timetables
    const result = generateTimetables(payload);
    
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

// Export the Express app for Vercel Serverless
export default app;
