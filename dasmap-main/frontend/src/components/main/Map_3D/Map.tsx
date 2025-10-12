import { useGLTF, OrbitControls } from '@react-three/drei'
import { useRef, useEffect, useState, Suspense } from 'react'
import { useFrame, useThree, extend, invalidate } from "@react-three/fiber"
import * as THREE from 'three'
import { BrgyMeshInfo } from "@/components/main/Map_3D/meshInfo"
import { a, useSpring } from "@react-spring/three"

type vectorFormat = [number,number,number]

interface MoveCamProps {
  target: THREE.Mesh | null
  active: string | null
  targetPosition: [number, number, number]
}

export interface MapActions {
  handleClick : (name:string) => void
  handleHover : (name:string) => void
  activeBarangay : string | null
  targetPosition : vectorFormat
  brgyRef : React.RefObject<Record<string, THREE.Mesh | null>>    
  onHover: (name: string | null) => void 
  rotate: boolean
}

function MoveCam({ target, active, targetPosition }: MoveCamProps) {
  const { camera} = useThree()
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
    handleHover,
    activeBarangay,
    targetPosition,
    brgyRef,
    onHover,
    rotate
  }) => {
    
  const { nodes, materials } = useGLTF('./draco.glb')
  const BrgyInfo = BrgyMeshInfo ?? []
  const mat = materials['SVGMat.032']

  return (  
    <group position={[-1, 1, -2]} dispose={null}>
      {BrgyInfo.map((brg) => {
        const { scale, color, position } = useSpring<{
          scale: [number, number, number]
          color: string
          position: [number, number, number]
        }>({
          scale: brg.scale ? brg.scale :
            brg.name === activeBarangay
              ? [19.644, 19.700, 19] // taller
              : [19.644, 19.644, 19],
          position:
            brg.name === activeBarangay
              ? [
                  (brg.position as vectorFormat)?.[0] ?? 0,
                  ((brg.position as vectorFormat)?.[1] ?? 0) + 0.5,
                  (brg.position as vectorFormat)?.[2] ?? 0,
                ]
              : (brg.position as vectorFormat) ?? [0, 0, 0],
          color: brg.name === activeBarangay ? "red" : "gray",
          config: { duration: 1500 },
        })

        return (
          <a.mesh
            castShadow 
            receiveShadow  
            onPointerOver={() => {if(!activeBarangay) handleHover(brg.name)}}
            onPointerOut={() => {if(!activeBarangay) handleHover('')}}
            key={brg.name}
            ref={(e) => {
              if (e) brgyRef.current[brg.name] = e
            }}
            geometry={(nodes[brg.name] as THREE.Mesh).geometry}
            material={mat}
            position={position}
            rotation={(brg.rotation as vectorFormat) ?? [0, 0, 0]}
            scale={scale} // <-- animated scale
            onClick={() => {
              console.log(`Clicked ${brg.name}`)
              handleClick(brg.name)
            }}
          >
            {/* Animated material color */}
            <a.meshStandardMaterial color={color} />
          </a.mesh>
        )
      })}

      <directionalLight
        castShadow
        position={[10, 20, 10]} 
        intensity={1.5}          
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-near={1}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <Suspense fallback={null}>
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 3}
          dampingFactor={0.25}
          autoRotate={rotate}
          autoRotateSpeed={1}
          enablePan={false}
          minDistance={20}
          maxDistance={60}
          target={new THREE.Vector3(...targetPosition)}
        />
      </Suspense>

      <MoveCam
        target={activeBarangay ? brgyRef.current[activeBarangay] : null}
        active={activeBarangay}
        targetPosition={targetPosition}
      />
    </group>
  )
}

useGLTF.preload('./DASMA-draco.glb')
