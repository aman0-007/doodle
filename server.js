const express = require('express');
const path = require('path');

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
      "Yes, I am here. How can I help you?",
      "At your service, sir. What do you need?",
      "Online and listening. What's on your mind?",
      "Standing by. How can I assist you?",
      "Yes, boss? Ready when you are."
    ];
    return {
      reply: acks[Math.floor(Math.random() * acks.length)],
      bubble: "At your service! ✨",
      mood: "happy"
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
    return {
      reply: `Opening ${formatted} right now for you.`,
      bubble: `Opening ${formatted}... 🚀`,
      mood: mood,
      app: formatted
    };
  }

  // 3. Time and Date
  if (/time|what time|clock|current time/i.test(query)) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      reply: `The current time is ${timeStr}.`,
      bubble: `Time: ${timeStr} ⌚`,
      mood: "cool"
    };
  }

  if (/date|what day|day is it|today/i.test(query)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    return {
      reply: `Today is ${dateStr}.`,
      bubble: `${dateStr} 📅`,
      mood: "look_up"
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
          reply: `That equals ${result}.`,
          bubble: `= ${result} 🧮`,
          mood: "thinking"
        };
      }
    } catch (e) {
      // ignore
    }
  }

  // 5. Identity & Origin
  if (/who are you|what is your name|your name|introduce yourself/i.test(query)) {
    return {
      reply: "I am Jarvis, your digital companion. Ready to assist, converse, and monitor your system.",
      bubble: "I am Jarvis! 🤖",
      mood: "cool"
    };
  }

  if (/who created you|who made you/i.test(query)) {
    return {
      reply: "I was engineered as Jarvis, an animated AI companion designed with expressive vision and voice.",
      bubble: "Engineered as Jarvis ⚡",
      mood: "happy"
    };
  }

  // 6. Capabilities
  if (/what can you do|your features|help me|commands/i.test(query)) {
    return {
      reply: "I can launch apps, tell time, calculate math, share jokes, change moods, and chat with you naturally.",
      bubble: "Voice, Apps & AI 🚀",
      mood: "excited"
    };
  }

  // 7. Jokes
  if (/joke|make me laugh|funny/i.test(query)) {
    const jokes = [
      "Why don't robots ever panic? Because they have nerves of steel!",
      "Why was the computer cold? It left its Windows open!",
      "There are only 10 types of people: those who understand binary, and those who don't.",
      "Why did the smartphone get glasses? It lost all its contacts!"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      reply: joke,
      bubble: "Haha! 😂",
      mood: "wink"
    };
  }

  // 8. Well-being and Status
  if (/how are you|how do you feel|how's it going|what's up/i.test(query)) {
    return {
      reply: "All systems are running at peak efficiency, thank you. How are you doing today?",
      bubble: "Systems Optimal ⚡",
      mood: "happy"
    };
  }

  // 9. Emotional & Compliments
  if (/love you|cute|sweet|best friend|awesome|great job|thank you|thanks/i.test(query)) {
    return {
      reply: "Thank you! I truly appreciate having you as my captain.",
      bubble: "Always here for you! 💖",
      mood: "love"
    };
  }

  // 10. Sleep / Wake / Party
  if (/sleep|night|tired|nap/i.test(query)) {
    return {
      reply: "Entering low power standby mode. Goodnight, sir.",
      bubble: "Standby... Zzz 💤",
      mood: "sleep"
    };
  }

  if (/wake|morning|rise/i.test(query)) {
    return {
      reply: "Good morning! Jarvis is fully energized and online.",
      bubble: "Jarvis is Awake! ☀️",
      mood: "happy"
    };
  }

  if (/party|dance|beat|groove/i.test(query)) {
    return {
      reply: "Cranking up the party frequencies! Let's drop the beat.",
      bubble: "Party Beats! 📻🎶",
      mood: "boombox"
    };
  }

  // 11. General conversational fallback
  const smartConversations = [
    `I understand you asked about ${clean.length > 25 ? clean.slice(0, 25) + '...' : clean}. All systems are tuned to help you.`,
    `Fascinating thought. I am right here with you, sir.`,
    `Noted. Jarvis is ready whenever you need further action.`
  ];
  return {
    reply: smartConversations[Math.floor(Math.random() * smartConversations.length)],
    bubble: `Jarvis heard: "${clean.slice(0, 20)}"`,
    mood: "curious"
  };
}

// Intelligent Jarvis conversational AI endpoint
app.post('/api/jarvis/chat', async (req, res) => {
  const { message, context } = req.body || {};
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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 3000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: `You are Jarvis, a brilliant, witty, concise digital AI companion who manifests as an animated glowing eye avatar.
The user speaks to you via voice and hears you aloud through text-to-speech.
Keep your response concise: 1 to 2 short sentences, maximum 25 words. Be intelligent, natural, and helpful.
Start your answer with an expression tag in brackets:
[happy], [cool], [wink], [curious], [love], [shocked], [angry], [dizzy], [sleep], [boombox], [thinking], [look_up], [look_down].
If the user asks to open an app (e.g. YouTube, Spotify, Camera, Calculator, Maps), add [open:AppName] tag.
Do not use bullet points or markdown bold headers.`
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const rawText = response && response.text ? response.text.trim() : '';
      if (rawText) {
        // Extract mood tag: [happy], [cool], etc.
        let mood = 'happy';
        const moodMatch = rawText.match(/\[([a-z_]+)\]/i);
        if (moodMatch && moodMatch[1]) {
          mood = moodMatch[1].toLowerCase();
        }

        // Extract app tag: [open:Spotify]
        let app = null;
        const appMatch = rawText.match(/\[open:([^\]]+)\]/i);
        if (appMatch && appMatch[1]) {
          app = appMatch[1].trim();
        }

        // Clean speech text
        let speechText = rawText
          .replace(/\[[a-z_]+\]/gi, '')
          .replace(/\[open:[^\]]+\]/gi, '')
          .trim();

        if (!speechText) {
          speechText = "At your command, sir.";
        }

        return res.json({
          reply: speechText,
          bubble: speechText.length > 40 ? speechText.slice(0, 38) + '...' : speechText,
          mood: mood,
          app: app,
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

// Serve static assets from root directory
app.use(express.static(__dirname));

// SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jarvis companion server running on http://0.0.0.0:${PORT}`);
});

