import { useGLTF, OrbitControls } from '@react-three/drei'
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { BrgyMeshInfo } from "@/components/Map_3D/meshInfo"
import { GLTF } from "three-stdlib"

interface MapActions {
  handleClick : (name:string) => void
  activeBarangay : string
  clicked : boolean
  targetPosition : [number,number,number] 
  brgyRef : Record<string, THREE.Mesh | null>       
}

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

export const DasMap: React.FC<MapActions> = ({
    handleClick,
    activeBarangay,
    clicked,
    targetPosition,
    brgyRef,
  }) => {
  const { nodes, materials } = useGLTF('./DASMA.glb')
  const BrgyInfo = BrgyMeshInfo ?? []
  nodes.
  return (
      <group position={[-1, 0, -4]} dispose={null}>
        {BrgyInfo.map((brg) => (
            <mesh
              ref={(e) => {if (e) brgyRef.current[brg.name] = e}}
              geometry={nodes.BrgyMeshInfo.name.geometry}
              material={materials['SVGMat.032']}
              position={brg.position as [number,number,number]}
              scale={19.644}
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
        <MoveCam target={activeBarangay ? brgyRef.current[activeBarangay] : null} clicked={clicked} targetPosition={targetPosition} />
      </group>
  )
}

useGLTF.preload('/DASMA.glb')
