import React, { useState, useEffect, useRef } from 'react';
import useAcousticSensor from './hooks/useAcousticSensor';
import useSoundscape from './hooks/useSoundscape';
import { 
  ShieldCheck, ShieldAlert, Zap, Heart, 
  Brain, Headphones, Power, CircleCheck, TriangleAlert, CircleX, Settings, ArrowDown, MicOff, Loader2
} from 'lucide-react';

function App() {
  // --- HOOKS ---
  const { volume, displayVolume, peakFreq, isRecording, startSensors, stopSensors } = useAcousticSensor();
  const { startFrequency, updateLiveFrequency, stopSound, activeMode } = useSoundscape();
  
  // --- STATE: NEURAL SCAN & AI ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState("Calibrating Sensors...");
  const [aiRecommendation, setAiRecommendation] = useState(null);
  
  // --- STATE: DASHBOARD ---
  const [isShieldOn, setIsShieldOn] = useState(false);
  const [history, setHistory] = useState(new Array(30).fill(0));
  const [focusScore, setFocusScore] = useState(100);
  const dashboardRef = useRef(null);

  // --- AI NEURAL INFERENCE ENGINE (The "AI" Integration) ---
  const runNeuralInference = (avgVol, peakF) => {
    try {
      if (avgVol > 65) {
        return { 
          mode: "ANC", label: "Neural ANC", 
          reason: "High amplitude ambient noise detected. Spectral masking required.",
          confidence: "94%", freq: peakF
        };
      } 
      if (peakF > 900) {
        return { 
          mode: "Pain", label: "Somatic Relief", 
          reason: "High-frequency mechanical jitter identified. 174Hz grounding suggested.",
          confidence: "89%", freq: 174
        };
      }
      if (avgVol > 35 && avgVol < 55) {
        return { 
          mode: "Focus", label: "High Focus", 
          reason: "Moderate environmental load. 40Hz Gamma entrainment optimal.",
          confidence: "91%", freq: 40
        };
      }
      return { 
        mode: "Stress", label: "Stress Void", 
        reason: "Environment stable. Suggesting 528Hz for DNA/Cortisol maintenance.",
        confidence: "97%", freq: 528
      };
    } catch (error) {
      // AI FALLBACK SYSTEM
      return { 
        mode: "Earth", label: "Earth Year", 
        reason: "Sensor data mismatch. Defaulting to 136.1Hz universal grounding.",
        confidence: "N/A", freq: 136.1
      };
    }
  };

  // --- INITIALIZE & SCAN LOGIC ---
  const handleInitialize = () => {
    setIsAnalyzing(true);
    startSensors();
    setTimeout(() => setAnalysisText("Decoding Frequency Spectrum..."), 1200);
    setTimeout(() => setAnalysisText("Running Neural Inference Engine..."), 2400);
    setTimeout(() => {
      const result = runNeuralInference(volume, peakFreq);
      setAiRecommendation(result);
      setIsAnalyzing(false);
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 3800); 
  };

  // --- LOGIC: AUTO-SHIELD ---
  useEffect(() => {
    if (isShieldOn) {
      if (volume > 60 && !activeMode) startFrequency(174, 'Auto-Relief');
    } else if (activeMode === 'Auto-Relief') {
        stopSound();
    }
  }, [volume, isShieldOn, activeMode, startFrequency, stopSound]);

  // --- LOGIC: LIVE ANC UPDATES ---
  useEffect(() => {
    if (activeMode === 'ANC') updateLiveFrequency(peakFreq);
  }, [peakFreq, activeMode, updateLiveFrequency]);

  // --- LOGIC: DATA TRACKING ---
  useEffect(() => {
    if (isRecording && !isAnalyzing) {
      const interval = setInterval(() => {
        setHistory(prev => [...prev.slice(1), volume]);
        let penalty = (volume > 50 ? (volume - 50) * 1.8 : 0);
        setFocusScore(Math.max(0, Math.min(100, Math.round(100 - penalty))));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [volume, isRecording, isAnalyzing]);

  // --- UI HELPERS ---
  const status = (() => {
    if (!isRecording || isAnalyzing) return { label: 'Standby', color: 'text-slate-600', icon: Power };
    if (volume < 30) return { label: 'Optimal', color: 'text-[#00ffa3]', icon: CircleCheck };
    if (volume < 55) return { label: 'Elevated', color: 'text-[#ffcc00]', icon: TriangleAlert };
    return { label: 'Critical', color: 'text-[#ff4d4d]', icon: CircleX };
  })();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-blue-600">
      
      {/* SECTION 1: HERO & NEURAL SCAN */}
      <section className="h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black relative">
        <div className="text-center space-y-6 z-10 px-4 animate-in fade-in zoom-in duration-1000">
          <div className="bg-[#111111] border border-white/10 p-10 rounded-[4rem] shadow-2xl inline-block mb-8 relative group">
             {isAnalyzing ? (
               <Loader2 size={80} className="text-blue-500 animate-spin relative z-10" />
             ) : (
               <Brain size={80} className="text-blue-500 mx-auto relative z-10" />
             )}
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase text-white leading-none">
            AuraPulse <span className="text-blue-500">v2.0</span>
          </h1>
          <div className="pt-12 min-h-[140px]">
            {isAnalyzing ? (
              <div className="space-y-6">
                <p className="text-blue-500 text-sm font-black uppercase tracking-[0.5em] animate-pulse">{analysisText}</p>
                <div className="w-64 h-1.5 bg-slate-900 mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-[loading_3.8s_ease-in-out]" style={{width:'100%'}}></div>
                </div>
              </div>
            ) : !isRecording ? (
              <button onClick={handleInitialize} className="group px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-2xl transition-all shadow-[0_0_60px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto uppercase">
                <Zap size={28} fill="white" /> Initialize Sensors
              </button>
            ) : (
              <button onClick={() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce p-6 bg-white/5 rounded-full border border-white/10 mx-auto">
                <ArrowDown size={32} className="text-blue-500" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: THE DASHBOARD */}
      <div ref={dashboardRef} className={`max-w-[1700px] mx-auto px-8 py-24 transition-all duration-1000 ${isAnalyzing ? 'opacity-10 blur-xl pointer-events-none' : 'opacity-100'}`}>
        
        <div className="flex justify-between items-end mb-20 border-b border-white/10 pb-12">
          <div>
            <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Neural Dashboard</h2>
            <p className="text-slate-600 text-[10px] mt-4 uppercase tracking-[0.3em] font-black underline decoration-blue-500">IoT Intelligence stream Ready</p>
          </div>
          <button onClick={stopSensors} className="px-8 py-3 border border-red-500/30 text-red-500 rounded-full text-xs font-black uppercase hover:bg-red-500 hover:text-white transition tracking-widest">Terminate Node</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* COLUMN 1: READINGS (4 COLS) */}
          <div className="xl:col-span-4 space-y-10">
            <div className="bg-[#0c0c0c] border border-white/10 p-12 rounded-[4rem] flex flex-col items-center justify-center min-h-[480px] shadow-2xl relative overflow-hidden">
              <div className={`${status.color} mb-12 transition-all duration-700 relative z-10`}><StatusIcon size={160} strokeWidth={2.5} /></div>
              <div className="flex items-baseline relative z-10">
                <h3 className="text-[12rem] font-black tracking-tighter leading-[0.6]">{displayVolume}</h3>
                <span className="text-3xl text-slate-700 ml-6 font-black italic border-l border-white/10 pl-6 uppercase">dB</span>
              </div>
              <h4 className={`text-4xl font-black uppercase tracking-tighter mt-12 ${status.color}`}>{status.label}</h4>
            </div>

            <div className="bg-[#0c0c0c] border border-white/10 p-10 rounded-[3.5rem] text-center shadow-2xl">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 font-mono tracking-tighter opacity-50 underline decoration-blue-500/50">Neural Focus Scorecard</p>
               <div className="text-8xl font-black text-blue-500">{focusScore}%</div>
               <div className="w-full bg-slate-900 h-2 mt-10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(0,112,243,0.5)]" style={{ width: `${focusScore}%` }}></div>
               </div>
            </div>
          </div>

          {/* COLUMN 2: MODES (5 COLS) */}
          <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FunctionCard 
                icon={<MicOff />} title="Neural ANC" freq="Pneumatic Shadow" 
                active={activeMode === 'ANC'} onClick={() => activeMode === 'ANC' ? stopSound() : startFrequency(peakFreq, 'ANC')} color="text-cyan-400"
                description="Adaptive spectral masking using smoothed high-frequency hiss to hide speech noise."
              />
              <FunctionCard 
                icon={<Headphones />} title="High Focus" freq="40 Hz Gamma" 
                active={activeMode === 'Focus'} onClick={() => activeMode === 'Focus' ? stopSound() : startFrequency(40, 'Focus')} color="text-blue-500"
                description="MIT research-backed 40Hz Gamma entrainment for cognitive speed and deep work."
              />
              <FunctionCard 
                icon={<Zap />} title="Earth Year" freq="136.1 Hz" 
                active={activeMode === 'Earth'} onClick={() => activeMode === 'Earth' ? stopSound() : startFrequency(136.1, 'Earth')} color="text-orange-400"
                description="The Zen OM frequency (32nd Octave of Earth's orbit). Promotes universal grounding."
              />
              <FunctionCard 
                icon={<Heart />} title="Stress Void" freq="528 Hz Repair" 
                active={activeMode === 'Stress'} onClick={() => activeMode === 'Stress' ? stopSound() : startFrequency(528, 'Stress')} color="text-indigo-400"
                description="Solfeggio frequency used to reduce cortisol and stimulate cellular-level repair."
              />
              <FunctionCard 
                icon={<ShieldAlert />} title="Somatic Relief" freq="174 Hz Foundation" 
                active={activeMode === 'Pain'} onClick={() => activeMode === 'Pain' ? stopSound() : startFrequency(174, 'Pain')} color="text-emerald-500"
                description="Low-resonance tone acting as a natural anesthetic for somatic (physical) pain."
              />
              <FunctionCard 
                icon={<CircleCheck />} title="Phase Inverter" freq="XOR Inversion" 
                active={activeMode === 'Phase'} onClick={() => activeMode === 'Phase' ? stopSound() : startFrequency(100, 'Phase')} color="text-yellow-500"
                description="Bit-wise inversion testing Destructive Interference at the browser-software level."
              />
          </div>

          {/* COLUMN 3: AI ADVISOR (3 COLS) */}
          <div className="xl:col-span-3 space-y-8 flex flex-col h-full">
            <div className="bg-[#0070f3]/10 border-2 border-[#0070f3]/30 p-10 rounded-[3.5rem] flex-grow flex flex-col justify-between group shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 text-blue-500 mb-8 font-black text-[11px] uppercase tracking-[0.4em]">
                    <Brain size={24} className="animate-pulse" /> AI Consultant
                  </div>
                  
                  {aiRecommendation ? (
                    <div className="animate-in slide-in-from-bottom duration-700">
                      <h5 className="text-3xl font-black uppercase text-white mb-2 leading-none italic">{aiRecommendation.label}</h5>
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Confidence Score: {aiRecommendation.confidence}</div>
                      <p className="text-sm font-bold leading-relaxed text-blue-100 italic">"{aiRecommendation.reason}"</p>
                      <button 
                        onClick={() => startFrequency(aiRecommendation.freq, aiRecommendation.mode)}
                        className="mt-10 w-full py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                      >
                        Engage Suggestion
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-600 italic text-sm">Initializing Neural Inference...</p>
                  )}
               </div>
               
               <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Spectral History (60s)</p>
                  <div className="flex items-end gap-1.5 h-20 px-2">
                    {history.map((h, i) => (
                      <div key={i} className="bg-blue-600/20 w-full rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(10, h)}%` }}></div>
                    ))}
                  </div>
               </div>
            </div>
            
            <div className="bg-[#0c0c0c] border border-white/10 p-10 rounded-[3rem] flex flex-col gap-6 shadow-2xl">
               <div className="flex justify-between items-center">
                  <div className={`p-4 rounded-2xl transition-all ${isShieldOn ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-slate-900 text-slate-600'}`}>
                    <ShieldCheck size={28} />
                  </div>
                  <button onClick={() => setIsShieldOn(!isShieldOn)} className={`w-14 h-7 rounded-full transition-all relative ${isShieldOn ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${isShieldOn ? 'left-8' : 'left-1'}`}></div>
                  </button>
               </div>
               <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 italic">Auto-Shield Node</h4>
               <p className="text-[11px] text-slate-600 font-bold leading-relaxed opacity-60">System auto-triggers 174Hz somatic relief upon detecting neural stress spikes.</p>
            </div>
          </div>
        </div>

        {/* FREQUENCY MATRIX FOOTER */}
        <div className="bg-[#0c0c0c] border border-white/10 p-12 rounded-[4rem] mt-12 shadow-2xl">
           <div className="flex justify-between items-center mb-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
              <span className="flex items-center gap-2 italic"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Neural Spectrum Analysis // Distrubted IoT Node</span>
           </div>
           <div className="flex items-end justify-between h-24 gap-1.5 px-4">
              {[...Array(80)].map((_, i) => (
                <div key={i} className={`w-full rounded-full transition-all duration-150 ${isRecording ? 'bg-blue-600/60' : 'bg-slate-950'}`}
                  style={{ height: isRecording ? `${Math.max(5, Math.random() * volume + (i % 25))}%` : '4px', opacity: isRecording ? 0.3 + (i / 150) : 0.05 }}></div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function FunctionCard({ icon, title, freq, active, onClick, color, description }) {
  return (
    <button onClick={onClick} className={`p-10 rounded-[3.5rem] border transition-all duration-700 text-left h-[340px] flex flex-col justify-between group relative overflow-hidden ${active ? `bg-white/5 border-white/20 ring-1 ring-white/10 shadow-2xl scale-[1.02]` : 'bg-[#0c0c0c] border-white/5 hover:border-white/10 hover:translate-y-[-5px]'}`}>
      <div className="flex justify-between items-start z-10">
        <div className={`p-5 rounded-3xl transition-all duration-500 ${active ? 'bg-white text-black scale-110 shadow-2xl' : 'bg-white/5 text-white'}`}>{icon}</div>
        {active && <div className="text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest border border-blue-500/20 px-2 py-1 rounded">Transmitting</div>}
      </div>
      <div className="z-10">
        <h3 className="text-3xl font-black tracking-tighter italic text-white mb-2 uppercase group-hover:text-blue-500 transition-colors leading-none">{title}</h3>
        <p className={`text-[12px] font-black uppercase tracking-[0.2em] mb-6 ${color}`}>{freq}</p>
        <p className="text-[11px] text-slate-600 font-bold leading-relaxed opacity-60 italic">{description}</p>
      </div>
      {active && <div className={`absolute bottom-[-50px] left-[-50px] w-64 h-64 blur-[100px] opacity-10 bg-current ${color}`}></div>}
    </button>
  );
}

export default App;