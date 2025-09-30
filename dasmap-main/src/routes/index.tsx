"use client"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, Suspense, useEffect } from "react"
import { Environment, PerspectiveCamera, AdaptiveDpr} from "@react-three/drei"
import { DasMap } from "@/components/main/Map_3D/Map"
import { DasMap2D } from "@/components/main/Map_2D/Map"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import SideBar from "@/components/main/sidebarProvider"
import { DashBoard } from '@/components/main/dashboard/drawer'
import * as THREE from "three"
import { SidebarTrigger } from '@/components/ui/sidebar'
import Header from '../components/main/Header'
import { Rotate3d, Flame} from "lucide-react"
import Terms from "@/components/main/terms"


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
      resetCamera()
      setMapOn(checked)
      setActiveBarangay("")
  }

  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleHover = (name: string | null) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    hoverTimeout.current = setTimeout(() => {
      setHoveredBrgy(name)
    }, 30)
  };

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
    if (activeBarangay === name && mapOn) {
      setActiveBarangay("")
      resetCamera()
    } else if (activeBarangay && !mapOn){
      setActiveBarangay("")
      setTimeout(() => setActiveBarangay(name), 0)
    } 
    else if (!activeBarangay) {
      setActiveBarangay(name)
      if (brgyRef.current && brgyRef.current[name]) {
        getPosition(name)
      }
    }
  }
  
  return (

    <SideBar
      activeBarangay={activeBarangay}
      targetPosition={[0, 0, 0]}
      handleClick={handleClick}
      brgyRef={brgyRef}
      onHover={hoveredBrgy}
    >
      <div className="flex flex-col flex-1 justify-content-center min-h-screen bg-[#1D2129]">
        <Header />
        <div className="fixed top-2 left-2 z-50">
          <SidebarTrigger />
        </div>
        <div className="fixed top-[20%] left-[5%] lg:top-[15%] lg:left-[20%] z-50 w-[90vw] lg:w-[60vw]">
          <Terms />
        </div>
        <div className="fixed top-6 right-2 lg:right-20 z-50 ">
            <Button
              onClick={() => {
                autorotate === true ? setautorotate(false) : setautorotate(true)
              }
              }
              className="w-[30px] h-[40px] lg:w-[40px] lg:h-[40px] rounded-xl bg-red-700"
            >
              <Flame />
            </Button>
          </div>
        {mapOn && (
          <div className="fixed top-6 right-11 lg:right-5 z-50">
            <Button
              onClick={() => {
                autorotate === true ? setautorotate(false) : setautorotate(true)
              }
              }
              className="w-[30px] h-[40px] lg:w-[40px] lg:h-[40px] rounded-xl bg-red-700"
            >
              <Rotate3d />
            </Button>
          </div>
        )}
        <div className="fixed top-25 right-2 md:top-8 md:right-35 lg:top-8 lg:right-35 z-50">
          <div className="flex flex-row items-center justify-center text-white font-[Formula]">
            <Label className="mr-2 text-lg">2D</Label>
              <Switch checked={mapOn} onCheckedChange={switchMap} className="mb-1 data-[state=checked]:bg-green-500" />
            <Label className="ml-2 text-lg">3D</Label>
          </div>
        </div>

        {/*/maps/*/} 
        {mapOn && (
          <div className="h-screen w-full">
            <Canvas 
              shadows 
              camera={{ position: [0, 5, 15], fov: 50 }} 
              frameloop="always" dpr={[0.6,1]}>
              <AdaptiveDpr pixelated />
              <ambientLight intensity={0.7} />
              <directionalLight position={[20, 5, 10]} intensity={0.8} />
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[10, 15, 10]} />
                <DasMap
                  activeBarangay={activeBarangay}
                  targetPosition={targetPosition as [number, number, number]}
                  handleClick={handleClick}
                  handleHover={handleHover}
                  brgyRef={brgyRef}
                  onHover={setHoveredBrgy}
                  rotate={autorotate}
                />
                <gridHelper args={[1000, 100, "white", "gray"]} />
              </Suspense>
            </Canvas>
          </div>
        )}

        {!mapOn && (
          <div className="w-full">
          <DasMap2D
            activeBarangay={activeBarangay}
            handleClick={handleClick}
            onHover={setHoveredBrgy}
          />
        </div>
        )}
        
        {/*/maps/*/}
        <div className={`absolute ... ${hoveredBrgy ? "opacity-100" : "opacity-0"}
            top-35
            lg:top-25
            right-4 
            bg-red-500 
            text-white 
            lg:text-2xl 
            px-2 
            py-1 
            rounded `}>
          {hoveredBrgy?.split("_").join(" ")}
        </div>
      </div>
      <DashBoard handleClick={handleClick} activeBarangay={activeBarangay} mapOn={mapOn}/>
    </SideBar>
  )
}

