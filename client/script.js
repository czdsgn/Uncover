class UncoverApp {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.conversationHistory = [];
        
        this.voiceButton = document.getElementById('voiceButton');
        this.status = document.getElementById('status');
        this.transcript = document.getElementById('transcript');
        this.errorDiv = document.getElementById('error');
        
        this.init();
    }
    
    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.showInstructions();
    }
    
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.showError('This browser does not support speech recognition. Please use Chrome.');
            return false;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI('listening', 'Listening... share what\'s on your mind');
            this.hideError();
        };
        
        this.recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            this.addMessage('user', speechResult);
            this.sendToAI(speechResult);
        };
        
        this.recognition.onerror = (event) => {
            this.showError(`Speech recognition error: ${event.error}`);
            this.resetUI();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
        };
        
        return true;
    }
    
    setupEventListeners() {
        this.voiceButton.addEventListener('click', () => {
            if (!this.recognition) {
                if (!this.setupSpeechRecognition()) return;
            }
            
            if (this.isListening) {
                this.recognition.stop();
            } else {
                try {
                    // iOS Safari 대응: 터치 이벤트로 speechSynthesis 활성화
                    if (window.speechSynthesis) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                    }
                    this.recognition.start();
                } catch (error) {
                    this.showError(`Failed to start speech recognition: ${error.message}`);
                }
            }
        });
    }
    
    async sendToAI(message) {
        try {
            this.updateUI('loading', 'AI is thinking...');
            
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Add to conversation history
            this.conversationHistory.push({
                user: message,
                assistant: data.response
            });
            
            this.addMessage('assistant', data.response);
            
            // Add 1 second delay before speaking for thinking time
            setTimeout(() => {
                this.speakResponse(data.response);
            }, 1000);
            
        } catch (error) {
            console.error('AI API Error:', error);
            const fallback = "Network error occurred. Please try again.";
            this.addMessage('assistant', fallback);
            setTimeout(() => {
                this.speakResponse(fallback);
            }, 1000);
        }
    }
    
    async speakResponse(text) {
        this.updateUI('speaking', 'AI is responding...');
        
        try {
            // Try ElevenLabs first
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                audio.onended = () => {
                    this.resetUI();
                    URL.revokeObjectURL(audioUrl);
                };
                
                audio.onerror = () => {
                    console.warn('ElevenLabs audio failed, falling back to browser TTS');
                    this.fallbackTTS(text);
                };
                
                await audio.play();
            } else {
                throw new Error('ElevenLabs TTS failed');
            }
            
        } catch (error) {
            console.warn('ElevenLabs TTS unavailable, using browser TTS:', error);
            this.fallbackTTS(text);
        }
    }
    
    fallbackTTS(text) {
        if (!window.speechSynthesis) {
            this.resetUI();
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onend = () => {
            this.resetUI();
        };
        
        utterance.onerror = () => {
            this.resetUI();
        };
        
        speechSynthesis.speak(utterance);
    }
    
    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'message-label';
        labelDiv.textContent = sender === 'user' ? 'You:' : 'Uncover:';
        
        const contentDiv = document.createElement('div');
        contentDiv.textContent = text;
        
        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);
        
        // Remove conversation start message if it exists
        const conversationStart = this.transcript.querySelector('.conversation-start');
        if (conversationStart) {
            conversationStart.remove();
        }
        
        this.transcript.appendChild(messageDiv);
        this.transcript.scrollTop = this.transcript.scrollHeight;
    }
    
    updateUI(state, statusText) {
        this.voiceButton.className = `voice-button ${state}`;
        this.status.textContent = statusText;
        
        const icons = {
            default: '🎤',
            listening: '🔴',
            speaking: '🔊',
            loading: '🤔'
        };
        
        this.voiceButton.querySelector('.icon').textContent = icons[state] || icons.default;
    }
    
    resetUI() {
        this.updateUI('default', 'Tap the button to continue sharing');
        this.isListening = false;
    }
    
    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.add('show');
    }
    
    hideError() {
        this.errorDiv.classList.remove('show');
    }
    
    showInstructions() {
        if (this.conversationHistory.length === 0) {
            this.status.textContent = 'Please allow microphone access in Chrome browser';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uncoverApp = new UncoverApp();
});

// Handle page visibility for better mobile experience
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.uncoverApp) {
        // Resume speech synthesis if needed
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        }
    }
});