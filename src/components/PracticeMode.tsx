import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, MicOff, Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { startLiveRecording } from '../utils/webSpeechAPI';
import { FILLER_WORDS } from '../utils/fillerWords';

export function PracticeMode() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fillerCount, setFillerCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recentFillers, setRecentFillers] = useState<string[]>([]);
  const [targetWPM] = useState(150);
  const [currentWPM, setCurrentWPM] = useState(0);
  const [showMetronome, setShowMetronome] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const metronomeRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (metronomeRef.current) {
        clearInterval(metronomeRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (duration > 0 && wordCount > 0) {
      const wpm = (wordCount / duration) * 60;
      setCurrentWPM(Math.round(wpm));
    }
  }, [duration, wordCount]);

  const startRecording = () => {
    const recognition = startLiveRecording(
      (text, isFinal) => {
        if (isFinal) {
          const newText = ' ' + text;
          setTranscript((prev) => prev + newText);
          
          // Check for filler words in the new text
          const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
          const singleWordFillers = FILLER_WORDS.filter(f => !f.includes(' '));
          const newFillers = words.filter(word => 
            singleWordFillers.includes(word.replace(/[.,!?;:]/g, ''))
          );
          
          if (newFillers.length > 0) {
            setFillerCount(prev => prev + newFillers.length);
            setRecentFillers(prev => [...newFillers, ...prev].slice(0, 5));
            
            // Clear recent fillers after 3 seconds
            setTimeout(() => {
              setRecentFillers([]);
            }, 3000);
          }

          setWordCount(prev => prev + words.length);
        }
      },
      (error) => {
        console.error('Recording error:', error);
        alert(`Recording failed: ${error}. Please ensure you've granted microphone permissions.`);
        setIsRecording(false);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const resetPractice = () => {
    stopRecording();
    setTranscript('');
    setFillerCount(0);
    setWordCount(0);
    setDuration(0);
    setRecentFillers([]);
    setCurrentWPM(0);
  };

  const playMetronomeSound = () => {
    // Create metronome click sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequency of the click sound
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const toggleMetronome = () => {
    if (!showMetronome) {
      setShowMetronome(true);
      // Beat every 60/targetWPM seconds (time per word)
      const interval = (60 / targetWPM) * 1000;
      metronomeRef.current = setInterval(() => {
        playMetronomeSound();
        setMetronomeBeat(true);
        setTimeout(() => setMetronomeBeat(false), 100);
      }, interval);
    } else {
      setShowMetronome(false);
      if (metronomeRef.current) {
        clearInterval(metronomeRef.current);
        metronomeRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getWPMStatus = (): 'slow' | 'optimal' | 'fast' => {
    if (currentWPM < 130) return 'slow';
    if (currentWPM > 170) return 'fast';
    return 'optimal';
  };

  const getWPMColor = (): string => {
    const status = getWPMStatus();
    if (status === 'optimal') return 'text-green-400';
    if (status === 'slow') return 'text-blue-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-slate-100">Practice Mode</h3>
              <p className="text-sm text-slate-400">
                Live feedback as you speak
              </p>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Duration</p>
              <p className="text-xl text-slate-100">{formatTime(duration)}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Words</p>
              <p className="text-xl text-slate-100">{wordCount}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Pace</p>
              <p className={`text-xl ${getWPMColor()}`}>
                {currentWPM} WPM
              </p>
            </div>
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <p className="text-xs text-red-400 mb-1">Fillers</p>
              <p className="text-xl text-red-400">{fillerCount}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}

            <Button
              onClick={toggleMetronome}
              variant={showMetronome ? "default" : "outline"}
              className={showMetronome ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {showMetronome ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Metronome ({targetWPM} WPM)
            </Button>

            <Button
              onClick={resetPractice}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Metronome Visual */}
      {showMetronome && (
        <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-center h-32">
              <div
                className={`w-24 h-24 rounded-full border-4 transition-all duration-100 ${
                  metronomeBeat
                    ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-lg shadow-indigo-500/50'
                    : 'bg-indigo-900/30 border-indigo-600 scale-100'
                }`}
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-slate-400">
                Target: {targetWPM} words per minute
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try to speak one word per beat
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Fillers Alert */}
      {recentFillers.length > 0 && (
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50 backdrop-blur-sm animate-pulse">
          <div className="p-6">
            <h4 className="text-red-400 mb-3">Recent Filler Words Detected!</h4>
            <div className="flex flex-wrap gap-2">
              {recentFillers.map((filler, index) => (
                <Badge
                  key={index}
                  variant="destructive"
                  className="animate-fade-in"
                >
                  "{filler}"
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-3">
              Try pausing instead of using filler words
            </p>
          </div>
        </Card>
      )}

      {/* Pace Guidance */}
      {currentWPM > 0 && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-slate-100">Speaking Pace</h4>
              <Badge
                variant={getWPMStatus() === 'optimal' ? 'default' : 'secondary'}
                className={
                  getWPMStatus() === 'optimal'
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : getWPMStatus() === 'slow'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                }
              >
                {getWPMStatus() === 'optimal' ? 'Optimal' : getWPMStatus() === 'slow' ? 'Too Slow' : 'Too Fast'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Too Slow</span>
                <span className="text-slate-400">Optimal</span>
                <span className="text-slate-400">Too Fast</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    getWPMStatus() === 'optimal'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : getWPMStatus() === 'slow'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{ width: `${Math.min((currentWPM / 200) * 100, 100)}%` }}
                />
                {/* Optimal range indicator */}
                <div
                  className="absolute top-0 h-full bg-white/20 border-x-2 border-white/40"
                  style={{
                    left: '65%', // 130 WPM
                    width: '20%' // 130-170 WPM range
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>110</span>
                <span>130-170</span>
                <span>200+</span>
              </div>
            </div>

            {getWPMStatus() !== 'optimal' && (
              <p className="text-sm text-slate-400 mt-4">
                {getWPMStatus() === 'slow'
                  ? 'Try speaking a bit faster to maintain audience engagement.'
                  : 'Slow down to ensure your audience can follow along.'}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Live Transcript */}
      {transcript && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <h4 className="text-slate-100 mb-4">Live Transcript</h4>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-h-48 overflow-y-auto">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
