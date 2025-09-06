// local-avatar-api.js
// A local alternative to D-ID streaming using open-source models

class LocalVideoAgent {
   constructor() {
    this.API_CONFIG = null;
    this.videoIsPlaying = false;

    this.idleVideo = document.getElementById('idle-video');
    this.talkVideo = document.getElementById('talk-video');

    this.init();
  }

  async init() {
    try {
      const response = await fetch('./api.json');
      this.API_CONFIG = await response.json();

      if (!this.API_CONFIG?.openai_key) throw new Error('Missing Google API key in api.json');

      this.talkVideo.setAttribute('playsinline', '');
      this.setupEventListeners();

      console.log('Local Video Agent initialized successfully');
    } catch (error) {
      this.showError(`Initialization failed: ${error.message}`);
    }
  }

  setupEventListeners() {
    document.getElementById('connect-button').addEventListener('click', () => this.handleConnect());
    document.getElementById('destroy-button').addEventListener('click', () => this.handleDestroy());
    document.getElementById('enter-button').addEventListener('click', () => this.handleTalk());
    document.getElementById('user-input-field').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTalk();
    });
  
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerText = 'Light Mode';
      } else {
        themeToggle.innerText = 'Dark Mode';
      }
    });
  }

  async handleConnect() {
    const connectButton = document.getElementById('connect-button');
    connectButton.classList.add('loading');
  
    try {
      // For local version, we just simulate a connection
      console.log('Connected to local avatar service');
      
      // Ensure the loading class is removed
      connectButton.classList.remove('loading');
      connectButton.classList.add('connected');
  
      this.updateUI(true);
      document.getElementById('user-input-field').focus();
    } catch (error) {
      this.showError(`Connection failed: ${error.message}`);
      connectButton.classList.remove('loading', 'connected');
    }
  }

    async handleTalk() {
    try {
      const userMessage = document.getElementById('user-input-field').value.trim();
      if (!userMessage) throw new Error('Please enter a message');
  
      // Add a loading animation to the input field
      document.getElementById('input-container').classList.add('loading');
  
      const { fetchGroqResponse } = await import('./openai.js');
      const aiResponse = await fetchGroqResponse(this.API_CONFIG.openai_key, userMessage);
  
      // For local version, we'll simulate the video response
      // In a real implementation, this would call your local avatar model
      await this.simulateAvatarResponse(aiResponse);
  
      // Remove the loading animation after we receive the response
      document.getElementById('input-container').classList.remove('loading');
  
      document.getElementById('user-input-field').value = '';
    } catch (error) {
      console.error('Talk Error:', error);
      alert(`Error: ${error.message}`);
  
      // Remove the loading animation in case of an error
      document.getElementById('input-container').classList.remove('loading');
    }
  }

  // Simulate avatar response using text-to-speech
  async simulateAvatarResponse(text) {
    try {
      // Display the text response in the UI
      console.log('AI Response:', text);
      
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find the Sulafat voice from NaturalReaders, otherwise use a female voice
        let voices = speechSynthesis.getVoices();
        
        // If voices are not yet loaded, try again after a short delay
        if (voices.length === 0) {
          setTimeout(() => {
            voices = speechSynthesis.getVoices();
            this.setVoiceAndSpeak(utterance, voices, text);
          }, 500);
          return;
        }
        
        this.setVoiceAndSpeak(utterance, voices, text);
      } else {
        // Fallback: show text in an alert
        alert(`AI says: ${text}`);
      }
    } catch (error) {
      console.error('Speech Error:', error);
      // Fallback: show text in an alert
      alert(`AI says: ${text}`);
    }
  }

  setVoiceAndSpeak(utterance, voices, text) {
    // First, try to find the Sulafat voice specifically
    const sulafatVoice = voices.find(voice => 
      voice.name.includes('Sulafat') || 
      voice.name.includes('NaturalReader') || 
      voice.name.includes('Natural Reader')
    );
    
    // If not found, look for other female voices
    const femaleVoices = voices.filter(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Woman') || 
      voice.name.includes('Girl') ||
      voice.name.includes('Victoria') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Moira') ||
      voice.name.includes('Tessa') ||
      voice.name.includes('Yuna') ||
      voice.name.includes('Microsoft Zira') ||
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft David') === false && voice.name.includes('Microsoft') && voice.name.includes('Female') ||
      voice.name.includes('Google') && voice.name.includes('Female') ||
      voice.name.includes('Alex') === false && voice.name.includes('en-US') && voice.gender === 'female'
    );
    
    // Use the Sulafat voice if available, otherwise use a female voice, fallback to default
    if (sulafatVoice) {
      utterance.voice = sulafatVoice;
      console.log('Using Sulafat voice from NaturalReaders');
    } else if (femaleVoices.length > 0) {
      utterance.voice = femaleVoices[0];
      console.log('Using alternative female voice: ', femaleVoices[0].name);
    } else {
      console.log('Using default voice');
    }
    
    // Use more natural voice settings from api.json or defaults
    // Add very subtle random variation for more natural sound
    utterance.rate = (this.API_CONFIG?.voice_settings?.rate || 0.9) + (Math.random() * 0.06 - 0.03);  // Slower, more natural speed with subtle variation
    utterance.pitch = (this.API_CONFIG?.voice_settings?.pitch || 1.1) + (Math.random() * 0.06 - 0.03); // Slightly lower pitch with subtle variation
    utterance.volume = (this.API_CONFIG?.voice_settings?.volume || 0.9) + (Math.random() * 0.06 - 0.03); // Slight random variation in volume with subtle variation
    
    // Add emotion-based modulation based on message content
    if (text.includes('?')) {
      utterance.pitch += 0.08; // Slightly higher pitch for questions
      utterance.rate -= 0.03; // Slightly slower for questions
    }
    
    if (text.includes('!')) {
      utterance.volume = Math.min(1.0, utterance.volume + 0.15); // Louder for exclamation but cap at 1.0
      utterance.pitch += 0.1; // Slightly higher pitch
    }
    
    // Ensure rate stays within reasonable bounds
    utterance.rate = Math.max(0.7, Math.min(1.3, utterance.rate));
    utterance.pitch = Math.max(0.8, Math.min(1.4, utterance.pitch));
    utterance.volume = Math.max(0.6, Math.min(1.0, utterance.volume));
    
    // Play the speech
    speechSynthesis.speak(utterance);
    
    // Show visual feedback
    this.showAvatarSpeaking(true);
    
    // When speech ends, show idle state
    utterance.onend = () => {
      this.showAvatarSpeaking(false);
    };
  }

  showAvatarSpeaking(isSpeaking) {
    if (isSpeaking) {
      // Show talking animation
      this.idleVideo.style.display = 'none';
      this.talkVideo.style.display = 'block';
      
      // Add a simple animation effect
      this.talkVideo.style.filter = 'brightness(1.2)';
      setTimeout(() => {
        this.talkVideo.style.filter = 'brightness(1.0)';
      }, 300);
    } else {
      // Return to idle state
      this.talkVideo.style.display = 'none';
      this.idleVideo.style.display = 'block';
    }
  }

  async handleDestroy() {
    const connectButton = document.getElementById('connect-button');

    try {
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Destroy error:', error);
    } finally {
      this.updateUI(false);
      connectButton.classList.remove('connected', 'loading');
    }
  }

  updateUI(connected) {
    const connectButton = document.getElementById('connect-button');
    const destroyButton = document.getElementById('destroy-button');
  
    destroyButton.disabled = !connected;
  
    if (connected) {
      connectButton.classList.add('connected');
      connectButton.innerText = 'Connected';
    } else {
      connectButton.classList.remove('connected', 'loading');
      connectButton.innerText = 'Connect';
    }
  }

  updateStatus(type, state) {
    const label = document.getElementById(`${type}-status-label`);
    if (!label) return;
    label.innerText = state;
    label.className = `${type}-${state}`;
  }

  showError(message) {
    alert(message);
    console.error(message);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we should use the local version
  const useLocalVersion = true; // This could be configured in api.json
  
  if (useLocalVersion) {
    new LocalVideoAgent();
  }
});