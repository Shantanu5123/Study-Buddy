import type { BuddyWithScore, StudyBuddyPeer, UserProfile } from '../types';

export const GENERATED_AVATARS = [
  {
    id: 'aisha',
    label: 'Portrait A',
    src: '/src/assets/images/avatar_aisha_1794632198682.jpg',
  },
  {
    id: 'rahul',
    label: 'Portrait B',
    src: '/src/assets/images/avatar_rahul_1794632198596.jpg',
  },
  {
    id: 'zara',
    label: 'Portrait C',
    src: '/src/assets/images/avatar_zara_1794632198871.jpg',
  },
  {
    id: 'chen',
    label: 'Portrait D',
    src: '/src/assets/images/avatar_chen_1794632200483.jpg',
  },
];

export const STUDY_BUDDIES: StudyBuddyPeer[] = [
  {
    id: 'aisha-sharma',
    name: 'Aisha Sharma',
    avatar: '/src/assets/images/avatar_aisha_1794632198682.jpg',
    initials: 'AS',
    accentBg: '#634EE3',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    examTarget: 'JEE',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'morning',
    weeklyHours: 35,
    bio: 'Preparing for JEE Advanced with daily morning problem sets in mechanics and calculus.',
    online: true,
  },
  {
    id: 'rahul-verma',
    name: 'Rahul Verma',
    avatar: '/src/assets/images/avatar_rahul_1794632198596.jpg',
    initials: 'RV',
    accentBg: '#2563EB',
    subjects: ['Mathematics', 'CS', 'Physics'],
    examTarget: 'JEE',
    studyStyle: 'mixed',
    timezone: 'IST',
    studyTime: 'evening',
    weeklyHours: 28,
    bio: 'Working through algorithms, linear algebra, and mock tests. Happy to do 50/10 focus blocks.',
    online: true,
  },
  {
    id: 'zara-williams',
    name: 'Zara Williams',
    avatar: '/src/assets/images/avatar_zara_1794632198871.jpg',
    initials: 'ZW',
    accentBg: '#DB2777',
    subjects: ['Mathematics', 'Literature', 'Economics'],
    examTarget: 'SAT',
    studyStyle: 'collaborative',
    timezone: 'EST',
    studyTime: 'afternoon',
    weeklyHours: 20,
    bio: 'SAT prep focused on reading comprehension and math timing drills. Love reviewing mistakes together.',
    online: true,
  },
  {
    id: 'chen-lei',
    name: 'Chen Lei',
    avatar: '/src/assets/images/avatar_chen_1794632200483.jpg',
    initials: 'CL',
    accentBg: '#0D9488',
    subjects: ['Mathematics', 'CS', 'Economics'],
    examTarget: 'GRE',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'night',
    weeklyHours: 24,
    bio: 'Quiet late-evening Pomodoro sessions for GRE quantitative reasoning and vocabulary flashcards.',
    online: true,
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    initials: 'PN',
    accentBg: '#059669',
    subjects: ['History', 'Economics', 'Literature'],
    examTarget: 'UPSC',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'morning',
    weeklyHours: 42,
    bio: 'Daily answer writing practice, current affairs synthesis, and structured revision blocks.',
    online: true,
  },
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    initials: 'MJ',
    accentBg: '#D97706',
    subjects: ['Biology', 'Chemistry', 'Mathematics'],
    examTarget: 'Board Exams',
    studyStyle: 'mixed',
    timezone: 'EST',
    studyTime: 'evening',
    weeklyHours: 18,
    bio: 'Organic chemistry mechanisms and biology flashcards. Looking for consistent evening check-ins.',
    online: false,
  },
  {
    id: 'sofia-martinez',
    name: 'Sofia Martinez',
    initials: 'SM',
    accentBg: '#7C3AED',
    subjects: ['Economics', 'Mathematics', 'Literature'],
    examTarget: 'GMAT',
    studyStyle: 'collaborative',
    timezone: 'CET',
    studyTime: 'afternoon',
    weeklyHours: 22,
    bio: 'Tackling GMAT Data Insights and critical reasoning. Open to talking through tricky passages.',
    online: true,
  },
  {
    id: 'liam-oconnor',
    name: "Liam O'Connor",
    initials: 'LO',
    accentBg: '#0284C7',
    subjects: ['CS', 'Mathematics'],
    examTarget: 'GRE',
    studyStyle: 'deep-focus',
    timezone: 'GMT',
    studyTime: 'morning',
    weeklyHours: 25,
    bio: 'Systems programming & GRE quant review. Silent camera-off 25/5 timers with goal check-ins.',
    online: true,
  },
  {
    id: 'mei-ling-zhou',
    name: 'Mei-Ling Zhou',
    initials: 'MZ',
    accentBg: '#E11D48',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    examTarget: 'IELTS',
    studyStyle: 'mixed',
    timezone: 'PST',
    studyTime: 'afternoon',
    weeklyHours: 20,
    bio: 'Academic writing practice and biochemistry revision. Always down for two 25-min rounds.',
    online: false,
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    initials: 'ER',
    accentBg: '#4F46E5',
    subjects: ['History', 'Literature', 'Economics'],
    examTarget: 'IELTS',
    studyStyle: 'collaborative',
    timezone: 'CET',
    studyTime: 'evening',
    weeklyHours: 16,
    bio: 'Essay structuring, speaking practice, and modern European history summaries.',
    online: true,
  },
  {
    id: 'arjun-kumar',
    name: 'Arjun Kumar',
    initials: 'AK',
    accentBg: '#0F766E',
    subjects: ['History', 'Economics', 'Physics'],
    examTarget: 'UPSC',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'morning',
    weeklyHours: 40,
    bio: 'Consistent 6am starter. Polity notes, economic survey highlights, and timed mock essays.',
    online: false,
  },
  {
    id: 'noah-kim',
    name: 'Noah Kim',
    initials: 'NK',
    accentBg: '#4338CA',
    subjects: ['CS', 'Physics', 'Mathematics'],
    examTarget: 'SAT',
    studyStyle: 'mixed',
    timezone: 'PST',
    studyTime: 'evening',
    weeklyHours: 15,
    bio: 'AP Physics C and SAT math sprints after school. Let us set 3 tasks and finish them together.',
    online: false,
  },
];

