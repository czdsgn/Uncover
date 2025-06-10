# Uncover

**Self-awareness as a Service**, a voice-powered AI companion that helps you discover your true intentions and motivations through natural conversation.

🔗 **Live Demo**: https://uncover-nine.vercel.app/

## 🎯 What is Uncover?

Instead of fulfilling your surface-level desires, Uncover asks deeper questions to help you understand *why* you want what you want. Through 3-4 conversational exchanges, it guides you from "what you think you want" to "what you actually need."

**Traditional AI**: "I want pizza" → "Here are nearby pizza places"  
**Uncover**: "I want pizza" → "Are you actually hungry, or is something else going on?"

## ✨ Features

- **Voice-First Interface**: Natural speech-to-speech conversation
- **AI-Powered Questioning**: Uses GPT-4 to generate thoughtful, exploratory questions
- **Natural Voice Synthesis**: ElevenLabs integration for human-like responses
- **Intent Recognition**: Categorizes your thoughts (wanting, frustration, uncertainty, escape)
- **Graceful Fallbacks**: Automatically switches to browser TTS if needed

## 🚀 Tech Stack

**Frontend**:
- Vanilla JavaScript
- Web Speech API (speech recognition)
- Responsive CSS

**Backend**:
- Node.js + Express
- OpenAI GPT-4 integration
- ElevenLabs TTS API
- RESTful API design

**Deployment**:
- Vercel (full-stack hosting)
- Automatic HTTPS

## 🎨 Design Philosophy

Uncover focuses on **Self-awareness as a Service** - helping humans understand themselves better rather than just executing tasks. The minimalist voice interface removes barriers to authentic expression and encourages genuine reflection.

## 🏗️ Project Structure

```
uncover/
├── client/                 # Frontend
│   ├── index.html         # Main interface
│   ├── script.js          # Voice interaction logic
│   └── style.css          # Modern styling
├── server/                # Backend
│   ├── app.js            # Express server
│   └── routes/
│       └── ask.js        # AI conversation endpoints
├── package.json          # Dependencies
├── vercel.json          # Deployment config
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+
- OpenAI API key
- ElevenLabs API key (optional, but recommended)
- ElevenLabs Voice ID (optional, but recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/czdsgn/Uncover.git
cd Uncover
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
```

4. **Run locally**
```bash
npm run dev
# Opens at http://localhost:3000
```

### Usage

1. **Allow microphone access** in your browser
2. **Tap the microphone button** and share what's on your mind
3. **Listen to AI's response** and continue the conversation
4. **Discover your deeper motivations** through conversation

## 🎭 Example Conversations

**User**: "I want to forget"  
**Uncover**: "Forgetting can feel comforting. What do you wish to escape from or leave behind for a little while?"

**User**: "I feel excited and proud that I finally build something that's working as I intended"  
**Uncover**: "That's wonderful to hear! What do you think this achievement means for you personally, beyond just the excitement of building something functional?"

**User**: "I need to start working out"  
**Uncover**: "What do you hope will change about how you feel once you start?"

## 🧠 AI Integration

- **Intent Classification**: Automatically detects emotional patterns (wanting, frustrated, uncertain, escape)
- **Dynamic Prompting**: Adapts conversation style based on user's psychological state
- **Turn Management**: Provides insights after 3-4 exchanges to synthesize discoveries
- **Fallback Responses**: Graceful handling when APIs are unavailable

## 🌐 Deployment

Deploy to Vercel with one command:

```bash
vercel --prod
```

Environment variables are managed through Vercel dashboard for production security.

## 🤝 Contributing

This project was built as a prototype to explore "Self-awareness as a Service." Contributions welcome for:

- Improved conversation flows
- Better intent recognition
- Mobile UX enhancements
- Additional voice options
- Conversation memory/history

## 🙏 Acknowledgments

- OpenAI for GPT-4 conversation intelligence
- ElevenLabs for natural voice synthesis
- Vercel for seamless deployment
- Inspired by the need for more reflective, human-centered AI interactions

---

**Built with ❤️ by [Klue Cho](https://github.com/czdsgn)**

*"The unexamined life is not worth living" - Socrates*
