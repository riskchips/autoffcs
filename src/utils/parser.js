export function parseFFCSText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim());
  const payload = {
    campus: "VIT Vellore Campus",
    semester: "Unknown Semester",
    preferences: {
      theory: "morning"
    },
    courses: []
  };

  let currentCourse = null;
  let parsingAllocations = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.startsWith('Semester') && !line.includes('Fall Semester 2026-27')) {
      if (line.length > 8) {
        payload.semester = line.substring(8).trim();
      } else if (i + 1 < lines.length) {
        payload.semester = lines[i+1].trim();
      }
    }

    if (line.startsWith('SemesterFall')) {
      payload.semester = line.replace('Semester', '');
    }

    if (line === 'Course List') {
      parsingAllocations = false;
      let j = i + 1;
      while (j < lines.length && !lines[j]) j++;
      if (j < lines.length) {
        const courseLine = lines[j];
        const sepIdx = courseLine.indexOf(' - ');
        if (sepIdx > -1) {
          const code = courseLine.substring(0, sepIdx).trim();
          const name = courseLine.substring(sepIdx + 3).trim();
          currentCourse = {
            course_code: code,
            course_name: name,
            allocations: []
          };
          payload.courses.push(currentCourse);
          i = j;
        }
      }
      continue;
    }

    if (line.includes('Slot Detail') && line.includes('Venue')) {
      parsingAllocations = true;
      continue;
    }

    if (parsingAllocations && (line.includes('VIT') || line.includes('User Image') || line.includes('Course Allocation Details'))) {
      parsingAllocations = false;
      continue;
    }

    if (parsingAllocations && currentCourse) {
      let parts = line.split('\t');
      if (parts.length < 4) {
        parts = line.split(/\s{2,}/);
      }
      
      if (parts.length >= 4) {
        const slotRaw = parts[0].trim();
        const venue = parts[1].trim();
        const faculty = parts[2].trim();
        const type = parts[3].trim();
        
        const slotArr = slotRaw.split('+').map(s => s.trim());
        
        currentCourse.allocations.push({
          slot: slotArr,
          venue: venue,
          faculty: faculty,
          course_type: type
        });
      }
    }
  }

  return payload;
}
