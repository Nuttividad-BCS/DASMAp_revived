import { useGLTF, OrbitControls, useBoxProjectedEnv } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from 'three'
import { BrgyMeshInfo } from "@/components/Map_3D/meshInfo"

type vectorFormat = [number,number,number]

interface MoveCamProps {
  target: THREE.Mesh | null
  active: string
  targetPosition: [number, number, number]
}

export interface MapActions {
  handleClick : (name:string) => void
  activeBarangay : string
  targetPosition : vectorFormat
  brgyRef : React.RefObject<Record<string, THREE.Mesh | null>>     
}

function MoveCam({ target, active, targetPosition }: MoveCamProps) {
  const { camera } = useThree()
  const startPos = useRef(new THREE.Vector3())
  const controlPos = useRef(new THREE.Vector3())
  const endPos = useRef(new THREE.Vector3())
  const progress = useRef(0)
  const theta = useRef(0)

  useEffect(() => {
    if (active && target) {
      // where we start (camera's current position)
      startPos.current.copy(camera.position)

      // where we want to go (a bit offset from target for a better view)
      const [tx, ty, tz] = targetPosition
      endPos.current.set(tx, ty + 7, tz + 5)

      // control point for curve (above midpoint)
      const mid = startPos.current.clone().add(endPos.current).multiplyScalar(0.5)
      controlPos.current.copy(mid).add(new THREE.Vector3(0, 10, 0)) // lift arc

      progress.current = 0
    }
  }, [active, target, targetPosition, camera])

  useFrame((state, delta) => {
    if (active && target) {
      progress.current = Math.min(progress.current + delta / 2, 1) // ~2 sec fly
      theta.current += delta * 0.15 // orbit spin speed

      // easing for smoother start/stop
      const t = 0.5 - 0.5 * Math.cos(progress.current * Math.PI)

      // quadratic Bezier for fly path
      const pos = new THREE.Vector3()
        .add(startPos.current.clone().multiplyScalar((1 - t) * (1 - t)))
        .add(controlPos.current.clone().multiplyScalar(2 * (1 - t) * t))
        .add(endPos.current.clone().multiplyScalar(t * t))

      // offset pos in orbit (rotate around target)
      const [tx, ty, tz] = targetPosition
      const orbitRadius = pos.distanceTo(new THREE.Vector3(tx, ty, tz))

      const orbitX = tx + orbitRadius * Math.cos(theta.current)
      const orbitZ = tz + orbitRadius * Math.sin(theta.current)

      // keep Y from Bezier but spin X/Z
      state.camera.position.set(orbitX, pos.y, orbitZ)

      // always look at the target
      state.camera.lookAt(tx, ty, tz)
    }
  })
  return null
}



export const DasMap: React.FC<MapActions> = ({
    handleClick,
    activeBarangay,
    targetPosition,
    brgyRef,
  }) => {

  const { nodes, materials } = useGLTF('./DASMA.glb')
  const BrgyInfo = BrgyMeshInfo ?? []

  return (
      <group position={[-1, 0, -4]} dispose={null}>
        {BrgyInfo.map((brg) => (
            <mesh
              key={brg.name}
              ref={(e) => {if (e) brgyRef.current[brg.name] = e}}
              geometry={(nodes[brg.name] as THREE.Mesh).geometry}
              material={materials['SVGMat.032']}
              position={(brg.position as vectorFormat) ?? [0,0,0]}  
              rotation={(brg.rotation as vectorFormat) ?? [0,0,0]}  
              scale={(brg.scale as vectorFormat) ?? 19.644} 
              onClick={() => {
                console.log(`Clicked ${brg.name}`)
                handleClick(brg.name)
              }}
            >
              <meshStandardMaterial color={activeBarangay === brg.name ? 'red' : 'gray'} />
            </mesh>
          ))
        } 
        
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 3}
          dampingFactor={0.25}
          autoRotate 
          autoRotateSpeed={1}
          enablePan={false}
          minDistance={20}
          maxDistance={60}
          target={new THREE.Vector3(...targetPosition)}
        />
        <MoveCam 
          target={activeBarangay ? brgyRef.current[activeBarangay] : null} 
          active={activeBarangay} 
          targetPosition={targetPosition} 
        />
      </group>
  )
}

useGLTF.preload('./DASMA.glb')
