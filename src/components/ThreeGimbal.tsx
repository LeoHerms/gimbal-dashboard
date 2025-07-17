import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GimbalData } from '../types';

interface ThreeGimbalProps {
  data: GimbalData | null;
}

const ThreeGimbal: React.FC<ThreeGimbalProps> = ({ data }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const yawRingRef = useRef<THREE.Group | null>(null);
  const pitchArmRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = 600;
    const height = 400;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    base.receiveShadow = true;
    scene.add(base);

    // Yaw ring (outer ring that rotates horizontally)
    const yawRing = new THREE.Group();
    yawRingRef.current = yawRing;
    
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 32);
    const yawMaterial = new THREE.MeshLambertMaterial({ color: 0x4488ff });
    const ringMesh = new THREE.Mesh(ringGeometry, yawMaterial);
    ringMesh.castShadow = true;
    yawRing.add(ringMesh); // Add to yawRing, not scene

    // Yaw ring supports
    for (let i = 0; i < 4; i++) {
      const supportGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.05);
      const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      const angle = (i / 4) * Math.PI * 2;
      support.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
      support.castShadow = true;
      yawRing.add(support); // Add to yawRing, not scene
    }

    // Pitch arm (inner mechanism that tilts)
    const pitchArm = new THREE.Group();
    pitchArmRef.current = pitchArm;

    // Pitch ring
    const pitchRingGeometry = new THREE.TorusGeometry(0.8, 0.08, 6, 24);
    const pitchMaterial = new THREE.MeshLambertMaterial({ color: 0xff6644 });
    const pitchRingMesh = new THREE.Mesh(pitchRingGeometry, pitchMaterial);
    pitchRingMesh.rotation.z = Math.PI / 2; // Rotate to be vertical
    pitchRingMesh.castShadow = true;
    pitchArm.add(pitchRingMesh); // Add to pitchArm, not scene

    // Camera/payload box
    const payloadGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
    const payloadMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const payload = new THREE.Mesh(payloadGeometry, payloadMaterial);
    payload.castShadow = true;
    pitchArm.add(payload); // Add to pitchArm, not scene

    // Camera lens
    const lensGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.1, 16);
    const lensMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.35;
    lens.castShadow = true;
    pitchArm.add(lens); // Add to pitchArm, not scene

    yawRing.add(pitchArm); // Pitch arm goes inside yaw ring
    scene.add(yawRing);    // Only yaw ring goes to scene

    // Mouse controls for camera
    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current || !cameraRef.current) return;

      const deltaX = event.clientX - mouseRef.current.x;
      const deltaY = event.clientY - mouseRef.current.y;

      // Orbit camera around the gimbal
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(cameraRef.current.position);
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      cameraRef.current.position.setFromSpherical(spherical);
      cameraRef.current.lookAt(0, 0, 0);

      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!cameraRef.current) return;

      const factor = event.deltaY > 0 ? 1.1 : 0.9;
      cameraRef.current.position.multiplyScalar(factor);
      
      // Limit zoom
      const distance = cameraRef.current.position.length();
      if (distance < 2) cameraRef.current.position.normalize().multiplyScalar(2);
      if (distance > 15) cameraRef.current.position.normalize().multiplyScalar(15);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Copy ref to variable to fix React warning
      const currentMount = mountRef.current;
      const currentRenderer = rendererRef.current;
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (currentMount && currentRenderer && currentRenderer.domElement) {
        currentMount.removeChild(currentRenderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  // Update gimbal rotation based on data
  useEffect(() => {
    if (!data) return;
    
    const yawRing = yawRingRef.current;
    const pitchArm = pitchArmRef.current;
    
    if (!yawRing || !pitchArm) return;

    // Convert 0-180 to -90 to +90 degrees, then to radians
    const yawRadians = ((data.x - 90) * Math.PI) / 180;
    const pitchRadians = ((data.y - 90) * Math.PI) / 180;

    // Apply rotations with smooth interpolation
    yawRing.rotation.y = yawRadians;
    pitchArm.rotation.x = pitchRadians;

  }, [data]);

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>3D Gimbal Visualization</h3>
      <div 
        ref={mountRef} 
        style={{ 
          border: '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'grab'
        }}
      />
      <div style={{ 
        marginTop: '10px', 
        fontSize: '14px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Click and drag to orbit • Scroll to zoom
      </div>
      {data && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginTop: '10px' 
        }}>
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#4488ff', 
            color: 'white', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Yaw: {data.x}° ({((data.x - 90) * 2).toFixed(1)}°)
          </div>
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#ff6644', 
            color: 'white', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Pitch: {data.y}° ({((data.y - 90) * 2).toFixed(1)}°)
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeGimbal;