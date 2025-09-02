# AL RAWABI GROUP OF COMPANIES Receptionist Agent

This is a specialized AI receptionist for AL RAWABI GROUP OF COMPANIES that works without any paid services. It uses the free Groq API for AI responses and your browser's built-in text-to-speech capabilities with a professional female voice.

## Features

- Professional receptionist for AL RAWABI GROUP OF COMPANIES
- Fullscreen video display (Instagram story size)
- Name entry interface
- Customized responses for appointments, office locations, and company information
- Browser-based text-to-speech with professional female voice
- Visual feedback with specific video files:
  - Idle video (oracle_Idle.mp4): 10 seconds loop
  - Talking video (talk.mp4): 19 seconds loop
- Fullscreen controls (Ctrl+F to enter, ESC to exit)
- No paid API services required
- Fully local implementation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Copy the `api.json.template` file to `api.json` and edit it with your Groq API key:
```bash
cp api.json.template api.json
```

Then edit the `api.json` file:
```json
{
    "openai_key": "your-groq-api-key",
    "model": "openai/gpt-oss-20b",
    "voice_settings": {
        "pitch": 1.2,
        "rate": 1.3,
        "voice_type": "female"
    },
    "company_context": {
        "name": "AL RAWABI GROUP OF COMPANIES",
        "role": "Receptionist",
        "services": [
            "Appointment scheduling",
            "Office location guidance",
            "Room number information",
            "Company service explanations",
            "Building directions",
            "Contact information"
        ]
    }
}
```

### 3. Get a Free Groq API Key
1. Go to [Groq Cloud](https://console.groq.com/)
2. Sign up for a free account
3. Create an API key
4. Add it to the `api.json` file

### 4. Test the Setup
```bash
node test-local.js
```

### 5. Run the Application Locally
```bash
npm run dev
```

Or:
```bash
node app.js
```

### 6. Access the Application
Open your browser and go to:
http://localhost:3002

## Deployment to Vercel

This application can be deployed to Vercel with the following steps:

1. Push your code to a GitHub repository (make sure not to include `api.json` with real API keys)
2. Sign up for a free account at [Vercel](https://vercel.com/)
3. Create a new project and import your GitHub repository
4. Vercel will automatically detect the configuration and deploy your application
5. Add your Groq API key as an environment variable in your Vercel project settings:
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add a new variable with the name `GROQ_API_KEY` and your API key as the value
6. Update your `api.json` file to use the environment variable:
   ```json
   {
       "openai_key": "${GROQ_API_KEY}",
       "model": "openai/gpt-oss-20b",
       "voice_settings": {
           "pitch": 1.2,
           "rate": 1.3,
           "voice_type": "female"
       },
       "company_context": {
           "name": "AL RAWABI GROUP OF COMPANIES",
           "role": "Receptionist",
           "services": [
               "Appointment scheduling",
               "Office location guidance",
               "Room number information",
               "Company service explanations",
               "Building directions",
               "Contact information"
           ]
       }
   }
   ```

## How It Works

1. **Enter Name**: User enters their name at startup
2. **Fullscreen**: Press Ctrl+F to enter fullscreen mode
3. **Chat**: Type questions about appointments, locations, services, etc.
4. **Response**: The AI receptionist responds with professional information
5. **Visual Feedback**: 
   - Idle video (10 seconds) plays when not speaking
   - Talking video (19 seconds) plays when speaking

## Interface Features

- **Fullscreen Mode**: Press Ctrl+F to enter fullscreen, ESC to exit
- **Name Entry**: Initial screen asks for user's name
- **Bottom Input**: Text input appears at bottom of screen
- **Professional Voice**: Female voice with appropriate pitch and rate
- **Black Background**: Complete black background for cinema experience
- **Company Branding**: AL RAWABI GROUP OF COMPANIES branding

## File Structure

- `index.html` - Main HTML interface (fully local implementation)
- `app.js` - Express server to serve the files locally
- `api/server.js` - Express server for Vercel deployment
- `api.json` - Configuration file for API keys and voice settings (not in repo for security)
- `api.json.template` - Template for API configuration
- `openai.js` - Groq API integration with company context
- `test-local.js` - Test script for local setup
- `oracle_Idle.mp4` - 10-second idle animation video
- `talk.mp4` - 19-second talking animation video
- `oracle_pic.jpg` - Avatar reference image
- `vercel.json` - Vercel deployment configuration

## Voice Customization

The application uses a professional female voice with the following settings:
- Moderate pitch (1.2) for a clear, professional sound
- Slightly faster rate (1.3) for efficient communication
- Automatic selection of female voices when available

To customize the voice further, modify the `voice_settings` in `api.json`:
```json
{
    "pitch": 1.0,  // Normal pitch: 0.1 to 2.0
    "rate": 1.0,   // Normal speed: 0.1 to 10.0
    "voice_type": "female"  // Options: "female", "male", "default"
}
```

## Company Context

The AI is specifically trained to respond as a receptionist for AL RAWABI GROUP OF COMPANIES with knowledge about:
- Appointment scheduling
- Office locations and room numbers
- Company services
- Building directions
- Contact information

## Video Customization

The videos are set to loop automatically:
- Idle video loops continuously when not speaking
- Talking video loops for the duration of speech

To use different videos:
1. Replace `oracle_Idle.mp4` and `talk.mp4` with your own videos
2. Update the video durations in the JavaScript code if needed

## Troubleshooting

### No Speech Output
- Make sure your browser supports the Web Speech API (Chrome works best)
- Check that your system has audio output enabled
- Try different browsers

### Video Not Displaying
- Ensure the video files are in the correct format (MP4)
- Check that the file paths are correct
- Verify that your browser supports the video codec

### Voice Not Professional/Female
- Browser voice selection varies by system
- Try different browsers to find better female voices
- Manually select a voice in your system's text-to-speech settings

### API Key Issues
- Make sure your Groq API key is valid
- Check that the key starts with "gsk_"
- Verify you have internet connectivity

## Resources

- [Groq Cloud](https://console.groq.com/) - Get your free API key
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - For text-to-speech customization
- [Express.js Documentation](https://expressjs.com/) - For server customization
- [Vercel Documentation](https://vercel.com/docs) - For deployment

## Next Steps

1. Try the receptionist application
2. Customize the videos and voice settings
3. Add more specific company information to the context
4. Deploy to a public server for organizational use