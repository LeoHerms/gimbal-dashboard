import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GimbalData, ConnectionStatus } from './types';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gimbalData, setGimbalData] = useState<GimbalData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnectionStatus({ connected: true });
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus({ connected: false });
    });

    newSocket.on('gimbal-data', (data: GimbalData) => {
      setGimbalData(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleReset = () => {
    if (socket) {
      socket.emit('reset-gimbal');
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header>
        <h1>Gimbal Dashboard</h1>
        <div style={{ 
          padding: '10px', 
          backgroundColor: connectionStatus.connected ? '#4CAF50' : '#f44336',
          color: 'white',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        {gimbalData ? (
          <div>
            <h2>Current Position</h2>
            <div style={{ fontSize: '24px', margin: '10px 0' }}>
              <strong>X (Yaw): {gimbalData.x}°</strong>
            </div>
            <div style={{ fontSize: '24px', margin: '10px 0' }}>
              <strong>Y (Pitch): {gimbalData.y}°</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Last update: {new Date(gimbalData.timestamp).toLocaleTimeString()}
            </div>
            <button 
              onClick={handleReset}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Reset Gimbal
            </button>
          </div>
        ) : (
          <p>Waiting for gimbal data...</p>
        )}
      </main>
    </div>
  );
}

export default App;
