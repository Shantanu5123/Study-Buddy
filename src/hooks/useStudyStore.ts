import { useCallback, useEffect, useState } from 'react';
import type {
  Flashcard,
  QuizSession,
  RoomTask,
  StudyDocument,
  StudyStats,
  UserProfile,
} from '../types';
import {
  extractTextFromFile,
  makeFlashcards,
  makeQuiz,
  MAX_FILE_SIZE_BYTES,
  SAMPLE_STUDY_TEXT,
  sha256Hex,
} from '../utils/studyTools';

const STORAGE_KEYS = {
  documents: 'studybuddy_documents_v1',
  cards: 'studybuddy_cards_v1',
  stats: 'studybuddy_stats_v1',
  profile: 'studybuddy_profile_v1',
  tasks: 'studybuddy_room_tasks_v1',
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useStudyStore(
  notify: (message: string, tone?: 'success' | 'info' | 'error') => void
) {
  const [documents, setDocuments] = useState<StudyDocument[]>(() =>
    readJson<StudyDocument[]>(STORAGE_KEYS.documents, [])
  );
  const [cardsByDoc, setCardsByDoc] = useState<Record<string, Flashcard[]>>(() =>
    readJson<Record<string, Flashcard[]>>(STORAGE_KEYS.cards, {})
  );
  const [quizByDoc, setQuizByDoc] = useState<Record<string, QuizSession>>({});
  const [stats, setStats] = useState<StudyStats>(() =>
    readJson<StudyStats>(STORAGE_KEYS.stats, { days: {}, sessions: 0 })
  );
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    readJson<UserProfile | null>(STORAGE_KEYS.profile, null)
  );
  const [roomTasks, setRoomTasks] = useState<RoomTask[]>(() =>
    readJson<RoomTask[]>(STORAGE_KEYS.tasks, [
      { id: 'task-1', text: 'Review key concepts from active notes', done: false },
      { id: 'task-2', text: 'Complete one 25-minute focus sprint', done: false },
    ])
  );
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents));
    } catch {
      // Ignore quota exceeded on very large docs
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cardsByDoc));
    } catch {
      // Ignore quota error
    }
  }, [cardsByDoc]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch {
      // Ignore quota error
    }
  }, [stats]);

  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
      }
    } catch {
      // Ignore quota error
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(roomTasks));
    } catch {
      // Ignore quota error
    }
  }, [roomTasks]);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsUploading(true);
      let addedCount = 0;

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          notify(`${file.name} exceeds the 20 MB limit.`, 'error');
          continue;
        }
        try {
          const buffer = await file.arrayBuffer();
          const signature = await sha256Hex(buffer);
          const duplicate = documents.some((d) => d.signature === signature);
          if (duplicate) {
            notify(`${file.name} is already in your library.`, 'info');
            continue;
          }

          const text = await extractTextFromFile(file);
          const ext = (file.name.split('.').pop() || 'txt').toLowerCase();
          const normalizedType: StudyDocument['type'] =
            ext === 'pdf' || ext === 'docx' || ext === 'md' || ext === 'markdown'
              ? ext
              : 'txt';

          const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const newDoc: StudyDocument = {
            id: docId,
            name: file.name,
            type: normalizedType,
            kind: 'file',
            size: file.size,
            addedAt: new Date().toISOString(),
            text,
            signature,
          };

          setDocuments((prev) => [newDoc, ...prev]);
          setSelectedDocId(docId);
          addedCount += 1;

          if (!text.trim()) {
            notify(
              `${file.name} has no selectable text. Scanned PDFs need OCR first.`,
              'info'
            );
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : `Could not read ${file.name}.`;
          notify(msg, 'error');
        }
      }

      setIsUploading(false);
      if (addedCount > 0) {
        notify(
          `Added ${addedCount} ${addedCount === 1 ? 'material' : 'materials'} to your library.`,
          'success'
        );
      }
    },
    [documents, notify]
  );

  const addSampleDocument = useCallback(() => {
    const existing = documents.find((d) => d.id === 'sample-active-recall');
    if (existing) {
      setSelectedDocId(existing.id);
      notify('Sample notes are already in your library.', 'info');
      return existing.id;
    }

    const sampleDoc: StudyDocument = {
      id: 'sample-active-recall',
      name: 'Sample — learning techniques.txt',
      type: 'txt',
      kind: 'sample',
      size: SAMPLE_STUDY_TEXT.length,
      addedAt: new Date().toISOString(),
      text: SAMPLE_STUDY_TEXT,
      signature: 'sample-active-recall',
    };

    setDocuments((prev) => [sampleDoc, ...prev]);
    setSelectedDocId(sampleDoc.id);
    notify('Sample study notes added.', 'success');
    return sampleDoc.id;
  }, [documents, notify]);

  const addNote = useCallback(
    (title: string, body: string) => {
      const noteId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newNote: StudyDocument = {
        id: noteId,
        name: title.trim(),
        type: 'note',
        kind: 'note',
        size: body.trim().length,
        addedAt: new Date().toISOString(),
        text: body.trim(),
        signature: '',
      };
      setDocuments((prev) => [newNote, ...prev]);
      setSelectedDocId(noteId);
      notify('Note saved to this browser.', 'success');
      return noteId;
    },
    [notify]
  );

  const deleteDocument = useCallback(
    (docId: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setCardsByDoc((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      setQuizByDoc((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      if (selectedDocId === docId) {
        setSelectedDocId('');
      }
      notify('Removed from your library.', 'info');
    },
    [notify, selectedDocId]
  );

  const generateDeckForDoc = useCallback(
    (doc: StudyDocument) => {
      const cards = makeFlashcards(doc.text, doc.id);
      setCardsByDoc((prev) => ({ ...prev, [doc.id]: cards }));
      setSelectedDocId(doc.id);
      if (cards.length === 0) {
        notify('This material needs more selectable text to create flashcards.', 'info');
      } else {
        notify(`Created ${cards.length} flashcards from ${doc.name}.`, 'success');
      }
      return cards;
    },
    [notify]
  );

  const toggleCardMastered = useCallback((docId: string, cardId: string) => {
    setCardsByDoc((prev) => {
      const deck = prev[docId] || [];
      return {
        ...prev,
        [docId]: deck.map((card) =>
          card.id === cardId ? { ...card, mastered: !card.mastered } : card
        ),
      };
    });
  }, []);

  const createQuizForDoc = useCallback(
    (doc: StudyDocument) => {
      const questions = makeQuiz(doc.text);
      const session: QuizSession = {
        questions,
        index: 0,
        score: 0,
        checked: false,
        selectedOption: questions[0]?.options[0] || '',
        lastCorrect: false,
      };
      setQuizByDoc((prev) => ({ ...prev, [doc.id]: session }));
      setSelectedDocId(doc.id);
      if (questions.length === 0) {
        notify('Needs more selectable text to generate quiz questions.', 'info');
      }
    },
    [notify]
  );

  const updateQuizSession = useCallback(
    (docId: string, updater: (prev: QuizSession) => QuizSession) => {
      setQuizByDoc((prev) => {
        const current = prev[docId];
        if (!current) return prev;
        return { ...prev, [docId]: updater(current) };
      });
    },
    []
  );

  const recordFocusSession = useCallback((minutes: number) => {
    const todayKey = getTodayKey();
    setStats((prev) => ({
      days: {
        ...prev.days,
        [todayKey]: (prev.days[todayKey] || 0) + minutes,
      },
      sessions: prev.sessions + 1,
    }));
  }, []);

  const saveProfile = useCallback(
    (nextProfile: UserProfile) => {
      setProfile(nextProfile);
      notify('Profile saved.', 'success');
    },
    [notify]
  );

  return {
    documents,
    cardsByDoc,
    quizByDoc,
    stats,
    profile,
    roomTasks,
    selectedDocId,
    isUploading,
    setSelectedDocId,
    setRoomTasks,
    uploadFiles,
    addSampleDocument,
    addNote,
    deleteDocument,
    generateDeckForDoc,
    toggleCardMastered,
    createQuizForDoc,
    updateQuizSession,
    recordFocusSession,
    saveProfile,
  };
}
