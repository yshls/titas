
import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const VisualizerBars = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 24px;
`;

const Bar = styled.div<{ height: number }>`
  width: 4px;
  background-color: white;
  border-radius: 4px;
  height: ${({ height }) => Math.max(4, height)}px;
  transition: height 0.05s ease;
`;


export const AudioVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0]);

  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    if (!stream) return;
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 32;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if(analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = [
          dataArray[0],
          dataArray[2],
          dataArray[4],
          dataArray[6],
          dataArray[8],
        ].map((v) => (v / 255) * 32);
        setData(bars);
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if(audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [stream]);

  return (
    <VisualizerBars>
      {data.map((h, i) => (
        <Bar key={i} height={h} />
      ))}
    </VisualizerBars>
  );
};
