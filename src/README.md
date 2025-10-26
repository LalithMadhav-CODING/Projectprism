# 🎤 Project Prism - AI Presentation Coach

> Transform your presentations with real-time AI-powered feedback and analysis

![Project Prism](https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=400&fit=crop)

## ✨ Features

### 📊 Analysis Dashboard
- **Filler Word Detection** - Identifies "um", "uh", "like", "you know" and 12+ other filler words
- **Speaking Pace Analysis** - Real-time WPM tracking with optimal range guidance (140-160 WPM)
- **Clarity Score** - Overall presentation quality metric
- **Interactive Timeline** - Click any point to see transcript context and pacing details

### 🎯 Timeline View
- Detailed segment-by-segment breakdown
- Color-coded pace indicators (too slow / optimal / too fast)
- Filler word timestamps with context
- Full transcript with highlighting

### 🤖 AI Coach
- Powered by Groq AI (Llama 3.1)
- Specific problem identification with data
- Actionable coaching tips
- Before/after examples from your actual transcript
- Priority-based recommendations

### 🎙️ Practice Mode
- Live recording with real-time feedback
- Instant filler word detection
- Speaking pace monitoring
- Visual metronome with sound (adjustable to target WPM)
- Live transcript display

## 🚀 Getting Started

### Quick Start (Demo Mode)
1. Open the app
2. Upload an audio file (mp3, wav, m4a)
3. Click "Analyze Presentation"
4. View your results across 4 tabs

### With API Keys (Full Features)

#### OpenAI Whisper (Recommended)
For accurate transcription with word-level timestamps:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Upload tab, click "+ Add OpenAI API Key"
3. Paste your key (starts with `sk-...`)

#### Groq AI (Optional)
For enhanced AI coaching:
1. Get free API key from [Groq Console](https://console.groq.com/keys)
2. Navigate to AI Coach tab
3. Click "API Key" button and add your key

See [API_SETUP.md](./API_SETUP.md) for detailed instructions.

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4 + Custom design system
- **Charts**: Recharts
- **UI Components**: Radix UI (shadcn/ui)
- **Transcription**: OpenAI Whisper API
- **AI Analysis**: Groq API (Llama 3.1)
- **Audio Processing**: Web Audio API
- **Speech Recognition**: Web Speech API

## 📋 How It Works

1. **Audio Upload** - Drop your presentation recording
2. **Transcription** - Whisper converts audio to text with timestamps
3. **Analysis** - Algorithms detect filler words, calculate WPM, analyze pacing
4. **AI Coaching** - Groq AI reviews transcript and provides personalized tips
5. **Practice** - Use live mode to improve in real-time

## 🎨 Design

- **Dark Theme** - Easy on the eyes for long sessions
- **Glassmorphism** - Modern card designs with backdrop blur
- **Purple/Indigo Gradients** - Professional SaaS aesthetic
- **Smooth Animations** - Polished micro-interactions
- **Responsive** - Works on desktop, tablet, and mobile

## 📊 Metrics Explained

### Filler Words
- **Low**: < 2% of total words (green)
- **Medium**: 2-5% of total words (yellow)
- **High**: > 5% of total words (red)

### Speaking Pace (WPM)
- **Too Slow**: < 130 WPM
- **Optimal**: 140-160 WPM
- **Too Fast**: > 170 WPM

### Clarity Score
Calculated from:
- Filler word rate (60% weight)
- Speaking pace deviation (40% weight)

## 🔒 Privacy & Security

- All processing happens in your browser
- API keys stored in localStorage (never sent anywhere except official APIs)
- Audio files are not uploaded to any servers (except for Whisper transcription)
- No analytics or tracking

## 🐛 Known Limitations

- Practice Mode requires Chrome, Edge, or Safari (Web Speech API)
- Whisper API has 25MB file size limit
- Free Groq API has rate limits
- Demo mode uses placeholder transcript without API key

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Export as PDF report
- [ ] Team collaboration features
- [ ] Historical tracking
- [ ] Custom filler word lists
- [ ] Presentation tips library

## 📝 License

Built for hackathon demonstration. See license file for details.

## 🙏 Acknowledgments

- OpenAI for Whisper API
- Groq for fast AI inference
- shadcn for beautiful UI components
- Unsplash for images

---

**Built with ❤️ for better presentations**
