import timetableData from '../../timetable.json';
import { getFacultyScore } from '../../data/facultyRatings.js';

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

function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombinations = cartesianProduct(rest);
  return first.flatMap(val => restCombinations.map(combo => [val, ...combo]));
}

/**
 * Returns available, non-clashing faculty bundles for a specific course.
 * @param {Object} rawCourse - The original course object from the payload containing all allocations.
 * @param {Array} currentTimetable - The array of currently scheduled courses in the timetable.
 * @param {string} courseCode - The code of the course we want to swap.
 * @returns {Array} List of valid bundles.
 */
export function getAvailableBundles(rawCourse, currentTimetable, courseCode) {
  if (!rawCourse || !rawCourse.allocations) return [];

  // Calculate used time blocks by ALL OTHER courses in the current timetable
  const usedBlocks = new Set();
  for (const item of currentTimetable) {
    if (item.dropped) continue;
    if (item.course_code === courseCode) continue; // skip the course we are trying to swap!

    // Extract blocks from its allocations
    for (const alloc of item.allocations || []) {
      const info = getSlotInfo(alloc.slot);
      for (const tb of info.timeBlocks) {
        usedBlocks.add(tb);
      }
    }
  }

  const requiredTypes = new Set();
  const allocsByType = {};
  const allocsByFacultyAndType = {};
  
  // Process raw allocations
  for (const alloc of rawCourse.allocations) {
    requiredTypes.add(alloc.course_type);
    
    const slotInfo = getSlotInfo(alloc.slot);
    const allocWithMeta = {
      ...alloc,
      timeBlocks: Array.from(slotInfo.timeBlocks),
      period: slotInfo.period,
      score: getFacultyScore(alloc.faculty)
    };
    
    // We don't filter by theory preference here because the user manually wants to explore all valid options.
    // However, they must NOT clash with `usedBlocks`.
    let internalClash = false;
    for (const tb of allocWithMeta.timeBlocks) {
      if (usedBlocks.has(tb)) {
        internalClash = true;
        break;
      }
    }
    
    if (!internalClash) {
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
  if (typesArray.length === 0) return [];

  let bundles = [];
  
  // Try Same-Faculty Bundles
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
        // Check for internal clashes between the Theory and Lab
        const comboUsedBlocks = new Set();
        let internalClash = false;
        let totalScore = 0;
        for (const alloc of combo) {
          totalScore += alloc.score;
          for (const tb of alloc.timeBlocks) {
            if (comboUsedBlocks.has(tb)) {
              internalClash = true;
              break;
            }
            comboUsedBlocks.add(tb);
          }
          if (internalClash) break;
        }
        
        if (!internalClash) {
          bundles.push({
            facultyName: faculty,
            isSameFaculty: true,
            score: totalScore,
            allocations: combo,
            timeBlocks: Array.from(comboUsedBlocks)
          });
        }
      }
    }
  }
  
  // If no same-faculty bundles exist, allow mixed-faculty bundles
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
        const comboUsedBlocks = new Set();
        let internalClash = false;
        let totalScore = 0;
        for (const alloc of combo) {
          totalScore += alloc.score;
          for (const tb of alloc.timeBlocks) {
            if (comboUsedBlocks.has(tb)) {
              internalClash = true;
              break;
            }
            comboUsedBlocks.add(tb);
          }
          if (internalClash) break;
        }
        
        if (!internalClash) {
          bundles.push({
            facultyName: "MIXED",
            isSameFaculty: false,
            score: totalScore,
            allocations: combo,
            timeBlocks: Array.from(comboUsedBlocks)
          });
        }
      }
    }
  }
  
  // Sort bundles by score (highest first)
  bundles.sort((a, b) => b.score - a.score);
  
  // Filter out duplicate identical allocations (could happen with MIXED)
  const uniqueBundles = [];
  const seenSignatures = new Set();
  for (const bundle of bundles) {
    // create a signature based on slots
    const sig = bundle.allocations.map(a => a.slot.join('+')).sort().join('|');
    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      uniqueBundles.push(bundle);
    }
  }

  return uniqueBundles;
}
