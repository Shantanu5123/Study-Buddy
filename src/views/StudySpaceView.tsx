import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  FileText,
  FolderOpen,
  Layers,
  LayoutGrid,
  Lock,
  Menu,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { getTodayKey } from '../hooks/useStudyStore';
import type {
  AppView,
  Flashcard,
  QuizSession,
  StudyDocument,
  StudyStats,
  StudyTab,
  UserProfile,
} from '../types';
import {
  formatSize,
  makeReview,
  playGentleChime,
  wordCount,
} from '../utils/studyTools';

interface StudySpaceViewProps {
  documents: StudyDocument[];
  cardsByDoc: Record<string, Flashcard[]>;
  quizByDoc: Record<string, QuizSession>;
  stats: StudyStats;
  profile: UserProfile | null;
  selectedDocId: string;
  isUploading: boolean;
  onSelectDoc: (docId: string) => void;
  onUploadFiles: (files: FileList | File[]) => Promise<void>;
  onAddSample: () => string;
  onAddNote: (title: string, body: string) => string;
  onDeleteDoc: (docId: string) => void;
  onGenerateDeck: (doc: StudyDocument) => Flashcard[];
  onToggleCardMastered: (docId: string, cardId: string) => void;
  onCreateQuiz: (doc: StudyDocument) => void;
  onUpdateQuiz: (
    docId: string,
    updater: (prev: QuizSession) => QuizSession
  ) => void;
  onRecordFocus: (minutes: number) => void;
  onNavigate: (view: AppView) => void;
}

const NAV_TABS: {
  id: StudyTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'library', label: 'My library', icon: FolderOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Practice quiz', icon: CircleHelp },
  { id: 'notes', label: 'My notes', icon: NotebookPen },
  { id: 'focus', label: 'Focus timer', icon: Clock },
];

type TimerModeKey = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_PRESETS: Record<
  TimerModeKey,
  { label: string; minutes: number }
> = {
  focus: { label: 'Focus · 25 min', minutes: 25 },
  shortBreak: { label: 'Short break · 5 min', minutes: 5 },
  longBreak: { label: 'Long break · 15 min', minutes: 15 },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getWeekDays(): { key: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayKey = getTodayKey();

  return labels.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
    return { key, label, isToday: key === todayKey };
  });
}

