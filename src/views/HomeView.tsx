import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { STUDY_BUDDIES } from '../data/buddies';
import type { AppView } from '../types';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onStartRoomWithBuddy: (buddyId: string) => void;
  docCount: number;
  cardCount: number;
  totalMinutes: number;
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Economics',
  'SAT / ACT',
  'UPSC',
  'GRE / GMAT',
  'IELTS / TOEFL',
];

const TESTIMONIALS = [
  {
    quote:
      'StudyBuddy matched me with a partner preparing for the same exam window. Checking in each morning kept me consistent for three months straight.',
    name: 'Rahul Verma',
    role: 'Engineering Graduate Student',
    location: 'Bengaluru, IST',
    outcome: 'Consistent 28 hrs/week routine',
    avatar: '/src/assets/images/avatar_rahul_1794632198596.jpg',
    initials: 'RV',
  },
  {
    quote:
      'Studying alone used to mean drifting off after twenty minutes. Running 25-minute timer blocks in the study room helped me stay locked in and raise my SAT score to 1540.',
    name: 'Zara Williams',
    role: 'SAT Prep Student',
    location: 'New York, EST',
    outcome: 'Scored 1540 on SAT',
    avatar: '/src/assets/images/avatar_zara_1794632198871.jpg',
    initials: 'ZW',
  },
  {
    quote:
      'Turning lecture PDFs straight into quick reviews and flashcards in my browser saved hours every week—and my GRE Verbal score climbed by 8 points in six weeks.',
    name: 'Chen Lei',
    role: 'GRE Candidate',
    location: 'Singapore, GMT+8',
    outcome: '+8 points on GRE Verbal in 6 weeks',
    avatar: '/src/assets/images/avatar_chen_1794632200483.jpg',
    initials: 'CL',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onStartRoomWithBuddy,
  docCount,
  cardCount,
  totalMinutes,
}) => {
  const featuredBuddies = STUDY_BUDDIES.slice(0, 2);

  return (
    <div className="bg-[#F5F4F9] text-[#1E1B2E]">
      {/* ── Hero Section ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 md:pt-16">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          {/* Left copy */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="mb-4 text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
              Personal Study Space &amp; Peer Accountability
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1E1B2E] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] [text-wrap:balance]">
              Your Notes.{' '}
              <span className="text-[#634EE3]">Study Smarter.</span> Feel Ready.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#524E66] sm:text-lg">
              Bring your class readings together, turn key concepts into
              flashcards and practice quizzes directly in your browser, and pair
              up with focused study partners when you want accountability.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('study')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#634EE3] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#523DD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3] focus-visible:ring-offset-2 whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4" />
                Open Study Space
              </button>
              <button
                type="button"
                onClick={() => onNavigate('buddies')}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DBD6EE] bg-white px-6 py-3 text-sm font-semibold text-[#1E1B2E] transition-colors hover:border-[#634EE3]/50 hover:bg-[#F9F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3] whitespace-nowrap"
              >
                <Users className="h-4 w-4 text-[#634EE3]" />
                Find Study Partners
              </button>
            </div>

            {/* Clean unboxed metrics strip */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[#E4E0F2] pt-6">
              <div>
                <div className="font-display text-2xl font-extrabold text-[#1E1B2E] tabular-nums">
                  {docCount > 0 ? docCount : '4'}
                </div>
                <div className="mt-1 text-xs text-[#646078]">
                  {docCount > 0 ? 'Materials in library' : 'Built-in study tools'}
                </div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-[#1E1B2E] tabular-nums">
                  {cardCount > 0 ? cardCount : '25:00'}
                </div>
                <div className="mt-1 text-xs text-[#646078]">
                  {cardCount > 0 ? 'Flashcards ready' : 'Default focus sprint'}
                </div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-[#1E1B2E] tabular-nums">
                  {totalMinutes > 0 ? `${totalMinutes}m` : '0'}
                </div>
                <div className="mt-1 text-xs text-[#646078]">
                  {totalMinutes > 0 ? 'Minutes focused' : 'Files sent to a server'}
                </div>
              </div>
            </div>
          </div>

          {/* Right interactive workspace preview */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E4E0F2] bg-white p-6 shadow-sm lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-[#EFECF7] pb-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[#1E1B2E]">
                    Active Study Workspace
                  </h2>
                  <p className="mt-0.5 text-xs text-[#646078]">
                    PDF · DOCX · Markdown · Plain Text
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F766E]">
                  <Lock className="h-3.5 w-3.5" />
                  On-device
                </span>
              </div>

              {/* Clean document rows */}
              <div className="mt-4 divide-y divide-[#F0EDF8]">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1EFFB] text-[#634EE3]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1E1B2E]">
                        physics-chapter-4.pdf
                      </p>
                      <p className="text-xs text-[#6E6A82]">
                        12 pages · Quick review &amp; 8 cards
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('study')}
                    className="ml-3 shrink-0 text-xs font-semibold text-[#634EE3] hover:underline"
                  >
                    Open
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                      <Layers className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1E1B2E]">
                        biology-review.docx
                      </p>
                      <p className="text-xs text-[#6E6A82]">
                        5 practice questions ready
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('study')}
                    className="ml-3 shrink-0 text-xs font-semibold text-[#634EE3] hover:underline"
                  >
                    Practice
                  </button>
                </div>
              </div>
            </div>

            {/* Study partner live preview */}
            <div className="mt-5 border-t border-[#EFECF7] pt-5">
              <div className="flex items-center justify-between text-xs text-[#6E6A82]">
                <span className="font-semibold text-[#1E1B2E]">
                  Ready to study together
                </span>
                <span>{STUDY_BUDDIES.filter((b) => b.online).length} peers online</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {featuredBuddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#ECE8F6] bg-[#FAF9FD] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={buddy.avatar}
                        name={buddy.name}
                        initials={buddy.initials}
                        accentBg={buddy.accentBg}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1E1B2E]">
                          {buddy.name}
                        </p>
                        <p className="truncate text-xs text-[#646078]">
                          {buddy.examTarget} · {buddy.timezone} ·{' '}
                          {buddy.subjects.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStartRoomWithBuddy(buddy.id)}
                      className="shrink-0 rounded-md border border-[#DCD6F2] bg-white px-2.5 py-1 text-xs font-semibold text-[#634EE3] hover:bg-[#F3F0FC]"
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subject Index Strip ── */}
      <section className="border-y border-[#E6E2F2] bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 text-xs font-medium text-[#5C5872]">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => onNavigate('buddies')}
              className="hover:text-[#634EE3] transition-colors whitespace-nowrap"
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      {/* ── Core Features ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
            Why StudyBuddy
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E] [text-wrap:balance]">
            Everything you need for focused independent or shared study
          </h2>
          <p className="mt-3 text-base text-[#5A5670]">
            Work quietly with your own notes, or open a shared timer and task
            room with a matched partner.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E6E2F2] bg-white p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1EFFB] text-[#634EE3]">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-[#1E1B2E]">
              Study from your files
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A5670]">
              Upload PDFs, Word documents, Markdown, or plain text notes. Pull
              out key sentences, draft flashcards, and generate fill-in quizzes
              directly in your browser.
            </p>
            <p className="mt-4 text-xs font-medium text-[#6E6A82]">
              On-device parsing · PDF · DOCX · MD · TXT
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6E2F2] bg-white p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D9488]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-[#1E1B2E]">
              Pomodoro Focus Timer
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A5670]">
              Set aside 25-minute focus blocks with 5- and 15-minute resets.
              Track completed sessions automatically in a weekly study view.
            </p>
            <p className="mt-4 text-xs font-medium text-[#6E6A82]">
              25 / 5 / 15 min presets · Custom durations · Weekly log
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6E2F2] bg-white p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF2F8] text-[#DB2777]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-[#1E1B2E]">
              Live Study Room
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A5670]">
              Jump into a three-panel study room with a partner. Manage your
              session checklist, run a synced Pomodoro ring, and chat during
              breaks.
            </p>
            <p className="mt-4 text-xs font-medium text-[#6E6A82]">
              Task checklist · Shared timer · Session chat
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-y border-[#E6E2F2] bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
              Get Started in Minutes
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E] [text-wrap:balance]">
              Three steps to your study routine
            </h2>
            <p className="mt-3 text-base text-[#5A5670]">
              No lengthy onboarding. Set your preferences once or start studying
              immediately with your files.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#634EE3] font-display text-sm font-bold text-white tabular-nums">
                  01
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                    Build your study profile
                  </h3>
                  <p className="mt-1 text-sm text-[#5A5670]">
                    Select your subjects, exam target, timezone, and preferred
                    study style in under two minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#634EE3] font-display text-sm font-bold text-white tabular-nums">
                  02
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                    Browse ranked matches
                  </h3>
                  <p className="mt-1 text-sm text-[#5A5670]">
                    Filter peers by subject, exam target, timezone, and online
                    availability with transparent match scores.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#634EE3] font-display text-sm font-bold text-white tabular-nums">
                  03
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                    Open your room or study space
                  </h3>
                  <p className="mt-1 text-sm text-[#5A5670]">
                    Upload your materials for flashcards and quizzes, or run a
                    guided Pomodoro room with your partner.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E4E0F2] bg-[#FAF9FD] p-7 lg:col-span-6">
            <div className="flex items-center justify-between border-b border-[#E8E5F3] pb-4">
              <div>
                <p className="font-display text-base font-bold text-[#1E1B2E]">
                  Example Match Breakdown
                </p>
                <p className="text-xs text-[#646078]">
                  JEE · IST · Deep Focus · Mathematics, Physics, Chemistry
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="text-xs font-semibold text-[#634EE3] hover:underline whitespace-nowrap"
              >
                Create yours →
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {STUDY_BUDDIES.slice(0, 2).map((buddy, idx) => {
                const samplePct = idx === 0 ? 95 : 88;
                return (
                  <div
                    key={buddy.id}
                    className="rounded-xl border border-[#E6E2F2] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={buddy.avatar}
                          name={buddy.name}
                          initials={buddy.initials}
                          accentBg={buddy.accentBg}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#1E1B2E]">
                            {buddy.name}
                          </p>
                          <p className="text-xs text-[#646078]">
                            {buddy.examTarget} · {buddy.timezone} ·{' '}
                            {buddy.subjects.join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-sm font-bold text-[#0F766E] tabular-nums">
                        {samplePct}% match
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EFECF8]">
                      <div
                        className="h-full rounded-full bg-[#634EE3]"
                        style={{ width: `${samplePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E8E5F3] pt-5">
              <div className="flex items-center gap-2 text-xs text-[#5A5670]">
                <Check className="h-4 w-4 text-[#0D9488]" />
                <span>Saved locally in your browser</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
              >
                Create Your Profile
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Student Stories ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
            Student Stories
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
            Real students, steady routines
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-[#E6E2F2] bg-white p-6"
            >
              <div>
                <p className="text-xs font-semibold text-[#0F766E]">
                  {item.outcome}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#3E3A52]">
                  “{item.quote}”
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-[#F0EDF8] pt-4">
                <Avatar
                  src={item.avatar}
                  name={item.name}
                  initials={item.initials}
                  size="md"
                />
                <div>
                  <p className="text-sm font-bold text-[#1E1B2E]">{item.name}</p>
                  <p className="text-xs text-[#646078]">
                    {item.role} · {item.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-[#D8D1F5] bg-[#1F1B38] px-8 py-12 text-center text-white md:px-14">
          <p className="text-xs font-semibold tracking-wider text-[#B6AAFF] uppercase">
            Your next study session starts here
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight [text-wrap:balance]">
            Bring your materials. Leave with a clear plan.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[#CAC5E2]">
            Upload a document to build quick reviews and flashcards, or find a
            study partner in your timezone.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate('study')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7A66F5] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6A55E6]"
            >
              <BookOpen className="h-4 w-4" />
              Open Study Space
            </button>
            <button
              type="button"
              onClick={() => onNavigate('buddies')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Users className="h-4 w-4" />
              Browse Study Partners
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6E2F2] bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 md:flex-row md:items-center">
          <div>
            <p className="font-display text-base font-extrabold text-[#1E1B2E]">
              Study<span className="text-[#634EE3]">Buddy</span>
            </p>
            <p className="mt-1 text-xs text-[#646078]">
              A personal workspace for studying, practicing, and learning
              together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#5A5670]">
            <button
              type="button"
              onClick={() => onNavigate('study')}
              className="hover:text-[#634EE3]"
            >
              Study Space
            </button>
            <button
              type="button"
              onClick={() => onNavigate('buddies')}
              className="hover:text-[#634EE3]"
            >
              Find Buddies
            </button>
            <button
              type="button"
              onClick={() => onNavigate('room')}
              className="hover:text-[#634EE3]"
            >
              Study Room
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="hover:text-[#634EE3]"
            >
              Profile Setup
            </button>
          </div>

          <p className="text-xs text-[#7B778F]">
            Processed locally in this browser.
          </p>
        </div>
      </footer>
    </div>
  );
};
