import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const ConsoleContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: scroll;
  background-color: rgba(0, 0, 0, 0.7);
  color: #0f0;
  font-family: monospace;
  font-size: 12px;
  padding: 10px;
  z-index: 9999;
  white-space: pre-wrap;
`;

const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const newLog = (type: string) => (...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return 'Unserializable Object';
          }
        }
        return String(arg);
      }).join(' ');

      setLogs(prevLogs => [...prevLogs, `[${type}] ${message}`]);
      
      if (type === 'ERROR') {
        originalConsoleError(...args);
      } else if (type === 'WARN') {
        originalConsoleWarn(...args);
      } else {
        originalConsoleLog(...args);
      }
    };

    console.log = newLog('LOG');
    console.error = newLog('ERROR');
    console.warn = newLog('WARN');

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return (
    <ConsoleContainer>
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </ConsoleContainer>
  );
};

export default DebugConsole;
