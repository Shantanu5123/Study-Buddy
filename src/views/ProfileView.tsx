import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Rocket } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { GENERATED_AVATARS } from '../data/buddies';
import type {
  StudyStyle,
  StudyTimePreference,
  UserProfile,
} from '../types';

interface ProfileViewProps {
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onComplete: () => void;
}

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Computer Science',
  'Literature',
  'Economics',
  'Geography',
  'Psychology',
];

const EXAM_OPTIONS = [
  'SAT',
  'JEE',
  'UPSC',
  'GMAT',
  'GRE',
  'IELTS',
  'Board Exams',
  'Other',
];

const TIMEZONES = [
  { value: 'IST', label: 'IST — India Standard Time (UTC+5:30)' },
  { value: 'EST', label: 'EST — Eastern Standard Time (UTC-5)' },
  { value: 'PST', label: 'PST — Pacific Standard Time (UTC-8)' },
  { value: 'CST', label: 'CST — Central Standard Time (UTC-6)' },
  { value: 'GMT', label: 'GMT — Greenwich Mean Time (UTC+0)' },
  { value: 'CET', label: 'CET — Central European Time (UTC+1)' },
  { value: 'JST', label: 'JST — Japan Standard Time (UTC+9)' },
  { value: 'AEST', label: 'AEST — Australian Eastern Time (UTC+10)' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(
    profile?.avatar || GENERATED_AVATARS[0].src
  );
  const [bio, setBio] = useState(profile?.bio || '');

  const [subjects, setSubjects] = useState<string[]>(profile?.subjects || []);
  const [examTarget, setExamTarget] = useState(profile?.examTarget || '');
  const [studyStyle, setStudyStyle] = useState<StudyStyle | ''>(
    profile?.studyStyle || ''
  );

  const [timezone, setTimezone] = useState(profile?.timezone || '');
  const [studyTime, setStudyTime] = useState<StudyTimePreference | ''>(
    profile?.studyTime || ''
  );
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 20);
  const [shortGoal, setShortGoal] = useState(profile?.shortGoal || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSubject = (sub: string) => {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
    setErrors((prev) => ({ ...prev, subjects: '' }));
  };

  const handleNextStep1 = () => {
    if (!name.trim()) {
      setErrors({ name: 'Please enter your full name.' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleNextStep2 = () => {
    const nextErrors: Record<string, string> = {};
    if (subjects.length === 0) {
      nextErrors.subjects = 'Please select at least one subject.';
    }
    if (!examTarget) {
      nextErrors.examTarget = 'Please select your exam target.';
    }
    if (!studyStyle) {
      nextErrors.studyStyle = 'Please choose a study style.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!timezone) {
      nextErrors.timezone = 'Please select your timezone.';
    }
    if (!studyTime) {
      nextErrors.studyTime = 'Please select a preferred study time.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextProfile: UserProfile = {
      id: profile?.id || `user-${Date.now()}`,
      name: name.trim(),
      avatar,
      bio: bio.trim(),
      subjects,
      examTarget,
      studyStyle: studyStyle as StudyStyle,
      timezone,
      studyTime: studyTime as StudyTimePreference,
      weeklyHours,
      shortGoal: shortGoal.trim(),
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    onSaveProfile(nextProfile);
    onComplete();
  };

  const stepLabels = [
    { num: 1, title: 'About You' },
    { num: 2, title: 'Preferences' },
    { num: 3, title: 'Schedule & Goals' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
          Student Profile
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
          {profile ? 'Update Your Study Profile' : 'Set Up Your Study Profile'}
        </h1>
        <p className="mt-2 text-sm text-[#5A5670]">
          Tell us what you are preparing for so we can rank compatible study
          partners.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {stepLabels.map((item, idx) => {
          const isDone = step > item.num;
          const isActive = step === item.num;
          return (
            <React.Fragment key={item.num}>
              <button
                type="button"
                onClick={() => {
                  if (item.num < step) setStep(item.num as 1 | 2 | 3);
                }}
                disabled={item.num > step}
                className="flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold tabular-nums transition-colors ${
                    isDone
                      ? 'border-[#0D9488] bg-[#0D9488] text-white'
                      : isActive
                        ? 'border-[#634EE3] bg-[#634EE3] text-white'
                        : 'border-[#DBD6EE] bg-white text-[#78748D]'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : item.num}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isActive
                      ? 'text-[#634EE3]'
                      : isDone
                        ? 'text-[#0F766E]'
                        : 'text-[#78748D]'
                  }`}
                >
                  {item.title}
                </span>
              </button>
              {idx < stepLabels.length - 1 && (
                <div
                  className={`mx-3 mb-5 h-0.5 flex-1 ${
                    step > item.num ? 'bg-[#0D9488]' : 'bg-[#E2DFF0]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E6E2F2] bg-white p-6 sm:p-8"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1E1B2E]">
                About You
              </h2>
              <p className="mt-1 text-sm text-[#5A5670]">
                Start with your name and a short introduction.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-[#4A465E]"
              >
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Priya Sharma"
                className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none focus:ring-2 focus:ring-[#634EE3]/20"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A465E]">
                Profile Photo
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4">
                {GENERATED_AVATARS.map((opt) => {
                  const selected = avatar === opt.src;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvatar(opt.src)}
                      className={`rounded-full p-0.5 transition-all ${
                        selected
                          ? 'ring-2 ring-[#634EE3] ring-offset-2'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Select ${opt.label}`}
                    >
                      <Avatar src={opt.src} name={name || opt.label} size="xl" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className={`rounded-full p-0.5 transition-all ${
                    avatar === ''
                      ? 'ring-2 ring-[#634EE3] ring-offset-2'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label="Use monogram initials"
                >
                  <Avatar name={name || 'Study Buddy'} size="xl" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-bio"
                  className="block text-xs font-semibold text-[#4A465E]"
                >
                  Bio (optional)
                </label>
                <span className="text-xs text-[#78748D] tabular-nums">
                  {bio.length}/200
                </span>
              </div>
              <textarea
                id="profile-bio"
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your subjects, current study habits, or upcoming test..."
                className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none focus:ring-2 focus:ring-[#634EE3]/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep1}
                className="inline-flex items-center gap-2 rounded-lg bg-[#634EE3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#523DD4]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1E1B2E]">
                Study Preferences
              </h2>
              <p className="mt-1 text-sm text-[#5A5670]">
                Select the subjects and style that fit your routine.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A465E]">
                Subjects <span className="text-rose-600">*</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SUBJECT_OPTIONS.map((subject) => {
                  const checked = subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        checked
                          ? 'border-[#634EE3] bg-[#F3F0FC] text-[#4B38B8]'
                          : 'border-[#E2DFF0] bg-white text-[#4A465E] hover:border-[#634EE3]/50'
                      }`}
                    >
                      <span className="truncate">{subject}</span>
                      {checked && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.subjects && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.subjects}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-exam"
                className="block text-xs font-semibold text-[#4A465E]"
              >
                Exam Target <span className="text-rose-600">*</span>
              </label>
              <select
                id="profile-exam"
                value={examTarget}
                onChange={(e) => {
                  setExamTarget(e.target.value);
                  setErrors((prev) => ({ ...prev, examTarget: '' }));
                }}
                className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
              >
                <option value="">— Select your exam —</option>
                {EXAM_OPTIONS.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
              {errors.examTarget && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.examTarget}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A465E]">
                Study Style <span className="text-rose-600">*</span>
              </p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    value: 'deep-focus',
                    title: 'Deep Focus',
                    desc: 'Quiet blocks with minimal interruptions',
                  },
                  {
                    value: 'collaborative',
                    title: 'Collaborative',
                    desc: 'Discussion, explanations, and peer review',
                  },
                  {
                    value: 'mixed',
                    title: 'Mixed',
                    desc: 'Focus sprints paired with brief check-ins',
                  },
                ].map((opt) => {
                  const active = studyStyle === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStudyStyle(opt.value as StudyStyle);
                        setErrors((prev) => ({ ...prev, studyStyle: '' }));
                      }}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? 'border-[#634EE3] bg-[#F3F0FC]'
                          : 'border-[#E2DFF0] bg-white hover:border-[#634EE3]/50'
                      }`}
                    >
                      <p className="font-display text-sm font-bold text-[#1E1B2E]">
                        {opt.title}
                      </p>
                      <p className="mt-1 text-xs text-[#5A5670]">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.studyStyle && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.studyStyle}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DEDAF0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4A465E] hover:bg-[#F7F6FB]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="inline-flex items-center gap-2 rounded-lg bg-[#634EE3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#523DD4]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1E1B2E]">
                Schedule &amp; Goals
              </h2>
              <p className="mt-1 text-sm text-[#5A5670]">
                Tell us when you study best and your weekly commitment.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-tz"
                className="block text-xs font-semibold text-[#4A465E]"
              >
                Timezone <span className="text-rose-600">*</span>
              </label>
              <select
                id="profile-tz"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setErrors((prev) => ({ ...prev, timezone: '' }));
                }}
                className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
              >
                <option value="">— Select timezone —</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {errors.timezone && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.timezone}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A465E]">
                Preferred Study Time <span className="text-rose-600">*</span>
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  { value: 'morning', label: 'Morning (6am – 12pm)' },
                  { value: 'afternoon', label: 'Afternoon (12pm – 6pm)' },
                  { value: 'evening', label: 'Evening (6pm – 12am)' },
                  { value: 'night', label: 'Late Night (12am – 6am)' },
                ].map((opt) => {
                  const active = studyTime === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStudyTime(opt.value as StudyTimePreference);
                        setErrors((prev) => ({ ...prev, studyTime: '' }));
                      }}
                      className={`rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? 'border-[#634EE3] bg-[#F3F0FC] text-[#4B38B8] font-semibold'
                          : 'border-[#E2DFF0] bg-white text-[#4A465E] hover:border-[#634EE3]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {errors.studyTime && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                  {errors.studyTime}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-hours"
                  className="text-xs font-semibold text-[#4A465E]"
                >
                  Weekly Study Hours Goal
                </label>
                <span className="font-display text-sm font-bold text-[#634EE3] tabular-nums">
                  {weeklyHours} hrs/week
                </span>
              </div>
              <input
                id="profile-hours"
                type="range"
                min={5}
                max={60}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="mt-2.5 w-full accent-[#634EE3]"
              />
            </div>

            <div>
              <label
                htmlFor="profile-goal"
                className="block text-xs font-semibold text-[#4A465E]"
              >
                Short-Term Goal (optional)
              </label>
              <input
                id="profile-goal"
                type="text"
                value={shortGoal}
                onChange={(e) => setShortGoal(e.target.value)}
                placeholder="e.g. Finish calculus practice set before Friday"
                className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none focus:ring-2 focus:ring-[#634EE3]/20"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DEDAF0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4A465E] hover:bg-[#F7F6FB]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#634EE3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#523DD4]"
              >
                <Rocket className="h-4 w-4" />
                Find My Buddies
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
