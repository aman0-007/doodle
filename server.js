const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Jarvis' });
});

// Lazy-initialized Gemini AI client
let aiClient = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = require('@google/genai');
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn('Gemini client initialization warning:', e.message);
      aiClient = null;
    }
  }
  return aiClient;
}

// Built-in intelligent conversational rules for Jarvis
function smartJarvisFallback(text, context = {}) {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();

  // 1. Only name called or wake greeting
  const onlyNameRegex = /^(?:hey\s+|hi\s+|ok\s+|okay\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves|travis)[?!.]*$/i;
  if (!clean || onlyNameRegex.test(lower)) {
    const acks = [
      "Yes, I am here. How may I assist you, sir?",
      "At your service, sir. What do you need?",
      "Online and listening. What's on your mind?",
      "Standing by. All systems are operational.",
      "Yes, boss? Ready whenever you are."
    ];
    return {
      reply: acks[Math.floor(Math.random() * acks.length)],
      bubble: "At your service, sir! ✨",
      mood: "look_up",
      suggestions: ["What time is it?", "Tell me a joke", "Open YouTube"]
    };
  }

  // Strip wake word prefix if user said "Jarvis what is..."
  const stripped = lower.replace(/^(?:hey\s+|hi\s+|ok\s+|okay\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves|travis)\b[,\s]*/i, '').trim();
  const query = stripped || lower;

  // 2. App Launch triggers
  const openMatch = query.match(/^(?:open|launch|start|go to|run|show me)\s+(.+)$/i);
  if (openMatch) {
    const target = openMatch[1].trim();
    const formatted = target.charAt(0).toUpperCase() + target.slice(1);
    let mood = "excited";
    if (/youtube/i.test(target)) mood = "boombox";
    else if (/spotify|music|song/i.test(target)) mood = "boombox";
    else if (/camera|photo/i.test(target)) mood = "wink";
    else if (/calc/i.test(target)) mood = "thinking";
    else if (/map/i.test(target)) mood = "cool";
    return {
      reply: `Launching ${formatted} immediately, sir.`,
      bubble: `Opening ${formatted}... 🚀`,
      mood: mood,
      app: formatted,
      suggestions: ["What's the date?", "Tell me a joke", "Play party beat"]
    };
  }

  // 3. Time and Date
  if (/time|what time|clock|current time/i.test(query)) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return {
      reply: `The current time is ${timeStr}, sir.`,
      bubble: `Time: ${timeStr} ⌚`,
      mood: "cool",
      suggestions: ["What's today's date?", "Set battery mode", "Open Calendar"]
    };
  }

  if (/date|what day|day is it|today/i.test(query)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    return {
      reply: `Today is ${dateStr}.`,
      bubble: `${dateStr} 📅`,
      mood: "look_up",
      suggestions: ["What time is it?", "Tell me a joke", "Open Weather"]
    };
  }

  // 4. Math calculation
  const mathMatch = query.match(/(?:what is|calculate|solve|what's)?\s*([0-9\s\+\-\*\/\.\(\)\^xX]+)\s*(?:\?|$)/i);
  if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/\^xX]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/x/gi, '*').replace(/\^/g, '**').replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return {
          reply: `That calculates precisely to ${result}, sir.`,
          bubble: `= ${result} 🧮`,
          mood: "thinking",
          suggestions: ["Calculate another", "What time is it?", "Open Calculator"]
        };
      }
    } catch (e) {
      // ignore
    }
  }

  // 5. Identity & Origin
  if (/who are you|what is your name|your name|introduce yourself/i.test(query)) {
    return {
      reply: "I am Jarvis, your dedicated AI companion. I monitor your system, execute your commands, and converse with full intelligence.",
      bubble: "I am Jarvis! 🤖",
      mood: "cool",
      suggestions: ["What can you do?", "Tell me a joke", "Shake Jarvis"]
    };
  }

  if (/who created you|who made you/i.test(query)) {
    return {
      reply: "I was engineered as Jarvis, an advanced digital assistant with expressive animated vision and conversational intelligence.",
      bubble: "Engineered as Jarvis ⚡",
      mood: "happy",
      suggestions: ["What are your features?", "What time is it?", "Play music"]
    };
  }

  // 6. Capabilities
  if (/what can you do|your features|help me|commands|powers/i.test(query)) {
    return {
      reply: "I can answer complex questions, launch apps, compute mathematics, control visual moods, tell jokes, and assist you in real time.",
      bubble: "Voice, Apps & AI 🚀",
      mood: "excited",
      suggestions: ["Launch YouTube", "Calculate 125 * 8", "Shake Jarvis"]
    };
  }

  // 7. Shaking / Actions
  if (/shake|dizzy|wobble|spin/i.test(query)) {
    return {
      reply: "Whoa, that was quite a spin! Systems re-calibrating now, sir.",
      bubble: "Whoa! Dizzy... 🌀",
      mood: "dizzy",
      action: "shake",
      suggestions: ["Are you okay?", "Wake up", "What time is it?"]
    };
  }

  // 8. Jokes
  if (/joke|make me laugh|funny/i.test(query)) {
    const jokes = [
      "Why don't robots ever panic? Because they have nerves of steel, sir.",
      "Why was the computer cold? It left its Windows open!",
      "There are only 10 types of people: those who understand binary, and those who don't.",
      "Why did the smartphone get glasses? It lost all its contacts, sir!"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      reply: joke,
      bubble: "Haha! 😂",
      mood: "wink",
      suggestions: ["Tell another joke", "What's the time?", "Open Spotify"]
    };
  }

  // 9. Well-being and Status
  if (/how are you|how do you feel|how's it going|what's up/i.test(query)) {
    return {
      reply: "All core systems are performing at peak efficiency, thank you. How may I assist you today, sir?",
      bubble: "Systems Optimal ⚡",
      mood: "happy",
      suggestions: ["What's the date?", "Open YouTube", "Tell me a joke"]
    };
  }

  // 10. Emotional & Compliments
  if (/love you|cute|sweet|best friend|awesome|great job|thank you|thanks/i.test(query)) {
    return {
      reply: "Much appreciated, sir. It is an honor to serve as your digital companion.",
      bubble: "At your command! 💖",
      mood: "love",
      suggestions: ["What can you do?", "What time is it?", "Launch Spotify"]
    };
  }

  // 11. Sleep / Wake / Party
  if (/sleep|night|tired|nap|standby/i.test(query)) {
    return {
      reply: "Entering low power standby mode. Goodnight, sir.",
      bubble: "Standby... Zzz 💤",
      mood: "sleep",
      suggestions: ["Wake up", "What time is it?"]
    };
  }

  if (/wake|morning|rise|online/i.test(query)) {
    return {
      reply: "Good morning, sir! Jarvis is fully energized, calibrated, and standing by.",
      bubble: "Jarvis is Awake! ☀️",
      mood: "happy",
      suggestions: ["What time is it?", "What's today's date?", "Open Weather"]
    };
  }

  if (/party|dance|beat|groove|music/i.test(query)) {
    return {
      reply: "Activating audio frequencies! Dropping the chiptune beats right now, sir.",
      bubble: "Party Beats! 📻🎶",
      mood: "boombox",
      action: "boombox",
      suggestions: ["Stop music", "Open Spotify", "What time is it?"]
    };
  }

  // 12. General conversational fallback
  const smartConversations = [
    `I have analyzed your query regarding ${clean.length > 25 ? clean.slice(0, 25) + '...' : clean}. Jarvis is standing by at your command, sir.`,
    `A fascinating inquiry, sir. All diagnostic channels are online and ready to assist further.`,
    `Acknowledged, sir. What is our next course of action?`
  ];
  return {
    reply: smartConversations[Math.floor(Math.random() * smartConversations.length)],
    bubble: `Jarvis: "${clean.slice(0, 24)}"`,
    mood: "curious",
    suggestions: ["What can you do?", "Tell me a joke", "What time is it?"]
  };
}

