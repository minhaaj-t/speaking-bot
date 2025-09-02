# Local AI Avatar Agent - Open Source Alternative

This is a local version of the AI Avatar Agent that works without paid services like D-ID. It uses open-source alternatives and your browser's built-in capabilities.

## Features

- Uses Groq API for AI responses (much cheaper than OpenAI)
- Browser-based text-to-speech for audio output
- Visual feedback when the avatar is "speaking"
- No paid API services required for the avatar functionality

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Edit the `api.json` file:
```json
{
    "openai_key": "your-groq-api-key",
    "model": "openai/gpt-oss-20b",
    "voice_id": "en-US-ChristopherNeural"
}
```

### 3. Run the Application
```bash
node app.js
```

### 4. Access the Local Version
Open your browser and go to:
http://localhost:3001/index-local.html

## Integrating with Open-Source Avatar Models

To get a full avatar experience, you can integrate with open-source models:

### Option 1: Google Colab + Animate Anyone
1. Visit the [Animate Anyone Colab notebook](https://colab.research.google.com/)
2. Upload your reference image
3. Generate animations based on text prompts
4. Save the generated videos
5. Modify `local-avatar-api.js` to display these videos

### Option 2: Hugging Face Spaces
1. Visit [Hugging Face Spaces](https://huggingface.co/spaces)
2. Search for avatar or animation demos
3. Try models like:
   - Animate Anyone
   - Stable Video Diffusion
   - VideoPoet

### Option 3: Local Installation
For advanced users who want to run models locally:

1. Install required dependencies:
```bash
pip install torch torchvision torchaudio
pip install diffusers transformers accelerate
```

2. Download model weights:
```python
from diffusers import StableVideoDiffusionPipeline

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16,
    variant="fp16"
)
```

3. Modify `local-avatar-api.js` to communicate with your local model server

## File Structure

- `local-avatar-api.js` - Main JavaScript file for the local version
- `index-local.html` - HTML interface for the local version
- `api.json` - Configuration file (shared with the main app)
- `openai.js` - Groq API integration (shared with the main app)

## Customization

### Changing the Voice
Modify the `local-avatar-api.js` file to use different voices:
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.voice = speechSynthesis.getVoices()[0]; // Change this line
```

### Adding Video Animations
To add actual video animations, modify the `simulateAvatarResponse` function in `local-avatar-api.js` to:
1. Send requests to your local model server
2. Receive generated video files
3. Display them in the video container

## Troubleshooting

### No Speech Output
- Make sure your browser supports the Web Speech API
- Check that your system has audio output enabled
- Try different browsers (Chrome works best)

### Video Not Displaying
- Ensure the video files are in the correct format (MP4, WebM)
- Check that the file paths are correct
- Verify that your browser supports the video codec

## Next Steps

1. Try the basic local version first
2. Experiment with Hugging Face demos
3. Set up Google Colab for more advanced avatar generation
4. Consider running models locally for full privacy

## Resources

- [Google Colab](https://colab.research.google.com/)
- [Hugging Face Spaces](https://huggingface.co/spaces)
- [Animate Anyone GitHub](https://github.com/open-mmlab/AnimateAnyone)
- [Stable Video Diffusion](https://stability.ai/blog/stable-video-diffusion-model)