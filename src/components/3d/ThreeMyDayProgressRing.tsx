import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMyDayProgressRingProps {
  completed: number;
  total: number;
  percentage: number;
  size?: number;
  className?: string;
}

export const ThreeMyDayProgressRing: React.FC<ThreeMyDayProgressRingProps> = ({
  completed,
  total,
  percentage,
  size = 220,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef(percentage);
  percentRef.current = percentage;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.z = 7.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // 1. Background Inactive Torus Ring (Dark futuristic track)
    const trackGeom = new THREE.TorusGeometry(2.1, 0.16, 20, 90);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.5,
      transparent: true,
      opacity: 0.65,
    });
    const trackMesh = new THREE.Mesh(trackGeom, trackMat);
    ringGroup.add(trackMesh);

    // 2. Active Progress Arc Mesh
    let progressMesh: THREE.Mesh | null = null;
    let progressGeom: THREE.TorusGeometry | null = null;
    const progressMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.7,
    });

    // 3. Glowing Progress Head Bead
    const headGeom = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
    });
    const headMesh = new THREE.Mesh(headGeom, headMat);
    ringGroup.add(headMesh);

    // 4. Subtle Inner Holographic Wireframe
    const innerWireGeom = new THREE.RingGeometry(1.6, 1.65, 48);
    const innerWireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const innerWire = new THREE.Mesh(innerWireGeom, innerWireMat);
    ringGroup.add(innerWire);

    // Lighting
    const pointLight = new THREE.PointLight(0x34d399, 2.5, 40);
    pointLight.position.set(4, 4, 6);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x8b5cf6, 1.8, 40);
    backLight.position.set(-4, -4, -3);
    scene.add(backLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Helper to update progress geometry
    const updateProgressGeom = (pct: number) => {
      const clampedPct = Math.max(0.01, Math.min(100, pct));
      const arcLength = (clampedPct / 100) * Math.PI * 2;

      if (progressMesh) {
        ringGroup.remove(progressMesh);
        progressGeom?.dispose();
      }

      progressGeom = new THREE.TorusGeometry(2.1, 0.19, 24, 90, arcLength);
      // Torus begins at 3 o'clock, rotate so it starts at top (12 o'clock)
      progressMesh = new THREE.Mesh(progressGeom, progressMat);
      progressMesh.rotation.z = Math.PI / 2;
      ringGroup.add(progressMesh);

      // Position head sphere at arc end
      // Arc angle clockwise from top:
      const angle = Math.PI / 2 - arcLength;
      headMesh.position.x = Math.cos(angle) * 2.1;
      headMesh.position.y = Math.sin(angle) * 2.1;
      headMesh.position.z = 0.05;

      // Update color based on completion
      if (clampedPct >= 100) {
        progressMat.color.setHex(0xf59e0b); // Gold on 100% completion!
        progressMat.emissive.setHex(0xd97706);
        headMat.color.setHex(0xfcd34d);
      } else if (clampedPct >= 60) {
        progressMat.color.setHex(0x10b981); // Emerald
        progressMat.emissive.setHex(0x059669);
        headMat.color.setHex(0x34d399);
      } else {
        progressMat.color.setHex(0x06b6d4); // Cyan
        progressMat.emissive.setHex(0x0891b2);
        headMat.color.setHex(0x67e8f9);
      }
    };

    updateProgressGeom(percentage);

    // Mouse tilt interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = -y * 0.45;
      targetY = x * 0.45;
    };

    mount.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animId: number;
    const clock = new THREE.Clock();
    let currentPct = percentage;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth percentage transition if changed
      if (Math.abs(currentPct - percentRef.current) > 0.5) {
        currentPct += (percentRef.current - currentPct) * 0.08;
        updateProgressGeom(currentPct);
      }

      // Smooth mouse follow tilt
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;
      ringGroup.rotation.x = mouseX + Math.sin(elapsedTime * 1.5) * 0.04;
      ringGroup.rotation.y = mouseY + Math.cos(elapsedTime * 1.5) * 0.04;

      innerWire.rotation.z = -elapsedTime * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      trackGeom.dispose();
      trackMat.dispose();
      progressGeom?.dispose();
      progressMat.dispose();
      headGeom.dispose();
      headMat.dispose();
      innerWireGeom.dispose();
      innerWireMat.dispose();
      renderer.dispose();
    };
  }, [size]);

  // Trigger geometry update when percentage prop changes
  useEffect(() => {
    percentRef.current = percentage;
  }, [percentage]);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title={`${percentage}% Daily Progress (${completed}/${total} completed)`}
    >
      {/* Central 3D Stats Hologram Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
          {percentage}%
        </span>
        <span className="text-[11px] font-bold text-emerald-400/90 tracking-widest uppercase mt-0.5">
          {completed} / {total} DONE
        </span>
      </div>

      {/* Ambient background glow ring */}
      <div
        className={`absolute inset-6 rounded-full blur-[35px] pointer-events-none transition-opacity duration-500 ${
          percentage >= 100
            ? 'bg-amber-500/30'
            : percentage >= 60
            ? 'bg-emerald-500/25'
            : 'bg-cyan-500/20'
        }`}
      />
    </div>
  );
};
