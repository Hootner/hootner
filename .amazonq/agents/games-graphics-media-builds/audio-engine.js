// Minimal Audio Engine
class AudioEngine {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
    this.sources = [];
  }

  addSource(source) {
    this.sources.push(source);
  }

  generateTone(freq, duration) {
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      buffer[i] = Math.sin(2 * Math.PI * freq * i / this.sampleRate);
    }
    
    return buffer;
  }

  mix() {
    const maxLen = Math.max(...this.sources.map(s => s.length));
    const output = new Float32Array(maxLen);
    
    this.sources.forEach(source => {
      for (let i = 0; i < source.length; i++) {
        output[i] += source[i] / this.sources.length;
      }
    });
    
    return output;
  }
}

const audio = new AudioEngine();
audio.addSource(audio.generateTone(440, 1));
console.log('Generated audio:', audio.mix().length, 'samples');

export default AudioEngine;
