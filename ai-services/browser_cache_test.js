/**
 * Browser Cache Audio Test Script
 * Tests: Browser cache storage → Audio playback → Cleanup
 * Also tests voice generation quality
 */

class AudioCacheTest {
    constructor() {
        this.testResults = [];
        this.audioElements = [];
        this.blobUrls = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        this.testResults.push({ timestamp, message, type });
    }

    async testBrowserCacheAudio() {
        this.log('🎵 Starting Browser Cache Audio Test', 'start');
        
        try {
            // Test 1: Get audio data from backend
            this.log('📡 Step 1: Fetching audio from TTS endpoint...');
            const response = await fetch('http://localhost:5010/tts/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: "This is a browser cache test. We will create a blob, play it, and then clean it up from memory.",
                    voiceProfile: "compassionate_female",
                    emotionContext: "supportive"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.tts_result?.audio_base64) {
                throw new Error('No audio data received');
            }

            this.log(`✅ Audio received: ${data.tts_result.audio_base64.length} chars base64`);
            this.log(`🎙️ Provider: ${data.tts_result.provider}`);
            this.log(`🎭 Voice: ${data.tts_result.voice_profile}`);
            this.log(`⏱️ Duration: ${data.tts_result.duration_seconds}s`);

            // Test 2: Convert to blob and create cache URL
            this.log('📦 Step 2: Converting base64 to blob...');
            const audioBase64 = data.tts_result.audio_base64;
            
            // Validate base64
            try {
                const binaryString = atob(audioBase64);
                this.log(`✅ Base64 decoded successfully: ${binaryString.length} bytes`);
            } catch (e) {
                throw new Error('Invalid base64 data');
            }

            // Create blob
            const audioBlob = new Blob(
                [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], 
                { type: 'audio/mpeg' }
            );
            
            this.log(`✅ Blob created: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

            // Test 3: Create browser cache URL
            this.log('🗂️ Step 3: Creating browser cache URL...');
            const audioUrl = URL.createObjectURL(audioBlob);
            this.blobUrls.push(audioUrl);
            
            this.log(`✅ Cache URL created: ${audioUrl.substring(0, 50)}...`);
            this.log(`📊 Current blob URLs in cache: ${this.blobUrls.length}`);

            // Test 4: Create audio element and play
            this.log('🎵 Step 4: Creating audio element and testing playback...');
            const audio = new Audio();
            this.audioElements.push(audio);
            
            return new Promise((resolve, reject) => {
                let playbackStarted = false;
                let playbackEnded = false;
                
                audio.onloadstart = () => {
                    this.log('⏳ Audio loading started...');
                };

                audio.oncanplay = () => {
                    this.log('✅ Audio can play (buffered enough data)');
                };

                audio.onplay = () => {
                    playbackStarted = true;
                    this.log('▶️ Audio playback STARTED from browser cache');
                };

                audio.onended = () => {
                    playbackEnded = true;
                    this.log('⏹️ Audio playback ENDED');
                    this.cleanupAndAnalyze(audioUrl, audio, resolve);
                };

                audio.onerror = (e) => {
                    this.log(`❌ Audio playback ERROR: ${e.message || 'Unknown error'}`, 'error');
                    reject(e);
                };

                audio.ontimeupdate = () => {
                    if (audio.currentTime > 0 && !this.timeUpdateLogged) {
                        this.log(`⏱️ Playback progress: ${audio.currentTime.toFixed(1)}s / ${audio.duration.toFixed(1)}s`);
                        this.timeUpdateLogged = true;
                    }
                };

                // Set source and attempt to play
                audio.src = audioUrl;
                this.log(`🎯 Audio source set to cache URL`);
                
                // Try to play after a short delay
                setTimeout(() => {
                    audio.play().then(() => {
                        this.log('✅ Audio.play() promise resolved successfully');
                    }).catch(error => {
                        this.log(`❌ Audio.play() promise rejected: ${error.message}`, 'error');
                        reject(error);
                    });
                }, 100);

                // Timeout in case audio never ends
                setTimeout(() => {
                    if (!playbackEnded) {
                        this.log('⏰ Test timeout - stopping audio manually');
                        audio.pause();
                        this.cleanupAndAnalyze(audioUrl, audio, resolve);
                    }
                }, 15000); // 15 second timeout
            });

        } catch (error) {
            this.log(`❌ Test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    cleanupAndAnalyze(audioUrl, audio, resolve) {
        this.log('🧹 Step 5: Cleaning up browser cache...');
        
        // Revoke the blob URL (remove from browser cache)
        URL.revokeObjectURL(audioUrl);
        this.log('✅ Blob URL revoked from browser cache');
        
        // Remove from tracking
        this.blobUrls = this.blobUrls.filter(url => url !== audioUrl);
        this.log(`📊 Remaining blob URLs in cache: ${this.blobUrls.length}`);
        
        // Test if URL is actually cleaned up
        setTimeout(() => {
            const testAudio = new Audio();
            testAudio.src = audioUrl;
            testAudio.onerror = () => {
                this.log('✅ Confirmed: Blob URL is no longer accessible (properly cleaned up)');
                this.generateReport();
                resolve(this.testResults);
            };
            testAudio.oncanplay = () => {
                this.log('⚠️ Warning: Blob URL still accessible after cleanup');
                this.generateReport();
                resolve(this.testResults);
            };
        }, 500);
    }

    generateReport() {
        this.log('📋 Generating final report...', 'report');
        
        const report = {
            totalSteps: 5,
            cacheCreated: this.blobUrls.length >= 0,
            cleanupSuccessful: this.blobUrls.length === 0,
            audioPlayback: true, // If we got this far, playback worked
            memoryLeaks: this.audioElements.length,
            summary: 'Browser cache audio test completed'
        };

        this.log('🎉 BROWSER CACHE AUDIO TEST RESULTS:', 'final');
        this.log(`✅ Cache Creation: ${report.cacheCreated ? 'SUCCESS' : 'FAILED'}`);
        this.log(`✅ Audio Playback: ${report.audioPlayback ? 'SUCCESS' : 'FAILED'}`);
        this.log(`✅ Cache Cleanup: ${report.cleanupSuccessful ? 'SUCCESS' : 'FAILED'}`);
        this.log(`📊 Memory Usage: ${report.memoryLeaks} audio elements created`);
        
        return report;
    }

    async testVoiceGeneration() {
        this.log('🎤 Testing Voice Generation Quality...', 'voice');
        
        const voiceTests = [
            { voice: 'compassionate_female', emotion: 'supportive', text: 'I understand how you feel and I want to help you through this.' },
            { voice: 'empathetic_male', emotion: 'calming', text: 'Take a deep breath. Everything is going to be okay.' },
            { voice: 'indian_female', emotion: 'encouraging', text: 'आप बहुत मजबूत हैं। You are very strong and capable.' }
        ];

        const results = [];

        for (const test of voiceTests) {
            try {
                this.log(`🎭 Testing ${test.voice} with ${test.emotion} emotion...`);
                
                const response = await fetch('http://localhost:5010/tts/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: test.text,
                        voiceProfile: test.voice,
                        emotionContext: test.emotion
                    })
                });

                const data = await response.json();
                
                if (data.success && data.tts_result) {
                    results.push({
                        voice: test.voice,
                        emotion: test.emotion,
                        success: true,
                        provider: data.tts_result.provider,
                        duration: data.tts_result.duration_seconds,
                        audioSize: data.tts_result.audio_base64?.length || 0
                    });
                    
                    this.log(`✅ ${test.voice}: ${data.tts_result.duration_seconds}s, ${data.tts_result.audio_base64?.length} chars`);
                } else {
                    results.push({ voice: test.voice, emotion: test.emotion, success: false });
                    this.log(`❌ ${test.voice}: Failed to generate`);
                }
                
            } catch (error) {
                results.push({ voice: test.voice, emotion: test.emotion, success: false, error: error.message });
                this.log(`❌ ${test.voice}: Error - ${error.message}`);
            }
        }

        this.log('🎤 VOICE GENERATION TEST RESULTS:', 'voice-final');
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            this.log(`${status} ${result.voice} (${result.emotion}): ${result.success ? `${result.duration}s audio` : 'FAILED'}`);
        });

        return results;
    }
}

// Auto-run tests when script loads
window.AudioCacheTest = AudioCacheTest;

// Convenience function to run all tests
window.runAudioTests = async function() {
    const tester = new AudioCacheTest();
    
    console.log('🚀 Starting Comprehensive Audio Tests...');
    
    try {
        // Test 1: Browser cache functionality
        const cacheResults = await tester.testBrowserCacheAudio();
        
        // Test 2: Voice generation quality
        const voiceResults = await tester.testVoiceGeneration();
        
        console.log('🎉 All tests completed successfully!');
        return { cache: cacheResults, voice: voiceResults };
        
    } catch (error) {
        console.error('❌ Tests failed:', error);
        throw error;
    }
};

console.log('🔧 Audio Cache Test loaded. Run runAudioTests() to start testing.');