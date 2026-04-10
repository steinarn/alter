"use client";

import { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
// @ts-expect-error — FBXLoader types not bundled with @types/three ^0.154
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TextureLoader } from "three";
import * as THREE from "three";

export function PandaModel(props: JSX.IntrinsicElements["group"]) {
  const fbx = useLoader(FBXLoader, "/panda.fbx");
  const [albedo, metalness, roughness] = useLoader(TextureLoader, [
    "/panda_albedo.jpg",
    "/panda_metalness.jpg",
    "/panda_roughness.jpg",
  ]);

  useEffect(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.needsUpdate = true;
    metalness.needsUpdate = true;
    roughness.needsUpdate = true;

    fbx.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.geometry.attributes.uv) {
          mesh.material = new THREE.MeshStandardMaterial({
            map: albedo,
            metalnessMap: metalness,
            roughnessMap: roughness,
            metalness: 0.2,
            roughness: 0.7,
          });
        }
      }
    });
  }, [fbx, albedo, metalness, roughness]);

  return (
    <group {...props}>
      <primitive object={fbx} />
    </group>
  );
}
