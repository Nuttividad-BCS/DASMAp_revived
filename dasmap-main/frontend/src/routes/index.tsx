"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label as Lbl} from "@/components/ui/label"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, Suspense, useEffect, useMemo } from "react"
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
import TopFive from "@/components/main/outerStats/topfive"
import { GetActiveModel } from "@/queries/getActiveModel"
import { ActiveModel } from "@/components/admin/dash/acc"
import { months } from "@/components/admin/dash/batch_predict"

interface RefStruct {
  [key: string]: any
}

export const Route = createFileRoute("/")({
  component: App,
})

export const barangayAlias: Record<string, string | Array<string>> = {
      "BUROL": "Burol_Main",
      "H-II": "H2",
      "SAN ISIDRO LABRADOR I": "San_IL_I",
      "SAN ISIDRO LABRADOR II": "San_IL_II",
      "SAN ESTEBAN (BARANGAY IV)": "Santo_Estoban",
      "EMMANUEL BERGADO I": "Emannuel_Bergado_I",
      "EMMANUEL BERGADO II": "Emannuel_Bergado_II",
      "SAINT PETER I": "St_Peter_I",
      "SAINT PETER II": "St_Peter_II",
      "SAN NICOLAS I": "San_Nicholas_I",
      "SAN NICOLAS II": "San_Nicholas_II",
      "SAN MIGUEL": "San_Miguel_I",
      "SANTO NIÑO I": "Santo_Nino_I",
      "SANTO NIÑO II": "Santo_Nino_II",
      "SAN LORENZO RUIZ I": "San_Lorenzo_Ruis_I",
      "ZONE I-B": "Zone_I",
      "ZONE I": "Zone_IA",
      "FATIMA I": "Fatima_I",
      "SANTA FE": "Santa_Fe",
      "SAN SIMON": "San_Simon",
      "SAN FRANCISCO II": "San_Francisco_II"
}

export default function App() {
  const [activeModel, setActiveModel] = useState<ActiveModel | null>(null)
  const [ mapOn, setMapOn ] = useState(false)
  const [autorotate, setautorotate] = useState(true)
  const [activeBarangay, setActiveBarangay] = useState("")
  const [targetPosition, setTargetPosition] = useState([0, 0, 0])
  const [hoveredBrgy, setHoveredBrgy] = useState<string | null>(null)
  const brgyRef = useRef<RefStruct>({})
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i)
  const [month_s, setMonth] = useState<string>("")
  const [year_s, setYear] = useState<string>("")
  const [ pred, setPred ] = useState<any[]>([])

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

  useEffect(() => {
    const loadModels = async () => {
      const active = await GetActiveModel()
      setActiveModel(active)
    }
    loadModels()
  }, [])

  useEffect(() => {
    const allRegions = document.querySelectorAll("path");

    // If month_s or year_s is not set, shade all gray and exit
    if (!month_s || !year_s) {
      allRegions.forEach(region => {
        region.style.fill = "#6B6B6B";
      });
    return;
  }

    const fetchPredictions = async () => {
      const response = await fetch("https://dasmaprevived-production.up.railway.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: parseInt(year_s), month: parseInt(month_s) }),
      });

      const data = await response.json();
      setPred(data)
    };

    fetchPredictions();
  }, [month_s, year_s]);

  useEffect(() => {
    if (pred.length === 0) return;

    const minCases = Math.min(...pred.map(p => p.Predicted_Cases));
    const maxCases = Math.max(...pred.map(p => p.Predicted_Cases));

    function getColor(intensity: number) {
      const r = 255;
      const g = Math.round(204 - 204 * intensity);
      const b = Math.round(204 - 204 * intensity);
      return `rgb(${r},${g},${b})`;
    }

    function normalizeBarangay(name: string) {
      name = name.replace(/\s*\(.*?\)\s*/g, "");
      let formatted = name.toLowerCase().replace(/\s+/g, "_");
      formatted = formatted
        .split("_")
        .map(word => (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(word)
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1)))
        .join("_");
      return formatted;
    }

    // Reset all first to gray before recoloring
    const allRegions = document.querySelectorAll("path");
    allRegions.forEach(region => {
      region.style.fill = "#6B6B6B";
    });

    pred.forEach(p => {
      const normalized = barangayAlias[p.BARANGAY] || normalizeBarangay(p.BARANGAY);
      const region = document.getElementById(normalized);

      const intensity = (p.Predicted_Cases - minCases) / (maxCases - minCases);
      const id = normalizeBarangay(p.BARANGAY);

      if (region) {
        region.style.fill = getColor(intensity);
      } else {
        console.warn(`No matching region for ${p.BARANGAY} (${id})`);
      }
    });
  }, [pred]);


  
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
        <div className="fixed lg:bottom-[5%] lg:right-[2.5%] z-50 ">
            <Card className="flex flex-col h-full bg-[#1D2126] text-white">
            <CardHeader className="items-center text-center justify-center pb-1">
                <CardTitle>Heatmap Visualizer</CardTitle>
                <CardDescription>Change Year and Month Below</CardDescription>
            </CardHeader>
            <CardContent className="grid pb-0 h-full w-full">
                <div className="col-span-1 lg:col-span-8 grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-5 mb-3 font-[Formula] items-center">
                  <Lbl className="lg:col-span-2 text-xl">Year:</Lbl>
                  <Select value={year_s} onValueChange={setYear}>
                      <SelectTrigger className="w-full col-span-3 lg:col-span-6">
                          <SelectValue placeholder="Select a Year" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>Year</SelectLabel>
                          {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                              {year}
                              </SelectItem>
                          ))}
                          </SelectGroup>
                      </SelectContent>
                  </Select>
                  <Lbl className="lg:col-span-2 text-xl lg:justify-self-end">Month:</Lbl>
                  <Select value={month_s} onValueChange={setMonth}>
                  <SelectTrigger className="w-full col-span-3 lg:col-span-6">
                      <SelectValue placeholder="Select a Month" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectGroup>
                      {months.map((month, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                          </SelectItem>
                      ))}
                      </SelectGroup>
                  </SelectContent>
                  </Select>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 text-sm">
                <Button onClick={() => {
                  setYear("") 
                  setMonth("")
                  setPred([])
                }
                }>
                  Heatmap Off
                </Button>
            </CardFooter>
        </Card>
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
        <Label className="text-gray-600 font-[Formula]">Confidence Level: {activeModel ? `${(activeModel.model_acc * 100).toFixed(2)}%` : "Loading..."}</Label>
        <Label className="text-gray-600 font-[Formula]">Last Model Update: January 1, 2025</Label>
  
        {/*
        <div className={`h-screen w-full`}>
          <Canvas 
            style={{ display: mapOn ? "block" : "none" }}
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
    */}


        {!mapOn && (
          <div className="w-full">
          <DasMap2D
            activeBarangay={activeBarangay}
            handleClick={handleClick}
            onHover={setHoveredBrgy}
          />
        </div>
        )}
      
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
      <DashBoard handleClick={handleClick} activeBarangay={activeBarangay} mapOn={mapOn} pred={pred}/>
    </SideBar>
  )
}