function normalizeSubject(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === 'computer science') return 'cs';
  return lower;
}

export function computeMatchScore(
  profile: UserProfile | null,
  buddy: StudyBuddyPeer
): number {
  if (!profile) return 0;

  let score = 0;

  // Subjects overlap (up to 45 pts)
  const mySubjects = new Set(profile.subjects.map(normalizeSubject));
  const theirSubjects = buddy.subjects.map(normalizeSubject);
  const overlap = theirSubjects.filter((s) => mySubjects.has(s)).length;
  if (mySubjects.size > 0 && theirSubjects.length > 0) {
    const unionCount = new Set([...mySubjects, ...theirSubjects]).size;
    score += Math.round((overlap / unionCount) * 45);
  }

  // Exam target (25 pts)
  if (profile.examTarget && profile.examTarget === buddy.examTarget) {
    score += 25;
  }

  // Study style (15 pts)
  if (profile.studyStyle && profile.studyStyle === buddy.studyStyle) {
    score += 15;
  } else if (profile.studyStyle === 'mixed' || buddy.studyStyle === 'mixed') {
    score += 7;
  }

  // Timezone (10 pts)
  if (profile.timezone && profile.timezone === buddy.timezone) {
    score += 10;
  }

  // Study time (5 pts)
  if (profile.studyTime && profile.studyTime === buddy.studyTime) {
    score += 5;
  }

  return Math.min(99, Math.max(25, score));
}

export function getRankedBuddies(profile: UserProfile | null): BuddyWithScore[] {
  return STUDY_BUDDIES.map((buddy) => ({
    ...buddy,
    matchScore: computeMatchScore(profile, buddy),
  })).sort((a, b) => {
    if (profile) {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    }
    return Number(b.online) - Number(a.online);
  });
}
