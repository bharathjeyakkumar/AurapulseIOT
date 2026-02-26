import { useState, useRef } from 'react';

const useAcousticSensor = () => {
  const [volume, setVolume] = useState(0);
  const [displayVolume, setDisplayVolume] = useState(0);
  const [peakFreq, setPeakFreq] = useState(0); // NEW: Track the noise pitch
  const [isRecording, setIsRecording] = useState(false);
  
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdate = useRef(0);

  const startSensors = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256; // Increased for better frequency detection
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsRecording(true);
      
      const updateVolume = (time) => {
        analyser.getByteFrequencyData(dataArray);
        
        // 1. Calculate Volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) { sum += dataArray[i]; }
        const currentVol = Math.round(sum / bufferLength);
        setVolume(currentVol);

        // 2. Find Peak Frequency (for ANC)
        let maxVal = 0;
        let maxIndex = 0;
        for(let i=0; i<bufferLength; i++) {
            if(dataArray[i] > maxVal) { maxVal = dataArray[i]; maxIndex = i; }
        }
        const freq = Math.round(maxIndex * (audioContext.sampleRate / analyser.fftSize));
        setPeakFreq(freq);

        if (time - lastUpdate.current > 200) {
          setDisplayVolume(currentVol);
          lastUpdate.current = time;
        }

        animationRef.current = requestAnimationFrame(updateVolume);
      };
      animationRef.current = requestAnimationFrame(updateVolume);
    } catch (err) {
      console.error("Mic Error:", err);
    }
  };

  const stopSensors = () => {
    setIsRecording(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setVolume(0);
    setDisplayVolume(0);
    setPeakFreq(0);
  };

  return { volume, displayVolume, peakFreq, isRecording, startSensors, stopSensors };
};

export default useAcousticSensor;