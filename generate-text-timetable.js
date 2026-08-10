import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTimetables } from './src/timetableSolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payloadPath = path.join(__dirname, 'full-payload.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

console.log("Generating timetables...");
const result = generateTimetables(payload);

console.log(`Generated timetables count: ${result.timetables.length}`);
console.log(`Globally dropped courses count: ${result.globallyDropped.length}`);

let outputTxt = `AUTO FFCS TIMETABLE GENERATION RESULTS\n`;
outputTxt += `======================================\n\n`;
outputTxt += `Total Timetables Found: ${result.timetables.length}\n\n`;

if (result.globallyDropped.length > 0) {
  outputTxt += `[!] GLOBALLY DROPPED COURSES (Could not fit any preference or valid slots):\n`;
  for (const dc of result.globallyDropped) {
    outputTxt += ` - ${dc.course_code} - ${dc.course_name}: ${dc.reason}\n`;
  }
  outputTxt += `\n`;
}

if (result.timetables.length > 0) {
  const firstTimetable = result.timetables[0];
  outputTxt += `--- BEST TIMETABLE (Option 1) ---\n\n`;
  
  if (firstTimetable.branchDropped.length > 0) {
    outputTxt += `Note: The following courses were dropped in this specific timetable due to 100% clashes:\n`;
    for (const dc of firstTimetable.branchDropped) {
      outputTxt += ` - ${dc.course_code} - ${dc.course_name}\n`;
    }
    outputTxt += `\n`;
  }
  
  for (const item of firstTimetable.courses) {
    if (item.dropped) continue;
    outputTxt += `Course: ${item.course_code} - ${item.course_name} (Faculty Match: ${item.bundle_faculty})\n`;
    for (const alloc of item.allocations) {
      outputTxt += `  Type: ${alloc.course_type} | Slot: ${alloc.slot.join(', ')} | Venue: ${alloc.venue} | Faculty: ${alloc.faculty}\n`;
    }
    outputTxt += `\n`;
  }
} else {
  outputTxt += `No valid timetables could be generated with the given constraints.\n`;
}

const outputPath = path.join(__dirname, 'timetable_output.txt');
fs.writeFileSync(outputPath, outputTxt);
console.log(`Saved output to ${outputPath}`);
