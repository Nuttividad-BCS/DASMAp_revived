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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Bug, Info} from "lucide-react"
import TopFive from "@/components/main/outerStats/topfive"
import { GetActiveModel } from "@/queries/getActiveModel"
import { ActiveModel } from "@/components/admin/dash/acc"
import { months } from "@/components/admin/dash/batch_predict"
import Papa from "papaparse"
import { brgy_lbls } from "@/components/main/brgy_Table/brgy_label"
import { supabase } from "@/makeclient"
import { useQuery } from "@tanstack/react-query"
import {toast} from 'sonner'
import Terms from "@/components/main/terms"

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
      "SAN FRANCISCO II": "San_Francisco_II",
      "SAN ROQUE (STA. CRISTINA II)": "San_Roque",
      "SAN SIMON (BARANGAY 7)": "San_Simon",
      "SAN DIONISIO (BARANGAY I)": "San_Dionisio",
      "SANTA MARIA (BARANGAY 20)": "Santa_Maria",
      "SAN JUAN (SAN JUAN I)": "San_Juan",
      "SANTA LUCIA (SAN JUAN II)": "Santa_Lucia",
      "SANTO CRISTO (BARANGAY III)": "Santo_Cristo"
}

export const invertedBarangayAlias: Record<string, string> = {
  "Burol_Main": "BUROL",
  "H2": "H-II",
  "San_IL_I": "SAN ISIDRO LABRADOR I",
  "San_IL_II": "SAN ISIDRO LABRADOR II",
  "Santo_Estoban": "SAN ESTEBAN (BARANGAY IV)",
  "Emannuel_Bergado_I": "EMMANUEL BERGADO I",
  "Emannuel_Bergado_II": "EMMANUEL BERGADO II",
  "St_Peter_I": "SAINT PETER I",
  "St_Peter_II": "SAINT PETER II",
  "San_Nicholas_I": "SAN NICOLAS I",
  "San_Nicholas_II": "SAN NICOLAS II",
  "San_Miguel_I": "SAN MIGUEL",
  "Santo_Nino_I": "SANTO NIÑO I",
  "Santo_Nino_II": "SANTO NIÑO II",
  "San_Lorenzo_Ruis_I": "SAN LORENZO RUIZ I",
  "Zone_I": "ZONE I-B",
  "Zone_IA": "ZONE I",
  "Fatima_I": "FATIMA I",
  "Santa_Fe": "SANTA FE",
  "San_Simon": "SAN SIMON (BARANGAY 7)",
  "San_Francisco_II": "SAN FRANCISCO II",
  "San_Roque": "SAN ROQUE (STA. CRISTINA II)",
  "San_Dionisio": "SAN DIONISIO (BARANGAY I)",
  "Santa_Maria": "SANTA MARIA (BARANGAY 20)",
  "San_Juan": "SAN JUAN (SAN JUAN I)",
  "Santa_Lucia": "SANTA LUCIA (SAN JUAN II)",
  "Santo_Cristo": "SANTO CRISTO (BARANGAY III)",
  "Datu_Esmael": "DATU ESMAEL (BAGO-A-INGUD)"
}