export const StudySpaceView: React.FC<StudySpaceViewProps> = ({
  documents,
  cardsByDoc,
  quizByDoc,
  stats,
  profile,
  selectedDocId,
  isUploading,
  onSelectDoc,
  onUploadFiles,
  onAddSample,
  onAddNote,
  onDeleteDoc,
  onGenerateDeck,
  onToggleCardMastered,
  onCreateQuiz,
  onUpdateQuiz,
  onRecordFocus,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<StudyTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'pdf' | 'docx' | 'text' | 'notes'
  >('all');
  const [reviewDocId, setReviewDocId] = useState<string>('');
  const [expandedDocId, setExpandedDocId] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Notes form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteError, setNoteError] = useState('');

  // Focus timer state
  const [timerMode, setTimerMode] = useState<TimerModeKey>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [focusTaskDocId, setFocusTaskDocId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl/Cmd + K to focus library search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setActiveTab('library');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus timer countdown
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setTimerRunning(false);
          playGentleChime();
          if (timerMode === 'focus') {
            onRecordFocus(TIMER_PRESETS.focus.minutes);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerMode, onRecordFocus]);

  const switchTimerMode = (nextMode: TimerModeKey) => {
    setTimerRunning(false);
    setTimerMode(nextMode);
    setSecondsLeft(TIMER_PRESETS[nextMode].minutes * 60);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(TIMER_PRESETS[timerMode].minutes * 60);
  };

  const docsWithText = useMemo(
    () => documents.filter((d) => d.text.trim().length > 0),
    [documents]
  );

  const activeDoc = useMemo(() => {
    if (docsWithText.length === 0) return null;
    return (
      docsWithText.find((d) => d.id === selectedDocId) || docsWithText[0]
    );
  }, [docsWithText, selectedDocId]);

  const reviewDoc = useMemo(
    () => documents.find((d) => d.id === reviewDocId) || null,
    [documents, reviewDocId]
  );

  const reviewPoints = useMemo(
    () => (reviewDoc ? makeReview(reviewDoc.text) : []),
    [reviewDoc]
  );

  const totalCards = useMemo(
    () =>
      Object.values(cardsByDoc).reduce((sum, deck) => sum + deck.length, 0),
    [cardsByDoc]
  );

  const totalMinutes = useMemo(
    () => Object.values(stats.days).reduce((sum, mins) => sum + mins, 0),
    [stats.days]
  );

  const todayMinutes = stats.days[getTodayKey()] || 0;
  const weekDays = useMemo(() => getWeekDays(), []);

  const filteredDocs = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      if (q) {
        const hay = `${doc.name} ${doc.text}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (typeFilter === 'pdf') return doc.type === 'pdf';
      if (typeFilter === 'docx') return doc.type === 'docx';
      if (typeFilter === 'text')
        return doc.type === 'txt' || doc.type === 'md' || doc.type === 'markdown';
      if (typeFilter === 'notes') return doc.kind === 'note';
      return true;
    });
  }, [documents, globalQuery, typeFilter]);

  const savedNotes = useMemo(
    () => documents.filter((d) => d.kind === 'note'),
    [documents]
  );

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleOpenCardsForDoc = (doc: StudyDocument) => {
    onSelectDoc(doc.id);
    if (!cardsByDoc[doc.id] || cardsByDoc[doc.id].length === 0) {
      onGenerateDeck(doc);
    }
    setCardIndex(0);
    setIsFlipped(false);
    setActiveTab('flashcards');
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) {
      setNoteError('Please add both a title and note text.');
      return;
    }
    setNoteError('');
    onAddNote(noteTitle, noteBody);
    setNoteTitle('');
    setNoteBody('');
  };

  const activeDeck = activeDoc ? cardsByDoc[activeDoc.id] || [] : [];
  const safeCardIndex =
    activeDeck.length > 0 ? cardIndex % activeDeck.length : 0;
  const currentCard = activeDeck[safeCardIndex] || null;

  const activeQuiz = activeDoc ? quizByDoc[activeDoc.id] || null : null;

  const currentTabMeta =
    NAV_TABS.find((t) => t.id === activeTab) || NAV_TABS[0];

  const renderDocRow = (doc: StudyDocument) => {
    const words = wordCount(doc.text);
    const metaText =
      doc.kind === 'note'
        ? `Note · ${words.toLocaleString()} words`
        : `${doc.type.toUpperCase()} · ${formatSize(doc.size)} · ${words.toLocaleString()} words`;
    const isExpanded = expandedDocId === doc.id;

    return (
      <div
        key={doc.id}
        className="rounded-xl border border-[#E8E5F3] bg-white p-4 transition-colors hover:border-[#D4CEF0]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F1FC] text-[#634EE3]">
              {doc.kind === 'note' ? (
                <NotebookPen className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#1E1B2E]">
                {doc.name}
              </p>
              <p className="text-xs text-[#6B6780] tabular-nums">{metaText}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setExpandedDocId(isExpanded ? '' : doc.id)
              }
              className="rounded-lg border border-[#E2DFF0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#4A465E] hover:bg-[#F7F6FB]"
            >
              {isExpanded ? 'Hide text' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => setReviewDocId(doc.id)}
              className="rounded-lg border border-[#E2DFF0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#51469B] hover:border-[#B9AFF0] hover:bg-[#F8F6FF]"
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => handleOpenCardsForDoc(doc)}
              className="rounded-lg bg-[#634EE3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => onDeleteDoc(doc.id)}
              aria-label={`Remove ${doc.name}`}
              className="rounded-lg p-1.5 text-[#8B879E] hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 border-t border-[#F0EDF8] pt-3">
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#FAF9FD] p-3 font-sans text-xs leading-relaxed text-[#3D3952]">
              {doc.text.trim()
                ? doc.text.slice(0, 4000)
                : 'No selectable text was extracted from this file. Scanned PDFs require OCR before study aids can be generated.'}
            </pre>
            {doc.text.length > 4000 && (
              <p className="mt-1.5 text-[11px] text-[#78748D]">
                Preview shortened to 4,000 characters. Study aids still process
                the full extracted text.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const uploaderZone = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
        dragActive
          ? 'border-[#634EE3] bg-[#F1EEFD]'
          : 'border-[#D9D4EE] bg-white hover:border-[#A99EEB]'
      }`}
    >
      <Upload className="mx-auto h-6 w-6 text-[#634EE3]" />
      <p className="mt-2.5 font-display text-sm font-bold text-[#1E1B2E]">
        {isUploading
          ? 'Reading your document...'
          : 'Drop PDF, Word (.docx), Markdown, or TXT files here'}
      </p>
      <p className="mt-1 text-xs text-[#6B6780]">
        Up to 20 MB per file · Extracted text stays in this browser
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4] disabled:opacity-60"
        >
          Choose Files
        </button>
        <button
          type="button"
          onClick={() => {
            onAddSample();
          }}
          className="rounded-lg border border-[#DCD6F2] bg-[#FAF9FD] px-4 py-2 text-xs font-semibold text-[#4B38B8] hover:bg-[#F1EFFB]"
        >
          Try Sample Notes
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F3F8] text-[#1E1B2E]">
      {/* Hidden shared file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.markdown,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            await onUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#19172D]/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Dark Indigo Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-gradient-to-b from-[#201C39] via-[#211E3B] to-[#19172D] px-4 py-6 text-[#F5F2FF] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B79FA] to-[#5F4DCC] text-white shadow-md">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              study<span className="text-[#A99EFF]">buddy</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-[#B8B3C9] hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-8 px-2 text-[10px] font-bold tracking-[0.14em] text-[#89849E] uppercase">
          Your Workspace
        </p>

        <nav
          aria-label="Study space navigation"
          className="mt-2.5 flex-1 space-y-1"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/12 text-white font-semibold'
                    : 'text-[#C8C3D9] hover:bg-white/7 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#B4A9FA]" />
                  <span>{tab.label}</span>
                </span>
                {tab.id === 'library' && (
                  <span className="font-mono text-xs text-[#C8C3D9] tabular-nums">
                    {documents.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/6 p-3.5 text-xs leading-relaxed text-[#C5C0D8]">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-[#A99EFF]" />
              <span>Your files stay yours</span>
            </div>
            <p className="mt-1 text-[11px] text-[#B0ABC4]">
              Documents are parsed directly in this browser and stored locally
              on your device.
            </p>
          </div>

          <div className="flex flex-col gap-1 border-t border-white/10 pt-3 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('buddies')}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-[#D5D0E6] hover:bg-white/7 hover:text-white"
            >
              <span>Find Study Buddies</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-[#B0ABC4] hover:bg-white/7 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E6E3F0] bg-white/95 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-[#E2DFF0] p-2 text-[#3E3A52] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#6B6780]">
              <span>My workspace</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <strong className="font-semibold text-[#1E1B2E]">
                {currentTabMeta.label}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#807C94]" />
              <input
                ref={searchInputRef}
                type="search"
                value={globalQuery}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  if (activeTab !== 'library' && e.target.value.trim()) {
                    setActiveTab('library');
                  }
                }}
                placeholder="Search your library"
                aria-label="Search your library"
                className="w-56 rounded-lg border border-[#E2DFF0] bg-[#FAF9FD] py-1.5 pl-9 pr-14 text-xs text-[#1E1B2E] placeholder:text-[#8E8AA1] focus:border-[#634EE3] focus:bg-white focus:outline-none md:w-64"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#E2DFF0] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#78748D]">
                Ctrl K
              </kbd>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('profile')}
              aria-label="Your profile"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3]"
            >
              <Avatar
                src={profile?.avatar}
                name={profile?.name || 'Student'}
                size="sm"
              />
            </button>
          </div>
        </header>

        {/* Active View Body */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {/* ══════════ OVERVIEW ══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  Your Study Space
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  {getGreeting()}
                  {profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}.
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  A calm place to turn class material into steady progress.
                </p>
              </div>

              {/* 4 KPI cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Study materials', value: documents.length },
                  { label: 'Flashcards made', value: totalCards },
                  { label: 'Minutes focused', value: totalMinutes },
                  { label: 'Focus sessions', value: stats.sessions },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl border border-[#EAE7F4] bg-white p-5"
                  >
                    <p className="text-xs font-medium text-[#6B6780]">
                      {kpi.label}
                    </p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-[#1E1B2E] tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hero + Focus Column */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                  <div className="rounded-2xl bg-gradient-to-br from-[#43388C] via-[#5949BC] to-[#7668DF] p-7 text-white">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#CFC9FF] uppercase">
                      Your material, your momentum
                    </p>
                    <h2 className="mt-2 max-w-lg font-display text-2xl font-extrabold leading-snug">
                      Make more of what you’re already studying.
                    </h2>
                    <p className="mt-2 max-w-lg text-xs leading-relaxed text-[#E3DFFF]">
                      Add class notes or a reading. Generate quick reviews,
                      flashcards, and practice questions right here in your
                      browser.
                    </p>
                  </div>

                  {uploaderZone}
                </div>

                <div className="flex flex-col gap-4 lg:col-span-4">
                  <div className="rounded-2xl border border-[#EAE7F4] bg-white p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                        Today’s focus
                      </h3>
                      <span className="text-xs font-semibold text-[#634EE3] tabular-nums">
                        {todayMinutes} / 60 min
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EEEBF8]">
                      <div
                        className="h-full rounded-full bg-[#634EE3] transition-all"
                        style={{
                          width: `${Math.min(100, (todayMinutes / 60) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2.5 text-xs text-[#6B6780]">
                      Even one 25-minute block moves the week forward.
                    </p>
                  </div>

                  <div className="flex-1 rounded-2xl border border-[#EAE7F4] bg-white p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                        This week
                      </h3>
                      <span className="text-xs text-[#6B6780]">
                        Focus minutes
                      </span>
                    </div>

                    <div className="mt-6 flex h-24 items-end gap-2.5">
                      {weekDays.map((day) => {
                        const mins = stats.days[day.key] || 0;
                        const heightPct =
                          mins > 0 ? Math.max(14, Math.min(100, mins)) : 10;
                        return (
                          <div
                            key={day.key}
                            className="flex flex-1 flex-col items-center gap-1.5"
                            title={`${day.label}: ${mins} min`}
                          >
                            <div className="flex h-16 w-full items-end justify-center">
                              <div
                                className={`w-4 rounded-t-md transition-all ${
                                  day.isToday
                                    ? 'bg-[#634EE3]'
                                    : mins > 0
                                      ? 'bg-[#B9AFF7]'
                                      : 'bg-[#ECE9F5]'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-[#78748D]">
                              {day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent + Study Toolkit */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-5 lg:col-span-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                        Recently added
                      </h3>
                      <p className="text-xs text-[#6B6780]">
                        Pick up where you left off
                      </p>
                    </div>
                    {documents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        className="text-xs font-semibold text-[#634EE3] hover:underline"
                      >
                        View all →
                      </button>
                    )}
                  </div>

                  {documents.length === 0 ? (
                    <div className="rounded-xl border border-[#ECE8F6] bg-[#FAF9FD] px-5 py-8 text-center">
                      <p className="text-sm font-medium text-[#3E3A52]">
                        Your library is ready for its first file.
                      </p>
                      <p className="mt-1 text-xs text-[#6B6780]">
                        Upload a document above or load the sample learning
                        notes to try flashcards and quizzes immediately.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.slice(0, 4).map(renderDocRow)}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-5 lg:col-span-4">
                  <h3 className="font-display text-base font-bold text-[#1E1B2E]">
                    Study toolkit
                  </h3>
                  <p className="text-xs text-[#6B6780]">
                    Jump directly into a tool
                  </p>

                  <div className="mt-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeDoc) {
                          setReviewDocId(activeDoc.id);
                        } else {
                          const id = onAddSample();
                          setReviewDocId(id);
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E6E2F2] bg-[#FAF9FD] px-4 py-3 text-left text-sm font-semibold text-[#1E1B2E] hover:border-[#634EE3]/50 hover:bg-[#F3F0FC]"
                    >
                      <span>Quick review</span>
                      <ChevronRight className="h-4 w-4 text-[#634EE3]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeDoc) {
                          handleOpenCardsForDoc(activeDoc);
                        } else {
                          onAddSample();
                          setActiveTab('flashcards');
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E6E2F2] bg-[#FAF9FD] px-4 py-3 text-left text-sm font-semibold text-[#1E1B2E] hover:border-[#634EE3]/50 hover:bg-[#F3F0FC]"
                    >
                      <span>Make flashcards</span>
                      <ChevronRight className="h-4 w-4 text-[#634EE3]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E6E2F2] bg-[#FAF9FD] px-4 py-3 text-left text-sm font-semibold text-[#1E1B2E] hover:border-[#634EE3]/50 hover:bg-[#F3F0FC]"
                    >
                      <span>Practice quiz</span>
                      <ChevronRight className="h-4 w-4 text-[#634EE3]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('focus')}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E6E2F2] bg-[#FAF9FD] px-4 py-3 text-left text-sm font-semibold text-[#1E1B2E] hover:border-[#634EE3]/50 hover:bg-[#F3F0FC]"
                    >
                      <span>Start a focus session</span>
                      <ChevronRight className="h-4 w-4 text-[#634EE3]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ MY LIBRARY ══════════ */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  Your Materials
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  My library
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  Bring your class materials together and keep them ready to
                  study.
                </p>
              </div>

              {uploaderZone}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#807C94]" />
                  <input
                    type="search"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    placeholder="Filter by title or extracted text..."
                    className="w-full rounded-lg border border-[#DEDAF0] bg-white py-2 pl-9 pr-3 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                  />
                </div>

                {/* Segmented filter buttons */}
                <div className="flex items-center gap-1 rounded-lg bg-[#EAE7F4] p-1">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'pdf', label: 'PDF' },
                      { id: 'docx', label: 'Word' },
                      { id: 'text', label: 'Text' },
                      { id: 'notes', label: 'Notes' },
                    ] as const
                  ).map((seg) => (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => setTypeFilter(seg.id)}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                        typeFilter === seg.id
                          ? 'bg-white text-[#1E1B2E] shadow-sm'
                          : 'text-[#5A5670] hover:text-[#1E1B2E]'
                      }`}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs font-medium text-[#6B6780] tabular-nums">
                {filteredDocs.length}{' '}
                {filteredDocs.length === 1 ? 'item' : 'items'}
              </p>

              {filteredDocs.length === 0 ? (
                <div className="rounded-2xl border border-[#EAE7F4] bg-white px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-[#1E1B2E]">
                    {documents.length === 0
                      ? 'Your library is empty'
                      : 'No materials match your search'}
                  </p>
                  <p className="mt-1 text-xs text-[#6B6780]">
                    {documents.length === 0
                      ? 'Upload a PDF, DOCX, Markdown, or text file above to get started.'
                      : 'Try clearing the search query or switching the file type filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">{filteredDocs.map(renderDocRow)}</div>
              )}
            </div>
          )}

          {/* ══════════ FLASHCARDS ══════════ */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  Active Recall
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  Flashcards
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  Practice remembering key definitions and ideas from your own
                  notes.
                </p>
              </div>

              {!activeDoc ? (
                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-[#1E1B2E]">
                    Add a text-based document first to build flashcards.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('library')}
                      className="rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
                    >
                      Go to My Library
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const id = onAddSample();
                        onSelectDoc(id);
                      }}
                      className="rounded-lg border border-[#DCD6F2] bg-white px-4 py-2 text-xs font-semibold text-[#4B38B8]"
                    >
                      Load Sample Notes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#EAE7F4] bg-white p-5">
                    <div className="min-w-[240px] flex-1">
                      <label
                        htmlFor="cards-doc-select"
                        className="block text-xs font-semibold text-[#5A5670]"
                      >
                        Choose study material
                      </label>
                      <select
                        id="cards-doc-select"
                        value={activeDoc.id}
                        onChange={(e) => {
                          onSelectDoc(e.target.value);
                          setCardIndex(0);
                          setIsFlipped(false);
                        }}
                        className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                      >
                        {docsWithText.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onGenerateDeck(activeDoc);
                        setCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className="rounded-lg bg-[#634EE3] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
                    >
                      {activeDeck.length > 0
                        ? 'Rebuild Deck'
                        : 'Create Flashcards'}
                    </button>
                  </div>

                  {activeDeck.length > 0 && currentCard && (
                    <div className="mx-auto max-w-2xl space-y-4">
                      <button
                        type="button"
                        onClick={() => setIsFlipped((prev) => !prev)}
                        className="flex min-h-[240px] w-full flex-col items-center justify-center rounded-2xl border border-[#E2DDF6] bg-white p-8 text-center transition-colors hover:border-[#634EE3]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#634EE3]"
                      >
                        <span className="text-[11px] font-bold tracking-wider text-[#78748D] uppercase tabular-nums">
                          {isFlipped ? 'Answer' : 'Question'} · Card{' '}
                          {safeCardIndex + 1} of {activeDeck.length}
                        </span>
                        <p className="mt-5 font-display text-xl font-bold leading-relaxed text-[#1E1B2E]">
                          {isFlipped
                            ? currentCard.answer
                            : currentCard.question}
                        </p>
                        <span className="mt-6 text-xs font-medium text-[#634EE3]">
                          {isFlipped
                            ? 'Click card to return to question'
                            : 'Click card to reveal answer'}
                        </span>
                      </button>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCardIndex(
                                (safeCardIndex - 1 + activeDeck.length) %
                                  activeDeck.length
                              );
                              setIsFlipped(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DEDAF0] bg-white px-4 py-2 text-xs font-semibold text-[#1E1B2E] hover:bg-[#F7F6FB]"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCardIndex(
                                (safeCardIndex + 1) % activeDeck.length
                              );
                              setIsFlipped(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DEDAF0] bg-white px-4 py-2 text-xs font-semibold text-[#1E1B2E] hover:bg-[#F7F6FB]"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onToggleCardMastered(activeDoc.id, currentCard.id)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                            currentCard.mastered
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-[#DEDAF0] bg-white text-[#4A465E] hover:bg-[#F7F6FB]'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {currentCard.mastered
                            ? 'Marked Mastered'
                            : 'Mark Mastered'}
                        </button>
                      </div>

                      <p className="text-center text-xs text-[#78748D]">
                        Drafted locally from key terms and definitions in your
                        source text.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════ PRACTICE QUIZ ══════════ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  Check What Stuck
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  Practice quiz
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  Low-pressure fill-in-the-blank prompts built from your
                  extracted text.
                </p>
              </div>

              {!activeDoc ? (
                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-[#1E1B2E]">
                    Add a document in My library to generate a practice quiz.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const id = onAddSample();
                      onSelectDoc(id);
                    }}
                    className="mt-4 rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
                  >
                    Load Sample Notes
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#EAE7F4] bg-white p-5">
                    <div className="min-w-[240px] flex-1">
                      <label
                        htmlFor="quiz-doc-select"
                        className="block text-xs font-semibold text-[#5A5670]"
                      >
                        Choose study material
                      </label>
                      <select
                        id="quiz-doc-select"
                        value={activeDoc.id}
                        onChange={(e) => onSelectDoc(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                      >
                        {docsWithText.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCreateQuiz(activeDoc)}
                      className="rounded-lg bg-[#634EE3] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
                    >
                      {activeQuiz ? 'New Practice Quiz' : 'Create Practice Quiz'}
                    </button>
                  </div>

                  {activeQuiz && activeQuiz.questions.length > 0 && (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-[#EAE7F4] bg-white p-7">
                      {activeQuiz.index >= activeQuiz.questions.length ? (
                        <div className="text-center py-4">
                          <p className="text-xs font-semibold tracking-wider text-[#0F766E] uppercase">
                            Quiz Complete
                          </p>
                          <p className="mt-2 font-display text-4xl font-extrabold text-[#1E1B2E] tabular-nums">
                            {activeQuiz.score} / {activeQuiz.questions.length}
                          </p>
                          <p className="mt-2 text-sm text-[#5A5670]">
                            Revisit your source material to reinforce any missed
                            terms.
                          </p>
                          <button
                            type="button"
                            onClick={() => onCreateQuiz(activeDoc)}
                            className="mt-6 rounded-lg bg-[#634EE3] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
                          >
                            Try Another Quiz
                          </button>
                        </div>
                      ) : (
                        (() => {
                          const q = activeQuiz.questions[activeQuiz.index];
                          return (
                            <div>
                              <div className="flex items-center justify-between text-xs font-medium text-[#6B6780] tabular-nums">
                                <span>
                                  Question {activeQuiz.index + 1} of{' '}
                                  {activeQuiz.questions.length}
                                </span>
                                <span>{activeQuiz.score} correct so far</span>
                              </div>

                              <h2 className="mt-4 font-display text-lg font-bold leading-relaxed text-[#1E1B2E]">
                                {q.prompt}
                              </h2>

                              <div className="mt-5 space-y-2.5">
                                {q.options.map((opt) => {
                                  const isSelected =
                                    activeQuiz.selectedOption === opt;
                                  const isAnswer =
                                    opt.toLowerCase() ===
                                    q.answer.toLowerCase();

                                  let styleClass =
                                    'border-[#E2DFF0] bg-white text-[#1E1B2E] hover:border-[#634EE3]/50';
                                  if (activeQuiz.checked) {
                                    if (isAnswer) {
                                      styleClass =
                                        'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                                    } else if (isSelected && !isAnswer) {
                                      styleClass =
                                        'border-rose-300 bg-rose-50 text-rose-900';
                                    }
                                  } else if (isSelected) {
                                    styleClass =
                                      'border-[#634EE3] bg-[#F3F0FC] text-[#4B38B8] font-semibold';
                                  }

                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      disabled={activeQuiz.checked}
                                      onClick={() =>
                                        onUpdateQuiz(activeDoc.id, (prev) => ({
                                          ...prev,
                                          selectedOption: opt,
                                        }))
                                      }
                                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${styleClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {activeQuiz.checked && (
                                <div
                                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                                    activeQuiz.lastCorrect
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : 'bg-[#F5F3FC] text-[#3B2E8A]'
                                  }`}
                                >
                                  {activeQuiz.lastCorrect
                                    ? 'Correct — nice recall.'
                                    : `The missing term is "${q.answer}".`}
                                </div>
                              )}

                              <div className="mt-6 flex justify-end">
                                {!activeQuiz.checked ? (
                                  <button
                                    type="button"
                                    disabled={!activeQuiz.selectedOption}
                                    onClick={() =>
                                      onUpdateQuiz(activeDoc.id, (prev) => {
                                        const correct =
                                          prev.selectedOption.toLowerCase() ===
                                          q.answer.toLowerCase();
                                        return {
                                          ...prev,
                                          checked: true,
                                          lastCorrect: correct,
                                          score: correct
                                            ? prev.score + 1
                                            : prev.score,
                                        };
                                      })
                                    }
                                    className="rounded-lg bg-[#634EE3] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4] disabled:opacity-50"
                                  >
                                    Check Answer
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuiz(activeDoc.id, (prev) => {
                                        const nextIdx = prev.index + 1;
                                        return {
                                          ...prev,
                                          index: nextIdx,
                                          checked: false,
                                          selectedOption:
                                            prev.questions[nextIdx]
                                              ?.options[0] || '',
                                        };
                                      })
                                    }
                                    className="rounded-lg bg-[#634EE3] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
                                  >
                                    Next Question →
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════ MY NOTES ══════════ */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  Think It Through
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  My notes
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  Capture questions, summaries in your own words, and ideas to
                  revisit.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <form
                  onSubmit={handleCreateNoteSubmit}
                  className="rounded-2xl border border-[#EAE7F4] bg-white p-6 lg:col-span-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-[#1E1B2E]">
                    Write a note
                  </h2>

                  <div>
                    <label
                      htmlFor="note-title"
                      className="block text-xs font-semibold text-[#5A5670]"
                    >
                      Title
                    </label>
                    <input
                      id="note-title"
                      type="text"
                      maxLength={90}
                      value={noteTitle}
                      onChange={(e) => {
                        setNoteTitle(e.target.value);
                        setNoteError('');
                      }}
                      placeholder="Give this note a title"
                      className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="note-body"
                      className="block text-xs font-semibold text-[#5A5670]"
                    >
                      Your thought
                    </label>
                    <textarea
                      id="note-body"
                      rows={6}
                      value={noteBody}
                      onChange={(e) => {
                        setNoteBody(e.target.value);
                        setNoteError('');
                      }}
                      placeholder="Write a concept explanation, summary, or question in your own words..."
                      className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3.5 py-2.5 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                    />
                  </div>

                  {noteError && (
                    <p className="text-xs font-medium text-rose-600">
                      {noteError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="rounded-lg bg-[#634EE3] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#523DD4]"
                  >
                    Save Note
                  </button>
                </form>

                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-6 lg:col-span-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-[#1E1B2E]">
                      Saved notes
                    </h2>
                    <span className="text-xs font-medium text-[#6B6780] tabular-nums">
                      {savedNotes.length}{' '}
                      {savedNotes.length === 1 ? 'note' : 'notes'}
                    </span>
                  </div>

                  {savedNotes.length === 0 ? (
                    <p className="mt-6 text-sm text-[#6B6780]">
                      Your saved notes will appear here. Saved notes can also be
                      turned into flashcards or practice quizzes.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {savedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-xl border border-[#ECE8F6] bg-[#FAF9FD] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-display text-sm font-bold text-[#1E1B2E]">
                              {note.name}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenCardsForDoc(note)}
                                className="text-xs font-semibold text-[#634EE3] hover:underline"
                              >
                                Make Cards
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteDoc(note.id)}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#4A465E]">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ FOCUS TIMER ══════════ */}
          {activeTab === 'focus' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#634EE3] uppercase">
                  One Thing at a Time
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1B2E]">
                  Focus timer
                </h1>
                <p className="mt-1 text-sm text-[#646078]">
                  Settle into a timed block. Completed focus rounds log to your
                  weekly chart automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="rounded-2xl border border-[#EAE7F4] bg-white p-7 lg:col-span-7">
                  {/* Segmented timer mode selector */}
                  <div className="flex flex-wrap justify-center gap-1 rounded-xl bg-[#EFEBF8] p-1">
                    {(Object.keys(TIMER_PRESETS) as TimerModeKey[]).map(
                      (modeKey) => {
                        const active = timerMode === modeKey;
                        return (
                          <button
                            key={modeKey}
                            type="button"
                            onClick={() => switchTimerMode(modeKey)}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                              active
                                ? 'bg-white text-[#1E1B2E] shadow-sm'
                                : 'text-[#5A5670] hover:text-[#1E1B2E]'
                            }`}
                          >
                            {TIMER_PRESETS[modeKey].label}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="my-10 text-center">
                    <p className="text-xs font-semibold tracking-wider text-[#6B6780] uppercase">
                      {TIMER_PRESETS[timerMode].label}
                    </p>
                    <p className="mt-3 font-display text-6xl font-extrabold tracking-tight text-[#2B2261] tabular-nums sm:text-7xl">
                      {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                      {String(secondsLeft % 60).padStart(2, '0')}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerRunning((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#634EE3] px-7 py-3 text-sm font-semibold text-white hover:bg-[#523DD4]"
                    >
                      {timerRunning ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause Session
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Session
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DEDAF0] bg-white px-5 py-3 text-sm font-semibold text-[#4A465E] hover:bg-[#F7F6FB]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>

                  {docsWithText.length > 0 && (
                    <div className="mt-8 border-t border-[#F0EDF8] pt-5">
                      <label
                        htmlFor="focus-doc-select"
                        className="block text-xs font-semibold text-[#5A5670]"
                      >
                        What are you working on?
                      </label>
                      <select
                        id="focus-doc-select"
                        value={focusTaskDocId || activeDoc?.id || ''}
                        onChange={(e) => setFocusTaskDocId(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#DEDAF0] bg-white px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
                      >
                        {docsWithText.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-4 lg:col-span-5">
                  <div className="rounded-2xl border border-[#EAE7F4] bg-white p-6">
                    <h2 className="font-display text-lg font-bold text-[#1E1B2E]">
                      Make room for a reset
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#5A5670]">
                      Choose one concrete task for focus time. When the timer
                      ends, step away from your screen, stretch, or grab water
                      before starting the next round.
                    </p>

                    <div className="mt-6 border-t border-[#F0EDF8] pt-5">
                      <div className="flex items-baseline justify-between text-xs font-semibold">
                        <span className="text-[#5A5670]">
                          Focus minutes today
                        </span>
                        <span className="text-[#634EE3] tabular-nums">
                          {todayMinutes} / 60 min
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEEBF8]">
                        <div
                          className="h-full rounded-full bg-[#634EE3]"
                          style={{
                            width: `${Math.min(100, (todayMinutes / 60) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-3 text-xs text-[#6B6780] tabular-nums">
                        {stats.sessions} completed focus{' '}
                        {stats.sessions === 1 ? 'session' : 'sessions'} logged
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EAE7F4] bg-white p-6">
                    <h3 className="font-display text-sm font-bold text-[#1E1B2E]">
                      Want company while you work?
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5A5670]">
                      Open the Live Study Room to pair a Pomodoro timer with a
                      shared task list and peer check-ins.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('room')}
                      className="mt-4 rounded-lg border border-[#DCD6F2] bg-[#FAF9FD] px-4 py-2 text-xs font-semibold text-[#4B38B8] hover:bg-[#F1EFFB]"
                    >
                      Open Live Study Room →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-[#E6E3F0] bg-white px-6 py-3.5 text-xs text-[#6B6780]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>Made for the way you learn.</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#0F766E]" />
              Private on this device
            </span>
          </div>
        </footer>
      </div>

      {/* ── Quick Review Modal ── */}
      {reviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#19172D]/55 p-4 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-review-title"
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E2DFF0] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#EFEBF8] pb-4">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#634EE3] uppercase">
                  Quick Review
                </p>
                <h2
                  id="quick-review-title"
                  className="mt-0.5 font-display text-lg font-bold text-[#1E1B2E]"
                >
                  {reviewDoc.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReviewDocId('')}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-[#6B6780] hover:bg-[#F3F1FA] hover:text-[#1E1B2E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#6B6780]">
                Key sentences selected locally from your source text. Check
                against your original notes for full context.
              </p>

              {reviewPoints.length === 0 ? (
                <p className="rounded-xl bg-[#FAF9FD] p-4 text-sm text-[#5A5670]">
                  There isn’t enough selectable text in this file to build a
                  quick review yet.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {reviewPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-[#ECE8F6] bg-[#FAF9FD] px-4 py-3 text-sm leading-relaxed text-[#2D2847]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-[#EFEBF8] pt-4">
              <button
                type="button"
                onClick={() => {
                  const doc = reviewDoc;
                  setReviewDocId('');
                  handleOpenCardsForDoc(doc);
                }}
                className="rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
              >
                Open Flashcards
              </button>
              <button
                type="button"
                onClick={() => setReviewDocId('')}
                className="rounded-lg border border-[#DEDAF0] bg-white px-4 py-2 text-xs font-semibold text-[#4A465E] hover:bg-[#F7F6FB]"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
