import React from 'react';
import * as THREE from 'three';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { MeshWobbleMaterial, OrbitControls } from '@react-three/drei/native';
import { Bridge } from '../map/bridge';
// A simple rotating box component
export function Map() {
  const meshRef = React.useRef<any>(null);
  const { scene } = useThree();
  const bridge = React.useMemo(() => new Bridge(), []);
  React.useEffect(() => {
    if (bridge && scene) {
      bridge.initScene(scene);
    }
  }, [bridge, scene]);
  // Animate rotation
  useFrame((state, delta) => {
    // if (meshRef.current) {
    //   meshRef.current.rotation.x += delta;
    //   meshRef.current.rotation.y += delta * 2.5;
    // }
  });

  return (
    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
  );
}

export function MapView() {
  return (
    <View style={styles.container}>
      <Canvas
        style={{ flex: 1 }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
      >
        {/* Ambient and directional lights */}
        <ambientLight intensity={0.5} />
        {/* <directionalLight position={[10, 10, 5]} intensity={1} castShadow /> */}

        {/* The rotating box */}
        <Map />

        {/* Ground plane to catch shadows */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.5} />
        </mesh>

        {/* Orbit controls for interaction (pinch/rotate on device) */}
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for 3D contrast
  },
});