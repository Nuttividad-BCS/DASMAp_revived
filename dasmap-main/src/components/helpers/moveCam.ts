import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

function MoveCam({ target, clicked, targetPosition }) {
  useFrame((state) => {
    if (clicked && target) {
      const [tx, ty, tz] = targetPosition
      const targetVec = new THREE.Vector3(tx, ty, tz)
      state.camera.position.lerp(targetVec.clone().add(new THREE.Vector3(0, 5, 5)), 0.05)
      state.camera.lookAt(targetVec)
    }
  })
  return null
}