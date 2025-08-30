"use client"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, Suspense, useEffect } from "react"
import { Environment, PerspectiveCamera } from "@react-three/drei"
import { DasMap } from "@/components/Map_3D/Map"
import { DasMap2D } from "@/components/Map_2D/Map"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import SideBar from "@/components/sidebarProvider"
import { DashBoard } from '@/components/dashboard/drawer'
import * as THREE from "three"
import { SidebarTrigger } from '@/components/ui/sidebar'
import Header from '../components/Header'
import { Rotate3d, Box } from "lucide-react"

interface RefStruct {
  [key: string]: any
}

export const Route = createFileRoute("/")({
  component: App,
})

export default function App() {
  const [ mapOn, setMapOn ] = useState(false)
  const [autorotate, setautorotate] = useState(true)
  const [activeBarangay, setActiveBarangay] = useState("")
  const [targetPosition, setTargetPosition] = useState([0, 0, 0])
  const [hoveredBrgy, setHoveredBrgy] = useState<string | null>(null)
  const brgyRef = useRef<RefStruct>({})
//
  //Reset Cam on Click
  const resetCamera = () => {
    setTargetPosition([0, 0, 0])
  }

  //Switch Match Mode
  const switchMap = (checked : boolean) => {
      setMapOn(checked)
  }

  //Get Target Position of Clicked and center cam
  const getPosition = (name: string) => {
    const mesh = brgyRef.current[name]
    const box = new THREE.Box3().setFromObject(mesh)
    const center = new THREE.Vector3()
    box.getCenter(center)
    setTargetPosition([center.x, center.y, center.z])
  }

  //Global Click Function
  function handleClick(name: string) {

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
  
  useEffect(() => {
    const map_2d = document.getElementById("2d") as HTMLElement
    const map_3d = document.getElementById("3d") as HTMLElement
    if (mapOn) {
      map_3d.style.display = "block"
      map_2d.style.display = "none"
    } else {
          map_3d.style.display = "none"
      map_2d.style.display = "block"
    } 
  },[mapOn])
  

  return (

    <SideBar
      activeBarangay={activeBarangay}
      targetPosition={[0, 0, 0]}
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
              autorotate === true ? setautorotate(false) : setautorotate(true)
            }
            }
            className="w-[40px] h-[40px] rounded-xl bg-red-600">
            <div>
              <Rotate3d />
            </div>
          </Button>
        </div>
        <div className="fixed top-25 right-2 md:top-8 md:right-15 lg:top-8 lg:right-15 z-50">
          <div className="flex flex-row items-center justify-center text-white font-[Formula]">
            <Label className="mr-2 text-lg">2D</Label>
              <Switch checked={mapOn} onCheckedChange={switchMap} className="mb-1 data-[state=checked]:bg-green-500" />
            <Label className="ml-2 text-lg">3D</Label>
          </div>
        </div>

        {/*/maps/*/} 
        <div className="h-screen w-full" id="3d">
          <Canvas>
            <Suspense fallback={null}>
              <Environment preset="sunset" />
              <PerspectiveCamera makeDefault position={[10, 15, 10]} />
              <DasMap
                activeBarangay={activeBarangay}
                targetPosition={targetPosition as [number, number, number]}
                handleClick={handleClick}
                brgyRef={brgyRef}
                onHover={setHoveredBrgy}
                rotate={autorotate}
              />
            </Suspense>
          </Canvas>
        </div>

        <div id="2d">
          <DasMap2D
            activeBarangay={activeBarangay}
            handleClick={handleClick}
          />
        </div>
        {/*/maps/*/}

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
      <DashBoard handleClick={handleClick} activeBarangay={activeBarangay} />
    </SideBar>
  )
}

