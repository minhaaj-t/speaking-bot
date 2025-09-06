
      // Fully local implementation for AL RAWABI GROUP OF COMPANIES Receptionist
      class ReceptionistAgent {
        constructor() {
          this.aiName = "Rasha Al Rayyaan";
          this.userName = '';
          this.isConnected = false;
          this.isSpeaking = false;
          this.speechTimeout = null;
          this.isFullscreen = false;
          this.talkSegments = [];
          this.speechEvents = [];
          this.currentSpeechEventIndex = 0;
          this.recognition = null;
          this.isListening = false;
          this.continueListening = true; // Keep speech recognition active
          this.currentAppointmentType = null;
          this.currentDepartment = null;
          this.cameraStream = null;
          this.faceDetectionInterval = null;
          this.faceDetected = false;
          this.showingAppointmentOptions = false;
          this.showingDepartmentOptions = false;
          this.idleGuidanceTimer = null;

          this.idleVideo = document.getElementById('idle-video');
          this.talkVideo = document.getElementById('talk-video');
          this.cameraVideo = document.getElementById('camera-video');
          this.cameraContainer = document.getElementById('camera-container');
          this.faceRectangle = document.getElementById('face-rectangle');
          this.facePrompt = document.getElementById('face-prompt');

          // Set video durations
          this.idleVideoDuration = 10; // 10 seconds
          this.talkVideoDuration = 19; // 19 seconds

          this.init();
        }

        async init() {
          try {
            this.setupEventListeners();

            // Set up video event listeners
            this.setupVideoListeners();

            // Set up fullscreen event listeners
            this.setupFullscreenListeners();

            // Initialize talk segments for realistic lip-sync
            this.initializeTalkSegments();

            // Initialize speech recognition
            this.initSpeechRecognition();

            // Start eye detection (camera always on)
            this.startFaceDetection();

            // Provide initial voice guidance when the page loads
            setTimeout(() => {
              this.speakResponse("Welcome to AL RAWABI GROUP OF COMPANIES. Please say your name to begin, for example: 'My name is John'.");
            }, 1000);

            // Start idle guidance timer
            this.startIdleGuidance();

            console.log('Receptionist Agent initialized successfully');
          } catch (error) {
            this.showError(`Initialization failed: ${error.message}`);
          }
        }

        // Provide periodic guidance when the system is idle at name entry
        startIdleGuidance() {
          // Only provide guidance at name entry stage
          if (!this.userName) {
            this.idleGuidanceTimer = setTimeout(() => {
              if (!this.userName) {
                this.speakResponse("To begin, please say your name clearly. For example: 'My name is Sarah'.");
                this.startIdleGuidance(); // Restart the timer
              }
            }, 15000); // Repeat every 15 seconds
          }
        }

        // Clear idle guidance timer
        clearIdleGuidance() {
          if (this.idleGuidanceTimer) {
            clearTimeout(this.idleGuidanceTimer);
            this.idleGuidanceTimer = null;
          }
        }

        // Start face detection using camera (always on) with a simpler approach
        async startFaceDetection() {
          try {
            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'user', width: 640, height: 480 }, 
              audio: false 
            });
            
            // Set the camera stream as the source for the camera video element
            this.cameraVideo.srcObject = this.cameraStream;
            
            // Keep the camera container hidden but active
            this.cameraContainer.style.display = 'none';
            
            // Start continuous face detection using a simpler approach
            this.detectFacesSimple();
            
          } catch (error) {
            console.error('Camera access error:', error);
            // Hide camera container if camera access fails
            this.cameraContainer.style.display = 'none';
          }
        }

        // Simple face detection using movement detection
        async detectFacesSimple() {
          try {
            // Create a canvas to capture video frames
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const video = this.cameraVideo;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple face detection based on skin tone analysis
            let facePixels = 0;
            const totalPixels = data.length / 4;
            
            // Analyze pixels for skin tone (simplified)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Basic skin tone detection (very simplified)
              if (r > 95 && g > 40 && b > 20 && 
                  r > g && r > b && 
                  Math.abs(r - g) > 15) {
                facePixels++;
              }
            }
            
            // Calculate face coverage percentage
            const faceCoverage = facePixels / totalPixels;
            
            // If face coverage is above threshold and we haven't detected recently
            if (faceCoverage > 0.05 && !this.faceDetected) { // 5% threshold
              this.faceDetected = true;
              
              // Speak the kiosk assistance prompt
              this.speakResponse("Hello! I noticed you're looking at the screen. I'm Rasha Al Rayyaan, your receptionist assistant. To use this kiosk, please say 'I want to schedule an appointment' or ask me any questions about our services.");
              
              // Reset eye detection after 30 seconds to avoid repeated prompts
              setTimeout(() => {
                this.faceDetected = false;
              }, 30000);
            }
            
            // Continue detection loop
            setTimeout(() => this.detectFacesSimple(), 1000);
          } catch (error) {
            console.error('Face detection error:', error);
            // Continue detection loop even if there's an error
            setTimeout(() => this.detectFacesSimple(), 1000);
          }
        }

        // Enhanced speech recognition for voice-controlled appointments
        initSpeechRecognition() {
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true; // Keep listening
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
              this.isListening = true;
              document.getElementById('microphone-button').classList.add('listening');
              this.speechStatus.style.display = 'block';
              console.log('Speech recognition started');
            };

            this.recognition.onresult = (event) => {
              const transcript = event.results[event.results.length - 1][0].transcript;
              console.log('Speech recognized:', transcript);
              
              // Handle voice commands for appointment system
              this.handleVoiceCommand(transcript);
            };

            this.recognition.onerror = (event) => {
              console.error('Speech recognition error:', event.error);
              this.isListening = false;
              document.getElementById('microphone-button').classList.remove('listening');
              this.speechStatus.style.display = 'none';
              
              // Provide guidance based on the error
              switch(event.error) {
                case 'no-speech':
                  this.speakResponse("I didn't hear anything. Please try speaking again.");
                  break;
                case 'audio-capture':
                  this.speakResponse("I'm having trouble accessing your microphone. Please check your microphone settings and try again.");
                  break;
                case 'not-allowed':
                  this.speakResponse("Microphone access was denied. Please allow microphone access and try again.");
                  break;
                default:
                  this.speakResponse("I'm sorry, I encountered an error. Please try speaking again.");
              }
              
              // Restart recognition if needed
              if (this.continueListening) {
                setTimeout(() => {
                  this.toggleSpeechRecognition();
                }, 2000);
              }
            };

            this.recognition.onend = () => {
              this.isListening = false;
              document.getElementById('microphone-button').classList.remove('listening');
              this.speechStatus.style.display = 'none';
              console.log('Speech recognition ended');
              // Restart recognition if needed
              if (this.continueListening) {
                // Add a small delay before restarting to avoid rapid restarts
                setTimeout(() => {
                  if (this.continueListening) {
                    this.toggleSpeechRecognition();
                  }
                }, 1000);
              }
            };
          } else {
            console.log('Speech recognition not supported in this browser');
            // Hide microphone button if not supported
            document.getElementById('microphone-button').style.display = 'none';
          }
        }

        // Handle voice commands for appointment system
        async handleVoiceCommand(transcript) {
          const lowerTranscript = transcript.toLowerCase().trim();
          
          // If we're showing appointment options, handle selection by voice
          if (this.showingAppointmentOptions) {
            if (lowerTranscript.includes('meeting') || lowerTranscript.includes('first') || lowerTranscript.includes('1')) {
              this.selectAppointmentOption('Meeting');
              return;
            } else if (lowerTranscript.includes('appointment') || lowerTranscript.includes('second') || lowerTranscript.includes('2')) {
              this.selectAppointmentOption('Appointment');
              return;
            } else if (lowerTranscript.includes('visit') || lowerTranscript.includes('third') || lowerTranscript.includes('3')) {
              this.selectAppointmentOption('Casual Visit');
              return;
            } else if (lowerTranscript.includes('cancel') || lowerTranscript.includes('back')) {
              this.closePopup('appointment-popup');
              this.showingAppointmentOptions = false;
              this.speakResponse("Appointment scheduling cancelled. How else can I help you?");
              return;
            } else {
              // Provide guidance for valid options
              this.speakResponse("Please choose from the following options: 1. Schedule a Meeting, 2. Book an Appointment, 3. Casual Visit. You can say the number or name of your choice, or say cancel to go back.");
              return;
            }
          }
          
          // If we're showing department options, handle selection by voice
          if (this.showingDepartmentOptions) {
            if (lowerTranscript.includes('general') || lowerTranscript.includes('first') || lowerTranscript.includes('1')) {
              this.selectDepartmentOption('General');
              return;
            } else if (lowerTranscript.includes('hr') || lowerTranscript.includes('second') || lowerTranscript.includes('2')) {
              this.selectDepartmentOption('HR');
              return;
            } else if (lowerTranscript.includes('accounts') || lowerTranscript.includes('third') || lowerTranscript.includes('3')) {
              this.selectDepartmentOption('Accounts');
              return;
            } else if (lowerTranscript.includes('purchase') || lowerTranscript.includes('fourth') || lowerTranscript.includes('4')) {
              this.selectDepartmentOption('Purchase');
              return;
            } else if (lowerTranscript.includes('marketing') || lowerTranscript.includes('fifth') || lowerTranscript.includes('5')) {
              this.selectDepartmentOption('Marketing');
              return;
            } else if (lowerTranscript.includes('it') || lowerTranscript.includes('sixth') || lowerTranscript.includes('6')) {
              this.selectDepartmentOption('IT');
              return;
            } else if (lowerTranscript.includes('cancel') || lowerTranscript.includes('back')) {
              this.closePopup('department-popup');
              this.showingDepartmentOptions = false;
              this.speakResponse("Department selection cancelled. How else can I help you?");
              return;
            } else {
              // Provide guidance for valid options
              this.speakResponse("Please choose a department: 1. General, 2. HR, 3. Accounts, 4. Purchase, 5. Marketing, 6. IT. You can say the number or name of your choice, or say cancel to go back.");
              return;
            }
          }
          
          // Handle initial appointment request
          if (lowerTranscript.includes('schedule') || lowerTranscript.includes('appointment') || 
              lowerTranscript.includes('meeting') || lowerTranscript.includes('visit') ||
              lowerTranscript.includes('book')) {
            this.handleVoiceAppointmentRequest();
            return;
          }
          
          // Handle name input by voice
          if (!this.userName && (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am') || lowerTranscript.includes('this is'))) {
            const name = lowerTranscript.replace('my name is', '').replace('i am', '').replace('this is', '').trim();
            if (name) {
              this.userName = name.charAt(0).toUpperCase() + name.slice(1);
              document.getElementById('name-input-field').value = this.userName;
              this.handleNameEnter();
              return;
            }
          }
          
          // Handle exit command
          if (lowerTranscript.includes('exit') || lowerTranscript.includes('bye') || lowerTranscript.includes('goodbye') || lowerTranscript.includes('thank you')) {
            this.handleExitChat();
            return;
          }
          
          // If user is in chat mode, process as regular message
          if (this.userName && document.getElementById('input-container').style.display !== 'none') {
            document.getElementById('user-input-field').value = transcript;
            this.handleTalk();
            return;
          }
          
          // If we're at the name entry stage and no name has been provided yet
          if (!this.userName) {
            // Try to extract name from any speech
            const nameWords = lowerTranscript.split(' ');
            if (nameWords.length > 0) {
              // Assume the last word or words are the name
              const potentialName = nameWords[nameWords.length - 1];
              if (potentialName.length > 1) {
                this.userName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
                document.getElementById('name-input-field').value = this.userName;
                this.handleNameEnter();
                return;
              }
            }
            
            // If we can't determine the name, ask for clarification
            this.speakResponse("I didn't catch your name. Please say your name clearly, for example: 'My name is John'.");
            return;
          }
        }

        // Handle voice appointment request
        async handleVoiceAppointmentRequest() {
          // Speak guidance
          await this.speakResponse("I can help you schedule an appointment. Please choose from the following options: 1. Schedule a Meeting, 2. Book an Appointment, 3. Casual Visit. Please say the number or name of your choice.");
          
          // Show appointment options
          this.handleAppointmentScheduling();
          
          // Set flag to indicate we're waiting for voice selection
          this.showingAppointmentOptions = true;
        }

        // Select appointment option by voice
        selectAppointmentOption(option) {
          this.showingAppointmentOptions = false;
          this.showDepartmentSelection(option);
          this.showingDepartmentOptions = true;
          
          // Speak guidance for department selection
          this.speakResponse("Please choose a department: 1. General, 2. HR, 3. Accounts, 4. Purchase, 5. Marketing, 6. IT. Please say the number or name of your choice.");
        }

        // Select department option by voice
        selectDepartmentOption(department) {
          this.showingDepartmentOptions = false;
          this.currentDepartment = department;
          this.completeAppointment();
        }

        // Handle appointment scheduling with voice guidance
        async handleAppointmentScheduling() {
          // Create appointment options popup
          const existingPopup = document.getElementById('appointment-popup');
          if (existingPopup) existingPopup.remove();
          
          const appointmentPopup = document.createElement('div');
          appointmentPopup.id = 'appointment-popup';
          appointmentPopup.className = 'popup';
          appointmentPopup.innerHTML = `
            <div class="popup-content">
              <h3>Schedule an Appointment</h3>
              <p>Please select the type of appointment:</p>
              <button id="meeting-btn">1. Schedule a Meeting</button>
              <button id="appointment-btn">2. Book an Appointment</button>
              <button id="visit-btn">3. Casual Visit</button>
              <button id="cancel-apt-btn">Cancel</button>
            </div>
          `;
          
          document.body.appendChild(appointmentPopup);
          
          // Add event listeners (for fallback touch interaction)
          document.getElementById('meeting-btn').addEventListener('click', () => {
            this.showingAppointmentOptions = false;
            this.showDepartmentSelection('Meeting');
            this.showingDepartmentOptions = true;
          });
          document.getElementById('appointment-btn').addEventListener('click', () => {
            this.showingAppointmentOptions = false;
            this.showDepartmentSelection('Appointment');
            this.showingDepartmentOptions = true;
          });
          document.getElementById('visit-btn').addEventListener('click', () => {
            this.showingAppointmentOptions = false;
            this.showDepartmentSelection('Casual Visit');
            this.showingDepartmentOptions = true;
          });
          document.getElementById('cancel-apt-btn').addEventListener('click', () => {
            this.closePopup('appointment-popup');
            this.showingAppointmentOptions = false;
          });
        }

        // Show department selection with voice guidance
        async showDepartmentSelection(appointmentType) {
          // Store the appointment type
          this.currentAppointmentType = appointmentType;
          
          // Close previous popup
          this.closePopup('appointment-popup');
          
          // Create department selection popup
          const existingPopup = document.getElementById('department-popup');
          if (existingPopup) existingPopup.remove();
          
          const departmentPopup = document.createElement('div');
          departmentPopup.id = 'department-popup';
          departmentPopup.className = 'popup';
          departmentPopup.innerHTML = `
            <div class="popup-content">
              <h3>Select Department</h3>
              <p>Which department would you like to schedule with?</p>
              <button id="general-btn" data-dept="General">1. General</button>
              <button id="hr-btn" data-dept="HR">2. HR</button>
              <button id="accounts-btn" data-dept="Accounts">3. Accounts</button>
              <button id="purchase-btn" data-dept="Purchase">4. Purchase</button>
              <button id="marketing-btn" data-dept="Marketing">5. Marketing</button>
              <button id="it-btn" data-dept="IT">6. IT</button>
              <button id="cancel-dept-btn">Cancel</button>
            </div>
          `;
          
          document.body.appendChild(departmentPopup);
          
          // Add event listeners for department buttons (for fallback touch interaction)
          const deptButtons = departmentPopup.querySelectorAll('[data-dept]');
          deptButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              this.showingDepartmentOptions = false;
              this.currentDepartment = e.target.getAttribute('data-dept');
              this.completeAppointment();
            });
          });
          
          document.getElementById('cancel-dept-btn').addEventListener('click', () => {
            this.closePopup('department-popup');
            this.showingDepartmentOptions = false;
          });
        }

        // Complete the appointment process
        async completeAppointment() {
          // Close department popup
          this.closePopup('department-popup');
          
          // Generate appointment token
          const appointmentToken = this.generateAppointmentToken();
          
          // Show appointment confirmation
          const confirmationMessage = `Your ${this.currentAppointmentType} with the ${this.currentDepartment} department has been scheduled. Your appointment token is ${appointmentToken}. Please wait to be called. Is there anything else I can help you with?`;
          await this.speakResponse(confirmationMessage);
          
          // Show exit button after completion
          setTimeout(() => {
            this.exitContainer.style.display = 'block';
          }, 2000);
        }

        // Generate a random appointment token
        generateAppointmentToken() {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let token = '';
          for (let i = 0; i < 6; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return token;
        }

        // Close popup by ID
        closePopup(popupId) {
          const popup = document.getElementById(popupId);
          if (popup) {
            popup.remove();
          }
        }

        async init() {
          try {
            this.setupEventListeners();

            // Set up video event listeners
            this.setupVideoListeners();

            // Set up fullscreen event listeners
            this.setupFullscreenListeners();

            // Initialize talk segments for realistic lip-sync
            this.initializeTalkSegments();

            // Initialize speech recognition
            this.initSpeechRecognition();

            // Start eye detection (camera always on)
            this.startFaceDetection();

            console.log('Receptionist Agent initialized successfully');
          } catch (error) {
            this.showError(`Initialization failed: ${error.message}`);
          }
        }

        // Initialize talk segments for realistic lip-sync effect
        initializeTalkSegments() {
          // Define different segments of the talk video for realistic playback
          this.talkSegments = [
            { start: 0.0, duration: 2.0, type: "opening" },     // Opening greeting
            { start: 2.0, duration: 1.5, type: "short_a" },     // Short vowel sounds
            { start: 3.5, duration: 2.5, type: "consonant" },   // Consonant sounds
            { start: 6.0, duration: 3.0, type: "long_a" },      // Long vowel sounds
            { start: 9.0, duration: 2.0, type: "pause" },       // Pause/transition
            { start: 11.0, duration: 2.5, type: "emphasis" },   // Emphasis/gestures
            { start: 13.5, duration: 2.0, type: "short_e" },    // Short E sounds
            { start: 15.5, duration: 3.5, type: "closing" }     // Closing statement
          ];
        }

        setupVideoListeners() {
          // Loop the idle video
          this.idleVideo.addEventListener('ended', () => {
            this.idleVideo.currentTime = 0;
            this.idleVideo.play();
          });

          // Handle talk video segments
          this.talkVideo.addEventListener('timeupdate', () => {
            if (this.isSpeaking && this.currentSegment) {
              // Check if we've reached the end of the current segment
              if (this.talkVideo.currentTime >= this.currentSegment.start + this.currentSegment.duration) {
                // If we have more speech events, play the next appropriate segment
                if (this.currentSpeechEventIndex < this.speechEvents.length - 1) {
                  this.currentSpeechEventIndex++;
                  this.playAppropriateSegment(this.speechEvents[this.currentSpeechEventIndex]);
                } else {
                  // Otherwise, continue with random segments
                  this.playRandomTalkSegment();
                }
              }
            }
          });

          // Loop the talk video when speaking
          this.talkVideo.addEventListener('ended', () => {
            if (this.isSpeaking) {
              this.playRandomTalkSegment();
            }
          });
        }

        setupFullscreenListeners() {
          document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            document.getElementById('fullscreen-indicator').style.display = this.isFullscreen ? 'block' : 'none';
          });

          document.addEventListener('webkitfullscreenchange', () => {
            this.isFullscreen = !!document.webkitFullscreenElement;
            document.getElementById('fullscreen-indicator').style.display = this.isFullscreen ? 'block' : 'none';
          });

          document.addEventListener('mozfullscreenchange', () => {
            this.isFullscreen = !!document.mozFullScreenElement;
            document.getElementById('fullscreen-indicator').style.display = this.isFullscreen ? 'block' : 'none';
          });

          document.addEventListener('keydown', (e) => {
            // Ctrl+F for fullscreen
            if (e.ctrlKey && e.key === 'f') {
              e.preventDefault();
              this.toggleFullscreen();
            }
            
            // ESC to exit fullscreen
            if (e.key === 'Escape' && this.isFullscreen) {
              this.exitFullscreen();
            }
          });
        }

        toggleFullscreen() {
          if (!this.isFullscreen) {
            this.enterFullscreen();
          } else {
            this.exitFullscreen();
          }
        }

        async enterFullscreen() {
          const elem = document.documentElement;
          try {
            if (elem.requestFullscreen) {
              await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
              await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
              await elem.mozRequestFullScreen();
            }
            this.isFullscreen = true;
            document.getElementById('fullscreen-indicator').style.display = 'block';
          } catch (err) {
            console.log('Fullscreen error:', err);
          }
        }

        exitFullscreen() {
          try {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            }
            this.isFullscreen = false;
            document.getElementById('fullscreen-indicator').style.display = 'none';
          } catch (err) {
            console.log('Exit fullscreen error:', err);
          }
        }

        setupEventListeners() {
          // Name input
          document.getElementById('name-enter-button').addEventListener('click', () => this.handleNameEnter());
          document.getElementById('name-input-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleNameEnter();
          });

          // Chat input
          document.getElementById('enter-button').addEventListener('click', () => this.handleTalk());
          document.getElementById('user-input-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleTalk();
          });

          // Microphone button for speech-to-text
          document.getElementById('microphone-button').addEventListener('click', () => this.toggleSpeechRecognition());
          
          // Exit button
          document.getElementById('exit-button').addEventListener('click', () => this.handleExitChat());
          
          // Store reference to speech status element
          this.speechStatus = document.getElementById('speech-status');
          this.exitContainer = document.getElementById('exit-container');
        }

        // Toggle speech recognition
        toggleSpeechRecognition() {
          if (!this.recognition) {
            this.showError('Speech recognition is not supported in your browser');
            return;
          }

          if (this.isListening) {
            this.recognition.stop();
          } else {
            try {
              this.recognition.start();
            } catch (error) {
              console.error('Error starting speech recognition:', error);
              this.showError('Error starting speech recognition: ' + error.message);
            }
          }
        }

        handleNameEnter() {
          const nameInput = document.getElementById('name-input-field');
          this.userName = nameInput.value.trim();
          
          if (!this.userName) {
            this.speakResponse("Please enter your name or say your name using the microphone button.");
            return;
          }

          // Clear idle guidance timer
          this.clearIdleGuidance();

          // Hide name input and show chat interface
          document.getElementById('name-input-container').style.display = 'none';
          document.getElementById('input-container').style.display = 'block';
          
          // Hide camera container after name is entered
          this.cameraContainer.style.display = 'none';
          
          // Stop face detection
          this.stopFaceDetection();
          
          // Focus on chat input
          document.getElementById('user-input-field').focus();
          
          // Provide welcome message and guidance
          this.speakResponse(`Hello ${this.userName}! I am Rasha Al Rayyaan, your receptionist assistant. You can ask me questions about our services, schedule appointments, or say 'exit' when you're done. How can I help you today?`);
        }

        async handleTalk() {
          try {
            const userMessage = document.getElementById('user-input-field').value.trim();
            if (!userMessage) {
              alert('Please enter your question');
              return;
            }
        
            // Check if user wants to schedule an appointment
            if (this.isAppointmentRequest(userMessage)) {
              this.handleAppointmentQuery(userMessage);
              document.getElementById('input-container').classList.remove('loading');
              document.getElementById('user-input-field').value = '';
              return;
            }
            
            // Check if user is asking for the AI's name
            if (this.isNameRequest(userMessage)) {
              this.handleNameRequest();
              document.getElementById('input-container').classList.remove('loading');
              document.getElementById('user-input-field').value = '';
              return;
            }
        
            // Add a loading animation to the input field
            document.getElementById('input-container').classList.add('loading');
        
            // Add time-based context for varied responses
            const currentTime = new Date();
            const hours = currentTime.getHours();
            let timeContext = '';
            
            if (hours < 12) {
              timeContext = 'Good morning!';
            } else if (hours < 17) {
              timeContext = 'Good afternoon!';
            } else {
              timeContext = 'Good evening!';
            }
            
            // Add context about AL RAWABI GROUP OF COMPANIES
            const contextMessage = `You are a professional receptionist for AL RAWABI GROUP OF COMPANIES. ${timeContext} Please provide helpful information about:
            - Appointment scheduling
            - Office locations and room numbers
            - Company services
            - Directions within the building
            - Contact information
            
            User's name is ${this.userName}. User's question: ${userMessage}`;
            
            const aiResponse = await this.fetchGroqResponse(contextMessage);
            
            // Check if AI response contains appointment keywords
            if (this.isAppointmentResponse(aiResponse)) {
              // Provide additional guidance before showing appointment options
              const guidanceMessage = 'I can help you schedule an appointment. Let me guide you through the process.';
              await this.speakResponse(guidanceMessage);
              
              // Show appointment options after a brief pause
              setTimeout(() => {
                this.handleAppointmentScheduling();
              }, 1500);
            } else {
              // Use text-to-speech with receptionist voice (no text display)
              await this.speakResponse(aiResponse);
            }
        
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

        // Handle exit chat button
        async handleExitChat() {
          // Show thanks message
          await this.speakResponse("Thank you for using our services. Have a great day!");
          
          // Hide chat interface and exit button
          document.getElementById('input-container').style.display = 'none';
          this.exitContainer.style.display = 'none';
          
          // Clear user data
          this.clearAppointmentData();
          
          // Show name input container after a delay and provide guidance
          setTimeout(() => {
            document.getElementById('name-input-field').value = '';
            document.getElementById('name-input-container').style.display = 'block';
            document.getElementById('name-input-field').focus();
            
            // Provide guidance for next user
            setTimeout(() => {
              this.speakResponse("To begin, please say your name. For example: 'My name is Sarah'.");
            }, 1000);
          }, 3000);
        }

        // Clear appointment data after process completion
        clearAppointmentData() {
          // Reset appointment-related variables
          this.currentAppointmentType = null;
          this.currentDepartment = null;
          this.userName = '';
          
          // Clear any existing appointment popups
          const existingPopup = document.getElementById('appointment-popup');
          if (existingPopup) {
            existingPopup.remove();
          }
          
          const departmentPopup = document.getElementById('department-popup');
          if (departmentPopup) {
            departmentPopup.remove();
          }
          
          // Restart idle guidance for next user
          this.startIdleGuidance();
          
          console.log('Appointment data cleared');
        }

        // Check if user message is an appointment request
        isAppointmentRequest(message) {
          const keywords = ['schedule', 'appointment', 'meeting', 'visit', 'book', 'arrange', 'set up', 'plan'];
          const lowerMessage = message.toLowerCase();
          return keywords.some(keyword => lowerMessage.includes(keyword));
        }

        // Check if user is asking for the AI's name
        isNameRequest(message) {
          const lowerMessage = message.toLowerCase();
          return lowerMessage.includes('what is your name') || 
                 lowerMessage.includes('your name') || 
                 lowerMessage.includes('who are you');
        }

        // Handle name request
        async handleNameRequest() {
          const nameMessage = `Hello, my name is ${this.aiName}. I am the receptionist for AL RAWABI GROUP OF COMPANIES. How can I assist you today?`;
          await this.speakResponse(nameMessage);
        }

        // Check if AI response suggests scheduling an appointment
        isAppointmentResponse(response) {
          const keywords = ['schedule', 'appointment', 'meeting', 'visit', 'book', 'arrange', 'set up', 'plan'];
          const lowerResponse = response.toLowerCase();
          return keywords.some(keyword => lowerResponse.includes(keyword));
        }

        // Handle appointment-related queries with AI guidance
        async handleAppointmentQuery(message) {
          // Provide context-aware guidance
          let guidanceMessage = '';
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('how') || lowerMessage.includes('help')) {
            guidanceMessage = 'I can help you schedule meetings, book appointments, or arrange casual visits with our departments. Simply tell me what you need, and I will guide you through the process.';
          } else if (lowerMessage.includes('department')) {
            guidanceMessage = 'We have several departments available for appointments: General, HR, Accounts, Purchase, Marketing, and IT. Which department would you like to schedule with?';
          } else if (lowerMessage.includes('time') || lowerMessage.includes('when')) {
            guidanceMessage = 'Our business hours are from 9 AM to 5 PM, Monday through Friday. Appointments can be scheduled during these hours. Would you like to proceed with scheduling?';
          } else {
            guidanceMessage = 'I understand you are interested in scheduling an appointment. I can help you with that. Would you like to schedule a meeting, book an appointment, or arrange a casual visit?';
          }
          
          await this.speakResponse(guidanceMessage);
          
          // After providing guidance, show the appointment options
          setTimeout(() => {
            this.handleAppointmentScheduling();
          }, 1000);
        }

        async fetchGroqResponse(userMessage) {
          try {
            const response = await fetch('/api/groq', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: userMessage }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`API error: ${errorData.error || 'Unknown error'}`);
            }
            
            const data = await response.json();
            return data.reply;
          } catch (error) {
            console.error('Groq API Error:', error);
            // Fallback response when API is not working
            return "I am sorry, I am currently experiencing technical difficulties. As a receptionist for AL RAWABI GROUP OF COMPANIES, I can help you with appointment scheduling, office locations, company services, building directions, and contact information. Please try again in a few moments.";
          }
        }

        // Clean response text by removing markdown and special characters
        cleanResponseText(text) {
          // Remove markdown characters
          return text
            .replace(/\*\*/g, '')  // Remove bold markers
            .replace(/__/g, '')    // Remove underline markers
            .replace(/\*/g, '')    // Remove italic markers
            .replace(/_/g, '')     // Remove italic markers
            .replace(/#/g, '')     // Remove header markers
            .replace(/\`/g, '')     // Remove code markers
            .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
            .replace(/\n/g, ' ')   // Replace newlines with spaces
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .trim();               // Trim whitespace
        }

        // Create speech events based on text for lip-sync
        createSpeechEvents(text) {
          // Simple approach: create events based on word count and punctuation
          this.speechEvents = [];
          const words = text.split(/\s+/);
          const punctuation = text.match(/[.!?;,]/g) || [];
          
          // Create events for each word and punctuation
          let time = 0;
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const hasPunctuation = /[.!?;,]/.test(word);
            
            // Determine event type based on word characteristics
            let eventType = "consonant";
            if (word.length <= 3) {
              eventType = "short_a";
            } else if (word.length >= 8) {
              eventType = "long_a";
            } else if (hasPunctuation) {
              eventType = "pause";
            }
            
            this.speechEvents.push({
              type: eventType,
              word: word,
              time: time
            });
            
            // Increment time (roughly based on word length and speech rate)
            time += (word.length * 0.1) + 0.2;
          }
          
          this.currentSpeechEventIndex = 0;
        }

        // Play appropriate segment based on speech event
        playAppropriateSegment(event) {
          // Find a segment that matches the event type
          const matchingSegments = this.talkSegments.filter(segment => segment.type === event.type);
          
          if (matchingSegments.length > 0) {
            // Select a random matching segment
            const randomIndex = Math.floor(Math.random() * matchingSegments.length);
            this.currentSegment = matchingSegments[randomIndex];
          } else {
            // Fallback to random segment
            this.playRandomTalkSegment();
            return;
          }
          
          // Set the video to start at the segment's start time
          this.talkVideo.currentTime = this.currentSegment.start;
          
          // Play the video
          this.talkVideo.play().catch(e => console.log("Video play error:", e));
        }

        // Play a random talk segment for variety
        playRandomTalkSegment() {
          if (this.talkSegments.length === 0) return;
          
          // Select a random segment
          const randomIndex = Math.floor(Math.random() * this.talkSegments.length);
          this.currentSegment = this.talkSegments[randomIndex];
          
          // Set the video to start at the segment's start time
          this.talkVideo.currentTime = this.currentSegment.start;
          
          // Play the video
          this.talkVideo.play().catch(e => console.log("Video play error:", e));
        }

        showAvatarSpeaking(isSpeaking) {
          this.isSpeaking = isSpeaking;
          
          if (isSpeaking) {
            // Show talking animation with realistic segments
            this.idleVideo.style.display = 'none';
            this.talkVideo.style.display = 'block';
            
            // Reset speech event index
            this.currentSpeechEventIndex = 0;
            
            // If we have speech events, start with the first one
            if (this.speechEvents.length > 0) {
              this.playAppropriateSegment(this.speechEvents[0]);
            } else {
              // Otherwise, start with a random segment
              this.playRandomTalkSegment();
            }
          } else {
            // Return to idle state
            this.talkVideo.style.display = 'none';
            this.idleVideo.style.display = 'block';
            this.idleVideo.play().catch(e => console.log("Video play error:", e));
            
            // Clear current segment
            this.currentSegment = null;
            this.speechEvents = [];
            this.currentSpeechEventIndex = 0;
          }
        }

        async speakResponse(text) {
          try {
            // Clean the response text
            const cleanText = this.cleanResponseText(text);
            
            // Use Web Speech API for text-to-speech
            if ('speechSynthesis' in window) {
              return new Promise((resolve, reject) => {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                
                // Try to find the Sulafat voice from NaturalReaders, otherwise use a female voice
                let voices = speechSynthesis.getVoices();
                
                // If voices are not yet loaded, try again after a short delay
                if (voices.length === 0) {
                  setTimeout(() => {
                    voices = speechSynthesis.getVoices();
                    this.setVoiceAndSpeak(utterance, voices, resolve, reject, cleanText);
                  }, 500);
                  return;
                }
                
                this.setVoiceAndSpeak(utterance, voices, resolve, reject, cleanText);
              });
            } else {
              // Fallback: show text only
              this.showAvatarSpeaking(true);
              // Simulate speaking duration based on text length
              const duration = Math.min(cleanText.length * 50, this.talkVideoDuration * 1000); // Cap at video duration
              clearTimeout(this.speechTimeout);
              this.speechTimeout = setTimeout(() => {
                this.showAvatarSpeaking(false);
              }, duration);
            }
          } catch (error) {
            console.error('Speech Error:', error);
            this.showAvatarSpeaking(false);
          }
        }

        setVoiceAndSpeak(utterance, voices, resolve, reject, cleanText) {
          // First, try to find Google voices specifically
          const googleVoices = voices.filter(voice => 
            voice.name.includes('Google') && 
            (voice.name.includes('Female') || voice.name.includes('Woman') || voice.name.includes('Girl'))
          );
          
          // Then try to find the Sulafat voice from NaturalReaders
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
          
          // Use Google voice if available, otherwise Sulafat, otherwise other female voices, fallback to default
          if (googleVoices.length > 0) {
            utterance.voice = googleVoices[0];
            console.log('Using Google voice: ', googleVoices[0].name);
          } else if (sulafatVoice) {
            utterance.voice = sulafatVoice;
            console.log('Using Sulafat voice from NaturalReaders');
          } else if (femaleVoices.length > 0) {
            utterance.voice = femaleVoices[0];
            console.log('Using alternative female voice: ', femaleVoices[0].name);
          } else {
            console.log('Using default voice');
          }
          
          // Enhanced emotional analysis for more natural speech
          const emotionalParams = this.analyzeEmotion(cleanText);
          
          // Apply base voice settings from api.json or defaults
          utterance.rate = emotionalParams.rate;
          utterance.pitch = emotionalParams.pitch;
          utterance.volume = emotionalParams.volume;
          
          // Add very subtle random variation for more natural sound
          utterance.rate += (Math.random() * 0.06 - 0.03);  // Very subtle random variation in speed
          utterance.pitch += (Math.random() * 0.06 - 0.03); // Very subtle random variation in pitch
          utterance.volume += (Math.random() * 0.06 - 0.03); // Very subtle random variation in volume
          
          // Ensure values stay within reasonable bounds
          utterance.rate = Math.max(0.7, Math.min(1.3, utterance.rate));
          utterance.pitch = Math.max(0.8, Math.min(1.4, utterance.pitch));
          utterance.volume = Math.max(0.6, Math.min(1.0, utterance.volume));
          
          // Create speech events for lip-sync
          this.createSpeechEvents(cleanText);
          
          // Show visual feedback with realistic lip-sync
          this.showAvatarSpeaking(true);
          
          // When speech ends, show idle state
          utterance.onend = () => {
            this.showAvatarSpeaking(false);
            resolve();
          };
          
          utterance.onerror = (event) => {
            this.showAvatarSpeaking(false);
            reject(event);
          };
          
          // Play the speech
          speechSynthesis.speak(utterance);
        }

        // Enhanced emotion analysis for more natural speech
        analyzeEmotion(text) {
          // Base settings from api.json or defaults
          let rate = this.API_CONFIG?.voice_settings?.rate || 0.9; // Slower, more natural speed
          let pitch = this.API_CONFIG?.voice_settings?.pitch || 1.1; // Slightly lower pitch
          let volume = this.API_CONFIG?.voice_settings?.volume || 0.9;
          
          // Get emotional range settings from api.json
          const emotionalRange = this.API_CONFIG?.voice_settings?.emotional_range || {};
          
          // Convert to lowercase for easier analysis
          const lowerText = text.toLowerCase();
          
          // Emotional keywords analysis
          const happyWords = ['happy', 'glad', 'pleased', 'delighted', 'excited', 'wonderful', 'great', 'excellent', 'fantastic', 'wonderful', 'amazing', 'brilliant'];
          const sadWords = ['sad', 'sorry', 'apologize', 'disappointed', 'upset', 'worried', 'concerned', 'unfortunate', 'regret'];
          const angryWords = ['angry', 'frustrated', 'annoyed', 'mad', 'furious', 'upset', 'irritated', 'outrage'];
          const surprisedWords = ['surprised', 'amazing', 'incredible', 'wow', 'unbelievable', 'astonishing', 'astounding'];
          const calmWords = ['calm', 'relaxed', 'peaceful', 'quiet', 'gentle', 'serene', 'tranquil'];
          
          // Check for emotional keywords
          const hasHappy = happyWords.some(word => lowerText.includes(word));
          const hasSad = sadWords.some(word => lowerText.includes(word));
          const hasAngry = angryWords.some(word => lowerText.includes(word));
          const hasSurprised = surprisedWords.some(word => lowerText.includes(word));
          const hasCalm = calmWords.some(word => lowerText.includes(word));
          
          // Adjust parameters based on emotional content using settings from api.json
          // Make emotional adjustments more subtle for natural speech
          if (hasHappy && emotionalRange.happy) {
            rate += emotionalRange.happy.rate_increase * 0.7 || 0.07; // More subtle
            pitch += emotionalRange.happy.pitch_increase * 0.8 || 0.08; // More subtle
            volume += emotionalRange.happy.volume_increase * 0.7 || 0.07; // More subtle
          }
          
          if (hasSad && emotionalRange.sad) {
            rate -= emotionalRange.sad.rate_decrease * 0.7 || 0.07; // More subtle
            pitch -= emotionalRange.sad.pitch_decrease * 0.8 || 0.08; // More subtle
            volume -= emotionalRange.sad.volume_decrease * 0.7 || 0.07; // More subtle
          }
          
          if (hasAngry && emotionalRange.angry) {
            rate += emotionalRange.angry.rate_increase * 0.8 || 0.16; // More controlled
            pitch += emotionalRange.angry.pitch_increase * 0.9 || 0.18; // More controlled
            volume += emotionalRange.angry.volume_increase * 0.8 || 0.16; // More controlled
          }
          
          if (hasSurprised && emotionalRange.surprised) {
            rate -= emotionalRange.surprised.rate_decrease * 0.7 || 0.07; // More subtle
            pitch += emotionalRange.surprised.pitch_increase * 0.9 || 0.27; // Controlled but noticeable
            volume += emotionalRange.surprised.volume_increase * 0.7 || 0.07; // More subtle
          }
          
          if (hasCalm && emotionalRange.calm) {
            rate -= emotionalRange.calm.rate_decrease * 0.8 || 0.08; // More subtle
            pitch -= emotionalRange.calm.pitch_decrease * 0.8 || 0.08; // More subtle
            volume -= emotionalRange.calm.volume_decrease * 0.8 || 0.08; // More subtle
          }
          
          // Punctuation-based modulation (existing functionality)
          if (text.includes('?')) {
            pitch += 0.08; // Slightly higher pitch for questions
            rate -= 0.03; // Slightly slower for questions
          }
          
          if (text.includes('!')) {
            volume = Math.min(1.0, volume + 0.15); // Louder for exclamation but cap at 1.0
            pitch += 0.1; // Higher pitch for emphasis
            rate -= 0.03; // Slightly slower for emphasis
          }
          
          // Sentence structure analysis
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length > 3) {
            // For longer responses, add some variation to maintain interest
            rate += 0.03; // Very subtle increase
          }
          
          // Ensure values stay within reasonable bounds
          rate = Math.max(0.7, Math.min(1.3, rate));
          pitch = Math.max(0.8, Math.min(1.4, pitch));
          volume = Math.max(0.6, Math.min(1.0, volume));
          
          // Return the emotional parameters
          return { rate, pitch, volume };
        }

        // Stop face detection
        stopFaceDetection() {
          if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
          }
          
          if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
          }
          
          this.cameraContainer.style.display = 'none';
        }

        showError(message) {
          alert(message);
          console.error(message);
        }
      }

      // Initialize when the page loads
      document.addEventListener('DOMContentLoaded', () => {
        new ReceptionistAgent();
      });
    