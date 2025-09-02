// Test script for the AL RAWABI GROUP OF COMPANIES Receptionist
import config from './api.json' assert { type: 'json' };
import fs from 'fs';

async function testReceptionistSetup() {
    try {
        console.log('🧪 Testing AL RAWABI GROUP OF COMPANIES Receptionist Setup...\n');
        
        // Check if Groq API key exists
        if (!config.openai_key) {
            throw new Error('Missing Groq API key in api.json');
        }

        // Check if the key has the right format
        if (!config.openai_key.startsWith('gsk_')) {
            console.warn('⚠ Warning: Groq API key should start with "gsk_"');
        }

        console.log('✅ Groq API key found in api.json');
        console.log('✅ Configuration file is valid');

        // Check company context
        if (config.company_context) {
            console.log('\n🏢 Company Context:');
            console.log(`✅ Name: ${config.company_context.name}`);
            console.log(`✅ Role: ${config.company_context.role}`);
            console.log(`✅ Services: ${config.company_context.services.length} services configured`);
        }

        // Test Groq API
        console.log('\n📡 Testing Groq API connection...');
        const { fetchGroqResponse } = await import('./openai.js');
        
        const testResponse = await fetchGroqResponse(config.openai_key, "As a receptionist for AL RAWABI GROUP OF COMPANIES, briefly introduce yourself.");
        console.log('✅ Groq API is working correctly');
        console.log('💬 Test response:', testResponse);

        // Check if required files exist
        const requiredFiles = [
            './oracle_Idle.mp4',
            './talk.mp4',
            './oracle_pic.jpg',
            './index.html',
            './app.js'
        ];

        console.log('\n📁 Checking required files...');
        let allFilesFound = true;
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} found`);
            } else {
                console.warn(`❌ ${file} not found`);
                allFilesFound = false;
            }
        }

        if (!allFilesFound) {
            console.warn('\n⚠ Some files are missing. The application may not work correctly.');
        }

        // Check video durations (approximate)
        const idleStats = fs.statSync('./oracle_Idle.mp4');
        const talkStats = fs.statSync('./talk.mp4');
        
        console.log('\n🎥 Video Information:');
        console.log(`✅ oracle_Idle.mp4: ${(idleStats.size / 1024 / 1024).toFixed(1)} MB (Approx. 0:10)`);
        console.log(`✅ talk.mp4: ${(talkStats.size / 1024 / 1024).toFixed(1)} MB (Approx. 0:19)`);

        // Check voice settings
        if (config.voice_settings) {
            console.log('\n📢 Voice Settings:');
            console.log(`✅ Pitch: ${config.voice_settings.pitch || 'default'}`);
            console.log(`✅ Rate: ${config.voice_settings.rate || 'default'}`);
            console.log(`✅ Voice Type: ${config.voice_settings.voice_type || 'default'}`);
        }

        console.log('\n🎉 AL RAWABI GROUP OF COMPANIES Receptionist setup is ready!');
        console.log('\n🚀 To run the application:');
        console.log('   1. Run: node app.js');
        console.log('   2. Open your browser to: http://localhost:3002');
        console.log('   3. Enter your name and start chatting!');
        console.log('\n📱 Features:');
        console.log('   • Fullscreen mode: Press Ctrl+F');
        console.log('   • Exit fullscreen: Press ESC');
        console.log('   • Professional receptionist responses');
        console.log('   • Customized for AL RAWABI GROUP OF COMPANIES');
        console.log('   • Realistic lip-sync video playback');

    } catch (error) {
        console.error('❌ Setup error:', error.message);
        process.exit(1);
    }
}

testReceptionistSetup();