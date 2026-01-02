import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Text,
  Html,
  Sphere,
  MeshDistortMaterial,
  Line,
} from "@react-three/drei";
import * as LucideIcons from "lucide-react";
import * as THREE from "three";

const ConnectionLine = ({ start, end, index }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (!lineRef.current) return;
    const t = state.clock.getElapsedTime();
    // Pulsing effect for the "circuit" line
    lineRef.current.material.opacity = 0.3 + Math.sin(t * 3 + index) * 0.2;
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#00f2ff" // Electric blue
      lineWidth={1.5}
      transparent
      opacity={0.4}
    />
  );
};

const Node = ({ position, label, iconName, index }) => {
  const Icon = LucideIcons[iconName];
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t + index) * 0.05;
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <Sphere args={[0.3, 32, 32]}>
          <MeshDistortMaterial
            color="#4ab3a5"
            speed={2}
            distort={0.3}
            radius={1}
            emissive="#1a4b44"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </Sphere>
        <Html center distanceFactor={8}>
          <div className="node-content">
            <div className="node-icon">
              {Icon && <Icon size={24} color="white" strokeWidth={1.5} />}
            </div>
            <div className="node-label">{label}</div>
          </div>
        </Html>
      </Float>
    </group>
  );
};

const Core = ({ logoUrl, large, reduced }) => {
  const meshRef = useRef();

  // Static core, no rotation or distortion as requested
  const radius = reduced ? 0.8 : large ? 2.5 : 1.0;

  return (
    <group>
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          color="#4a29bb"
          emissive="#241468"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
        />
      </Sphere>
      <Html center distanceFactor={8}>
        <div
          className={`core-logo-container ${
            reduced ? "reduced" : large ? "large" : ""
          }`}
        >
          <img src={logoUrl} alt="Hovera Logo" className="core-logo-img" />
        </div>
      </Html>
    </group>
  );
};

const Scene = ({ chartData, visible, large, showSegments, reduced }) => {
  const sceneRef = useRef();

  useFrame((state) => {
    if (!sceneRef.current) return;
    const targetScale = visible ? 1 : 0;
    sceneRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <group ref={sceneRef} scale={[0, 0, 0]}>
      <Core logoUrl={chartData.center} large={large} reduced={reduced} />

      {showSegments &&
        chartData?.segments?.map((segment, i) => {
          const angle = (i / chartData.segments.length) * Math.PI * 2;
          const radius = large ? 3.0 : 2.0;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const nodePosition = [x, y, 0];

          return (
            <React.Fragment key={i}>
              <ConnectionLine start={[0, 0, 0]} end={nodePosition} index={i} />
              <Node
                index={i}
                position={nodePosition}
                label={segment.label}
                iconName={segment.icon}
              />
            </React.Fragment>
          );
        })}
    </group>
  );
};

const HoveraCore = ({
  chartData,
  visible,
  large,
  showSegments = true,
  reduced = false,
}) => {
  if (!visible) return null;

  return (
    <div className={`hovera-3d-container ${visible ? "visible" : ""}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#4ab3a5" />

        <Scene
          chartData={chartData}
          visible={visible}
          large={large}
          showSegments={showSegments}
          reduced={reduced}
        />
      </Canvas>
    </div>
  );
};

export default HoveraCore;
