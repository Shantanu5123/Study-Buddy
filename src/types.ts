export type AppView = 'home' | 'study' | 'buddies' | 'room' | 'profile';

export type StudyTab =
  | 'overview'
  | 'library'
  | 'flashcards'
  | 'quiz'
  | 'notes'
  | 'focus';

export type StudyStyle = 'deep-focus' | 'collaborative' | 'mixed';
export type StudyTimePreference = 'morning' | 'afternoon' | 'evening' | 'night';

export interface StudyDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'markdown' | 'note';
  kind: 'file' | 'sample' | 'note';
  size: number;
  addedAt: string;
  text: string;
  signature: string;
}

export interface Flashcard {
  id: string;
  docId: string;
  question: string;
  answer: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  options: string[];
}

export interface QuizSession {
  questions: QuizQuestion[];
  index: number;
  score: number;
  checked: boolean;
  selectedOption: string;
  lastCorrect: boolean;
}

export interface StudyStats {
  days: Record<string, number>;
  sessions: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subjects: string[];
  examTarget: string;
  studyStyle: StudyStyle;
  timezone: string;
  studyTime: StudyTimePreference;
  weeklyHours: number;
  shortGoal: string;
  createdAt: string;
}

export interface StudyBuddyPeer {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  accentBg: string;
  subjects: string[];
  examTarget: string;
  studyStyle: StudyStyle;
  timezone: string;
  studyTime: StudyTimePreference;
  weeklyHours: number;
  bio: string;
  online: boolean;
}

export interface BuddyWithScore extends StudyBuddyPeer {
  matchScore: number;
}

export interface RoomTask {
  id: string;
  text: string;
  done: boolean;
}

export interface ChatMessage {
  id: string;
  name: string;
  initials: string;
  text: string;
  time: string;
  fromBuddy: boolean;
}