export default function App() {
  const [activeModel, setActiveModel] = useState<ActiveModel | null>(null)
  const [ open, setOpen ] = useState(false)
  const [ openInfo, setOpenInfo ] = useState(true)
  const [ mapOn, setMapOn ] = useState(false)
  const [autorotate, setautorotate] = useState(true)
  const [activeBarangay, setActiveBarangay] = useState("")
  const [targetPosition, setTargetPosition] = useState([0, 0, 0])
  const [hoveredBrgy, setHoveredBrgy] = useState<string | null>(null)
  const brgyRef = useRef<RefStruct>({})
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => 2010 + i)
  const [month_s, setMonth] = useState<string>("")
  const [year_s, setYear] = useState<string>("")
  const [ pred, setPred ] = useState<any[]>([])
  const [ predYear, setPredYear ] = useState<any[]>([])

  //Reset Cam on Click
  const resetCamera = () => {
    setTargetPosition([0, 0, 0])
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

  function normalizeBarangay(name: string) {
      name = name.replace(/\s*\(.*?\)\s*/g, "");
      let formatted = name.toLowerCase().replace(/\s+/g, "_");
      formatted = formatted
        .split("_")
        .map(word =>
          /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(word)
            ? word.toUpperCase()
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("_");
      return formatted;
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
        const historical = supabase
          .storage
          .from("models") 
          .getPublicUrl("main_merged/historical_cases.csv").data.publicUrl

        if (!activeModel) {
          toast("No active model found!")
          return
        }

        // Get CSV URL from active model
        const csvUrl = activeModel.file_url
        if (!csvUrl) {
          toast("No CSV URL available for this model")
          return
        }

        const response = parseInt(year_s) >= 2025 ? await fetch(csvUrl) : await fetch(historical)
        const csvText = await response.text()
        

 
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rows = result.data
        
            // Convert to numbers (CSV loads them as strings)
            const targetYear = parseInt(year_s)
            const targetMonth = parseInt(month_s)
    
            // Filter records that match selected YEAR + MONTH
            const filtered = rows.filter(row => {
              const rowYear = Number(String(row.YEAR || row.year || row.Year).trim())
              const rowMonth = Number(String(row.MONTH || row.month || row.Month).trim())

              return rowYear === targetYear && rowMonth === targetMonth
            })
            
              const labeled = filtered.map(row => ({
                ...row,
                BARANGAY_NAME: brgy_lbls[row.BARANGAY_ID]
              }))

              setPred(labeled) // only matching rows
          },
        })
    }

  
    fetchPredictions()
  }, [month_s, year_s])

  useEffect(() => {
    if (activeBarangay && year_s) {
      
      // 3. Lookup in inverted alias
      const mapped = invertedBarangayAlias[activeBarangay] ?? activeBarangay
      
      const fetchPredictions = async () => {
        if (!activeModel || !activeModel.file_url) {
          toast("No active model CSV available")
          return
        }

        try {
          // Get CSV URL from active model or historical CSV depending on year
          const csvSourceUrl =
            parseInt(year_s) >= 2025
              ? activeModel.file_url
              : supabase
                  .storage
                  .from("models")
                  .getPublicUrl("main_merged/historical_cases.csv").data.publicUrl

          if (!csvSourceUrl) {
            toast("CSV URL not found")
            return
          }

          // Fetch CSV
          const response = await fetch(csvSourceUrl)
          if (!response.ok) {
            toast("Failed to fetch CSV")
            return
          }

          const csvText = await response.text()

          // Parse CSV
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const rows = result.data
              const targetYear = parseInt(year_s)

              // Filter by year AND activeBarangay (match by name)
              const filtered = rows.filter((row) => {
                const rowYear = Number(String(row.YEAR || row.year || row.Year).trim())
                const rowBarangayId = String(row.BARANGAY_ID || row.barangay_id || row.Barangay_ID).trim()
                const rowBarangayName = brgy_lbls[rowBarangayId] || rowBarangayId // fallback

                const normalizedRowName = rowBarangayName.replace(/_/g, " ").toUpperCase()
                const normalizedMapped = mapped.replace(/_/g, " ").toUpperCase()

                return rowYear === targetYear && normalizedRowName === normalizedMapped
              })

              // Add BARANGAY_NAME field for consistency
              const labeled = filtered.map((row) => ({
                ...row,
                BARANGAY_NAME: brgy_lbls[row.BARANGAY_ID] || mapped, // fallback
              }))

              setPredYear(labeled) // all months for that year + barangay
            },
          })
        } catch (err) {
          console.error(err)
          toast("Error fetching CSV data")
        }
      }

      fetchPredictions()
    } else {console.log("Error Occured or Select Year is Empty")}
  }, [activeBarangay, year_s])

  useEffect(() => {
  
    if (pred.length === 0) return;

    // --- CONFIG ---
    const MAX_COLOR_CASES = 32

    function getColor(cases: number) {
      const intensity = Math.min(cases / MAX_COLOR_CASES, 1); // fixed, not dynamic
      const r = 255;
      const g = Math.round(204 - 204 * intensity);
      const b = Math.round(204 - 204 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }

    // Reset all regions first to gray
    const allRegions = document.querySelectorAll("path");
    allRegions.forEach(region => {
      region.style.fill = "#6B6B6B";
    });

    // Apply static color scaling
    pred.forEach(p => {
      const normalized = barangayAlias[p.BARANGAY_NAME] || normalizeBarangay(p.BARANGAY_NAME);
      const region = document.getElementById(normalized);

      if (region) {
        region.style.fill = getColor(p.Predicted_Cases)
      } else {
        console.warn(`No matching region for ${p.BARANGAY_NAME} (${normalized})`);
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
        <Terms openInfo={openInfo} setOpenInfo={setOpenInfo}/>
        <Header />
        
        <div className="fixed top-2 left-2 z-50">
          <SidebarTrigger />
        </div>
        
        <div className="fixed bottom-45 left-10 lg:bottom-16 lg:left-1/2 lg:-translate-x-1/2 z-50 flex gap-4">
          {/* Info Button */}
          <Button
            onClick={() => setOpenInfo(true)}
            className="lg:w-[50px] lg:h-[50px] w-[40px] h-[40px] rounded-4xl bg-red-700"
          >
            <Info />
          </Button>
          {/* How to Use Button - Desktop Only */}
          <Button
            onClick={() => window.open('https://youtu.be/zdFgHLIszH8', '_blank')}
            className="hidden lg:block lg:w-[110px] lg:h-[50px] rounded-4xl bg-red-700"
          >
            <Lbl className="text-sm">How to Use?</Lbl>
          </Button>
        </div>

        <div className="fixed bottom-45 right-5 lg:hidden z-50 flex gap-4">
          {/* How to Use - Mobile Only */}
          <Button
            onClick={() => window.open('https://youtu.be/zdFgHLIszH8', '_blank')}
            className="w-[85px] h-[40px] rounded-4xl bg-red-700"
          >
           <Lbl className="text-sm">How to Use?</Lbl>
          </Button>
        </div>
        
        <div className="fixed lg:bottom-[5%] lg:right-[2.5%] z-50 hidden lg:w-[20vw] lg:max-w-[40vw] lg:block">
          {/* Grid container for case intensity legend and heatmap visualizer */}
          <div className="grid grid-rows-2 place-items-end gap-2">
            {/* Case Intensity Legend */}
            <div className="bg-[#1D2126] h-25 border w-full border-white-600 rounded-lg px-6 py-4 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 mb-4 w-full">
                <span className="text-sm font-semibold text-white">Case Intensity Legend</span>
                <div className="flex items-center gap-4 w-full">
                  <span className="text-xs text-white">0</span>
                  <div className="relative w-full">
                    <div className="w-full h-4 rounded" style={{
                      background: `linear-gradient(to right, 
                        rgb(255, 204, 204), 
                        rgb(255, 153, 153), 
                        rgb(255, 102, 102), 
                        rgb(255, 51, 51), 
                        rgb(255, 0, 0))`
                    }}></div>
                    {/* Gauge markings */}
                    <div className="absolute top-4 left-0 w-full flex justify-between text-xs text-white mt-3">
                      <span className="transform -translate-x-1/2">0</span>
                      <span className="transform -translate-x-1/2">8</span>
                      <span className="transform -translate-x-1/2">16</span>
                      <span className="transform -translate-x-1/2">24</span>
                      <span className="transform translate-x-1/2">30+</span>
                    </div>
                    {/* Tick marks */}
                    <div className="absolute top-0 left-0 w-full flex justify-between">
                      <div className="w-0.5 h-6 bg-white"></div>
                      <div className="w-0.5 h-6 bg-white"></div>
                      <div className="w-0.5 h-6 bg-white"></div>
                      <div className="w-0.5 h-6 bg-white"></div>
                      <div className="w-0.5 h-6 bg-white"></div>
                    </div>
                  </div>
                  <span className="text-xs text-white">30+</span>
                </div>
              </div>
            </div>
            
            {/* Heatmap Visualizer Card */}
            <Card className="flex flex-col w-full h-full bg-[#1D2126] text-white">
            <CardHeader className="items-center text-center justify-center pb-1">
                <CardTitle>Heatmap Visualizer</CardTitle>
                <CardDescription>Change Year and Month Below</CardDescription>
            </CardHeader>
            <CardContent className="grid pb-0 h-full w-full">
                <div className="col-span-1 lg:col-span-8 grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-5 mb-3 font-[Formula] items-center">
                  <Lbl className="lg:col-span-2 text-sm lg:text-md">Year:</Lbl>
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
                  <Lbl className="lg:col-span-2 text-sm lg:text-md lg:justify-self-end">Month:</Lbl>
                  <Select value={month_s} onValueChange={setMonth}>
                  <SelectTrigger className="w-full col-span-3 lg:col-span-6">
                      <SelectValue placeholder="Select a Month" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectGroup>
                      {months
                        .filter((_, index) => !(year_s === "2026" && index > 4))
                        .map((month, index) => (
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
        </div>
        {/* Mobile Case Intensity Legend - Vertical on Right */}
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40 lg:hidden">
          <div className="bg-[#1D2126]/80 bg-opacity-5 border border-white-20 rounded-lg p-1 flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="relative h-60 w-2">
                <div className="w-full h-full rounded" style={{
                  background: `linear-gradient(to bottom, 
                    rgb(255, 0, 0),
                    rgb(255, 51, 51), 
                    rgb(255, 102, 102), 
                    rgb(255, 153, 153), 
                    rgb(255, 204, 204))`
                }}></div>
                {/* Tick marks */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between">
                  <div className="h-0.5 w-3 bg-white -ml-0.5"></div>
                  <div className="h-0.5 w-3 bg-white -ml-0.5"></div>
                  <div className="h-0.5 w-3 bg-white -ml-0.5"></div>
                  <div className="h-0.5 w-3 bg-white -ml-0.5"></div>
                  <div className="h-0.5 w-3 bg-white -ml-0.5"></div>
                </div>
              </div>
              {/* Numerical values beside the bar */}
              <div className="h-48 flex flex-col justify-between text-xs text-white ml-1">
                <span className="transform -translate-y-1/2">30+</span>
                <span className="transform -translate-y-1/2">24</span>
                <span className="transform -translate-y-1/2">16</span>
                <span className="transform -translate-y-1/2">8</span>
                <span className="transform translate-y-1/2">0</span>
              </div>
            </div>
            <div className="flex flex-col items-center mt-2 gap-0.5">
              <span className="text-xs font-semibold text-white">Case</span>
              <span className="text-xs font-semibold text-white">Intensity</span>
            </div>
          </div>
        </div>

        {/* Mobile Heatmap Visualizer Card - Hidden on LG and MD screens */}
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
          <Card className="bg-[#1D2126] text-white border-[#3d4452]">
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-sm font-semibold">
                Heatmap Visualizer
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0 pt-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="space-y-0.5">
                  <Lbl className="text-xs text-white font-[Formula]">Year:</Lbl>
                  <Select value={year_s} onValueChange={setYear}>
                    <SelectTrigger className="w-full bg-[#2a2f38] text-white border-[#3d4452] h-6 text-xs">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-white">Year</SelectLabel>
                        {years.map((year: number) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-0.5">
                  <Lbl className="text-xs text-white font-[Formula]">Month:</Lbl>
                  <Select value={month_s} onValueChange={setMonth}>
                    <SelectTrigger className="w-full bg-[#2a2f38] text-white border-[#3d4452] h-6 text-xs">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {months
                          .filter((_, index) => !(year_s === "2026" && index > 4))
                          .map((month, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0.5 pb-1">
              <Button
                className="w-full h-6 text-xs"
                variant="destructive"
                onClick={() => {
                  setYear("")
                  setMonth("")
                  setPred([])
                }}
              >
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
              <Bug />
            </Button>
          </div>
        )}
        <Label className="text-gray-600 font-[Formula]">Confidence Level: {activeModel ? `${(activeModel.model_acc * 100).toFixed(2)}%` : "Loading..."}</Label>
        <Label className="text-gray-600 font-[Formula]">Last Model Update: November 13, 2025</Label>
  
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
      <DashBoard handleClick={handleClick} activeBarangay={activeBarangay} mapOn={mapOn} pred={pred} predYear={predYear}/>
    </SideBar>
  )
}