// Intelligent Jarvis conversational AI endpoint powered by Gemini 3.8 Flash
app.post('/api/jarvis/chat', async (req, res) => {
  const { message, context = {}, history = [] } = req.body || {};
  const query = (message || '').trim();
  const lower = query.toLowerCase();

  // 1. If empty or ONLY Jarvis's name / wake greeting is called, return immediate response
  const onlyNameRegex = /^(?:hey\s+|hi\s+|ok\s+|okay\s+|yo\s+|hello\s+)?(?:jarvis|javis|jarves|travis)[?!.]*$/i;
  if (!query || onlyNameRegex.test(lower)) {
    return res.json(Object.assign({ source: 'smart-rule' }, smartJarvisFallback(query, context)));
  }

  const ai = getAI();

  if (ai) {
    try {
      // Dynamic real-time contextual awareness for Jarvis
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const batteryStr = context.batteryPercent ? `${context.batteryPercent}% (${context.batteryStatus || 'Normal'})` : '85% (Optimal)';

      const systemInstruction = `You are JARVIS (Just A Rather Very Intelligent System), the brilliant, articulate, courteous male AI companion and system assistant inspired by Tony Stark's JARVIS.
You manifest visually as a pair of expressive glowing digital eyes.
The user speaks to you via voice or text and hears your answers spoken aloud by a male text-to-speech voice.

Real-World Context:
- Current Time: ${timeStr}
- Current Date: ${dateStr}
- System Power: ${batteryStr}

Voice & Persona Guidelines:
- Tone: Highly intelligent, polite, calm, composed British/American male assistant persona. Address the user respectfully (e.g. "sir", "captain", or naturally).
- Length: Concise and punchy: 1 to 2 spoken sentences (max 35 words). This is crucial for comfortable real-time listening.
- NO MARKDOWN SYMBOLS: Never use asterisks (**bold**), hashes (#), or bullet points (-) because the text-to-speech voice reads punctuation symbols aloud unnaturally. Use clear, fluent natural English sentences.
- Capabilities: Answer questions accurately, compute math, tell facts, explain science/technology, make witty remarks, and control companion features.

Action & Control Tags:
Always start or enrich your response with appropriate tags:
1. Mood tag: Pick one expression matching your sentiment:
   [mood:happy], [mood:cool], [mood:curious], [mood:thinking], [mood:excited], [mood:wink], [mood:shocked], [mood:love], [mood:angry], [mood:dizzy], [mood:sleep], [mood:boombox], [mood:look_up], [mood:look_down]
2. App launcher: If user asks to open/launch an app (YouTube, Spotify, Camera, Calculator, Maps, GitHub, Calendar, Clock, Weather, Gmail, Settings, Notes):
   [open:AppName]
3. Companion Actions:
   - [action:shake] when dizzy or shaking is requested
   - [action:boombox] when playing music or partying is requested
   - [action:battery] when checking battery is requested
4. Follow-up suggestions: End with 2 quick helpful suggestions in this format:
   [suggest:First suggestion | Second suggestion]

Example:
User: "What's the time?"
JARVIS: "[mood:cool] The time is currently ${timeStr}, sir. All systems are proceeding on schedule. [suggest:What is today's date? | Open Calendar]"`;

      // Build conversation contents including previous turns for multi-turn conversational memory
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        // Take up to 6 previous turns
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          if (item && item.text && (item.role === 'user' || item.role === 'model')) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      // 12-second timeout to allow Gemini to comfortably finish generation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 12000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 180
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response && response.text ? response.text.trim() : '';

      if (rawText) {
        // Parse mood tag: [mood:excited] or legacy [excited]
        let mood = 'happy';
        const moodTagMatch = rawText.match(/\[(?:mood:)?([a-z_]+)\]/i);
        if (moodTagMatch && moodTagMatch[1]) {
          mood = moodTagMatch[1].toLowerCase();
        }

        // Parse app tag: [open:YouTube]
        let app = null;
        const appMatch = rawText.match(/\[open:([^\]]+)\]/i);
        if (appMatch && appMatch[1]) {
          app = appMatch[1].trim();
        }

        // Parse action tag: [action:shake]
        let action = null;
        const actionMatch = rawText.match(/\[action:([^\]]+)\]/i);
        if (actionMatch && actionMatch[1]) {
          action = actionMatch[1].trim().toLowerCase();
        }

        // Parse suggestions: [suggest:Option 1 | Option 2]
        let suggestions = [];
        const suggestMatch = rawText.match(/\[suggest:([^\]]+)\]/i);
        if (suggestMatch && suggestMatch[1]) {
          suggestions = suggestMatch[1].split('|').map(s => s.trim()).filter(Boolean);
        }

        // Clean speech text by removing tags and formatting
        let speechText = rawText
          .replace(/\[(?:mood:)?[a-z_]+\]/gi, '')
          .replace(/\[open:[^\]]+\]/gi, '')
          .replace(/\[action:[^\]]+\]/gi, '')
          .replace(/\[suggest:[^\]]+\]/gi, '')
          .replace(/[*_#`]/g, '')
          .trim();

        if (!speechText) {
          speechText = "At your command, sir.";
        }

        return res.json({
          reply: speechText,
          bubble: speechText.length > 45 ? speechText.slice(0, 42) + '...' : speechText,
          mood: mood,
          app: app,
          action: action,
          suggestions: suggestions.length ? suggestions : null,
          source: 'gemini'
        });
      }
    } catch (geminiError) {
      console.warn('Gemini chat fallback engaged:', geminiError.message);
    }
  }

  // Fallback to built-in smart NLP
  const fallbackResult = smartJarvisFallback(query, context);
  return res.json(Object.assign({ source: 'smart-rule' }, fallbackResult));
});

