import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GimbalData, ConnectionStatus } from './types';
import GimbalChart from './components/GimbalChart';
import GimbalVisual from './components/GimbalVisual';
import ThreeGimbal from './components/ThreeGimbal';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gimbalData, setGimbalData] = useState<GimbalData | null>(null);
  const [dataHistory, setDataHistory] = useState<GimbalData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false
  });

  useEffect(() => {
    // Connect to backend
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listen for connection status
    newSocket.on('connection-status', (status: ConnectionStatus) => {
      setConnectionStatus(status);
    });

    // Listen for gimbal data
    newSocket.on('gimbal-data', (data: GimbalData) => {
      setGimbalData(data);
      
      // Add to history (keep last 100 points)
      setDataHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.slice(-100);
      });
    });

    // Handle connection events
    newSocket.on('connect', () => {
      setConnectionStatus({ connected: true });
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus({ connected: false });
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const handleReset = () => {
    if (socket) {
      socket.emit('reset-gimbal');
    }
  };

  const clearHistory = () => {
    setDataHistory([]);
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Gimbal Dashboard</h1>
        <div style={{ 
          padding: '10px', 
          backgroundColor: connectionStatus.connected ? '#4CAF50' : '#f44336',
          color: 'white',
          borderRadius: '5px'
        }}>
          Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>
      
      <main>
        {gimbalData ? (
          <div>
            {/* Current Values */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                minWidth: '150px'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Current Position</h3>
                <div style={{ fontSize: '18px', margin: '5px 0' }}>
                  <strong>X (Yaw): {gimbalData.x}°</strong>
                </div>
                <div style={{ fontSize: '18px', margin: '5px 0' }}>
                  <strong>Y (Pitch): {gimbalData.y}°</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  {new Date(gimbalData.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Controls</h3>
                <button 
                  onClick={handleReset}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Reset Gimbal
                </button>
                <button 
                  onClick={clearHistory}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Chart
                </button>
              </div>
            </div>

            {/* Visual Gimbal */}
            {/*<GimbalVisual data={gimbalData} />*}

            {/* 3D Gimbal */}
            <ThreeGimbal data={gimbalData} />

            {/* Real-time Chart */}
            <GimbalChart data={dataHistory} />

            {/* Stats */}
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px' 
            }}>
              <h3>Session Stats</h3>
              <p>Data points collected: {dataHistory.length}</p>
              <p>Session duration: {dataHistory.length > 0 ? 
                Math.round((gimbalData.timestamp - dataHistory[0].timestamp) / 1000) : 0} seconds</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Waiting for gimbal data...</h2>
            <p>Make sure your gimbal server is running and sending data.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;