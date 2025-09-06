const https = require('https');
const fs = require('fs');

const models = [
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    filename: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1.dat',
    filename: 'face_landmark_68_model-shard1.dat'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
    filename: 'face_recognition_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1.dat',
    filename: 'face_recognition_model-shard1.dat'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    filename: 'tiny_face_detector_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1.dat',
    filename: 'tiny_face_detector_model-shard1.dat'
  }
];

function downloadFile(model) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`models/${model.filename}`);
    
    https.get(model.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${model.filename}: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${model.filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(`models/${model.filename}`, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('Downloading face-api.js models...');
  
  for (const model of models) {
    try {
      await downloadFile(model);
    } catch (error) {
      console.error(`Failed to download ${model.filename}:`, error.message);
    }
  }
  
  console.log('Model download complete!');
}

downloadModels();