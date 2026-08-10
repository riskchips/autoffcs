export const FACULTY_RATINGS = {
  exceptional: [
    "Gowsalya M", "John Kennedy", "Mohana Ma'am", "Mohana N", "Kalyani Desikan", "Pankaj Shukla",
    "Maheswari R", "Kannadasan", "Narayanamoorthy", "Alan G", "Punithavelan", "Sanjit Das", "S. Radha",
    "Aju D", "Anand M", "Balamurugan R", "Balasubramanian V", "Gawas Mahadev Anant", "Jaisankar N",
    "Kumar K", "Natarajan P", "Rajakumar K", "Rajkumar R", "Rajkumar S", "Vijaya Kumar K", "Coumaran G",
    "Gopichand G", "Bagyaveereswaran V", "Mathew M. Noel", "Balamurugan S", "Sridharan T B",
    "Ramesh Pathy M", "Geetha M", "Vinitha", "Krishnamoorthy A", "Ushus Elizebeth Zachariah"
  ],
  good: [
    "Reena rani", "Shobhana devi", "Monica c", "Rachna bhatia", "Sivanesan", "Manjari", "Dinesh",
    "Gowrisankar", "Kavitha", "Ramesh k", "Kalpana priya", "nalllah m", "Manimaran", "Dinesh kumar",
    "Senthil Nathan", "Navaman", "Nagaraja", "Padma priya", "Evangeline", "Jagannath M", "Richa",
    "Janaki Meena", "Naresh", "Muthukumar", "Abdul Quidar", "Khadar Nawas", "Sakarrvarti",
    "Anosouya", "Nisha", "Dhanashaker", "David Maxim", "Abhishek Kumar Singh", "Luke Gerard Cristie",
    "Atanu dutta", "Vigneshwaran Swaminathan", "Anisha M Lal", "Anny Leema A", "Balakrishnan P",
    "Dheeba J", "Geetha Mary A", "Lavanya K", "Marimuthu K", "Mohanasundaram R", "Nalini N",
    "Naveen Kumar N", "Rishin Haldar", "Sanjiban Sekhar Roy", "Shashank Mouli Satapathy", "Vijayasherly V",
    "Sriram G", "Sivaprasad Darla", "Boopathi M", "John Rajan A", "Srinivasan Narayanan", "Jeevanantham A.K",
    "Raju Abraham", "Pandivelan C", "Devendiran S", "Geetha Manivasagam", "Thiagarajan S", "Benedict Thomas",
    "Senthil Kumar A", "Anthony Xavior M", "Debasish Mishra", "Kalaivani T", "Anand Prem Rajan", "Jayanthi S",
    "Sangeetha Subramanian", "Subathradevi C", "Rasool M", "Sanjit Kumar", "Sivakumar A", "Shanthi C",
    "Abhishek Sinha", "Sivabalan S", "Abhishek G", "Brisilla R M", "Sudhakar N", "Amutha Prabha N",
    "Rashmi Ranjan Das", "Monica Subashini M", "Ramesh V"
  ],
  bad: [
    "Praveen T", "Yogalakshmi T", "Tarun Garg", "Ruban Kumar", "Uma mahendra", "Dhritiman gupta",
    "Gayathri", "Shaikh Naseera", "Debi Prassanna", "Debi Prasanna Acharjya", "Boominathan",
    "Rijesh M", "Soloman Bobby", "Anandvel K", "Rajesh M", "Rahul Singh Sikharwar", "Geetanjali",
    "Karthikeyan T", "Brijendra Singh", "Mohamed Ibrahim", "Thangaraja", "Arunachalam V",
    "Srimathi", "Santhi H", "Saleem durai", "Ramanathan L", "Kalaivani K", "Shaira bano", "Kalyanaraman",
    "Parveen Sultana", "Mercy Mathew", "Jimmy Mathew", "Seema A", "Kausher Ahmed", "Karthika",
    "Veeraman", "Amrit das", "Eashwaran", "Manikadan", "Jagalinga", "Meenakshi", "Rahul", "Ramani S",
    "Murali s", "Ambarasi", "Satish cj", "Govindaa", "Ethiiraj RD", "Yokesh babu", "Prabhakar",
    "Suresh kumar", "Lijo", "Calaivan", "Mary Chandini", "Shivakumari", "Bornali", "Kavi Yarsan",
    "Lavanya", "Meera", "Umayil", "Deepa", "Nirmal Thyagu", "Rashmi Rekha Borah",
    "Satishkumar G", "Mausumi Goswami", "Napoleon A A", "Thenmozhi", "Asharani IV", "Prakash M",
    "Joshva Devdas T", "Santhi V", "Caroline poonraj", "Senthilnathan", "Joshan Anthesious",
    "Pramod Kumar Maurya", "Raja", "RajeshKannan R", "Sarvanan Kumar K", "Ravi v", "Divya lakshmi K",
    "Saradha Rajkumar", "Balaji S", "Raghvendra K", "Roy S", "Bala Anki Reddy", "Parvez Alam",
    "Prakash Babu", "Rajashekaran", "Rajendran P", "Aruna K", "MUTHUCHOWMY", "MUTHUCHAMY",
    "GOPINATH", "Gopinath M P", "Arun Kumar G", "Jayakumar S"
  ],
  blacklisted: [
    "Jadadeesh Kumar", "Jagadeesh Kumar", "DEVENDRANATH", "Devendra Kumar",
    "Nawaz Khan", "Veera venkata Ramesh E", "Rupa Kenoth", "Mohanaroopan",
    "Aruna K", "Balaji S", "Raghvendra K", "Bala Anki Reddy", "Praveen T", "Rajendran P", "Yogalakshmi T",
    "Lakshmi N", "Karthika K", "Geraldine Bessie", "Boominathan", "Debi Prasanna Acharjya", "Santhi H",
    "Ramanathan L", "Kalaivani K", "Gaythri P", "Shaira bano", "Kalyanaraman", "Srimathi C", "Rajasekharan",
    "Rajashekhar Babu", "Parveen Sultana", "Mercy Mathew", "Jimmy Mathew", "Seema A", "Kausher Ahmed",
    "Veeraman"
  ]
};

export const getFacultyScore = (facultyName) => {
  if (!facultyName) return 0;
  
  const name = facultyName.toLowerCase();
  
  const matches = (arr) => arr.some(r => {
    const rLower = r.toLowerCase().replace(/[^a-z]/g, '');
    const nLower = name.replace(/[^a-z]/g, '');
    return rLower.length >= 4 && nLower.includes(rLower);
  });

  if (matches(FACULTY_RATINGS.blacklisted)) return -2;
  if (matches(FACULTY_RATINGS.bad)) return -1;
  if (matches(FACULTY_RATINGS.exceptional)) return 2;
  if (matches(FACULTY_RATINGS.good)) return 1;
  
  return 0;
};
