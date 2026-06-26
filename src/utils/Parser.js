import { getFacultyScore } from '../data/facultyRatings.js';

export const parseFFCSData = (text) => {
  const courses = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentCourseTitle = null;
  let currentOptions = [];
  
  const finishCurrentCourse = () => {
    if (currentCourseTitle && currentOptions.length > 0) {
      const optionsByType = {};
      currentOptions.forEach(opt => {
        if (!optionsByType[opt.type]) optionsByType[opt.type] = [];
        optionsByType[opt.type].push(opt);
      });
      courses.push({ title: currentCourseTitle, optionsByType });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore known headers and noise
    if (
      line.startsWith('VIT') || 
      line.includes('Course Allocation Details') || 
      line.includes('Student those who') || 
      line.includes('Allotted classes') || 
      line.includes('If a particular') || 
      line.includes('Semester') || 
      line.includes('Curriculum') || 
      line.includes('Course List') || 
      (line.includes('Slot Detail') && line.includes('Venue'))
    ) {
      continue;
    }
    
    // Check for a Course Title (e.g., "BAGER101 - German Level I")
    const titleMatch = line.match(/^([A-Z0-9]{5,12})\s+-\s+(.+)$/);
    if (titleMatch) {
      finishCurrentCourse();
      currentCourseTitle = line;
      currentOptions = [];
      continue;
    }
    
    // Check for Slot details if we are inside a course
    if (currentCourseTitle) {
      // Regex expects: Slot(s) Venue Faculty CourseType
      const slotMatch = line.match(/^(\S+)\s+(\S+)\s+(.+?)\s+(\S+)$/);
      if (slotMatch && slotMatch[2] !== '-') {
        currentOptions.push({
          slot: slotMatch[1],
          parsedSlots: slotMatch[1].split('+'),
          venue: slotMatch[2],
          faculty: slotMatch[3],
          type: slotMatch[4],
          facultyScore: getFacultyScore(slotMatch[3])
        });
      }
    }
  }
  
  finishCurrentCourse();
  return courses;
};

const isMorningSlot = (slotString) => {
  const firstSlot = slotString.split('+')[0].trim();
  
  if (firstSlot.startsWith('L')) {
    const num = parseInt(firstSlot.substring(1), 10);
    return num >= 1 && num <= 30;
  }
  
  if (firstSlot.startsWith('V')) {
    const num = parseInt(firstSlot.substring(1), 10);
    return num === 1 || num === 2;
  }
  
  return firstSlot.endsWith('1');
};

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const calculateScheduleScore = (schedule) => {
  return schedule.reduce((sum, item) => sum + getFacultyScore(item.faculty), 0);
};

export const generateSchedule = (courses, preference, ignorePreferenceFor = []) => {
  console.log('Generating packages for', courses.length, 'courses');
  const coursePackages = courses.map(course => {
    const types = Object.keys(course.optionsByType);
    
    const validOptionsByType = {};
    types.forEach(type => {
      validOptionsByType[type] = course.optionsByType[type].filter(opt => {
        if (ignorePreferenceFor.includes(course.title)) return true;
        if (preference && preference !== 'none') {
          const isMorning = isMorningSlot(opt.slot);
          const isLab = ['ELA', 'LA', 'LO', 'EPJ'].includes(type);
          if (preference === 'morning_theory') return isLab ? !isMorning : isMorning;
          if (preference === 'morning_lab') return isLab ? isMorning : !isMorning;
        }
        return true;
      });
    });

    const combinations = [];
    
    const buildCombinations = (typeIndex, currentCombination) => {
      if (typeIndex === types.length) {
        const occupied = new Set();
        let clash = false;
        for (const item of currentCombination) {
          for (const s of item.parsedSlots) {
            if (occupied.has(s)) clash = true;
            occupied.add(s);
          }
        }
        if (!clash) {
          let score = currentCombination.reduce((sum, item) => sum + item.facultyScore, 0);
          
          // Bonus for having the same teacher for Theory and Lab
          const theoryFacs = currentCombination.filter(i => i.type.includes('TH')).map(i => i.faculty);
          const labFacs = currentCombination.filter(i => i.type.includes('LA')).map(i => i.faculty);
          theoryFacs.forEach(tf => {
            if (labFacs.includes(tf) && !tf.includes('(APT)')) {
               score += 5;
            }
          });

          combinations.push({
            items: [...currentCombination],
            score: score
          });
        }
        return;
      }
      
      const type = types[typeIndex];
      if (!validOptionsByType[type]) return;
      for (const option of validOptionsByType[type]) {
        currentCombination.push({ courseTitle: course.title, type, ...option });
        buildCombinations(typeIndex + 1, currentCombination);
        currentCombination.pop();
      }
    };

    buildCombinations(0, []);
    console.log(`Course ${course.title} has ${combinations.length} valid combinations.`);
    return { courseTitle: course.title, combinations };
  });

  console.log('Filtering valid packages...');

  // Filter out any courses that have literally 0 valid combinations
  const validCoursePackages = coursePackages.filter(pkg => pkg.combinations.length > 0);

  // Pre-calculate max scores, sort combinations, and cap to top 100
  validCoursePackages.forEach(pkg => {
    pkg.combinations.sort((a, b) => b.score - a.score);
    pkg.combinations = pkg.combinations.slice(0, 100);
    pkg.maxScore = pkg.combinations.length > 0 ? pkg.combinations[0].score : 0;
  });

  // MRV Heuristic: Sort courses by fewest combinations first to fail-fast
  validCoursePackages.sort((a, b) => a.combinations.length - b.combinations.length);

  // Pre-calculate max possible remaining score for bounding
  const maxRemainingScore = new Array(validCoursePackages.length + 1).fill(0);
  for (let i = validCoursePackages.length - 1; i >= 0; i--) {
    maxRemainingScore[i] = maxRemainingScore[i + 1] + validCoursePackages[i].maxScore;
  }

  const perfectSchedules = [];
  const maxSchedules = 100;
  let worstTopScore = -Infinity;
  let steps = 0;
  const maxSteps = 50000;

  const backtrack = (index, currentSchedule, occupiedSlots, currentScore) => {
    if (steps > maxSteps) return true; // Signal abortion
    
    // BRANCH AND BOUND PRUNING
    if (perfectSchedules.length >= maxSchedules && (currentScore + maxRemainingScore[index] < worstTopScore)) {
      return false; 
    }
    
    if (index === validCoursePackages.length) {
      perfectSchedules.push({ schedule: [...currentSchedule], score: currentScore });
      
      if (perfectSchedules.length > maxSchedules) {
        perfectSchedules.sort((a, b) => b.score - a.score);
        perfectSchedules.pop();
        worstTopScore = perfectSchedules[maxSchedules - 1].score;
      } else if (perfectSchedules.length === maxSchedules) {
        perfectSchedules.sort((a, b) => b.score - a.score);
        worstTopScore = perfectSchedules[maxSchedules - 1].score;
      }
      return false;
    }

    steps++;
    if (steps % 10000 === 0) console.log('Steps:', steps);
    
    const coursePkg = validCoursePackages[index];

    for (const combinationObj of coursePkg.combinations) {
      if (steps > maxSteps) return true; // Fast exit

      const combination = combinationObj.items;
      let clash = false;
      const slotsToOccupy = [];
      for (const item of combination) {
        for (const s of item.parsedSlots) {
          if (occupiedSlots.has(s)) { clash = true; break; }
          slotsToOccupy.push(s);
        }
        if (clash) break;
      }

      if (!clash) {
        combination.forEach(item => currentSchedule.push(item));
        slotsToOccupy.forEach(s => occupiedSlots.add(s));
        
        const combScore = combinationObj.score;
        const aborted = backtrack(index + 1, currentSchedule, occupiedSlots, currentScore + combScore);

        for (let i = 0; i < combination.length; i++) currentSchedule.pop();
        slotsToOccupy.forEach(s => occupiedSlots.delete(s));
        
        if (aborted) return true;
      }
    }
    
    return false;
  };

  console.log('Starting Phase 1 (DFS)');
  backtrack(0, [], new Set(), 0);
  console.log('Finished Phase 1 (DFS). Steps taken:', steps, 'Perfect schedules found:', perfectSchedules.length);

  if (perfectSchedules.length > 0) {
    perfectSchedules.sort((a, b) => b.score - a.score);
    const isTotalSuccess = validCoursePackages.length === courses.length;
    const unscheduled = courses
      .filter(c => !validCoursePackages.find(vpc => vpc.courseTitle === c.title))
      .map(c => c.title);
      
    return {
      success: isTotalSuccess,
      schedules: perfectSchedules.map(p => p.schedule),
      unscheduledCourses: unscheduled
    };
  }

  console.log('Starting Phase 2 (Greedy)');
  // Pre-sort all combinations for Phase 2 just once
  coursePackages.forEach(pkg => {
    pkg.combinations.sort((a, b) => b.score - a.score);
  });

  let bestSchedules = [];
  let maxScheduledCount = -1;

  for (let i = 0; i < 200; i++) {
    const shuffledCourses = shuffleArray(coursePackages);
    const currentSchedule = [];
    const occupiedSlots = new Set();

    for (const coursePkg of shuffledCourses) {
      if (coursePkg.combinations.length === 0) continue;

      // Randomly pick from the top combinations (e.g. top 30%) to add variety but keep scores high
      // without doing a full shuffle & sort on thousands of items.
      let poolSize = Math.max(1, Math.ceil(coursePkg.combinations.length * 0.3));
      let pool = coursePkg.combinations.slice(0, poolSize);
      let shuffledPool = shuffleArray(pool);

      for (const combinationObj of shuffledPool) {
        const combination = combinationObj.items;
        let clash = false;
        for (const item of combination) {
          for (const s of item.parsedSlots) {
            if (occupiedSlots.has(s)) { clash = true; break; }
          }
          if (clash) break;
        }

        if (!clash) {
          combination.forEach(item => currentSchedule.push(item));
          combination.forEach(item => {
            item.parsedSlots.forEach(s => occupiedSlots.add(s));
          });
          break; // picked one valid combo for this course
        }
      }
    }

    if (currentSchedule.length > maxScheduledCount) {
      maxScheduledCount = currentSchedule.length;
      bestSchedules = [currentSchedule];
    } else if (currentSchedule.length === maxScheduledCount && bestSchedules.length < maxSchedules) {
      const scheduleStr = currentSchedule.map(s => `${s.courseTitle}-${s.type}-${s.slot}`).sort().join('|');
      const isDuplicate = bestSchedules.some(bs => {
        return bs.map(s => `${s.courseTitle}-${s.type}-${s.slot}`).sort().join('|') === scheduleStr;
      });
      if (!isDuplicate) {
        bestSchedules.push(currentSchedule);
      }
    }
  }

  bestSchedules.sort((a, b) => calculateScheduleScore(b) - calculateScheduleScore(a));
  const bestSchedule = bestSchedules[0] || [];
  
  const scheduledCourseNames = [...new Set(bestSchedule.map(s => s.courseTitle))];
  const allCourseNames = courses.map(c => c.title);
  const unscheduledCourses = allCourseNames.filter(c => !scheduledCourseNames.includes(c));

  return {
    success: unscheduledCourses.length === 0,
    schedules: bestSchedules,
    unscheduledCourses
  };
};
