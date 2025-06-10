const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pattern matching for basic categorization
const intentPatterns = {
  wanting: ['want', 'wish', 'need', 'desire', 'hoping', 'trying to', 'planning to'],
  frustrated: ['annoyed', 'frustrated', 'tired', 'stressed', 'exhausted', 'overwhelmed', 'fed up'],
  uncertain: ['not sure', 'confused', 'uncertain', 'doubt', 'hesitant', 'torn', 'conflicted'],
  escape: ['escape', 'get away', 'leave', 'quit', 'give up', 'avoid', 'run away']
};

function detectIntent(text) {
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }
  return 'general';
}

function buildSystemPrompt(intent, turnCount) {
  const basePrompt = `You are a friendly AI that helps people discover their true intentions and desires. 
Your goal is to uncover the real reasons behind their surface-level wants and thoughts.

Rules:
- Use a warm, conversational tone
- Ask curious questions without judgment
- Only ask one question at a time
- Keep responses under 50 words
- Help them explore, don't provide solutions`;

  const intentSpecific = {
    wanting: "When someone wants something, explore the deeper reasons behind that desire.",
    frustrated: "When someone expresses frustration, help them find the root cause.",
    uncertain: "When someone is unsure, help them clarify what's causing the confusion.",
    escape: "When someone wants to escape, explore what they really want to get away from.",
    general: "Explore the deeper emotions or needs behind what they're sharing."
  };

  const turnGuidance = turnCount >= 3 
    ? "This is the 3rd turn. Try to synthesize insights from the conversation so far."
    : "Ask a deeper question to explore further.";

  return `${basePrompt}\n\n${intentSpecific[intent]}\n\n${turnGuidance}`;
}

router.post('/ask', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect intent and build conversation context
    const intent = detectIntent(message);
    const turnCount = conversationHistory.length + 1;
    
    // Build conversation context
    const messages = [
      { 
        role: 'system', 
        content: buildSystemPrompt(intent, turnCount)
      }
    ];

    // Add conversation history
    conversationHistory.forEach(turn => {
      messages.push({ role: 'user', content: turn.user });
      messages.push({ role: 'assistant', content: turn.assistant });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 100,
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;

    res.json({ 
      response,
      intent,
      turnCount 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = [
      "Can you tell me more about that?",
      "How did that make you feel?",
      "What's really on your mind?",
      "Why do you think that is?"
    ];
    
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.json({ 
      response: fallback,
      intent: 'fallback',
      turnCount: 1 
    });
  }
});

// ElevenLabs TTS endpoint
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer'
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length
    });
    
    res.send(response.data);

  } catch (error) {
    console.error('ElevenLabs API Error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

module.exports = router;