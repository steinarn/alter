"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SoftShadows, Float, CameraControls, Sky } from "@react-three/drei";
import { easing } from "maath";
import { XR, Controllers, Hands, TeleportationPlane } from "@react-three/xr";
import { RoomModel } from "./room-model";
import { PandaModel } from "./panda-model";
import { VRLocomotion } from "./vr-locomotion";
import { PandaUI } from "./panda-ui";

function Light() {
  const ref = useRef<any>(null);
  useFrame((state, delta) => {
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
      0.2,
      delta
    );
  });
  return (
    <group ref={ref}>
      <directionalLight
        position={[5, 3, -8]}
        castShadow
        intensity={5}
        shadow-mapSize={2048}
        shadow-bias={-0.001}
      >
        <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
      </directionalLight>
    </group>
  );
}

const PANDA_POSITION: [number, number, number] = [0, -0.5, -3.05];

interface RoomSceneProps {
  userName: string;
  userId: string;
}

export function RoomScene({ userName, userId }: RoomSceneProps) {
  return (
    <Canvas shadows camera={{ position: [5, 2, 10], fov: 50 }}>
      <XR>
        <Controllers />
        <Hands />
        <TeleportationPlane leftHand rightHand maxDistance={10} />
        <VRLocomotion />

        <SoftShadows size={35} focus={0.5} samples={16} />
        <CameraControls makeDefault />

        <color attach="background" args={["#d0d0d0"]} />
        <fog attach="fog" args={["#d0d0d0", 8, 35]} />
        <ambientLight intensity={0.4} />
        <Light />

        <RoomModel scale={0.5} position={[0, -1, 0]} />
        <PandaModel scale={0.032} position={PANDA_POSITION} rotation={[0, -Math.PI / 2, 0]} />
        <PandaUI pandaPosition={PANDA_POSITION} userId={userId} userName={userName} />

        <Float floatIntensity={15}>
          <mesh castShadow position={[0, 5, -8]}>
            <sphereGeometry />
            <meshBasicMaterial color="hotpink" />
          </mesh>
        </Float>
        <Float floatIntensity={15}>
          <mesh castShadow position={[2, 4, -8]} scale={0.9}>
            <sphereGeometry />
            <meshBasicMaterial color="pink" />
          </mesh>
        </Float>
        <Float floatIntensity={15}>
          <mesh castShadow position={[-2, 2, -8]} scale={0.8}>
            <sphereGeometry />
            <meshBasicMaterial color="lightpink" />
          </mesh>
        </Float>

        <Sky inclination={0.52} distance={20} />
      </XR>
    </Canvas>
  );
}
