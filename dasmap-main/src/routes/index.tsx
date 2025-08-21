"use client"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, Suspense} from "react"
import { Environment, PerspectiveCamera } from "@react-three/drei"
import { DasMap } from "@/components/Map_3D/Map"
import { Canvas } from '@react-three/fiber'
import SideBar from "@/components/sidebarProvider"
import * as THREE from "three"
import { SidebarTrigger } from '@/components/ui/sidebar'

interface RefStruct {
  [key: string]: any 
}

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [activeBarangay, setActiveBarangay] = useState("")
  const [clicked, setClicked] = useState(false)
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]) 
  const brgyRef = useRef<RefStruct>({}) 

  //Reset Cam on Click
  const resetCamera = () => {
    setClicked(false)
    setTargetPosition([0, 0, 0])
  }

  //Get Target Position of Clicked and center cam
  const getPosition = (name:string) => {
    const mesh = brgyRef.current[name]
    const box = new THREE.Box3().setFromObject(mesh)
    const center = new THREE.Vector3()
    box.getCenter(center)
    setTargetPosition([center.x, center.y, center.z])
  }

  //Global Click Function
  function handleClick(name:string) {
    if (activeBarangay === name) {
        setActiveBarangay("")
        setClicked(false)
        resetCamera()

    } else if (!activeBarangay) {
      setActiveBarangay(name)
      setClicked(true)
      if (brgyRef.current && brgyRef.current[name]) {
        getPosition(name)
      }
    }
  }

  return (
    <SideBar 
      activeBarangay={activeBarangay}
      clicked={clicked}
      targetPosition={[0,0,0]}
      handleClick={handleClick}
      brgyRef={brgyRef}
    >
      <div className="flex flex-1 justify-content-center h-screen bg-[#1D2129]">
        <div className="fixed top-2 left-2 z-50">
          <SidebarTrigger />
        </div>
        <Canvas>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <PerspectiveCamera makeDefault position={[10, 15, 10]} />
            <DasMap
              activeBarangay={activeBarangay}
              clicked={clicked}
              targetPosition={targetPosition as [number,number,number]}
              handleClick={handleClick}
              brgyRef={brgyRef}
            />
          </Suspense>
        </Canvas>
      </div>
    </SideBar>
  )
}
