import React, { useState, useEffect, useRef } from 'react';

export const TypewriterText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context only when typing starts to increase chances of it being allowed
    let i = 0;
    let typingInterval: NodeJS.Timeout;
    let startTimeout: NodeJS.Timeout;

    const playClick = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            audioCtxRef.current = new AudioContext();
          }
        }
        
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        
        if (audioCtxRef.current) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          
          osc.type = 'square';
          // Randomize frequency slightly to sound more like varied keystrokes
          osc.frequency.setValueAtTime(300 + Math.random() * 100, audioCtxRef.current.currentTime);
          osc.frequency.exponentialRampToValueAtTime(100, audioCtxRef.current.currentTime + 0.05);
          
          gain.gain.setValueAtTime(0.02, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
          
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.05);
        }
      } catch(e) {
        // Ignore autoplay or audio errors
      }
    };

    const startTyping = () => {
      setIsTyping(true);
      typingInterval = setInterval(() => {
        i++;
        setDisplayedText(text.substring(0, i));
        playClick();
        
        if (i >= text.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
          setCompleted(true);
        }
      }, 70); // 70ms per character is a good typing speed
    };

    startTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(typingInterval);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [text, delay]);

  return (
    <span className={`inline-flex items-center ${className || ''}`}>
      <span>{displayedText}</span>
      <span 
        className={`inline-block w-[0.08em] h-[0.9em] ml-1 bg-current transition-opacity ${completed ? 'animate-hard-blink' : ''}`} 
        style={{ opacity: (isTyping || completed) ? 1 : 0 }} 
      />
    </span>
  );
};
