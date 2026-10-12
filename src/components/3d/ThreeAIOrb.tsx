import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ThreeAIOrbProps {
  state?: 'idle' | 'thinking' | 'active';
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const ThreeAIOrb: React.FC<ThreeAIOrbProps> = ({
  state = 'idle',
  size = 280,
  className = '',
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group to hold all orb elements
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Inner Core Nucleus Sphere
    const coreGeometry = new THREE.SphereGeometry(1.3, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    orbGroup.add(coreMesh);

    // 2. Outer Holographic Wireframe Shell (Icosahedron)
    const shellGeometry = new THREE.IcosahedronGeometry(1.85, 2);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    orbGroup.add(shellMesh);

    // 3. Orbital Gimbal Rings
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const ringGeom1 = new THREE.TorusGeometry(2.3, 0.025, 16, 100);
    const ring1 = new THREE.Mesh(ringGeom1, ringMaterial1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    orbGroup.add(ring1);

    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const ringGeom2 = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
    const ring2 = new THREE.Mesh(ringGeom2, ringMaterial2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    orbGroup.add(ring2);

    // 4. Orbiting Energy Sparkles
    const sparkCount = 80;
    const sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.0 + Math.random() * 0.9;

      sparkPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      sparkPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      sparkPositions[i * 3 + 2] = r * Math.cos(phi);

      // Cyan to Violet sparks
      const isCyan = Math.random() > 0.4;
      sparkColors[i * 3] = isCyan ? 0.02 : 0.65;
      sparkColors[i * 3 + 1] = isCyan ? 0.71 : 0.36;
      sparkColors[i * 3 + 2] = isCyan ? 0.83 : 0.97;
    }

    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    orbGroup.add(sparks);

    // 5. Lighting
    const pointLight1 = new THREE.PointLight(0x06b6d4, 2.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 2.0, 50);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    const ambientLight = new THREE.AmbientLight(0x312e81, 1.2);
    scene.add(ambientLight);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.8;
      targetRotationX = -y * 0.8;
    };

    mount.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const curState = stateRef.current;

      // Speed multipliers based on state
      const speedMult = curState === 'thinking' ? 2.8 : curState === 'active' ? 1.8 : 1.0;

      // Breathing scale oscillation
      const scaleBreath = 1.0 + Math.sin(elapsedTime * 2.5 * speedMult) * (curState === 'thinking' ? 0.08 : 0.03);
      coreMesh.scale.set(scaleBreath, scaleBreath, scaleBreath);

      // Core emissive pulse
      if (curState === 'thinking') {
        coreMaterial.color.setHex(0xf59e0b); // Amber during thinking
        coreMaterial.emissive.setHex(0xd97706);
        coreMaterial.emissiveIntensity = 1.2 + Math.sin(elapsedTime * 8) * 0.5;
        shellMaterial.color.setHex(0xf59e0b);
      } else if (curState === 'active') {
        coreMaterial.color.setHex(0x10b981); // Emerald during active
        coreMaterial.emissive.setHex(0x059669);
        coreMaterial.emissiveIntensity = 1.0;
        shellMaterial.color.setHex(0x34d399);
      } else {
        coreMaterial.color.setHex(0x8b5cf6); // Default violet
        coreMaterial.emissive.setHex(0x6d28d9);
        coreMaterial.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 2) * 0.2;
        shellMaterial.color.setHex(0x06b6d4);
      }

      // Rotations
      shellMesh.rotation.y = elapsedTime * 0.2 * speedMult;
      shellMesh.rotation.x = elapsedTime * 0.15 * speedMult;

      ring1.rotation.z += 0.012 * speedMult;
      ring1.rotation.y += 0.008 * speedMult;

      ring2.rotation.y -= 0.015 * speedMult;
      ring2.rotation.x -= 0.01 * speedMult;

      sparks.rotation.y = -elapsedTime * 0.18 * speedMult;
      sparks.rotation.z = elapsedTime * 0.12 * speedMult;

      // Smooth mouse follow parallax
      mouseX += (targetRotationX - mouseX) * 0.06;
      mouseY += (targetRotationY - mouseY) * 0.06;
      orbGroup.rotation.x = mouseX;
      orbGroup.rotation.y = mouseY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      ringGeom1.dispose();
      ringMaterial1.dispose();
      ringGeom2.dispose();
      ringMaterial2.dispose();
      sparkGeometry.dispose();
      sparkMaterial.dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title="LifeDesk 3D AI Neural Orb"
    >
      {/* Outer ambient glow ring in CSS backdrop for layered depth */}
      <div
        className={`absolute inset-4 rounded-full blur-[45px] pointer-events-none transition-opacity duration-500 ${
          state === 'thinking'
            ? 'bg-amber-500/35 opacity-90 animate-pulse'
            : state === 'active'
            ? 'bg-emerald-500/30 opacity-80'
            : 'bg-violet-600/25 opacity-60'
        }`}
      />
    </div>
  );
};
