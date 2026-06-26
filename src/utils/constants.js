export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export const TIMETABLE_GRID = {
  MON: {
    morning: [
      { theory: 'A1', lab: 'L1' },
      { theory: 'F1', lab: 'L2' },
      { theory: 'D1', lab: 'L3' },
      { theory: 'TB1', lab: 'L4' },
      { theory: 'TG1', lab: 'L5' },
      { theory: null, lab: 'L6' }
    ],
    evening: [
      { theory: 'A2', lab: 'L31' },
      { theory: 'F2', lab: 'L32' },
      { theory: 'D2', lab: 'L33' },
      { theory: 'TB2', lab: 'L34' },
      { theory: 'TG2', lab: 'L35' },
      { theory: null, lab: 'L36' },
      { theory: 'V3', lab: null }
    ]
  },
  TUE: {
    morning: [
      { theory: 'B1', lab: 'L7' },
      { theory: 'G1', lab: 'L8' },
      { theory: 'E1', lab: 'L9' },
      { theory: 'TC1', lab: 'L10' },
      { theory: 'TAA1', lab: 'L11' },
      { theory: null, lab: 'L12' }
    ],
    evening: [
      { theory: 'B2', lab: 'L37' },
      { theory: 'G2', lab: 'L38' },
      { theory: 'E2', lab: 'L39' },
      { theory: 'TC2', lab: 'L40' },
      { theory: 'TAA2', lab: 'L41' },
      { theory: null, lab: 'L42' },
      { theory: 'V4', lab: null }
    ]
  },
  WED: {
    morning: [
      { theory: 'C1', lab: 'L13' },
      { theory: 'A1', lab: 'L14' },
      { theory: 'F1', lab: 'L15' },
      { theory: 'V1', lab: 'L16' },
      { theory: 'V2', lab: 'L17' },
      { theory: null, lab: 'L18' }
    ],
    evening: [
      { theory: 'C2', lab: 'L43' },
      { theory: 'A2', lab: 'L44' },
      { theory: 'F2', lab: 'L45' },
      { theory: 'TD2', lab: 'L46' },
      { theory: 'TBB2', lab: 'L47' },
      { theory: null, lab: 'L48' },
      { theory: 'V5', lab: null }
    ]
  },
  THU: {
    morning: [
      { theory: 'D1', lab: 'L19' },
      { theory: 'B1', lab: 'L20' },
      { theory: 'G1', lab: 'L21' },
      { theory: 'TE1', lab: 'L22' },
      { theory: 'TCC1', lab: 'L23' },
      { theory: null, lab: 'L24' }
    ],
    evening: [
      { theory: 'D2', lab: 'L49' },
      { theory: 'B2', lab: 'L50' },
      { theory: 'G2', lab: 'L51' },
      { theory: 'TE2', lab: 'L52' },
      { theory: 'TCC2', lab: 'L53' },
      { theory: null, lab: 'L54' },
      { theory: 'V6', lab: null }
    ]
  },
  FRI: {
    morning: [
      { theory: 'E1', lab: 'L25' },
      { theory: 'C1', lab: 'L26' },
      { theory: 'TA1', lab: 'L27' },
      { theory: 'TF1', lab: 'L28' },
      { theory: 'TD1', lab: 'L29' },
      { theory: null, lab: 'L30' }
    ],
    evening: [
      { theory: 'E2', lab: 'L55' },
      { theory: 'C2', lab: 'L56' },
      { theory: 'TA2', lab: 'L57' },
      { theory: 'TF2', lab: 'L58' },
      { theory: 'TDD2', lab: 'L59' },
      { theory: null, lab: 'L60' },
      { theory: 'V7', lab: null }
    ]
  }
};

export const MORNING_THEORY_TIMES = [
  '8:00 AM to 8:50 AM',
  '9:00 AM to 9:50 AM',
  '10:00 AM to 10:50 AM',
  '11:00 AM to 11:50 AM',
  '12:00 PM to 12:50 PM',
  ''
];

export const MORNING_LAB_TIMES = [
  '08:00 AM to 08:50 AM',
  '08:51 AM to 09:40 AM',
  '09:51 AM to 10:40 AM',
  '10:41 AM to 11:30 AM',
  '11:40 AM to 12:30 PM',
  '12:31 PM to 1:20 PM'
];

export const EVENING_THEORY_TIMES = [
  '2:00 PM to 2:50 PM',
  '3:00 PM to 3:50 PM',
  '4:00 PM to 4:50 PM',
  '5:00 PM to 5:50 PM',
  '6:00 PM to 6:50 PM',
  '6:51 PM to 7:00 PM', // Wait, 7th slot is 7:01 PM to 7:50 PM in the image! So 6th slot is 6:51 to 7:40 PM? Let's check image... Image says 6:51 PM to 7:00 PM? Actually the image is a bit cut off but I can see "6:51 PM to 7:00 PM". Let me use what's likely right.
  '7:01 PM to 7:50 PM'
];

export const EVENING_LAB_TIMES = [
  '2:00 PM to 2:50 PM',
  '2:51 PM to 3:40 PM',
  '3:51 PM to 4:40 PM',
  '4:41 PM to 5:30 PM',
  '5:40 PM to 6:30 PM',
  '6:31 PM to 7:20 PM',
  ''
];
