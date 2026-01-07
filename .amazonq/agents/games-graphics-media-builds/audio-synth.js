class AudioSynth {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
    }
    
    generateTone(frequency, duration, waveform = 'sine') {
        const samples = Math.floor(this.sampleRate * duration);
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / this.sampleRate;
            const phase = 2 * Math.PI * frequency * t;
            
            switch (waveform) {
                case 'sine':
                    buffer[i] = Math.sin(phase);
                    break;
                case 'square':
                    buffer[i] = Math.sin(phase) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    buffer[i] = 2 * (phase / (2 * Math.PI) % 1) - 1;
                    break;
                case 'triangle':
                    const saw = 2 * (phase / (2 * Math.PI) % 1) - 1;
                    buffer[i] = 2 * Math.abs(saw) - 1;
                    break;
            }
        }
        
        return buffer;
    }
    
    applyEnvelope(buffer, attack, decay, sustain, release) {
        const samples = buffer.length;
        const attackSamples = Math.floor(attack * this.sampleRate);
        const decaySamples = Math.floor(decay * this.sampleRate);
        const releaseSamples = Math.floor(release * this.sampleRate);
        
        for (let i = 0; i < samples; i++) {
            let envelope = 1;
            
            if (i < attackSamples) {
                envelope = i / attackSamples;
            } else if (i < attackSamples + decaySamples) {
                const t = (i - attackSamples) / decaySamples;
                envelope = 1 - (1 - sustain) * t;
            } else if (i > samples - releaseSamples) {
                const t = (samples - i) / releaseSamples;
                envelope = sustain * t;
            } else {
                envelope = sustain;
            }
            
            buffer[i] *= envelope;
        }
        
        return buffer;
    }
    
    mix(buffers) {
        const maxLength = Math.max(...buffers.map(b => b.length));
        const mixed = new Float32Array(maxLength);
        
        for (let i = 0; i < maxLength; i++) {
            let sum = 0;
            for (let buffer of buffers) {
                if (i < buffer.length) {
                    sum += buffer[i];
                }
            }
            mixed[i] = sum / buffers.length;
        }
        
        return mixed;
    }
}

// Test
const synth = new AudioSynth();
const tone = synth.generateTone(440, 0.5, 'sine');
const envelope = synth.applyEnvelope(tone, 0.1, 0.1, 0.7, 0.2);

console.log('Generated audio samples:', envelope.length);
console.log('First 10 samples:', Array.from(envelope.slice(0, 10)));
