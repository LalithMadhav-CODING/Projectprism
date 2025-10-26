// Filler word detection and analysis utilities

import { WordTiming } from './webSpeechAPI';

export interface FillerWord {
  word: string;
  timestamp: number;
  context: string;
}

export const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'basically', 'actually',
  'literally', 'kind of', 'sort of', 'i mean', 'right'
];

import { WordTiming } from './webSpeechAPI';

export function detectFillerWords(transcript: string, wordTimings?: WordTiming[]): FillerWord[] {
  const words = transcript.toLowerCase().split(/\s+/);
  const fillerInstances: FillerWord[] = [];

  // Check for multi-word fillers first
  const multiWordFillers = FILLER_WORDS.filter(f => f.includes(' '));
  multiWordFillers.forEach(filler => {
    const fillerWords = filler.split(' ');
    for (let i = 0; i <= words.length - fillerWords.length; i++) {
      const slice = words.slice(i, i + fillerWords.length).join(' ');
      if (slice === filler) {
        const timestamp = wordTimings?.[i]?.start || (i * 0.5); // Fallback to estimated timing
        fillerInstances.push({
          word: filler,
          timestamp,
          context: getContext(words, i, 5)
        });
      }
    }
  });

  // Check for single-word fillers
  words.forEach((word, index) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    if (FILLER_WORDS.filter(f => !f.includes(' ')).includes(cleanWord)) {
      const timestamp = wordTimings?.[index]?.start || (index * 0.5); // Fallback to estimated timing
      fillerInstances.push({
        word: cleanWord,
        timestamp,
        context: getContext(words, index, 5)
      });
    }
  });

  return fillerInstances.sort((a, b) => a.timestamp - b.timestamp);
}

function getContext(words: string[], index: number, contextSize: number): string {
  const start = Math.max(0, index - contextSize);
  const end = Math.min(words.length, index + contextSize + 1);
  const contextWords = words.slice(start, end);
  
  // Highlight the filler word
  const relativeIndex = index - start;
  contextWords[relativeIndex] = `**${contextWords[relativeIndex]}**`;
  
  return contextWords.join(' ');
}

export function calculateFillerWordRate(fillerCount: number, totalWords: number): number {
  if (totalWords === 0) return 0;
  return (fillerCount / totalWords) * 100;
}

export function getFillerSeverity(rate: number): 'low' | 'medium' | 'high' {
  if (rate < 2) return 'low';
  if (rate < 5) return 'medium';
  return 'high';
}
