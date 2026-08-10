import fs from 'fs';

const payload = {
  student: {
    registration_number: "25BME0177",
    type: "STUDENT"
  },
  campus: "VIT Vellore Campus",
  semester: "Fall Semester 2026-27",
  preferences: {
    theory: "morning"
  },
  courses: [
    {
      course_code: "BAGER101",
      course_name: "German Level I",
      allocations: [
        {
          slot: ["TBB2"],
          venue: "SJT105",
          faculty: "DHANANJAY KUMAR",
          course_type: "ETH"
        },
        {
          slot: ["L15", "L16"],
          venue: "TT116",
          faculty: "DHANANJAY KUMAR",
          course_type: "ELA"
        },
        {
          slot: ["L1", "L2"],
          venue: "PRP555",
          faculty: "Gowsalya M", 
          course_type: "ELA"
        },
        {
          slot: ["A1"],
          venue: "PRP555",
          faculty: "Gowsalya M", 
          course_type: "ETH"
        }
      ]
    },
    {
      course_code: "BASTS101",
      course_name: "Qualitative and Quantitative Skills Practice I",
      allocations: [
        {
          slot: ["E1", "TE1"],
          venue: "SMV116",
          faculty: "TIME (APT)",
          course_type: "SS"
        },
        {
          slot: ["E2", "TE2"],
          venue: "SMV101",
          faculty: "TIME (APT)",
          course_type: "SS"
        }
      ]
    }
  ]
};

async function runTest() {
  console.log("Sending request to generate timetables...");
  
  try {
    const response = await fetch('http://127.0.0.1:3000/api/v1/timetable/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Error! Status: ${response.status}`);
      const err = await response.text();
      console.error(err);
      return;
    }
    
    const data = await response.json();
    console.log("Success! Timetables generated.");
    console.log(`Globally dropped courses: ${data.globally_dropped_courses.length}`);
    console.log(`Generated timetables count: ${data.generated_timetables.length}`);
    
    // PII Check
    if (data.student) {
      console.error("FAIL: PII (student data) was returned in the response!");
    } else {
      console.log("PASS: PII (student data) was successfully stripped.");
    }
    
    if (data.generated_timetables.length > 0) {
      console.log("First Timetable:");
      console.log(JSON.stringify(data.generated_timetables[0], null, 2));
    }
    
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

runTest();
