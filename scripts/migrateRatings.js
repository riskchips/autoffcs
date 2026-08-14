import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { getFacultyScore } from '../data/facultyRatings.js';

dotenv.config({ path: '.env' });

const mapScoreToRating = (score) => {
  if (score === 2) return 5;
  if (score === 1) return 4;
  if (score === -1) return 2;
  if (score === -2) return 1;
  return 0;
};

async function run() {
  console.log("Connecting to database...");
  const db = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log("Creating tables if they don't exist...");
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        voter_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (faculty_id, voter_hash)
    );
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_averages (
        faculty_id VARCHAR(255) PRIMARY KEY,
        average_rating DECIMAL(3, 2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0
    );
  `);

  console.log("Reading vit-faculty.json...");
  const data = JSON.parse(readFileSync('./vit-faculty.json', 'utf-8'));
  
  let count = 0;

  for (const school of data) {
    if (!school.faculty) continue;
    
    for (const fac of school.faculty) {
      const cleanName = fac.name.replace(/^\d+\s+/, '');
      const score = getFacultyScore(cleanName);
      
      const rating = mapScoreToRating(score);
      if (rating > 0) {
        try {
          await db.query(
            `INSERT IGNORE INTO faculty_reviews (faculty_id, rating, voter_hash) VALUES (?, ?, ?)`,
            [fac.id, rating, 'legacy_static_data']
          );
          
          // Recalculate average
          const [[avgResult]] = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM faculty_reviews WHERE faculty_id = ?',
            [fac.id]
          );
          
          const newAvg = avgResult.avg_rating || 0;
          const newCount = avgResult.count || 0;

          await db.query(
            `INSERT INTO faculty_averages (faculty_id, average_rating, total_reviews)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE average_rating = ?, total_reviews = ?`,
            [fac.id, newAvg, newCount, newAvg, newCount]
          );
          count++;
          console.log(`Migrated: ${cleanName} (${fac.id}) -> ${rating} stars`);
        } catch (err) {
          console.error(`Failed to migrate ${fac.id}:`, err);
        }
      }
    }
  }

  console.log(`Successfully migrated ${count} faculty ratings to the database.`);
  process.exit(0);
}

run();
