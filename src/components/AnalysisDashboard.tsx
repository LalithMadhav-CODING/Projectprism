import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MessageSquare, Gauge, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FillerWord } from '../utils/fillerWords';
import { TranscriptSegment } from '../utils/speechAnalysis';

interface AnalysisDashboardProps {
  fillerWords: FillerWord[];
  segments: TranscriptSegment[];
  averageWPM: number;
  clarityScore: number;
  totalWords: number;
  onTimelineClick: (segment: TranscriptSegment) => void;
}

export function AnalysisDashboard({
  fillerWords,
  segments,
  averageWPM,
  clarityScore,
  totalWords,
  onTimelineClick
}: AnalysisDashboardProps) {
  const fillerRate = ((fillerWords.length / totalWords) * 100).toFixed(1);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getPaceIcon = () => {
    if (averageWPM < 130) return <TrendingDown className="w-4 h-4" />;
    if (averageWPM > 170) return <TrendingUp className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getPaceStatus = () => {
    if (averageWPM < 130) return 'Too Slow';
    if (averageWPM > 170) return 'Too Fast';
    return 'Optimal';
  };

  const chartData = segments.map((segment, index) => ({
    name: `${Math.floor(segment.timestamp / 60)}:${String(Math.floor(segment.timestamp % 60)).padStart(2, '0')}`,
    wpm: Math.round(segment.wpm),
    timestamp: segment.timestamp,
    segment
  }));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filler Words Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3">
                <MessageSquare className="w-6 h-6 text-red-400" />
              </div>
              <Badge variant={fillerWords.length > 15 ? 'destructive' : fillerWords.length > 8 ? 'secondary' : 'default'}>
                {fillerWords.length > 15 ? 'High' : fillerWords.length > 8 ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl text-slate-100">{fillerWords.length}</p>
              <p className="text-sm text-slate-400">Filler Words</p>
              <p className="text-xs text-slate-500">{fillerRate}% of total words</p>
            </div>
          </div>
        </Card>

        {/* Speaking Pace Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
                <Gauge className="w-6 h-6 text-blue-400" />
              </div>
              <Badge variant={averageWPM >= 130 && averageWPM <= 170 ? 'default' : 'secondary'}>
                {getPaceStatus()}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-2xl text-slate-100">{Math.round(averageWPM)}</p>
                {getPaceIcon()}
              </div>
              <p className="text-sm text-slate-400">Words Per Minute</p>
              <p className="text-xs text-slate-500">Target: 140-160 WPM</p>
            </div>
          </div>
        </Card>

        {/* Clarity Score Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <Badge variant={getScoreBadgeVariant(clarityScore)}>
                {clarityScore >= 80 ? 'Excellent' : clarityScore >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl ${getScoreColor(clarityScore)}`}>
                {clarityScore}%
              </p>
              <p className="text-sm text-slate-400">Clarity Score</p>
              <p className="text-xs text-slate-500">Overall performance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Timeline Chart */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-slate-100 mb-1">Speaking Pace Over Time</h3>
            <p className="text-sm text-slate-400">
              Click on any point to see the transcript context
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Words Per Minute', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}
                  formatter={(value: any) => [`${value} WPM`, 'Pace']}
                />
                <ReferenceLine 
                  y={130} 
                  stroke="#3b82f6" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Min', position: 'right', fill: '#3b82f6', fontSize: 12 }}
                />
                <ReferenceLine 
                  y={170} 
                  stroke="#3b82f6" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Max', position: 'right', fill: '#3b82f6', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="url(#colorGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4, cursor: 'pointer' }}
                  activeDot={{ 
                    r: 6, 
                    onClick: (_, payload) => onTimelineClick(payload.payload.segment),
                    cursor: 'pointer'
                  }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Filler Words Breakdown */}
      {fillerWords.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-slate-100 mb-4">Filler Words Detected</h3>
            <div className="space-y-2">
              {Object.entries(
                fillerWords.reduce((acc, fw) => {
                  acc[fw.word] = (acc[fw.word] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([word, count]) => (
                  <div key={word} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="min-w-[80px] justify-center">
                        "{word}"
                      </Badge>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / fillerWords.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-slate-400 ml-4 min-w-[40px] text-right">
                      {count}×
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
