import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { FillerWord } from '../utils/fillerWords';
import { TranscriptSegment } from '../utils/speechAnalysis';
import { Clock, MessageSquare, AlertCircle } from 'lucide-react';

interface TimelineViewProps {
  transcript: string;
  fillerWords: FillerWord[];
  segments: TranscriptSegment[];
  selectedSegment: TranscriptSegment | null;
}

export function TimelineView({ transcript, fillerWords, segments, selectedSegment }: TimelineViewProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getSegmentSeverity = (wpm: number): 'optimal' | 'warning' | 'critical' => {
    if (wpm >= 130 && wpm <= 170) return 'optimal';
    if ((wpm >= 110 && wpm < 130) || (wpm > 170 && wpm <= 190)) return 'warning';
    return 'critical';
  };

  const getSeverityColor = (severity: 'optimal' | 'warning' | 'critical'): string => {
    switch (severity) {
      case 'optimal':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'critical':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  const getSeverityBadge = (severity: 'optimal' | 'warning' | 'critical'): string => {
    switch (severity) {
      case 'optimal':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Full Transcript */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-slate-100">Full Transcript</h3>
          </div>
          <ScrollArea className="h-64 pr-4">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          </ScrollArea>
        </div>
      </Card>

      {/* Selected Segment Context */}
      {selectedSegment && (
        <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-slate-100">Selected Segment</h3>
              <Badge variant="outline" className="ml-auto">
                {formatTime(selectedSegment.timestamp)}
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                {selectedSegment.text}
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                    {Math.round(selectedSegment.wpm)} WPM
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    {selectedSegment.wordCount} words
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Segments */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-slate-100">Timeline Breakdown</h3>
          </div>

          <ScrollArea className="h-96 pr-4">
            <div className="space-y-4">
              {segments.map((segment, index) => {
                const severity = getSegmentSeverity(segment.wpm);
                const fillersInSegment = fillerWords.filter(
                  fw => fw.timestamp >= segment.timestamp && fw.timestamp < segment.timestamp + segment.duration
                );

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      getSeverityColor(severity)
                    } ${
                      selectedSegment?.timestamp === segment.timestamp
                        ? 'ring-2 ring-purple-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {formatTime(segment.timestamp)}
                        </Badge>
                        <Badge className={getSeverityBadge(severity)}>
                          {Math.round(segment.wpm)} WPM
                        </Badge>
                      </div>
                      {fillersInSegment.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {fillersInSegment.length} filler{fillersInSegment.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed mb-2">
                      {segment.text}
                    </p>

                    {fillersInSegment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-700">
                        {fillersInSegment.map((fw, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-red-500/10 text-red-400 border-red-500/30"
                          >
                            "{fw.word}"
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
