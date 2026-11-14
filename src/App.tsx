import { useCallback, useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ToastStack, type ToastItem } from './components/Toast';
import { STUDY_BUDDIES } from './data/buddies';
import { useStudyStore } from './hooks/useStudyStore';
import type { AppView } from './types';
import { BuddiesView } from './views/BuddiesView';
import { HomeView } from './views/HomeView';
import { ProfileView } from './views/ProfileView';
import { RoomView } from './views/RoomView';
import { StudySpaceView } from './views/StudySpaceView';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [activeBuddyId, setActiveBuddyId] = useState<string>(
    STUDY_BUDDIES[0].id
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: 'success' | 'info' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const store = useStudyStore(notify);

  const totalCards = useMemo(
    () =>
      Object.values(store.cardsByDoc).reduce(
        (sum, deck) => sum + deck.length,
        0
      ),
    [store.cardsByDoc]
  );

  const totalMinutes = useMemo(
    () =>
      Object.values(store.stats.days).reduce((sum, mins) => sum + mins, 0),
    [store.stats.days]
  );

  const handleNavigate = (nextView: AppView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRoomWithBuddy = (buddyId: string) => {
    setActiveBuddyId(buddyId);
    setView('room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Study Space and Live Study Room use their own dedicated full-viewport chrome
  if (view === 'study') {
    return (
      <>
        <StudySpaceView
          documents={store.documents}
          cardsByDoc={store.cardsByDoc}
          quizByDoc={store.quizByDoc}
          stats={store.stats}
          profile={store.profile}
          selectedDocId={store.selectedDocId}
          isUploading={store.isUploading}
          onSelectDoc={store.setSelectedDocId}
          onUploadFiles={store.uploadFiles}
          onAddSample={store.addSampleDocument}
          onAddNote={store.addNote}
          onDeleteDoc={store.deleteDocument}
          onGenerateDeck={store.generateDeckForDoc}
          onToggleCardMastered={store.toggleCardMastered}
          onCreateQuiz={store.createQuizForDoc}
          onUpdateQuiz={store.updateQuizSession}
          onRecordFocus={store.recordFocusSession}
          onNavigate={handleNavigate}
        />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (view === 'room') {
    return (
      <>
        <RoomView
          buddyId={activeBuddyId}
          profile={store.profile}
          tasks={store.roomTasks}
          onChangeTasks={store.setRoomTasks}
          onRecordFocus={store.recordFocusSession}
          onLeaveRoom={() => handleNavigate('buddies')}
          notify={notify}
        />
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F9] text-[#1E1B2E]">
      <Navbar
        currentView={view}
        onNavigate={handleNavigate}
        profile={store.profile}
      />

      {view === 'home' && (
        <HomeView
          onNavigate={handleNavigate}
          onStartRoomWithBuddy={handleStartRoomWithBuddy}
          docCount={store.documents.length}
          cardCount={totalCards}
          totalMinutes={totalMinutes}
        />
      )}

      {view === 'buddies' && (
        <BuddiesView
          profile={store.profile}
          onStartRoom={handleStartRoomWithBuddy}
          onNavigate={handleNavigate}
          notify={notify}
        />
      )}

      {view === 'profile' && (
        <ProfileView
          profile={store.profile}
          onSaveProfile={store.saveProfile}
          onComplete={() => handleNavigate('buddies')}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
