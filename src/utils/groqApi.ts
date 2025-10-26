// Groq API integration for AI coaching feedback

export interface CoachingTip {
  category: string;
  issue: string;
  suggestion: string;
  example: {
    before: string;
    after: string;
  };
  priority: 'high' | 'medium' | 'low';
}

export async function getAICoaching(
  transcript: string,
  fillerCount: number,
  averageWPM: number,
  clarityScore: number,
  fillerWords: Array<{ word: string; count: number }>,
  apiKey: string
): Promise<CoachingTip[]> {
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    // Return mock data if no API key is provided
    return getMockCoachingTips(fillerCount, averageWPM, clarityScore, fillerWords);
  }

  try {
    const topFillers = fillerWords.slice(0, 5).map(f => `"${f.word}" (${f.count}x)`).join(', ');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional presentation coach with expertise in public speaking, communication, and delivery. Analyze presentations and provide specific, actionable coaching tips. You must respond with ONLY a valid JSON array, no other text.'
          },
          {
            role: 'user',
            content: `Analyze this presentation and provide detailed coaching feedback.

PRESENTATION ANALYSIS:
- Total filler words: ${fillerCount}
- Most common fillers: ${topFillers}
- Speaking pace: ${Math.round(averageWPM)} WPM (optimal is 140-160 WPM)
- Clarity score: ${clarityScore}% (based on filler rate and pacing)

TRANSCRIPT:
${transcript.substring(0, 2000)}${transcript.length > 2000 ? '...' : ''}

Based on this analysis, identify the TOP 4-5 SPECIFIC PROBLEMS and provide actionable solutions. For each problem:
1. Identify the exact issue from the data
2. Explain why it matters
3. Provide a clear, actionable suggestion
4. Give a before/after example using actual phrases from the transcript where possible

Respond with ONLY a JSON array in this exact format:
[
  {
    "category": "Filler Words" or "Pacing" or "Clarity" or "Structure",
    "issue": "Specific problem with numbers/data",
    "suggestion": "Detailed actionable solution",
    "example": {
      "before": "Actual problematic phrase from transcript",
      "after": "Improved version"
    },
    "priority": "high" or "medium" or "low"
  }
]`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content;
    
    // Clean up the response - remove any markdown code blocks
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    const tips = JSON.parse(content);
    return Array.isArray(tips) ? tips : [tips];
  } catch (error) {
    console.error('Error fetching AI coaching:', error);
    return getMockCoachingTips(fillerCount, averageWPM, clarityScore, fillerWords);
  }
}

function getMockCoachingTips(
  fillerCount: number, 
  averageWPM: number, 
  clarityScore: number,
  fillerWords: Array<{ word: string; count: number }>
): CoachingTip[] {
  const tips: CoachingTip[] = [];
  const fillerRate = fillerWords.reduce((sum, f) => sum + f.count, 0);

  if (fillerCount > 10) {
    const topFiller = fillerWords[0];
    tips.push({
      category: 'Filler Words',
      issue: `You used ${fillerCount} filler words (${((fillerCount / 250) * 100).toFixed(1)}% of your speech). Your most common filler is "${topFiller.word}" used ${topFiller.count} times.`,
      suggestion: 'Replace filler words with strategic pauses. Before speaking, take a breath. When you feel the urge to say "um" or "like", pause instead. This makes you appear more confident and gives your audience time to absorb your message.',
      example: {
        before: 'So, um, I think, like, we should basically move forward',
        after: 'I think [pause] we should move forward'
      },
      priority: 'high'
    });
  }

  if (averageWPM > 170) {
    tips.push({
      category: 'Pacing',
      issue: `Your speaking pace of ${Math.round(averageWPM)} WPM is ${Math.round(((averageWPM - 160) / 160) * 100)}% faster than optimal. This makes it hard for your audience to follow and absorb key points.`,
      suggestion: 'Consciously slow down to 140-160 WPM. Take 2-3 second pauses after important points. Use the "rule of three": state your point, pause, let it sink in, then continue.',
      example: {
        before: 'Quick rushed delivery without any breaks for the audience to process',
        after: 'Measured delivery [2-second pause] with intentional breaks [pause] for emphasis'
      },
      priority: 'high'
    });
  } else if (averageWPM < 130) {
    tips.push({
      category: 'Pacing',
      issue: `Your speaking pace of ${Math.round(averageWPM)} WPM is ${Math.round(((130 - averageWPM) / 130) * 100)}% slower than optimal. This can cause audience attention to drift.`,
      suggestion: 'Increase energy and pace to 140-160 WPM. Practice with a metronome or timer. Reduce unnecessary pauses between regular sentences.',
      example: {
        before: 'Very... slow... delivery... with... too... many... long... pauses',
        after: 'Confident delivery with natural pauses only at key moments'
      },
      priority: 'medium'
    });
  }

  if (clarityScore < 70) {
    tips.push({
      category: 'Clarity',
      issue: `Your clarity score is ${clarityScore}%, indicating room for improvement in confident delivery and word choice.`,
      suggestion: 'Use stronger, more decisive language. Replace tentative phrases ("I think", "maybe", "kind of") with confident statements. Practice the rule: if you\'re unsure, pause to think rather than hedging with weak words.',
      example: {
        before: 'I think maybe we could possibly consider this approach',
        after: 'We will implement this approach'
      },
      priority: 'medium'
    });
  }

  tips.push({
    category: 'Structure',
    issue: 'Strengthen your presentation structure with clear signposting',
    suggestion: 'Use transition phrases to guide your audience. Start with "First...", "Second...", "Finally...". Between sections say "Now let\'s turn to..." or "This brings us to...". This creates a roadmap for listeners.',
    example: {
      before: 'Let me talk about sales. Our revenue increased.',
      after: 'Now, let\'s turn to our sales performance. Our revenue increased by 25%.'
    },
    priority: 'low'
  });

  return tips.slice(0, 5); // Return max 5 tips
}
