import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Settings } from 'lucide-react';
import { CoachingTip, getAICoaching } from '../utils/groqApi';

interface AICoachProps {
  transcript: string;
  fillerCount: number;
  averageWPM: number;
  clarityScore: number;
  fillerWords: Array<{ word: string; count: number }>;
}

export function AICoach({ transcript, fillerCount, averageWPM, clarityScore, fillerWords }: AICoachProps) {
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Auto-load coaching tips
    loadCoachingTips(savedApiKey || '');
  }, [transcript, fillerCount, averageWPM, clarityScore]);

  const loadCoachingTips = async (key: string) => {
    setLoading(true);
    try {
      const coachingTips = await getAICoaching(
        transcript, 
        fillerCount, 
        averageWPM, 
        clarityScore,
        fillerWords,
        key
      );
      setTips(coachingTips);
    } catch (error) {
      console.error('Error loading coaching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('groq_api_key', apiKey);
    setShowApiKeyInput(false);
    loadCoachingTips(apiKey);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-green-500/30 bg-green-500/5';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Filler Words':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Pacing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Clarity':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'Structure':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-slate-100">AI Presentation Coach</h3>
                <p className="text-sm text-slate-400">
                  Personalized feedback powered by Groq AI
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              API Key
            </Button>
          </div>

          {showApiKeyInput && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Label htmlFor="apiKey" className="text-slate-300 mb-2 block">
                Groq API Key (optional)
              </Label>
              <p className="text-xs text-slate-400 mb-3">
                Add your Groq API key for enhanced AI analysis. Without a key, we'll provide basic coaching tips.
              </p>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="bg-slate-900 border-slate-600 text-slate-100"
                />
                <Button
                  onClick={handleSaveApiKey}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 backdrop-blur-sm">
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-slate-300">Analyzing your presentation...</p>
            <p className="text-sm text-slate-500">This may take a few moments</p>
          </div>
        </Card>
      )}

      {/* Coaching Tips */}
      {!loading && tips.length > 0 && (
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <Card
              key={index}
              className={`border transition-all duration-300 hover:shadow-xl ${getPriorityColor(
                tip.priority
              )} backdrop-blur-sm`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(tip.priority)}
                    <Badge className={getCategoryColor(tip.category)}>
                      {tip.category}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      tip.priority === 'high'
                        ? 'text-red-400 border-red-500/50'
                        : tip.priority === 'medium'
                        ? 'text-yellow-400 border-yellow-500/50'
                        : 'text-green-400 border-green-500/50'
                    }
                  >
                    {tip.priority} priority
                  </Badge>
                </div>

                <h4 className="text-slate-100 mb-2">{tip.issue}</h4>
                <p className="text-slate-300 text-sm mb-4">{tip.suggestion}</p>

                {/* Before/After Example */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="text-xs text-red-400">Before</p>
                    </div>
                    <p className="text-sm text-slate-300 italic">"{tip.example.before}"</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs text-green-400">After</p>
                    </div>
                    <p className="text-sm text-slate-300">"{tip.example.after}"</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No API Key Notice */}
      {!loading && tips.length > 0 && (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') && (
        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 mt-1" />
              <div>
                <h4 className="text-slate-100 mb-2">Get Enhanced AI Analysis</h4>
                <p className="text-sm text-slate-300 mb-3">
                  You're seeing basic coaching tips. Add your Groq API key to unlock personalized,
                  context-aware feedback powered by advanced AI.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyInput(true)}
                  className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
                >
                  Add API Key
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
