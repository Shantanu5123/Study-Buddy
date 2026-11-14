import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Clock,
  DoorOpen,
  ListChecks,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Settings,
  SkipForward,
  Trash2,
  X,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { STUDY_BUDDIES } from '../data/buddies';
import type { ChatMessage, RoomTask, UserProfile } from '../types';
import { playGentleChime } from '../utils/studyTools';

interface RoomViewProps {
  buddyId: string;
  profile: UserProfile | null;
  tasks: RoomTask[];
  onChangeTasks: React.Dispatch<React.SetStateAction<RoomTask[]>>;
  onRecordFocus: (minutes: number) => void;
  onLeaveRoom: () => void;
  notify: (msg: string, tone?: 'success' | 'info' | 'error') => void;
}

type PomoPhase = 'focus' | 'shortBreak' | 'longBreak';

const AUTO_REPLIES = [
  "Let's keep the pace steady. One task at a time.",
  'Taking a brief stretch on the break really helps reset attention.',
  'Just wrapped up a problem set block. How is your current task going?',
  'Try summarizing the last concept from memory before moving to the next section.',
  'Checking in at the end of this sprint to compare progress.',
];

function getTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
}

export const RoomView: React.FC<RoomViewProps> = ({
  buddyId,
  profile,
  tasks,
  onChangeTasks,
  onRecordFocus,
  onLeaveRoom,
  notify,
}) => {
  const buddy = useMemo(
    () =>
      STUDY_BUDDIES.find((b) => b.id === buddyId) || STUDY_BUDDIES[0],
    [buddyId]
  );

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'tasks' | 'timer' | 'chat'>(
    'timer'
  );

  // Tasks state
  const [taskInput, setTaskInput] = useState('');
  const [completedOpen, setCompletedOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Pomodoro state
  const [focusMins, setFocusMins] = useState(25);
  const [shortBreakMins, setShortBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftFocus, setDraftFocus] = useState(25);
  const [draftShort, setDraftShort] = useState(5);
  const [draftLong, setDraftLong] = useState(15);

  const [phase, setPhase] = useState<PomoPhase>('focus');
  const [sessionNum, setSessionNum] = useState(1);
  const [totalFocusDone, setTotalFocusDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      name: buddy.name,
      initials: buddy.initials,
      text: `Ready to start? I am working on ${buddy.subjects[0]} today.`,
      time: getTimeStr(),
      fromBuddy: true,
    },
    {
      id: 'init-2',
      name: buddy.name,
      initials: buddy.initials,
      text: 'Drop your session goals in the checklist and start the timer whenever you are set.',
      time: getTimeStr(),
      fromBuddy: true,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const replyIndexRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const phaseSeconds = (p: PomoPhase) => {
    if (p === 'focus') return focusMins * 60;
    if (p === 'shortBreak') return shortBreakMins * 60;
    return longBreakMins * 60;
  };

  const totalPhaseSeconds = phaseSeconds(phase);
  const circumference = 2 * Math.PI * 92;
  const pct = totalPhaseSeconds > 0 ? secondsLeft / totalPhaseSeconds : 0;
  const strokeDashoffset = circumference * (1 - pct);

  // Advance timer phase
  const advancePhase = (completedNaturally: boolean) => {
    setRunning(false);
    if (completedNaturally) {
      playGentleChime();
    }

    if (phase === 'focus') {
      if (completedNaturally) {
        onRecordFocus(focusMins);
      }
      const nextDone = Math.min(4, totalFocusDone + 1);
      setTotalFocusDone(nextDone);
      if (nextDone >= 4 && sessionNum === 4) {
        setPhase('longBreak');
        setSecondsLeft(longBreakMins * 60);
        if (completedNaturally) notify('Long break time! Great work.', 'success');
      } else {
        setPhase('shortBreak');
        setSecondsLeft(shortBreakMins * 60);
        if (completedNaturally)
          notify('Short break time — step away for a moment.', 'info');
      }
    } else {
      if (sessionNum < 4) {
        setSessionNum((n) => n + 1);
      } else {
        setSessionNum(1);
        setTotalFocusDone(0);
        if (completedNaturally)
          notify('Four-session Pomodoro cycle complete.', 'success');
      }
      setPhase('focus');
      setSecondsLeft(focusMins * 60);
      if (completedNaturally) notify('Focus session ready.', 'info');
    }
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && secondsLeft === 0) {
      advancePhase(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, running]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = taskInput.trim();
    if (!text) return;
    onChangeTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, text, done: false },
    ]);
    setTaskInput('');
  };

  const handleToggleTask = (id: string) => {
    onChangeTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    onChangeTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDropTask = (targetId: string) => {
    if (!draggedTaskId || draggedTaskId === targetId) return;
    onChangeTasks((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((t) => t.id === draggedTaskId);
      const toIdx = next.findIndex((t) => t.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggedTaskId(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const myName = profile?.name || 'You';
    const myInitials = myName
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        name: myName,
        initials: myInitials || 'Y',
        text,
        time: getTimeStr(),
        fromBuddy: false,
      },
    ]);
    setChatInput('');

    setIsTyping(true);
    const delay = 900 + Math.random() * 1200;
    window.setTimeout(() => {
      setIsTyping(false);
      const reply = AUTO_REPLIES[replyIndexRef.current % AUTO_REPLIES.length];
      replyIndexRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          name: buddy.name,
          initials: buddy.initials,
          text: reply,
          time: getTimeStr(),
          fromBuddy: true,
        },
      ]);
    }, delay);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const f = Math.min(60, Math.max(1, draftFocus));
    const s = Math.min(30, Math.max(1, draftShort));
    const l = Math.min(60, Math.max(1, draftLong));
    setFocusMins(f);
    setShortBreakMins(s);
    setLongBreakMins(l);
    setRunning(false);
    setPhase('focus');
    setSessionNum(1);
    setTotalFocusDone(0);
    setSecondsLeft(f * 60);
    setSettingsOpen(false);
    notify('Timer settings updated.', 'success');
  };

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);
  const isFocus = phase === 'focus';

  return (
    <div className="flex h-screen flex-col bg-[#F5F4F9] text-[#1E1B2E]">
      {/* Room Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E5E1F2] bg-white px-6 py-3">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-2 text-left"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#634EE3] text-white">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-[#1E1B2E]">
            Study<span className="text-[#634EE3]">Buddy</span>
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-2.5 text-sm text-[#5A5670]">
          <Avatar
            src={buddy.avatar}
            name={buddy.name}
            initials={buddy.initials}
            accentBg={buddy.accentBg}
            size="sm"
            className="!h-7 !w-7"
          />
          <span>
            Studying with{' '}
            <strong className="font-semibold text-[#1E1B2E]">
              {buddy.name}
            </strong>
          </span>
          <span className="text-xs text-[#6B6780]">
            · {buddy.examTarget} ·{' '}
            <span className="font-medium text-[#0F766E]">
              {buddy.online ? 'Online' : 'Session active'}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 whitespace-nowrap"
        >
          <DoorOpen className="h-3.5 w-3.5" />
          Leave Room
        </button>
      </header>

      {/* 3-Panel Room Grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-3">
        {/* LEFT — TASKS */}
        <section
          className={`${
            mobileTab === 'tasks' ? 'flex' : 'hidden'
          } lg:flex min-h-0 flex-col border-r border-[#E6E2F2] bg-white`}
        >
          <div className="flex items-center justify-between border-b border-[#EFEBF8] px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-[#1E1B2E]">
              My Tasks
            </h2>
            <span className="text-xs font-medium text-[#6B6780] tabular-nums">
              {completedTasks.length} of {tasks.length} done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                maxLength={150}
                placeholder="Add a session task..."
                className="min-w-0 flex-1 rounded-lg border border-[#DEDAF0] bg-[#FAF9FD] px-3 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-[#634EE3] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </form>

            {activeTasks.length === 0 ? (
              <p className="rounded-xl border border-[#EFEBF8] bg-[#FAF9FD] px-4 py-5 text-center text-xs text-[#6B6780]">
                No pending tasks. Add a clear objective for this Pomodoro block.
              </p>
            ) : (
              <ul className="space-y-2">
                {activeTasks.map((task) => (
                  <li
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropTask(task.id)}
                    className="flex items-center gap-3 rounded-xl border border-[#EAE6F6] bg-[#FAF9FD] px-3.5 py-2.5 cursor-grab active:cursor-grabbing"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-4 w-4 accent-[#634EE3]"
                    />
                    <span className="min-w-0 flex-1 break-words text-sm text-[#1E1B2E]">
                      {task.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label={`Delete ${task.text}`}
                      className="text-[#9490A6] hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCompletedOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6780] hover:text-[#1E1B2E]"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    completedOpen ? 'rotate-90' : ''
                  }`}
                />
                <span>Completed ({completedTasks.length})</span>
              </button>

              {completedOpen && completedTasks.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl border border-[#EFEBF8] bg-white px-3.5 py-2 opacity-65"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-4 w-4 accent-[#634EE3]"
                      />
                      <span className="min-w-0 flex-1 break-words text-sm text-[#6B6780] line-through">
                        {task.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label={`Delete ${task.text}`}
                        className="text-[#9490A6] hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* CENTER — POMODORO TIMER */}
        <section
          className={`${
            mobileTab === 'timer' ? 'flex' : 'hidden'
          } lg:flex min-h-0 flex-col border-r border-[#E6E2F2] bg-[#FAF9FD]`}
        >
          <div className="flex items-center justify-between border-b border-[#EFEBF8] bg-white px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-[#1E1B2E]">
              Pomodoro Timer
            </h2>
            <button
              type="button"
              onClick={() => {
                setDraftFocus(focusMins);
                setDraftShort(shortBreakMins);
                setDraftLong(longBreakMins);
                setSettingsOpen(true);
              }}
              aria-label="Timer settings"
              className="rounded-lg p-1.5 text-[#5A5670] hover:bg-[#F3F1FA] hover:text-[#1E1B2E]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="text-center">
              <p className="font-display text-base font-bold text-[#1E1B2E]">
                {phase === 'focus'
                  ? 'Focus Sprint'
                  : phase === 'shortBreak'
                    ? 'Short Break'
                    : 'Long Break'}
              </p>
              <p className="mt-0.5 text-xs text-[#6B6780] tabular-nums">
                Session {sessionNum} of 4
              </p>
            </div>

            {/* SVG Circular Ring */}
            <div className="relative h-56 w-56">
              <svg className="h-56 w-56 -rotate-90" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="#E7E3F5"
                  strokeWidth="12"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke={isFocus ? '#634EE3' : '#0D9488'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.8s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-extrabold tracking-tight text-[#1E1B2E] tabular-nums">
                  {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[11px] font-bold tracking-widest text-[#6B6780] uppercase">
                  {phase === 'focus'
                    ? 'Focus'
                    : phase === 'shortBreak'
                      ? 'Short Break'
                      : 'Long Break'}
                </span>
              </div>
            </div>

            {/* 4 session progress indicators */}
            <div className="flex items-center gap-2.5" aria-label="Session progress">
              {[0, 1, 2, 3].map((dotIdx) => {
                const done = dotIdx < totalFocusDone;
                const active = dotIdx === sessionNum - 1 && isFocus;
                return (
                  <span
                    key={dotIdx}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      done
                        ? 'bg-[#634EE3]'
                        : active
                          ? 'bg-[#634EE3] ring-4 ring-[#634EE3]/20'
                          : 'bg-[#DCD6EE]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(phaseSeconds(phase));
                }}
                aria-label="Reset timer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DEDAF0] bg-white text-[#4A465E] hover:bg-[#F3F1FA]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setRunning((prev) => !prev)}
                aria-label={running ? 'Pause timer' : 'Start timer'}
                className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md transition-colors ${
                  isFocus
                    ? 'bg-[#634EE3] hover:bg-[#523DD4]'
                    : 'bg-[#0D9488] hover:bg-[#0F766E]'
                }`}
              >
                {running ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => advancePhase(false)}
                aria-label="Skip phase"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DEDAF0] bg-white text-[#4A465E] hover:bg-[#F3F1FA]"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT — SESSION CHAT */}
        <section
          className={`${
            mobileTab === 'chat' ? 'flex' : 'hidden'
          } lg:flex min-h-0 flex-col bg-white`}
        >
          <div className="flex items-center justify-between border-b border-[#EFEBF8] px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-[#1E1B2E]">
              Session Chat
            </h2>
            <span className="text-xs text-[#6B6780]">{buddy.name}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.fromBuddy ? 'items-start' : 'items-end'
                }`}
              >
                <span className="mb-1 text-[11px] text-[#78748D] tabular-nums">
                  {msg.name} · {msg.time}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.fromBuddy
                      ? 'rounded-bl-sm bg-[#F3F1FA] text-[#1E1B2E]'
                      : 'rounded-br-sm bg-[#634EE3] text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="text-xs font-medium text-[#6B6780]">
                {buddy.name} is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-[#EFEBF8] bg-[#FAF9FD] p-3.5"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={500}
              placeholder="Send a check-in message..."
              className="min-w-0 flex-1 rounded-full border border-[#DEDAF0] bg-white px-4 py-2 text-sm text-[#1E1B2E] focus:border-[#634EE3] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#634EE3] text-white hover:bg-[#523DD4]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>

      {/* Mobile Tab Bar */}
      <nav
        aria-label="Room sections"
        className="grid shrink-0 grid-cols-3 border-t border-[#E5E1F2] bg-white lg:hidden"
      >
        {[
          { id: 'tasks', label: 'Tasks', icon: ListChecks },
          { id: 'timer', label: 'Timer', icon: Clock },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setMobileTab(tab.id as 'tasks' | 'timer' | 'chat')
              }
              className={`flex flex-col items-center gap-1 py-2.5 text-xs font-semibold ${
                active ? 'text-[#634EE3]' : 'text-[#6B6780]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Timer Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#19172D]/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={saveSettings}
            className="w-full max-w-sm rounded-2xl border border-[#E2DFF0] bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#1E1B2E]">
                Timer Settings
              </h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded p-1 text-[#6B6780] hover:bg-[#F3F1FA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label
                htmlFor="set-focus"
                className="block text-xs font-semibold text-[#5A5670]"
              >
                Focus Duration (minutes)
              </label>
              <input
                id="set-focus"
                type="number"
                min={1}
                max={60}
                value={draftFocus}
                onChange={(e) => setDraftFocus(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#DEDAF0] px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="set-short"
                className="block text-xs font-semibold text-[#5A5670]"
              >
                Short Break (minutes)
              </label>
              <input
                id="set-short"
                type="number"
                min={1}
                max={30}
                value={draftShort}
                onChange={(e) => setDraftShort(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#DEDAF0] px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="set-long"
                className="block text-xs font-semibold text-[#5A5670]"
              >
                Long Break (minutes)
              </label>
              <input
                id="set-long"
                type="number"
                min={1}
                max={60}
                value={draftLong}
                onChange={(e) => setDraftLong(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#DEDAF0] px-3 py-2 text-sm tabular-nums"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg border border-[#DEDAF0] bg-white px-4 py-2 text-xs font-semibold text-[#4A465E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#634EE3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#523DD4]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
