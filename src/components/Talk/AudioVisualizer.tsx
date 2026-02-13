import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const VisualizerBars = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 24px;
`;

const Bar = styled(motion.div)`
  width: 4px;
  background-color: white;
  border-radius: 4px;
`;

export const AudioVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const [data, setData] = useState<number[]>([10, 15, 20, 15, 10]); 
  
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    if (!stream) return;

   
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; 
    
    analyser.smoothingTimeConstant = 0.8; 
    
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        
        
        const bars = [
            dataArray[2],
            dataArray[4],
            dataArray[6],
            dataArray[8],
            dataArray[12] 
        ].map(val => Math.max(6, (val / 255) * 24)); 
        

        setData(bars);
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, [stream]);

  return (
    <VisualizerBars>
      {data.map((h, i) => (
        <Bar
          key={i}
          animate={{ height: h }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </VisualizerBars>
  );
};
