import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFacultyScore } from '../data/facultyRatings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const timetablePath = path.join(__dirname, '..', 'timetable.json');
const timetableData = JSON.parse(fs.readFileSync(timetablePath, 'utf8'));

// Build slot mapping
const slotMapping = {};
const daysSchedule = timetableData.schedule.days_schedule;
for (const day of Object.keys(daysSchedule)) {
  for (const block of daysSchedule[day]) {
    const timeBlockId = `${day}_${block.slot}`;
    if (block.theory) {
      if (!slotMapping[block.theory]) slotMapping[block.theory] = { timeBlocks: new Set(), period: block.theory_period };
      slotMapping[block.theory].timeBlocks.add(timeBlockId);
    }
    if (block.lab) {
      if (!slotMapping[block.lab]) slotMapping[block.lab] = { timeBlocks: new Set(), period: block.lab_period };
      slotMapping[block.lab].timeBlocks.add(timeBlockId);
    }
    if (block.special) {
      if (!slotMapping[block.special]) slotMapping[block.special] = { timeBlocks: new Set(), period: null };
      slotMapping[block.special].timeBlocks.add(timeBlockId);
    }
  }
}

function getSlotInfo(slotNames) {
  const timeBlocks = new Set();
  let isMorning = true;
  let isEvening = true;

  for (const name of slotNames) {
    const info = slotMapping[name];
    if (info) {
      for (const tb of info.timeBlocks) timeBlocks.add(tb);
      if (info.period === 'morning') isEvening = false;
      if (info.period === 'evening') isMorning = false;
    }
  }
  
  let finalPeriod = 'mixed';
  if (isMorning && !isEvening) finalPeriod = 'morning';
  if (isEvening && !isMorning) finalPeriod = 'evening';
  
  return { timeBlocks, period: finalPeriod };
}

const THEORY_TYPES = ['ETH', 'TH', 'SS'];
const LAB_TYPES = ['ELA', 'LO', 'LA'];

// Helper to generate Cartesian product of arrays
function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombinations = cartesianProduct(rest);
  return first.flatMap(val => restCombinations.map(combo => [val, ...combo]));
}

