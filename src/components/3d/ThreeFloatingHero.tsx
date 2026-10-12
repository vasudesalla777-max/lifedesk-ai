import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeFloatingHeroProps {
  className?: string;
}

export const ThreeFloatingHero: React.FC<ThreeFloatingHeroProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Centerpiece Crystal: Dodecahedron with holographic glass/metallic material
    const dodecGeom = new THREE.DodecahedronGeometry(1.8, 0);
    const dodecMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85,
    });
    const dodecMesh = new THREE.Mesh(dodecGeom, dodecMat);
    group.add(dodecMesh);

    // 2. Wireframe Overlay on Crystal
    const wireGeom = new THREE.DodecahedronGeometry(1.82, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    group.add(wireMesh);

    // 3. Floating Orbital Torus Rings
    const ring1Geom = new THREE.TorusGeometry(2.6, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 4;
    group.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(3.1, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.z = Math.PI / 5;
    group.add(ring2);

    // 4. Floating Satellites / Task Nodes
    const nodes: THREE.Mesh[] = [];
    const nodeColors = [0x06b6d4, 0xec4899, 0xf59e0b, 0x10b981];
    for (let i = 0; i < 4; i++) {
      const nodeGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      group.add(nodeMesh);
      nodes.push(nodeMesh);
    }

    // 5. Lights
    const light1 = new THREE.PointLight(0x06b6d4, 3, 50);
    light1.position.set(6, 6, 6);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xf59e0b, 2.5, 50);
    light2.position.set(-6, -6, -6);
    scene.add(light2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = -y * 0.7;
      targetY = x * 0.7;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      group.rotation.x = mouseX + Math.sin(t * 0.5) * 0.05;
      group.rotation.y = mouseY + t * 0.25;

      dodecMesh.rotation.y = t * 0.2;
      dodecMesh.rotation.z = Math.sin(t * 0.3) * 0.1;
      wireMesh.rotation.copy(dodecMesh.rotation);

      ring1.rotation.z += 0.01;
      ring2.rotation.y -= 0.008;

      // Orbit satellites around centerpiece
      nodes.forEach((node, idx) => {
        const angle = t * 0.8 + (idx * Math.PI) / 2;
        const radius = 2.7 + Math.sin(t * 1.2 + idx) * 0.3;
        node.position.x = Math.cos(angle) * radius;
        node.position.y = Math.sin(angle * 0.7) * 1.5;
        node.position.z = Math.sin(angle) * radius;
        node.rotation.x += 0.02;
        node.rotation.y += 0.03;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      dodecGeom.dispose();
      dodecMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[380px] flex items-center justify-center select-none ${className}`}
    >
      {/* Dynamic ambient backdrop glow */}
      <div className="absolute w-72 h-72 rounded-full blur-[80px] bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-amber-500/20 pointer-events-none" />
    </div>
  );
};
