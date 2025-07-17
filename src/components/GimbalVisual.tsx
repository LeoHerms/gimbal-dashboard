import React from 'react';
import { GimbalData } from '../types';

interface GimbalVisualProps {
  data: GimbalData | null;
}

const GimbalVisual: React.FC<GimbalVisualProps> = ({ data }) => {
  if (!data) return <div>No gimbal data</div>;

  // Convert 0-180 to -90 to +90 for more intuitive visualization
  const yawAngle = (data.x - 90) * 2; // Scale for better visual effect
  const pitchAngle = (data.y - 90) * 2;

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <h3>Gimbal Orientation</h3>
      
      {/* Gimbal Base */}
      <div style={{ 
        width: '300px', 
        height: '300px', 
        margin: '0 auto',
        position: 'relative',
        border: '2px solid #333',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Yaw Indicator (outer ring) */}
        <div style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          border: '2px solid #8884d8',
          borderRadius: '50%',
          transform: `rotate(${yawAngle}deg)`,
          transition: 'transform 0.1s ease-out'
        }}>
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '20px',
            backgroundColor: '#8884d8'
          }} />
        </div>

        {/* Pitch Indicator (inner gimbal) */}
        <div style={{
          width: '200px',
          height: '200px',
          border: '2px solid #82ca9d',
          borderRadius: '50%',
          position: 'relative',
          backgroundColor: 'white',
          transform: `rotate(${pitchAngle}deg)`,
          transition: 'transform 0.1s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '20px',
            backgroundColor: '#82ca9d'
          }} />
          
          {/* Center dot */}
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#333',
            borderRadius: '50%'
          }} />
        </div>
      </div>

      {/* Angle Display */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        marginTop: '20px',
        maxWidth: '300px',
        margin: '20px auto 0'
      }}>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#8884d8', 
          color: 'white', 
          borderRadius: '5px',
          minWidth: '100px'
        }}>
          <strong>Yaw</strong><br />
          {data.x}° ({yawAngle > 0 ? '+' : ''}{yawAngle.toFixed(1)}°)
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#82ca9d', 
          color: 'white', 
          borderRadius: '5px',
          minWidth: '100px'
        }}>
          <strong>Pitch</strong><br />
          {data.y}° ({pitchAngle > 0 ? '+' : ''}{pitchAngle.toFixed(1)}°)
        </div>
      </div>
    </div>
  );
};

export default GimbalVisual;