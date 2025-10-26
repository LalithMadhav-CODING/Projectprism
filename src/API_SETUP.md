# Project Prism - API Setup Guide

## Overview
Project Prism uses two APIs for enhanced functionality:
1. **OpenAI Whisper API** - For accurate audio transcription with word-level timestamps
2. **Groq API** - For AI-powered coaching feedback

Both APIs are optional. Without them, the app will use demo data for presentation.

## OpenAI API Setup (for Whisper)

### 1. Get Your API Key
- Go to https://platform.openai.com/api-keys
- Sign in or create an account
- Click "Create new secret key"
- Copy the key (starts with `sk-...`)

### 2. Add to Project Prism
- In the Upload tab, click "+ Add OpenAI API Key"
- Paste your API key
- The key is stored locally in your browser

### 3. Usage
Whisper API provides:
- Accurate transcription of your audio
- Word-level timestamps for precise WPM analysis
- Better detection of pauses and pacing issues

**Cost**: ~$0.006 per minute of audio

## Groq API Setup (for AI Coaching)

### 1. Get Your API Key
- Go to https://console.groq.com/keys
- Sign in or create an account (free tier available)
- Click "Create API Key"
- Copy the key (starts with `gsk_...`)

### 2. Add to Project Prism
- Navigate to the "AI Coach" tab
- Click the "API Key" button
- Paste your Groq API key
- The key is stored locally in your browser

### 3. Usage
Groq API provides:
- Detailed analysis of your presentation
- Specific problem identification
- Actionable coaching tips with examples
- Before/after examples from your transcript

**Cost**: Free tier available with rate limits

## Demo Mode (No API Keys)

Without API keys, Project Prism will:
- Use a mock transcript for demonstration
- Provide basic coaching tips based on general patterns
- Still calculate WPM, filler words, and clarity scores
- Show all features and UI components

## Privacy & Security

- API keys are stored only in your browser's localStorage
- No data is sent to any server except the official OpenAI/Groq APIs
- Audio files are processed client-side before transcription
- No presentation data is stored on external servers

## Troubleshooting

### Whisper API Issues
- **Error 401**: Check your API key is correct
- **Error 429**: You've hit rate limits, wait a few minutes
- **Large file fails**: Whisper supports files up to 25MB

### Groq API Issues
- **Rate limit errors**: Free tier has limits, wait or upgrade
- **Timeout**: Try with a shorter transcript
- **Parse error**: The API response may be malformed, will fall back to demo tips

### Browser Compatibility
- **Practice Mode**: Requires Chrome, Edge, or Safari for Web Speech API
- **Audio upload**: Works in all modern browsers
- **Metronome**: Uses Web Audio API (all modern browsers)

## Support

For issues or questions:
- Check browser console for detailed error messages
- Ensure microphone permissions are granted (Practice Mode)
- Verify API keys are valid and have sufficient credits
