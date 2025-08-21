import { useGLTF, OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { BrgyMeshInfo } from "@/components/Map_3D/meshInfo"

export interface MapActions {
  handleClick : (name:string) => void
  activeBarangay : string
  clicked : boolean
  targetPosition : [number,number,number] 
  brgyRef : React.RefObject<Record<string, THREE.Mesh | null>>     
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
  const targetVec = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition])

  return (
      <group position={[-1, 0, -4]} dispose={null}>
        {BrgyInfo.map((brg) => (
            <mesh
              key={brg.name}
              ref={(e) => {if (e) brgyRef.current[brg.name] = e}}
              geometry={(nodes[brg.name] as THREE.Mesh).geometry}
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
        <mesh
          ref={(el) => {if (el) brgyRef.current["Zone_IA"] = el}}
          onClick={() => {
            console.log("Clicked Zone_IA")
            handleClick('Zone_IA')
          }}
          geometry={(nodes.Zone_IA as THREE.Mesh).geometry}
          material={materials['SVGMat.032']}
          position={[-4.353, 0.012, -1.319]}
          rotation={[Math.PI, -0.052, Math.PI]}
          scale={[-45.186, -20.06, -45.186]}
        >
          <meshStandardMaterial color={activeBarangay ==='Zone_IA' ? 'red' : 'gray'}/>
        </mesh>
        <mesh
          ref={(el) => {if (el) brgyRef.current["Victoria_Reyes"] = el}}
          onClick={() => {
            console.log("Clicked Victoria_Reyes")
            handleClick('Victoria_Reyes')
          }}
          geometry={(nodes.Victoria_Reyes as THREE.Mesh).geometry}
          material={materials['SVGMat.032']}
          position={[2.999, 0.011, 1.468]}
          scale={[51.524, 19.433, 51.524]}
        >
          <meshStandardMaterial color={activeBarangay ==='Victoria_Reyes' ? 'red' : 'gray'}/>
        </mesh>
        <mesh
          ref={(el) => {if (el) brgyRef.current["Zone_IV"] = el}}
          onClick={() => {
            console.log("Clicked Zone_IV")
            handleClick('Zone_IV')
          }}
          geometry={(nodes.Zone_IV as THREE.Mesh).geometry}
          material={materials['SVGMat.032']}
          position={[-4.006, 0.015, -0.041]}
          scale={[43.436, 19.131, 43.436]}
        >
          <meshStandardMaterial color={activeBarangay ==='Zone_IV' ? 'red' : 'gray'}/>
        </mesh>
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

      </group>
  )
}

useGLTF.preload('./DASMA.glb')
