// Speech analysis utilities

import { WordTiming } from './webSpeechAPI';

export interface TranscriptSegment {
  text: string;
  timestamp: number;
  duration: number;
  wordCount: number;
  wpm: number;
}

export interface AnalysisResult {
  transcript: string;
  segments: TranscriptSegment[];
  totalWords: number;
  totalDuration: number;
  averageWPM: number;
  clarityScore: number;
}

export function analyzeTranscript(transcript: string, duration: number, words?: WordTiming[]): AnalysisResult {
  const segments = words && words.length > 0 
    ? createSegmentsFromTimings(words, duration)
    : createSegments(transcript, duration);
    
  const totalWords = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const averageWPM = (totalWords / duration) * 60;

  return {
    transcript,
    segments,
    totalWords,
    totalDuration: duration,
    averageWPM,
    clarityScore: 0 // Will be calculated with filler words
  };
}

function createSegmentsFromTimings(words: WordTiming[], totalDuration: number): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const segmentDuration = 10; // 10-second segments for better granularity
  
  let currentTime = 0;
  while (currentTime < totalDuration) {
    const segmentEnd = Math.min(currentTime + segmentDuration, totalDuration);
    const segmentWords = words.filter(w => w.start >= currentTime && w.start < segmentEnd);
    
    if (segmentWords.length > 0) {
      const text = segmentWords.map(w => w.word).join(' ');
      const actualDuration = segmentEnd - currentTime;
      const wpm = (segmentWords.length / actualDuration) * 60;
      
      segments.push({
        text,
        timestamp: currentTime,
        duration: actualDuration,
        wordCount: segmentWords.length,
        wpm: Math.max(wpm, 0) // Ensure non-negative WPM
      });
    }
    
    currentTime = segmentEnd;
  }
  
  return segments;
}

function createSegments(transcript: string, totalDuration: number): TranscriptSegment[] {
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const segmentSize = Math.ceil(words.length / 20); // Create ~20 segments
  const segments: TranscriptSegment[] = [];

  for (let i = 0; i < words.length; i += segmentSize) {
    const segmentWords = words.slice(i, i + segmentSize);
    const segmentText = segmentWords.join(' ');
    const timestamp = (i / words.length) * totalDuration;
    const duration = (segmentWords.length / words.length) * totalDuration;
    const wpm = (segmentWords.length / duration) * 60;

    segments.push({
      text: segmentText,
      timestamp,
      duration,
      wordCount: segmentWords.length,
      wpm
    });
  }

  return segments;
}

export function calculateClarityScore(
  totalWords: number,
  fillerCount: number,
  averageWPM: number
): number {
  // Ideal WPM is 140-160, filler rate should be < 2%
  const fillerRate = (fillerCount / totalWords) * 100;
  const fillerScore = Math.max(0, 100 - (fillerRate * 10));
  
  const idealWPM = 150;
  const wpmDiff = Math.abs(averageWPM - idealWPM);
  const wpmScore = Math.max(0, 100 - wpmDiff);
  
  return Math.round((fillerScore * 0.6 + wpmScore * 0.4));
}

export function getPaceSeverity(wpm: number): 'slow' | 'optimal' | 'fast' {
  if (wpm < 130) return 'slow';
  if (wpm > 170) return 'fast';
  return 'optimal';
}
