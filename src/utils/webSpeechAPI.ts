// OpenAI Whisper API utilities for transcription

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  duration: number;
  words: WordTiming[];
}

export async function transcribeAudioFile(file: File, apiKey?: string): Promise<TranscriptionResult> {
  // Get audio duration first
  const duration = await getAudioDuration(file);

  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    console.log('No OpenAI API key provided, using mock transcription');
    return getMockTranscription(duration);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract word timings
    const words: WordTiming[] = data.words?.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end
    })) || [];

    return {
      transcript: data.text,
      confidence: 0.95,
      duration: duration,
      words
    };
  } catch (error) {
    console.error('Error transcribing with Whisper:', error);
    return getMockTranscription(duration);
  }
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => {
      reject(new Error('Failed to load audio file'));
    };
  });
}

function getMockTranscription(duration: number): TranscriptionResult {
  const transcript = `Good morning everyone. Um, I'm excited to, like, present our quarterly results today. So, basically, we've seen significant growth in all areas. You know, our revenue increased by 25% which is, uh, really impressive. Actually, the team has worked incredibly hard to achieve these results. So let me walk you through the details. First, um, our customer acquisition rate has, like, doubled. Basically, we implemented a new marketing strategy that's been very effective. You know, we focused on social media engagement and, uh, it's really paying off. The data shows that, so, our conversion rate improved by 15%. Actually, this is the highest we've ever seen. Um, looking at our product development, we launched three new features this quarter. Like, each one was designed based on customer feedback. You know, we really listened to what users wanted. So, basically, the adoption rate for these features has been amazing. Uh, about 60% of our users are already using at least one new feature. Actually, that's well above our initial projections. Um, in terms of future plans, we're going to, like, continue this momentum. You know, we have some exciting projects in the pipeline. So, basically, we're planning to expand into two new markets next quarter. Uh, the research looks very promising. Actually, I think this could be a game changer for us. Um, to wrap up, I want to thank everyone for their hard work. Like, this success is really a team effort. You know, we couldn't have done it without everyone's dedication. So, let's keep pushing forward and, uh, make next quarter even better. Thank you.`;
  
  // Generate word timings
  const words = transcript.split(/\s+/);
  const avgWordDuration = duration / words.length;
  const wordTimings: WordTiming[] = words.map((word, i) => ({
    word: word,
    start: i * avgWordDuration,
    end: (i + 1) * avgWordDuration
  }));

  return {
    transcript,
    confidence: 0.92,
    duration,
    words: wordTimings
  };
}

export function startLiveRecording(
  onTranscript: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void
): { stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      onTranscript(transcript, event.results[i].isFinal);
    }
  };

  recognition.onerror = (event: any) => {
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.start();

  return {
    stop: () => recognition.stop()
  };
}
