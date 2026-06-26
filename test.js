import fs from 'fs';
import { parseFFCSData, generateSchedule } from './src/utils/Parser.js';

const data = `
VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
UCC - University Core Courses

Course List
BAGER101 - German Level I


Slot Detail	Venue	Faculty	Course Type
TBB2	SJT105	DHANANJAY KUMAR	ETH
L15+L16	TT116	DHANANJAY KUMAR	ELA
TAA2	SJT124	ARATI KUMARI	ETH
L15+L16	PRP555	ARATI KUMARI	ELA
L39+L40	PRP555	ADAIKALAM ARULANANDAM	ELA
TCC1	SJT114	ADAIKALAM ARULANANDAM	ETH
TDD2	SJT113	ABHIJIT KR DARBEY	ETH
L5+L6	PRP555	ABHIJIT KR DARBEY	ELA
TCC1	SJT113	AMIT KUMAR SAINI	ETH
TAA1	SJT201	ADAIKALAM ARULANANDAM	ETH
L55+L56	PRP555	ADAIKALAM ARULANANDAM	ELA
L41+L42	PRP555	AMIT KUMAR SAINI	ELA
TE1	SJT508	AMIT KUMAR SAINI	ETH
TG2	TT404	DHANANJAY KUMAR	ETH
L47+L48	PRP555	AMIT KUMAR SAINI	ELA
L21+L22	PRP555	ARATI KUMARI	ELA
L1+L2	PRP555	DHANANJAY KUMAR	ELA
TBB2	MB211	ARATI KUMARI	ETH
L35+L36	TT318	ABHIJIT KR DARBEY	ELA
TCC1	MB214	ABHIJIT KR DARBEY	ETH






VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
UCC - University Core Courses

Course List
BASTS101 - Qualitative and Quantitative Skills Practice I


Slot Detail	Venue	Faculty	Course Type
E1+TE1	SMV116	TIME (APT)	SS
E2+TE2	SMV101	TIME (APT)	SS
E2+TE2	TT201	TIME (APT)	SS
E1+TE1	TT204	TIME (APT)	SS
E2+TE2	PRP251	SIXPHRASE (APT)	SS
E2+TE2	SMV116	TIME (APT)	SS
E1+TE1	SMV101	TIME (APT)	SS
E1+TE1	CDMM403	TIME (APT)	SS
E1+TE1	TT201	TIME (APT)	SS
E2+TE2	TT204	TIME (APT)	SS
E1+TE1	MB211	ETHNUS (APT)	SS
E2+TE2	MB211	ETHNUS (APT)	SS
E1+TE1	MB212	FACE (APT)	SS
E2+TE2	MB212	FACE (APT)	SS
E1+TE1	MB213	SIXPHRASE (APT)	SS
E1+TE1	MB214	ETHNUS (APT)	SS
E2+TE2	CDMM403	TIME (APT)	SS
E1+TE1	PRP251	SIXPHRASE (APT)	SS
E2+TE2	MB214	ETHNUS (APT)	SS
E2+TE2	SJT215	FACE (APT)	SS
E1+TE1	PRP426	SIXPHRASE (APT)	SS
E2+TE2	PRP426	SIXPHRASE (APT)	SS
E1+TE1	PRP427	ETHNUS (APT)	SS
E2+TE2	PRP427	ETHNUS (APT)	SS
E2+TE2	PRP429	FACE (APT)	SS
E2+TE2	MB213	SIXPHRASE (APT)	SS
E1+TE1	SJT215	FACE (APT)	SS
E1+TE1	SJT222	ETHNUS (APT)	SS
E2+TE2	SJT222	ETHNUS (APT)	SS
E2+TE2	SJT223	FACE (APT)	SS
E2+TE2	SJT224	SIXPHRASE (APT)	SS
E1+TE1	SJT221	SIXPHRASE (APT)	SS
E2+TE2	SJT221	SIXPHRASE (APT)	SS
E1+TE1	SJT223	FACE (APT)	SS
E2+TE2	PRP424	ETHNUS (APT)	SS
E1+TE1	PRP425	FACE (APT)	SS
E1+TE1	SJT224	SIXPHRASE (APT)	SS
E1+TE1	PRP429	FACE (APT)	SS
E1+TE1	PRP424	ETHNUS (APT)	SS
E2+TE2	PRP425	FACE (APT)	SS






VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
PCC - Programme Core Courses

Course List
BAMEE202 - Metallurgy and Mechanical Behaviour of Materials


Slot Detail	Venue	Faculty	Course Type
L13+L14	GDN139	PADMANABHAN K	ELA
L41+L42	GDN139	PADMANABHAN K	ELA
F1+TF1	MB211	PADMANABHAN K	ETH
F2+TF2	MB212	PADMANABHAN K	ETH
F1+TF1	MB214	AHANKARI SANDEEP SURESHRAO	ETH
L51+L52	GDN139	PADMANABHAN K	ELA
L21+L22	GDN139	SREEKANTH M. S	ELA
L23+L24	GDN139	SREEKANTH M. S	ELA
F1+TF1	MB212	SK ARIFUL RAHAMAN	ETH
F1+TF1	MB213	SREEKANTH M. S	ETH
F2+TF2	MB213	SREEKANTH M. S	ETH
F2+TF2	MB214	AHANKARI SANDEEP SURESHRAO	ETH
L5+L6	GDN139	PADMANABHAN K	ELA
L11+L12	GDN139	SK ARIFUL RAHAMAN	ELA
L39+L40	GDN139	SK ARIFUL RAHAMAN	ELA
F2+TF2	MB211	SK ARIFUL RAHAMAN	ETH
L25+L26	GDN139	SK ARIFUL RAHAMAN	ELA
L35+L36	GDN139	SK ARIFUL RAHAMAN	ELA
L47+L48	GDN139	SREEKANTH M. S	ELA
L55+L56	GDN139	SREEKANTH M. S	ELA
F2+TF2	MB218	SASIKUMAR R	ETH
L7+L8	GDN139	AHANKARI SANDEEP SURESHRAO	ELA
F1+TF1	MB218	KARRI SANTHOSH KUMAR	ETH
L3+L4	GDN139	SASIKUMAR R	ELA
L15+L16	GDN139	SASIKUMAR R	ELA
L45+L46	GDN139	KARRI SANTHOSH KUMAR	ELA
L57+L58	GDN139	KARRI SANTHOSH KUMAR	ELA
L9+L10	GDN139	AHANKARI SANDEEP SURESHRAO	ELA
L37+L38	GDN139	AHANKARI SANDEEP SURESHRAO	ELA
L43+L44	GDN139	AHANKARI SANDEEP SURESHRAO	ELA






VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
PCC - Programme Core Courses

Course List
BAMEE204 - Fluid Mechanics and Machinery


Slot Detail	Venue	Faculty	Course Type
L39+L40	GDN25A	JAYAPRAKASH NARAYAN M	ELA
L9+L10	GDN25A	DEEPAKKUMAR R	ELA
L29+L30	GDN25A	DEEPAKKUMAR R	ELA
D1+TD1	MB226	ANUJ KUMAR	ETH
D2+TD2	MB224	DEEPAKKUMAR R	ETH
L19+L20	GDN25A	PRAKASH R	ELA
D2+TD2	GDN106	PRAKASH R	ETH
L37+L38	GDN25A	ANUJ KUMAR	ELA
D1+TD1	MB224	SREEJA SADASIVAN	ETH
D1+TD1	GDN106	MOHAN C.G	ETH
L49+L50	GDN25A	SREEJA SADASIVAN	ELA
L13+L14	GDN25A	ARUNA KUMAR BEHURA	ELA
L27+L28	GDN25A	ARUNA KUMAR BEHURA	ELA
L55+L56	GDN25A	JAYAPRAKASH NARAYAN M	ELA
D2+TD2	GDN107	ARUNA KUMAR BEHURA	ETH
D1+TD1	MB225	JAYAPRAKASH NARAYAN M	ETH
L33+L34	GDN25A	SREEJA SADASIVAN	ELA
L57+L58	GDN25A	ANUJ KUMAR	ELA
D2+TD2	MB213	RAJESH KANNA	ETH
L7+L8	GDN25A	RAJESH KANNA	ELA
L21+L22	GDN25A	RAJESH KANNA	ELA
L31+L32	GDN25A	MOHAMED IBRAHIM M	ELA
L51+L52	GDN25A	MOHAMED IBRAHIM M	ELA
D1+TD1	MB214	MOHAMED IBRAHIM M	ETH
L5+L6	GDN25A	PRAKASH R	ELA
L15+L16	GDN25A	GAURAV GUPTA	ELA
D2+TD2	GDN121	GAURAV GUPTA	ETH
L3+L4	GDN25A	GAURAV GUPTA	ELA
L35+L36	GDN25A	MOHAN C.G	ELA
L45+L46	GDN25A	MOHAN C.G	ELA






VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
CON - Concentration

Course List
BAMEE305 - Precision Engineering and Metrology


Slot Detail	Venue	Faculty	Course Type
B2+TB2	MB227	KAPIL MANOHARAN	ETH
B2+TB2	GDN121	MURALIDHARAN B	ETH
L21+L22	GDN138	KAPIL MANOHARAN	ELA
B1+TB1	GDN120	MURALIDHARAN B	ETH
B1+TB1	MB227	RATNESH RAJ	ETH
L9+L10	GDN138	MURALIDHARAN B	ELA
L23+L24	GDN138	MURALIDHARAN B	ELA
L31+L32	GDN138	MURALIDHARAN B	ELA
L33+L34	GDN138	RATNESH RAJ	ELA
L27+L28	GDN138	SUYA PREM ANAND P	ELA
B1+TB1	GDN121	SUYA PREM ANAND P	ETH
B2+TB2	GDN122	SUYA PREM ANAND P	ETH
L7+L8	GDN138	KAPIL MANOHARAN	ELA
L51+L52	GDN138	MURALIDHARAN B	ELA
L41+L42	GDN138	SUYA PREM ANAND P	ELA
L55+L56	GDN138	SUYA PREM ANAND P	ELA
L39+L40	GDN138	RATNESH RAJ	ELA
L11+L12	GDN138	SUYA PREM ANAND P	ELA






VIT
(Vellore Campus)
   
User Image
25BME0177 (STUDENT) 
☰
Course Allocation Details

Course
Note:
Student those who have curriculum can view the allocated courses.
Allotted classes shown based on Specific Class Option (i.e. General/ Programme Group/ Programme Specialization/ School).
If a particular course is not available in the course list, mean that the course is not offered by the respective school


SemesterFall Semester 2026-27


Curriculum category
CON - Concentration

Course List
BAMEE401 - Production and Operations Management


Slot Detail	Venue	Faculty	Course Type
C2+TC2+TCC2	MB225	SAMPATH KUMAR T	TH
C1+TC1+TCC1	MB226	JOEL J	TH
C2+TC2+TCC2	MB227	JAYAKRISHNA K	TH
C1+TC1+TCC1	MB225	RAMANUJAM R	TH
C2+TC2+TCC2	MB226	JOEL J	TH
C1+TC1+TCC1	GDNG07	RAJYALAKSHMI G	TH
A2+TA2+TAA2	CDMM404	ARAVIND RAJ S	TH
`;

console.time('parseFFCSData');
const courses = parseFFCSData(data);
console.timeEnd('parseFFCSData');

console.log('Courses Parsed:', courses.length);

console.time('generateSchedule (Morning Theory)');
console.log('Starting generateSchedule...');
const result = generateSchedule(courses, 'morning_theory');
console.log('Finished generateSchedule...');
console.timeEnd('generateSchedule (Morning Theory)');

console.log('Success:', result.success);
console.log('Generated Schedules:', result.schedules.length);
console.log('Unscheduled Courses:', result.unscheduledCourses);

if (result.schedules.length > 0) {
  console.log('Best Schedule:');
  const best = result.schedules[0];
  best.forEach(item => {
    console.log(' -', item.courseTitle, item.type, item.slot, item.faculty);
  });
}