export function generateTimetables(inputData, liveScores = null) {
  const courses = inputData.courses || [];
  const theoryPreference = inputData.preferences?.theory; 
  
  const processedCourses = [];
  const globallyDropped = [];
  
  for (const course of courses) {
    const requiredTypes = new Set();
    const allocsByType = {};
    const allocsByFacultyAndType = {};
    
    // First, process and filter valid allocations
    for (const alloc of (course.allocations || [])) {
      requiredTypes.add(alloc.course_type);
      
      const slotInfo = getSlotInfo(alloc.slot);
      
      let finalScore = 3; // Default middle score
      const staticScore = getFacultyScore(alloc.faculty);
      
      const match = alloc.faculty.match(/^([a-zA-Z0-9]+)/);
      const facId = match ? match[1] : null;
      
      if (liveScores && facId && liveScores[facId] !== undefined) {
        finalScore = liveScores[facId];
      } else {
        if (staticScore === 2) finalScore = 5;
        else if (staticScore === 1) finalScore = 4;
        else if (staticScore === 0) finalScore = 3;
        else if (staticScore === -1) finalScore = 2;
        else if (staticScore === -2) finalScore = 1;
      }

      const allocWithMeta = {
        ...alloc,
        timeBlocks: Array.from(slotInfo.timeBlocks),
        period: slotInfo.period,
        score: finalScore
      };
      
      let keep = true;
      if (theoryPreference && theoryPreference !== 'mixed') {
        if (THEORY_TYPES.includes(alloc.course_type)) {
          if (allocWithMeta.period !== theoryPreference && allocWithMeta.period !== 'mixed') keep = false;
        } else if (LAB_TYPES.includes(alloc.course_type)) {
          const expectedLabPeriod = theoryPreference === 'morning' ? 'evening' : 'morning';
          if (allocWithMeta.period !== expectedLabPeriod && allocWithMeta.period !== 'mixed') keep = false;
        }
      }
      
      if (keep) {
        if (!allocsByType[alloc.course_type]) allocsByType[alloc.course_type] = [];
        allocsByType[alloc.course_type].push(allocWithMeta);
        
        if (!allocsByFacultyAndType[alloc.faculty]) allocsByFacultyAndType[alloc.faculty] = {};
        if (!allocsByFacultyAndType[alloc.faculty][alloc.course_type]) {
          allocsByFacultyAndType[alloc.faculty][alloc.course_type] = [];
        }
        allocsByFacultyAndType[alloc.faculty][alloc.course_type].push(allocWithMeta);
      }
    }
    
    const typesArray = Array.from(requiredTypes);
    let bundles = [];
    
    // 1. Try Same-Faculty Bundles
    for (const [faculty, typesMap] of Object.entries(allocsByFacultyAndType)) {
      let hasAllTypes = true;
      for (const type of typesArray) {
        if (!typesMap[type] || typesMap[type].length === 0) {
          hasAllTypes = false;
          break;
        }
      }
      
      if (hasAllTypes) {
        const arraysToCombine = typesArray.map(t => typesMap[t]);
        const combinations = cartesianProduct(arraysToCombine);
        
        for (const combo of combinations) {
          // Check for internal clashes
          const usedBlocks = new Set();
          let internalClash = false;
          let totalScore = 0;
          for (const alloc of combo) {
            totalScore += alloc.score;
            for (const tb of alloc.timeBlocks) {
              if (usedBlocks.has(tb)) {
                internalClash = true;
                break;
              }
              usedBlocks.add(tb);
            }
            if (internalClash) break;
          }
          
          if (!internalClash) {
            bundles.push({
              facultyName: faculty,
              isSameFaculty: true,
              score: totalScore,
              allocations: combo,
              timeBlocks: Array.from(usedBlocks)
            });
          }
        }
      }
    }
    
    // 2. If no same-faculty bundles exist, allow mixed-faculty bundles
    if (bundles.length === 0) {
      let canFormMixed = true;
      for (const type of typesArray) {
        if (!allocsByType[type] || allocsByType[type].length === 0) {
          canFormMixed = false;
          break;
        }
      }
      
      if (canFormMixed) {
        const arraysToCombine = typesArray.map(t => allocsByType[t]);
        const combinations = cartesianProduct(arraysToCombine);
        
        for (const combo of combinations) {
          const usedBlocks = new Set();
          let internalClash = false;
          let totalScore = 0;
          for (const alloc of combo) {
            totalScore += alloc.score;
            for (const tb of alloc.timeBlocks) {
              if (usedBlocks.has(tb)) {
                internalClash = true;
                break;
              }
              usedBlocks.add(tb);
            }
            if (internalClash) break;
          }
          
          if (!internalClash) {
            bundles.push({
              facultyName: "MIXED",
              isSameFaculty: false,
              score: totalScore,
              allocations: combo,
              timeBlocks: Array.from(usedBlocks)
            });
          }
        }
      }
    }
    
    bundles.sort((a, b) => b.score - a.score);
    
    if (bundles.length === 0) {
      globallyDropped.push({
        course_code: course.course_code,
        course_name: course.course_name,
        reason: 'No allocations match preferences or valid combinations.'
      });
    } else {
      processedCourses.push({
        ...course,
        bundles
      });
    }
  }
  
  const results = [];
  let bestDroppedCount = Infinity;
  let searchSteps = 0;
  const MAX_SEARCH_STEPS = 100000; // safety limit to prevent infinite loops
  
  function solve(courseIndex, currentSchedule, usedTimeBlocks, branchDropped, currentTotalScore) {
    searchSteps++;
    if (searchSteps > MAX_SEARCH_STEPS) return;
    
    // Branch and Bound: Prune if we have already dropped more courses than the best known solution
    if (branchDropped.length > bestDroppedCount) return;
    
    if (courseIndex === processedCourses.length) {
      if (branchDropped.length < bestDroppedCount) {
        bestDroppedCount = branchDropped.length;
        // If we found a strictly better solution (fewer drops), we could clear out worse ones
        // but sorting at the end handles it. However, since we want top 20, we just collect them.
      }
      
      const cleanSchedule = currentSchedule.map(item => {
        if (item.dropped) return item;
        return {
          course_code: item.course_code,
          course_name: item.course_name,
          bundle_faculty: item.bundle.facultyName,
          allocations: item.bundle.allocations.map(a => {
            const { timeBlocks, score, period, ...cleanAlloc } = a;
            return cleanAlloc;
          })
        };
      });
      
      results.push({
        courses: cleanSchedule,
        branchDropped,
        totalScore: currentTotalScore,
        droppedCount: branchDropped.length
      });
      return;
    }
    
    const course = processedCourses[courseIndex];
    let coursePlaced = false;
    
    for (const bundle of course.bundles) {
      let clash = false;
      for (const tb of bundle.timeBlocks) {
        if (usedTimeBlocks.has(tb)) {
          clash = true;
          break;
        }
      }
      
      if (!clash) {
        coursePlaced = true;
        for (const tb of bundle.timeBlocks) usedTimeBlocks.add(tb);
        
        currentSchedule.push({
          course_code: course.course_code,
          course_name: course.course_name,
          bundle: bundle
        });
        
        solve(courseIndex + 1, currentSchedule, usedTimeBlocks, branchDropped, currentTotalScore + bundle.score);
        
        currentSchedule.pop();
        for (const tb of bundle.timeBlocks) usedTimeBlocks.delete(tb);
      }
    }
    
    if (!coursePlaced) {
      // Only drop if we are allowed to (i.e. branchDropped.length + 1 <= bestDroppedCount)
      if (branchDropped.length + 1 <= bestDroppedCount) {
        currentSchedule.push({
          course_code: course.course_code,
          course_name: course.course_name,
          dropped: true
        });
        
        const newBranchDropped = [...branchDropped, {
          course_code: course.course_code,
          course_name: course.course_name,
          reason: '100% clashing with other scheduled courses'
        }];
        
        solve(courseIndex + 1, currentSchedule, usedTimeBlocks, newBranchDropped, currentTotalScore - 100);
        currentSchedule.pop();
      }
    }
  }
  
  solve(0, [], new Set(), [], 0);
  
  // Sort timetables: fewest dropped courses first, then highest total score
  results.sort((a, b) => {
    if (a.droppedCount !== b.droppedCount) {
      return a.droppedCount - b.droppedCount;
    }
    return b.totalScore - a.totalScore;
  });

  return {
    globallyDropped,
    timetables: results.slice(0, 80) // Return top 80
  };
}
