import { useRef, useState } from 'react';

const useSoundscape = () => {
  const audioCtx = useRef(null);
  const source = useRef(null);
  const filterNode = useRef(null);
  const gainNode = useRef(null);
  const [activeMode, setActiveMode] = useState(null);

  const startFrequency = (freq, modeName) => {
    if (activeMode === modeName) return;
    stopSound();

    audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    gainNode.current = audioCtx.current.createGain();
    
    if (modeName === 'ANC') {
      // 1. "AIR PUMP" HISS (White Noise + High Pass)
      const bufferSize = audioCtx.current.sampleRate * 2;
      const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }

      source.current = audioCtx.current.createBufferSource();
      source.current.buffer = buffer;
      source.current.loop = true;

      filterNode.current = audioCtx.current.createBiquadFilter();
      filterNode.current.type = 'bandpass';
      filterNode.current.frequency.value = freq;
      filterNode.current.Q.value = 0.5; // Wide, airy hiss

      source.current.connect(filterNode.current);
      filterNode.current.connect(gainNode.current);
      gainNode.current.gain.value = 0.15;
    } else {
      // 2. PLANETARY RESONANCE (Pure Sine Waves)
      source.current = audioCtx.current.createOscillator();
      source.current.type = 'sine';
      source.current.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      
      source.current.connect(gainNode.current);
      gainNode.current.gain.value = 0.1;
    }

    gainNode.current.connect(audioCtx.current.destination);
    source.current.start();
    setActiveMode(modeName);
  };

  const updateLiveFrequency = (freq) => {
    if (filterNode.current && audioCtx.current && activeMode === 'ANC') {
      // NEURAL SMOOTHING: Change freq over 2.0 seconds so it's "Mild" and not irritating
      filterNode.current.frequency.setTargetAtTime(freq, audioCtx.current.currentTime, 2.0);
    }
  };

  const stopSound = () => {
    if (source.current) {
      try { source.current.stop(); source.current.disconnect(); } catch (e) {}
      source.current = null;
      setActiveMode(null);
    }
  };

  return { startFrequency, updateLiveFrequency, stopSound, activeMode };
};

export default useSoundscape;