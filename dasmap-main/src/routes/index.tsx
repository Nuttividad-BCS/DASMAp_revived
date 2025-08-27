"use client"
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, Suspense} from "react"
import { Environment, PerspectiveCamera } from "@react-three/drei"
import { DasMap } from "@/components/Map_3D/Map"
import { Canvas, useFrame, useThree} from '@react-three/fiber'
import SideBar from "@/components/sidebarProvider"
import { DashBoard } from '@/components/dashboard/drawer'
import * as THREE from "three"
import { SidebarTrigger } from '@/components/ui/sidebar'
import Header from '../components/Header'

interface RefStruct {
  [key: string]: any 
}

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [autorotate, setautorotate] = useState(true)
  const [activeBarangay, setActiveBarangay] = useState("")
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]) 
  const [hoveredBrgy, setHoveredBrgy] = useState<string | null>(null)
  const brgyRef = useRef<RefStruct>({}) 

  //Reset Cam on Click
  const resetCamera = () => {
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
        resetCamera()
    } else if (!activeBarangay) {
      setActiveBarangay(name)
      if (brgyRef.current && brgyRef.current[name]) {
        getPosition(name)
      }
    }
  }

  return (
    
    <SideBar 
      activeBarangay={activeBarangay}
      targetPosition={[0,0,0]}
      handleClick={handleClick}
      brgyRef={brgyRef}
      onHover={hoveredBrgy}
    >
      <div className="flex flex-col flex-1 justify-content-center h-screen bg-[#1D2129]">
        <Header />
        <div className="fixed top-2 left-2 z-50">
          <SidebarTrigger />
        </div>
        <div className="fixed top-6 right-2 z-50">
          <Button 
            onClick={() => {
              autorotate === true ? setautorotate(false) : setautorotate(true)}
            } 
            className="w-[20px] h-[30px] rounded-xl bg-blue-300">
            <img src="./controller.svg" 
                 alt="3d Rotate Icon"
                 className='w-[5px]'
                 
            />
          </Button>
        </div>
        <Canvas>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <PerspectiveCamera makeDefault position={[10, 15, 10]} />
            <DasMap
              activeBarangay={activeBarangay}
              targetPosition={targetPosition as [number,number,number]}
              handleClick={handleClick}
              brgyRef={brgyRef}
              onHover={setHoveredBrgy}
              rotate={autorotate}
            />
          </Suspense>
        </Canvas>
        {hoveredBrgy && (
          <div className="
            absolute 
            top-25 
            right-4 
            bg-red-500 
            text-white 
            lg:text-2xl 
            px-2 
            py-1 
            rounded 
          ">
            {hoveredBrgy.split("_").join(" ")}
          </div>
        )}
      </div>
      <DashBoard handleClick={handleClick} activeBarangay={activeBarangay}/>
    </SideBar>
  )
}
