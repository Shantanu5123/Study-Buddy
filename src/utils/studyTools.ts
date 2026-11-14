import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { Flashcard, QuizQuestion } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const SAMPLE_STUDY_TEXT = `Active recall is a learning technique where you retrieve information from memory instead of simply rereading it. The effort of remembering strengthens the neural pathways that help you find the idea again later.

Spaced practice means reviewing material across several short sessions over time. It helps move ideas into long-term memory more effectively than doing one long study session the night before an exam.

Interleaving is the practice of switching between related topics or problem types during a study session. It encourages you to recognize which strategy fits a new problem rather than repeating one method mechanically.

A useful study cycle is simple: read a small section, close the notes, write down what you remember, then check the source and correct gaps. Break a large chapter into short sections and return to each one after a delay.`;

const STOP_WORDS = new Set(
  (
    'a about above after again against all am an and any are as at be because been before ' +
    'being between both but by can could did do does doing down during each few for from ' +
    'further had has have having he her here hers herself him himself his how i if in into ' +
    'is it its itself just me more most my myself no nor not of off on once only or other ' +
    'our ours ourselves out over own same she should so some such than that the their theirs ' +
    'them themselves then there these they this those through to too under until up very ' +
    'was we were what when where which while who whom why will with would you your yours ' +
    'yourself yourselves also using based learn learning material notes study session'
  ).split(' ')
);

export function wordCount(text: string): number {
  const trimmed = (text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function splitSentences(text: string): string[] {
  const parts = (text || '').replace(/\r/g, ' ').split(/(?<=[.!?])\s+|\n+/);
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 35 && part.length < 360);
}

export function topTerms(text: string, limit = 20): string[] {
  const words = (text || '').toLowerCase().match(/[a-z][a-z'-]{3,}/g) || [];
  const counts = new Map<string, number>();
  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
    .slice(0, limit)
    .map(([word]) => word);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function makeReview(text: string, limit = 5): string[] {
  const lines = splitSentences(text);
  const terms = topTerms(text, 12);
  const ranked = lines.map((sentence, index) => {
    const lower = sentence.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const matches = lower.match(new RegExp(`\\b${escapeRegExp(term)}\\b`, 'g'));
      score += matches ? matches.length : 0;
    }
    if (sentence.length > 65 && sentence.length < 230) {
      score += 1;
    }
    return { score, index, sentence };
  });

  return ranked
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index))
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);
}

export function makeFlashcards(text: string, docId: string): Flashcard[] {
  const lines = splitSentences(text);
  const cards: Flashcard[] = [];
  const used = new Set<string>();

  const defRegex =
    /([^.!?\n]{2,65}?\s+(?:is|are|means|refers to|describes)\s+[^.!?\n]{20,230})/gi;
  const matches = (text || '').match(defRegex) || [];

  for (const line of matches) {
    if (cards.length >= 5) break;
    const parts = line
      .trim()
      .match(/^(.{2,65}?)\s+(is|are|means|refers to|describes)\s+(.+)$/i);
    if (parts && parts[1].split(/\s+/).length <= 7) {
      const verb = parts[2].toLowerCase() === 'means' ? 'does' : 'is';
      cards.push({
        id: `${docId}-def-${cards.length}-${Date.now()}`,
        docId,
        question: `What ${verb} ${parts[1].trim()}?`,
        answer: `${parts[3].trim().replace(/\.$/, '')}.`,
      });
    }
  }

  for (const term of topTerms(text, 24)) {
    if (cards.length >= 10 || used.has(term)) continue;
    const source = lines.find(
      (line) => line.toLowerCase().includes(term) && line.split(/\s+/).length > 7
    );
    if (source) {
      used.add(term);
      cards.push({
        id: `${docId}-term-${term}-${cards.length}`,
        docId,
        question: `What do your notes say about "${term}"?`,
        answer: source,
      });
    }
  }

  return cards;
}

export function makeQuiz(text: string): QuizQuestion[] {
  const lines = splitSentences(text);
  const terms = topTerms(text, 28);
  const questions: QuizQuestion[] = [];
  const usedLines = new Set<string>();

  for (const term of terms) {
    const source = lines.find(
      (line) => line.toLowerCase().includes(term) && line.split(/\s+/).length > 8
    );
    if (!source || usedLines.has(source)) continue;

    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    const blanked = source.replace(regex, '_____');
    if (blanked === source) continue;

    const distractors = terms
      .filter((other) => other !== term && !source.toLowerCase().includes(other))
      .slice(0, 3);
    if (distractors.length < 2) continue;

    const options = [term, ...distractors];
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    questions.push({
      prompt: blanked,
      answer: term,
      options,
    });
    usedLines.add(source);
    if (questions.length === 5) break;
  }

  return questions;
}

export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function extractTextFromFile(file: File): Promise<string> {
  const suffix = (file.name.split('.').pop() || '').toLowerCase();
  const buffer = await file.arrayBuffer();

  if (suffix === 'pdf') {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const maxPages = Math.min(pdf.numPages, 80);
    const chunks: string[] = [];
    for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      chunks.push(pageText);
    }
    return chunks.join('\n\n').slice(0, 250_000);
  }

  if (suffix === 'docx') {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return (result.value || '').slice(0, 250_000);
  }

  if (suffix === 'txt' || suffix === 'md' || suffix === 'markdown') {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer).slice(0, 250_000);
  }

  throw new Error('Unsupported file format. Please upload a PDF, DOCX, Markdown, or TXT file.');
}

export function playGentleChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio playback may be blocked if user hasn't interacted yet
  }
}
