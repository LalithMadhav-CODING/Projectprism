import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Download, Sparkles } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { AudioUploader } from './components/AudioUploader';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { TimelineView } from './components/TimelineView';
import { AICoach } from './components/AICoach';
import { PracticeMode } from './components/PracticeMode';
import { transcribeAudioFile } from './utils/webSpeechAPI';
import { detectFillerWords } from './utils/fillerWords';
import { analyzeTranscript, calculateClarityScore, TranscriptSegment } from './utils/speechAnalysis';
import { FillerWord } from './utils/fillerWords';

interface AnalysisData {
  transcript: string;
  fillerWords: FillerWord[];
  segments: TranscriptSegment[];
  averageWPM: number;
  clarityScore: number;
  totalWords: number;
  totalDuration: number;
}

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<TranscriptSegment | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // Load saved analysis from localStorage
    const savedAnalysis = localStorage.getItem('prism_analysis');
    if (savedAnalysis) {
      try {
        setAnalysisData(JSON.parse(savedAnalysis));
        setActiveTab('dashboard');
      } catch (error) {
        console.error('Error loading saved analysis:', error);
      }
    }
  }, []);

  const handleAnalyze = async (file: File, apiKey?: string) => {
    setIsAnalyzing(true);
    toast.loading('Transcribing audio with Whisper...', { id: 'analysis' });

    try {
      // Transcribe audio using OpenAI Whisper
      const transcription = await transcribeAudioFile(file, apiKey);
      
      if (!apiKey) {
        toast.loading('No API key provided - using demo transcript...', { id: 'analysis' });
      }
      
      toast.loading('Analyzing speech patterns...', { id: 'analysis' });

      // Analyze transcript with word timings
      const analysis = analyzeTranscript(
        transcription.transcript, 
        transcription.duration,
        transcription.words
      );
      
      // Detect filler words with accurate timestamps
      const fillerWords = detectFillerWords(transcription.transcript, transcription.words);

      // Calculate clarity score
      const clarityScore = calculateClarityScore(
        analysis.totalWords,
        fillerWords.length,
        analysis.averageWPM
      );

      const data: AnalysisData = {
        transcript: transcription.transcript,
        fillerWords,
        segments: analysis.segments,
        averageWPM: analysis.averageWPM,
        clarityScore,
        totalWords: analysis.totalWords,
        totalDuration: analysis.totalDuration
      };

      setAnalysisData(data);
      localStorage.setItem('prism_analysis', JSON.stringify(data));
      
      toast.success(`Analysis complete! Found ${fillerWords.length} filler words.`, { id: 'analysis' });
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze audio. Please try again.', { id: 'analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisData) return;

    const report = {
      date: new Date().toISOString(),
      summary: {
        totalWords: analysisData.totalWords,
        fillerWords: analysisData.fillerWords.length,
        fillerRate: ((analysisData.fillerWords.length / analysisData.totalWords) * 100).toFixed(2) + '%',
        averageWPM: Math.round(analysisData.averageWPM),
        clarityScore: analysisData.clarityScore,
        duration: Math.round(analysisData.totalDuration) + 's'
      },
      fillerWordsBreakdown: Object.entries(
        analysisData.fillerWords.reduce((acc, fw) => {
          acc[fw.word] = (acc[fw.word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([, a], [, b]) => b - a),
      transcript: analysisData.transcript,
      segments: analysisData.segments.map(s => ({
        timestamp: s.timestamp,
        wpm: Math.round(s.wpm),
        wordCount: s.wordCount,
        text: s.text
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prism-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 dark">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-slate-100">Project Prism</h1>
                  <p className="text-sm text-slate-400">AI-Powered Presentation Coaching</p>
                </div>
              </div>

              {analysisData && (
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
              <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                disabled={!analysisData}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              >
                Analysis Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                disabled={!analysisData}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              >
                Timeline View
              </TabsTrigger>
              <TabsTrigger 
                value="coach" 
                disabled={!analysisData}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              >
                AI Coach
              </TabsTrigger>
              <TabsTrigger 
                value="practice"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              >
                Practice Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-800 p-8">
                <div className="max-w-3xl mx-auto text-center mb-8">
                  <h2 className="text-slate-100 mb-3">Transform Your Presentations</h2>
                  <p className="text-slate-400 mb-4">
                    Upload your presentation recording and get instant AI-powered feedback on your speaking
                    style, pacing, and clarity. Eliminate filler words and speak with confidence.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Powered by OpenAI Whisper & Groq AI</span>
                  </div>
                </div>
                <AudioUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 p-6">
                  <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3 w-fit mb-4">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-100 mb-2">Filler Word Detection</h3>
                  <p className="text-sm text-slate-400">
                    Identify and track "um", "uh", "like" and other filler words that weaken your message
                  </p>
                </Card>

                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 p-6">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 w-fit mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-100 mb-2">Pace Analysis</h3>
                  <p className="text-sm text-slate-400">
                    Get real-time feedback on your speaking speed to maintain optimal audience engagement
                  </p>
                </Card>

                <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 p-6">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 w-fit mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-100 mb-2">AI Coaching</h3>
                  <p className="text-sm text-slate-400">
                    Receive personalized tips and actionable feedback powered by advanced AI
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dashboard">
              {analysisData && (
                <AnalysisDashboard
                  fillerWords={analysisData.fillerWords}
                  segments={analysisData.segments}
                  averageWPM={analysisData.averageWPM}
                  clarityScore={analysisData.clarityScore}
                  totalWords={analysisData.totalWords}
                  onTimelineClick={(segment) => {
                    setSelectedSegment(segment);
                    setActiveTab('timeline');
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="timeline">
              {analysisData && (
                <TimelineView
                  transcript={analysisData.transcript}
                  fillerWords={analysisData.fillerWords}
                  segments={analysisData.segments}
                  selectedSegment={selectedSegment}
                />
              )}
            </TabsContent>

            <TabsContent value="coach">
              {analysisData && (
                <AICoach
                  transcript={analysisData.transcript}
                  fillerCount={analysisData.fillerWords.length}
                  averageWPM={analysisData.averageWPM}
                  clarityScore={analysisData.clarityScore}
                  fillerWords={Object.entries(
                    analysisData.fillerWords.reduce((acc, fw) => {
                      acc[fw.word] = (acc[fw.word] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .map(([word, count]) => ({ word, count }))
                    .sort((a, b) => b.count - a.count)}
                />
              )}
            </TabsContent>

            <TabsContent value="practice">
              <PracticeMode />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-slate-500 text-sm">
              <p>Project Prism - AI-Powered Presentation Coaching</p>
              <p className="mt-2">Built for hackathon demo • Powered by Web Speech API & Groq AI</p>
            </div>
          </div>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}
