import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { SkillGroup } from '../types';

// Layer 1: Base - Horizontal scrolling EEG waveform lines
const WaveLayer = () => {
  return (
    <div className="absolute inset-0 opacity-[0.5] overflow-hidden flex flex-col justify-around py-20 pointer-events-none">
       {[...Array(4)].map((_, i) => (
         <motion.div 
           key={i}
           className="w-[200vw] flex text-brand-200"
           animate={{ x: ["0%", "-50%"] }}
           transition={{ repeat: Infinity, ease: "linear", duration: 15 + i * 5 }}
         >
           <svg width="100%" height="60" viewBox="0 0 100 40" preserveAspectRatio="none">
             <path d="M 0 20 Q 12.5 5, 25 20 T 50 20 T 75 20 T 100 20" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
           </svg>
           <svg width="100%" height="60" viewBox="0 0 100 40" preserveAspectRatio="none">
             <path d="M 0 20 Q 12.5 5, 25 20 T 50 20 T 75 20 T 100 20" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
           </svg>
         </motion.div>
       ))}
    </div>
  );
};

// Layer 2: Mid layer - Sparse neural-network motif
const NeuralNetLayer = () => {
  const nodes = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: 30 + Math.random() * 65,
    y: 10 + Math.random() * 80,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3
  })), []);

  return (
    <motion.div 
      className="absolute inset-0 opacity-[0.7] pointer-events-none"
      animate={{ x: ["-2%", "2%", "-2%"], y: ["-1%", "3%", "-1%"] }}
      transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        {nodes.map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          const nextNode2 = nodes[(i + 2) % nodes.length];
          return (
            <g key={`lines-${i}`}>
              <line x1={`${node.x}%`} y1={`${node.y}%`} x2={`${nextNode.x}%`} y2={`${nextNode.y}%`} stroke="currentColor" strokeWidth="1" className="text-brand-300/50" />
              <line x1={`${node.x}%`} y1={`${node.y}%`} x2={`${nextNode2.x}%`} y2={`${nextNode2.y}%`} stroke="currentColor" strokeWidth="1" className="text-brand-300/30" />
            </g>
          )
        })}
      </svg>
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className="absolute w-2 h-2 rounded-full bg-brand-400"
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.5, 0.8] }}
          transition={{ repeat: Infinity, duration: node.duration, delay: node.delay, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
};

// Layer 3: Accent strip - Attention weights motif
const AttentionWeightsLayer = () => {
  const blocks = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ id: i })), []);
  
  return (
    <div className="absolute top-24 right-4 lg:top-32 lg:right-16 opacity-[0.9] pointer-events-none w-48 lg:w-72 h-12 hidden sm:block">
       <svg width="100%" height="100%" className="absolute inset-0">
          <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-brand-200" />
       </svg>
       <div className="absolute inset-0 flex items-center justify-between px-2 lg:px-4">
           {blocks.map((block, i) => (
             <motion.div 
               key={block.id}
               className="w-4 h-4 lg:w-6 lg:h-6 bg-brand-400 rounded z-10 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
               animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
               transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: "easeInOut" }}
             />
           ))}
       </div>
    </div>
  );
};

// Layer 4: Top layer - Sparse monospace text fragments
const FloatingTextLayer = ({ skillGroups }: { skillGroups: SkillGroup[] }) => {
  const items = useMemo(() => {
    let skills = skillGroups?.flatMap(sg => sg.skills.map(s => s.name)) || [];
    if (skills.length === 0) {
      skills = ['embed', 'token', '[CLS]', 'tensor', 'layer', 'attention', 'transformers', 'LLM', 'AI'];
    }
    
    // Spread texts evenly across the screen with random delays and durations
    return skills.map((text, i) => ({
      text,
      x: 5 + Math.random() * 90,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 20
    }));
  }, [skillGroups]);

  return (
    <div className="absolute inset-0 opacity-[0.8] pointer-events-none overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-sm lg:text-base font-mono font-bold text-brand-400/50 whitespace-nowrap"
          style={{ left: `${item.x}%` }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, 1, 1, 0], x: ["0px", "40px", "-40px"] }}
          transition={{ 
            y: { repeat: Infinity, duration: item.duration, delay: item.delay, ease: "linear" },
            opacity: { repeat: Infinity, duration: item.duration, delay: item.delay, ease: "easeInOut" },
            x: { repeat: Infinity, duration: item.duration * 0.6, ease: "easeInOut", yoyo: true }
          }}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
};

export const AnimatedBackground = ({ skillGroups = [] }: { skillGroups?: SkillGroup[] }) => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-white pointer-events-none">
      <WaveLayer />
      <NeuralNetLayer />
      <AttentionWeightsLayer />
      <FloatingTextLayer skillGroups={skillGroups} />
    </div>
  );
};
