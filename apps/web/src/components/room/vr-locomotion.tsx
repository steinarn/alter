"use client";

import { useFrame } from "@react-three/fiber";
import { useXR, useController } from "@react-three/xr";
import * as THREE from "three";
import { useRef } from "react";

const direction = new THREE.Vector3();
const tempVec = new THREE.Vector3();
const MOVE_SPEED = 3;
const SNAP_ANGLE = Math.PI / 6; // 30 degrees

export function VRLocomotion() {
  const { player } = useXR();
  const leftController = useController("left");
  const rightController = useController("right");
  const snapReady = useRef(true);

  useFrame((_, delta) => {
    if (!player) return;

    // Left thumbstick: snap turn
    const leftGamepad = leftController?.inputSource?.gamepad;
    if (leftGamepad) {
      const leftX = leftGamepad.axes[2] ?? leftGamepad.axes[0] ?? 0;

      if (Math.abs(leftX) > 0.5) {
        if (snapReady.current) {
          player.rotation.y += Math.sign(-leftX) * SNAP_ANGLE;
          snapReady.current = false;
        }
      } else {
        snapReady.current = true;
      }
    }

    // Right thumbstick: smooth locomotion
    const rightGamepad = rightController?.inputSource?.gamepad;
    if (rightGamepad) {
      const rightX = rightGamepad.axes[2] ?? rightGamepad.axes[0] ?? 0;
      const rightY = rightGamepad.axes[3] ?? rightGamepad.axes[1] ?? 0;

      if (Math.abs(rightX) > 0.15 || Math.abs(rightY) > 0.15) {
        direction.set(-rightX, 0, -rightY);
        direction.applyAxisAngle(tempVec.set(0, 1, 0), player.rotation.y);
        direction.normalize().multiplyScalar(MOVE_SPEED * delta);
        player.position.add(direction);
      }
    }
  });

  return null;
}
