#!/usr/bin/env node
/**
 * Layer 9: Audio Engine - Sound synthesis and processing
 * Dependencies: Layer 0 (Binary), Layer 4 (Runtime)
 */

class AudioEngine {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
    this.tracks = [];
    this.masterVolume = 1.0;
    this.time = 0;
  }

  // Create track
  createTrack(name) {
    const track = {
      name,
      clips: [],
      volume: 1.0,
      pan: 0,
      effects: []
    };
    this.tracks.push(track);
    console.log(`[TRACK] Created ${name}`);
    return track;
  }

  // Generate sine wave
  sine(frequency, duration, amplitude = 1.0) {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      buffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
    
    return buffer;
  }

  // Generate square wave
  square(frequency, duration, amplitude = 1.0) {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      buffer[i] = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * t));
    }
    
    return buffer;
  }

  // Generate sawtooth wave
  sawtooth(frequency, duration, amplitude = 1.0) {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      const phase = (frequency * t) % 1;
      buffer[i] = amplitude * (2 * phase - 1);
    }
    
    return buffer;
  }

  // Generate noise
  noise(duration, amplitude = 1.0) {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      buffer[i] = amplitude * (Math.random() * 2 - 1);
    }
    
    return buffer;
  }

  // ADSR envelope
  applyEnvelope(buffer, attack, decay, sustain, release) {
    const samples = buffer.length;
    const attackSamples = Math.floor(attack * this.sampleRate);
    const decaySamples = Math.floor(decay * this.sampleRate);
    const releaseSamples = Math.floor(release * this.sampleRate);
    
    for (let i = 0; i < samples; i++) {
      let envelope = 1.0;
      
      if (i < attackSamples) {
        // Attack
        envelope = i / attackSamples;
      } else if (i < attackSamples + decaySamples) {
        // Decay
        const t = (i - attackSamples) / decaySamples;
        envelope = 1.0 - (1.0 - sustain) * t;
      } else if (i > samples - releaseSamples) {
        // Release
        const t = (samples - i) / releaseSamples;
        envelope = sustain * t;
      } else {
        // Sustain
        envelope = sustain;
      }
      
      buffer[i] *= envelope;
    }
    
    return buffer;
  }

  // Low-pass filter
  lowPass(buffer, cutoff) {
    const rc = 1.0 / (cutoff * 2 * Math.PI);
    const dt = 1.0 / this.sampleRate;
    const alpha = dt / (rc + dt);
    
    const filtered = new Float32Array(buffer.length);
    filtered[0] = buffer[0];
    
    for (let i = 1; i < buffer.length; i++) {
      filtered[i] = filtered[i - 1] + alpha * (buffer[i] - filtered[i - 1]);
    }
    
    return filtered;
  }

  // Reverb (simple delay-based)
  reverb(buffer, delay, decay) {
    const delaySamples = Math.floor(delay * this.sampleRate);
    const output = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      output[i] = buffer[i];
      if (i >= delaySamples) {
        output[i] += output[i - delaySamples] * decay;
      }
    }
    
    return output;
  }

  // Mix tracks
  mix() {
    let maxLength = 0;
    
    for (const track of this.tracks) {
      for (const clip of track.clips) {
        maxLength = Math.max(maxLength, clip.buffer.length);
      }
    }
    
    const mixed = new Float32Array(maxLength);
    
    for (const track of this.tracks) {
      for (const clip of track.clips) {
        for (let i = 0; i < clip.buffer.length; i++) {
          mixed[i] += clip.buffer[i] * track.volume * this.masterVolume;
        }
      }
    }
    
    // Normalize
    const max = Math.max(...mixed.map(Math.abs));
    if (max > 1.0) {
      for (let i = 0; i < mixed.length; i++) {
        mixed[i] /= max;
      }
    }
    
    console.log(`[MIX] Mixed ${this.tracks.length} tracks, ${maxLength} samples`);
    return mixed;
  }

  // Play note (frequency to note name)
  noteToFrequency(note) {
    const notes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const octave = parseInt(note.slice(-1));
    const noteName = note[0];
    const semitone = notes[noteName];
    
    return 440 * Math.pow(2, (octave - 4) + (semitone - 9) / 12);
  }

  // Get stats
  stats() {
    return {
      sampleRate: this.sampleRate,
      tracks: this.tracks.length,
      masterVolume: this.masterVolume
    };
  }
}

// Demo
if (require.main === module) {
  const audio = new AudioEngine(44100);
  
  console.log('=== Audio Engine Demo ===\n');
  
  // Create track
  const track1 = audio.createTrack('melody');
  
  console.log();
  
  // Generate tones
  console.log('Generating sine wave (440 Hz, 0.5s)');
  let buffer = audio.sine(440, 0.5, 0.5);
  
  // Apply envelope
  buffer = audio.applyEnvelope(buffer, 0.1, 0.1, 0.7, 0.2);
  console.log('Applied ADSR envelope');
  
  // Apply effects
  buffer = audio.lowPass(buffer, 2000);
  console.log('Applied low-pass filter');
  
  buffer = audio.reverb(buffer, 0.1, 0.3);
  console.log('Applied reverb');
  
  track1.clips.push({ buffer, startTime: 0 });
  
  console.log();
  
  // Generate chord
  const track2 = audio.createTrack('harmony');
  const c4 = audio.sine(audio.noteToFrequency('C4'), 1.0, 0.3);
  const e4 = audio.sine(audio.noteToFrequency('E4'), 1.0, 0.3);
  const g4 = audio.sine(audio.noteToFrequency('G4'), 1.0, 0.3);
  
  track2.clips.push({ buffer: c4, startTime: 0 });
  track2.clips.push({ buffer: e4, startTime: 0 });
  track2.clips.push({ buffer: g4, startTime: 0 });
  
  console.log();
  
  // Mix
  const mixed = audio.mix();
  console.log(`Mixed output: ${mixed.length} samples (${(mixed.length / audio.sampleRate).toFixed(2)}s)`);
  
  console.log('\nStats:', audio.stats());
}

module.exports = AudioEngine;