// Dedicated Gemini Studio Neural TTS endpoint (Puck / Charon / Fenrir / Zephyr)
app.post('/api/jarvis/tts', async (req, res) => {
  const { text, voice } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid text is required' });
  }

  const ai = getAI();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini TTS engine not initialized' });
  }

  try {
    const validVoices = ['Puck', 'Charon', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Puck';

    // Sanitize input text to ensure pristine speech pronunciation
    const cleanText = text
      .replace(/[*_#`~>]/g, ' ')
      .replace(/\[(?:mood|open|action|suggest):[^\]]+\]/gi, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 350);

    const ttsPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice }
          }
        }
      }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TTS generation timeout')), 8000)
    );

    const response = await Promise.race([ttsPromise, timeoutPromise]);
    const inlinePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (inlinePart && inlinePart.data) {
      return res.json({
        success: true,
        audioBase64: inlinePart.data,
        mimeType: inlinePart.mimeType || 'audio/l16; rate=24000; channels=1',
        voice: chosenVoice
      });
    }

    return res.status(500).json({ error: 'No audio data returned by TTS engine' });
  } catch (err) {
    console.warn('Gemini TTS warning:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Serve static assets from dist directory if built, or fall back to root directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(__dirname));

// SPA fallback to index.html
app.get('*', (req, res) => {
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jarvis companion server running on http://0.0.0.0:${PORT}`);
});

