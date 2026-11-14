import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserPlus,
  X,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { getRankedBuddies } from '../data/buddies';
import type { AppView, StudyStyle, UserProfile } from '../types';

interface BuddiesViewProps {
  profile: UserProfile | null;
  onStartRoom: (buddyId: string) => void;
  onNavigate: (view: AppView) => void;
  notify: (msg: string, tone?: 'success' | 'info' | 'error') => void;
}

const FILTER_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'CS',
  'History',
  'Literature',
  'Economics',
];

const EXAMS = ['SAT', 'JEE', 'UPSC', 'GMAT', 'GRE', 'IELTS', 'Board Exams'];
const TIMEZONES = ['IST', 'EST', 'PST', 'GMT', 'CET'];

const STYLE_LABELS: Record<StudyStyle, string> = {
  'deep-focus': 'Deep Focus',
  collaborative: 'Collaborative',
  mixed: 'Mixed',
};

export const BuddiesView: React.FC<BuddiesViewProps> = ({
  profile,
  onStartRoom,
  onNavigate,
  notify,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [exam, setExam] = useState('');
  const [style, setStyle] = useState<StudyStyle | ''>('');
  const [timezone, setTimezone] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const rankedBuddies = useMemo(() => getRankedBuddies(profile), [profile]);
  const onlineCount = useMemo(
    () => rankedBuddies.filter((b) => b.online).length,
    [rankedBuddies]
  );

  const filteredBuddies = useMemo(() => {
    return rankedBuddies.filter((buddy) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !buddy.name.toLowerCase().includes(q) &&
          !buddy.bio.toLowerCase().includes(q) &&
          !buddy.subjects.some((s) => s.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (selectedSubjects.length > 0) {
        const hasMatch = selectedSubjects.some((s) =>
          buddy.subjects.includes(s)
        );
        if (!hasMatch) return false;
      }
      if (exam && buddy.examTarget !== exam) return false;
      if (style && buddy.studyStyle !== style) return false;
      if (timezone && buddy.timezone !== timezone) return false;
      if (onlineOnly && !buddy.online) return false;
      return true;
    });
  }, [rankedBuddies, search, selectedSubjects, exam, style, timezone, onlineOnly]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSubjects([]);
    setExam('');
    setStyle('');
    setTimezone('');
    setOnlineOnly(false);
    notify('Filters reset.', 'info');
  };

  const filterSidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-wider text-[#5A5670] uppercase">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#634EE3]" />
          Filters
        </h2>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="rounded p-1 text-[#5A5670] lg:hidden"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div>
        <label
          htmlFor="buddy-search"
          className="block text-xs font-semibold text-[#5A5670]"
        >
          Search
        </label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#807C94]" />
          <input
            id="buddy-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, subject, or bio..."
            className="w-full rounded-lg border border-[#DEDAF0] bg-white py-2 pl-9 pr-3 text-sm text-[#1E1B2E] placeholder:text-[#8E8AA1] focus:border-[#634EE3] focus:outline-none focus:ring-2 focus:ring-[#634EE3]/20"
          />
        </div>
      </div>

      {/* Subjects (interactive buttons) */}
      <div>
        <p className="text-xs font-semibold text-[#5A5670]">Subjects</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTER_SUBJECTS.map((subject) => {
            const active = selectedSubjects.includes(subject);
            return (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#634EE3] bg-[#634EE3] text-white'
                    : 'border-[#E2DFF0] bg-white text-[#4A465E] hover:border-[#634EE3]/50 hover:text-[#634EE3]'
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exam target */}
      <div>
        <label
          htmlFor="exam-filter"
          className="block text-xs font-semibold text-[#5A5670]"
        >
          Exam Target
        </label>
        <select
          id="exam-filter"
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
        >
          <option value="">All Exams</option>
          {EXAMS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Study Style */}
      <div>
        <p className="text-xs font-semibold text-[#5A5670]">Study Style</p>
        <div className="mt-2 space-y-1.5">
          {[
            { value: '', label: 'All Styles' },
            { value: 'deep-focus', label: 'Deep Focus' },
            { value: 'collaborative', label: 'Collaborative' },
            { value: 'mixed', label: 'Mixed' },
          ].map((opt) => (
            <label
              key={opt.label}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[#3E3A52] hover:bg-[#F3F1FA]"
            >
              <input
                type="radio"
                name="buddy-style"
                checked={style === opt.value}
                onChange={() => setStyle(opt.value as StudyStyle | '')}
                className="accent-[#634EE3]"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="tz-filter"
          className="block text-xs font-semibold text-[#5A5670]"
        >
          Timezone
        </label>
        <select
          id="tz-filter"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
        >
          <option value="">All Timezones</option>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Online Only */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#E6E2F2] bg-white px-3 py-2.5">
        <span className="text-sm font-medium text-[#1E1B2E]">Online only</span>
        <input
          type="checkbox"
          checked={onlineOnly}
          onChange={(e) => setOnlineOnly(e.target.checked)}
          className="h-4 w-4 accent-[#634EE3]"
        />
      </label>

      <button
        type="button"
        onClick={resetFilters}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DEDAF0] bg-white px-4 py-2 text-xs font-semibold text-[#524E66] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-[#E6E2F2] bg-[#FAF9FD] p-6 lg:block">
        <div className="sticky top-20">{filterSidebarContent}</div>
      </aside>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#1E1B2E]/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <aside className="relative z-10 h-full w-80 max-w-full overflow-y-auto bg-[#FAF9FD] p-6 shadow-xl">
            {filterSidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="min-w-0 flex-1 px-6 py-8">
        {!profile && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCD5F6] bg-[#F3F0FC] px-5 py-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 shrink-0 text-[#634EE3]" />
              <p className="text-sm text-[#2D2847]">
                Set up your study profile to calculate personalized match scores
                with study partners.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4] whitespace-nowrap"
            >
              Complete Profile
            </button>
          </div>
        )}

        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#1E1B2E] sm:text-3xl">
              Find a Study Buddy
            </h1>
            <p className="mt-1 text-sm text-[#5A5670]">
              Matched by your subjects, exam target, timezone, and study rhythm.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-[#5A5670] tabular-nums">
              {filteredBuddies.length}{' '}
              {filteredBuddies.length === 1 ? 'buddy' : 'buddies'} ·{' '}
              <span className="text-[#0F766E] font-semibold">
                {onlineCount} online now
              </span>
            </span>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-xs font-semibold text-[#1E1B2E] lg:hidden"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {filteredBuddies.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E2F2] bg-white px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-[#8E8AA1]" />
            <h3 className="mt-4 font-display text-lg font-bold text-[#1E1B2E]">
              No buddies match your current filters
            </h3>
            <p className="mt-1.5 text-sm text-[#5A5670]">
              Try clearing one or more filters to widen your search.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBuddies.map((buddy) => {
              const scoreText = profile
                ? `${buddy.matchScore}% match`
                : null;

              return (
                <article
                  key={buddy.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E6E2F2] bg-white p-5 transition-shadow hover:shadow-md hover:shadow-[#1E1B2E]/5"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        src={buddy.avatar}
                        name={buddy.name}
                        initials={buddy.initials}
                        accentBg={buddy.accentBg}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="truncate font-display text-base font-bold text-[#1E1B2E]">
                            {buddy.name}
                          </h3>
                          {scoreText && (
                            <span
                              className={`shrink-0 font-display text-xs font-bold tabular-nums ${
                                buddy.matchScore >= 75
                                  ? 'text-[#0F766E]'
                                  : 'text-[#634EE3]'
                              }`}
                            >
                              {scoreText}
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-[#646078]">
                          {buddy.examTarget} · {buddy.timezone} ·{' '}
                          <span
                            className={
                              buddy.online
                                ? 'font-semibold text-[#0F766E]'
                                : 'text-[#7C7890]'
                            }
                          >
                            {buddy.online ? 'Online now' : 'Offline'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-medium text-[#524E66]">
                      {buddy.subjects.join(' · ')}
                    </p>
                    <p className="mt-1 text-xs text-[#78748D]">
                      {STYLE_LABELS[buddy.studyStyle]} · {buddy.weeklyHours}{' '}
                      hrs/wk target
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#3E3A52]">
                      {buddy.bio}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartRoom(buddy.id)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#634EE3] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#523DD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3]"
                  >
                    Study Together
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
