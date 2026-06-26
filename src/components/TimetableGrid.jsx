import React from 'react';
import { DAYS, TIMETABLE_GRID, MORNING_THEORY_TIMES, MORNING_LAB_TIMES, EVENING_THEORY_TIMES, EVENING_LAB_TIMES } from '../utils/constants';
import { getFacultyScore } from '../data/facultyRatings';
import '../index.css';

const TimetableGrid = ({ schedule, targetRef }) => {
  if (!schedule) return null;

  // Helper to find a course in the schedule that occupies a given slot
  const getCourseForSlot = (slot) => {
    if (!slot) return null;
    return schedule.find(s => s.slot.split('+').includes(slot));
  };

  const renderCell = (cellData) => {
    const theoryCourse = getCourseForSlot(cellData.theory);
    const labCourse = getCourseForSlot(cellData.lab);
    
    // If a lab spans this slot, or theory spans this slot
    // Prioritize showing lab if both exist (though they shouldn't clash in reality if FFCS works right, 
    // actually theory and lab slots overlay in the same physical cell in the UI)
    
    // The cell has a format like "A1 / L1" if empty
    // If occupied, we show the course code and venue.
    
    const isOccupied = theoryCourse || labCourse;
    const course = theoryCourse || labCourse;
    const isLab = course && ['ELA', 'LA', 'LO', 'EPJ'].includes(course.type);
    const originalText = `${cellData.theory || ''} ${cellData.theory && cellData.lab ? '/' : ''} ${cellData.lab || ''}`;

    let courseCode = '';
    let courseName = '';
    if (course) {
      const parts = course.courseTitle.split(' - ');
      courseCode = parts[0];
      courseName = parts.length > 1 ? parts[1] : '';
    }

    return (
      <div className={`cell ${isOccupied ? 'occupied' : 'empty'} ${isOccupied ? (isLab ? 'lab-cell' : 'theory-cell') : ''}`}>
        {isOccupied ? (
          <>
            <div className="course-type-indicator">{isLab ? 'L' : 'T'}</div>
            <div className="course-code">{courseCode}</div>
            <div className="course-title" title={courseName}>
              {courseName}
            </div>
            <div className="faculty">
              {course.faculty}
              <div className="faculty-rating" style={{ marginTop: '2px', fontSize: '0.65rem' }}>
                {getFacultyScore(course.faculty) === 2 && <span title="Goated Teacher" style={{ color: '#fbbf24' }}>⭐⭐⭐</span>}
                {getFacultyScore(course.faculty) === 1 && <span title="Good Teacher" style={{ color: '#fbbf24' }}>⭐⭐</span>}
                {getFacultyScore(course.faculty) === 0 && <span title="Average Teacher" style={{ color: '#fbbf24' }}>⭐</span>}
                {getFacultyScore(course.faculty) === -1 && <span title="Bad Teacher" style={{ color: '#9ca3af' }}>0 Stars</span>}
                {getFacultyScore(course.faculty) === -2 && <span title="Blacklisted Teacher" style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Blacklisted</span>}
              </div>
            </div>
            <div className="venue">{course.venue}</div>
          </>
        ) : (
          <div className="slot-placeholder">{originalText}</div>
        )}
      </div>
    );
  };

  return (
    <div className="timetable-container" ref={targetRef}>
      <table className="timetable">
        <thead>
          <tr>
            <th className="corner">
              <div>THEORY</div>
              <div>HOURS</div>
            </th>
            {MORNING_THEORY_TIMES.map((time, idx) => (
              <th key={`mth-${idx}`}>{time.split(' to ').map(t => <div key={t}>{t}</div>)}</th>
            ))}
            <th className="lunch-col" rowSpan={2}>
              <div className="vertical-text">LUNCH</div>
            </th>
            {EVENING_THEORY_TIMES.map((time, idx) => (
              <th key={`eth-${idx}`}>{time.split(' to ').map(t => <div key={t}>{t}</div>)}</th>
            ))}
          </tr>
          <tr>
            <th className="corner">
              <div>LAB</div>
              <div>HOURS</div>
            </th>
            {MORNING_LAB_TIMES.map((time, idx) => (
              <th key={`mla-${idx}`}>{time.split(' to ').map(t => <div key={t}>{t}</div>)}</th>
            ))}
            {EVENING_LAB_TIMES.map((time, idx) => (
              <th key={`ela-${idx}`}>{time ? time.split(' to ').map(t => <div key={t}>{t}</div>) : null}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, dayIdx) => (
            <tr key={day}>
              <th className="day-header">{day}</th>
              
              {/* Morning Slots */}
              {TIMETABLE_GRID[day].morning.map((cellData, idx) => (
                <td key={`m-${day}-${idx}`}>
                  {renderCell(cellData)}
                </td>
              ))}
              
              {/* LUNCH body cell (only in the first row, spanning all 5 days) */}
              {dayIdx === 0 && (
                <td className="lunch-col" rowSpan={5}></td>
              )}

              {/* Evening Slots */}
              {TIMETABLE_GRID[day].evening.map((cellData, idx) => (
                <td key={`e-${day}-${idx}`}>
                  {renderCell(cellData)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;
