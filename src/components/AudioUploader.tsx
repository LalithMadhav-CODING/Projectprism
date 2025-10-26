import { useState, useRef } from 'react';
import { Upload, FileAudio, Loader2, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AudioUploaderProps {
  onAnalyze: (file: File, apiKey?: string) => void;
  isAnalyzing: boolean;
}

export function AudioUploader({ onAnalyze, isAnalyzing }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.match(/audio\/(mp3|wav|mpeg|m4a|x-m4a)/)) {
      alert('Please upload a valid audio file (mp3, wav, or m4a)');
      return;
    }

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);

    setFile(selectedFile);
    await generateWaveform(selectedFile);
    
    // Load API key from localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  const togglePlayAudio = () => {
    if (!file) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(URL.createObjectURL(file));
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    // Save API key if provided
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
    
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    onAnalyze(file, apiKey);
  };

  const generateWaveform = async (audioFile: File) => {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 100;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      const multiplier = Math.max(...filteredData) ** -1;
      const normalizedData = filteredData.map(n => n * multiplier);
      setWaveformData(normalizedData);
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Generate mock waveform on error
      const mockData = Array.from({ length: 100 }, () => Math.random());
      setWaveformData(mockData);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-slate-700 bg-slate-900/50'
        } backdrop-blur-sm`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-4 mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="mb-2 text-slate-100">
              {file ? file.name : 'Upload Your Presentation'}
            </h3>
            
            <p className="text-slate-400 text-sm mb-6">
              Drag and drop an audio file or click to browse
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-m4a"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <FileAudio className="w-4 h-4 mr-2" />
              Choose File
            </Button>

            <p className="text-xs text-slate-500 mt-4">
              Supported formats: MP3, WAV, M4A
            </p>
          </div>
        </div>
      </Card>

      {file && waveformData.length > 0 && (
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
                  <FileAudio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="h-24 flex items-center gap-1 px-2 rounded-lg bg-slate-800/50">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(value * 100, 4)}%`,
                    opacity: 0.7 + value * 0.3
                  }}
                />
              ))}
            </div>

            {/* API Key Input */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showApiKey ? '− Hide' : '+ Add'} OpenAI API Key (optional, for accurate transcription)
              </button>
              
              {showApiKey && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label htmlFor="apiKey" className="text-slate-300 mb-2 block text-sm">
                    OpenAI API Key
                  </Label>
                  <p className="text-xs text-slate-400 mb-3">
                    Add your OpenAI API key to use Whisper for accurate transcription with word-level timestamps.
                    Without a key, we'll use a demo transcript.
                  </p>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={togglePlayAudio}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Audio
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Preview Audio
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Presentation'
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
