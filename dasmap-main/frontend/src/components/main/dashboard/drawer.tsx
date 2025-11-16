import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "../../ui/button"
import { useState, useEffect, useMemo } from "react"
import { motion, useDragControls } from "framer-motion"
import { Label as Lbl} from "@/components/ui/label"
import React from "react"
import RecovChart from "@/components/main/dashboard/stats/recovery"
import MortalChart from "@/components/main/dashboard/stats/mortality"
import RadarRatio from "@/components/main/dashboard/stats/RMratio"
import TimeSeries from "@/components/main/dashboard/stats/timeseries"
import CaseCount from "@/components/main/dashboard/stats/cases"
import { Label } from "recharts"
import { BrgyMeshInfo } from "../Map_3D/meshInfo.withCoords"
import Papa from "papaparse"
import { barangayAlias } from "@/routes"

interface Prediction {
  BARANGAY: string
  Predicted_Cases: number
  MONTH: number
  YEAR: number
  Risk_Level: string
}

interface DashProps {
  handleClick : (name:string) => void
  activeBarangay: string
  mapOn : boolean
  pred: Array<Prediction>
  predYear: Array<Prediction>
}

export const DashBoard: React.FC<DashProps> = ({
    handleClick,
    activeBarangay,
    mapOn,
    pred,
    predYear
}) => {
    
    const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    ]
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i);
    const [ year, setYear ] = useState("2024")
    const [ month, setMonth] = useState("1")
    const [ open, setOpen ] = useState(false)
    const [ popu, setPopu ] = useState(0)
    const [ pc, setPc] = useState("")
    const [ coord, setCoord ] = useState([0,0])

    useEffect(() => {
        if (activeBarangay == null || activeBarangay == "") {
            setOpen(false)
            setPopu(0)
            setPc("")
            setCoord([0,0])
        } else {
            const delay = setTimeout(() => {setOpen(true)}, mapOn ? 500 : 500)
            const current = BrgyMeshInfo.find(e => e.name === activeBarangay)

            if (current && current.coordinates) {
                setPopu(current?.population2020)
                setPc(current?.pct_of_city)
                setCoord(current?.coordinates)
            }
            
            return () => clearTimeout(delay)
        }
    }, [activeBarangay, mapOn])

    const reverseBarangayAlias: Record<string, string> = Object.entries(barangayAlias).reduce(
        (acc, [key, value]) => {
            if (Array.isArray(value)) {
            value.forEach(v => acc[v] = key)
            } else {
            acc[value] = key
            }
            return acc
        }, {}
        )

    const activePrediction = pred.find(p => {
        const originalName = reverseBarangayAlias[activeBarangay] || activeBarangay.replace(/_/g, " ").toUpperCase()
        
        return p.BARANGAY_NAME === originalName
    })
   
    return (
        <Drawer open={open} preventScrollRestoration={true} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="hidden">Open</Button>
            </DrawerTrigger>
            <DrawerContent className="
                text-center
                lg:text-left
                flex
                
                scroll-hidden
                bg-[#1D2129] 
                font-[Formula] 
                h-[80vh] 
                lg:h-[100%] 
                lg:max-h-[90%] 
                bg-black/[0]
                lg:bg-black/[.70]
            ">
                <div className="
                scroll-hidden
                overflow-y-auto
                h-full
                grid
                grid-cols-1
                p-5">
                    <DrawerHeader className="grid col-span-1 lg:col-span-6 grid-cols-1 lg:grid-cols-8 justify-self-center">
                        <div className="col-span-1 lg:col-span-8 text-white grid lg:grid-cols-10 text-xl gap-5 lg:gap-0 mb-4">
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Barangay Name: {activeBarangay.split("_").join(" ")}
                            </DrawerTitle>
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Estimated Population: {popu}
                            </DrawerTitle>
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                % to the City: {pc}
                            </DrawerTitle>
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Longitude: {coord[0]}
                            </DrawerTitle>
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Latitude: {coord[1]}
                            </DrawerTitle>
                        </div>
                        <div className="col-span-1 lg:col-span-8 text-white grid grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-5 mb-3 justify-self-center">
                            <Lbl className="col-span-2 lg:col-span-3 text-xl">Predictions For</Lbl>
                            <Lbl className="col-span-2 lg:col-span-3 text-xl">{`${activePrediction?.MONTH ? months[activePrediction.MONTH- 1] : ""} ${activePrediction?.YEAR}`}</Lbl>
                        </div>
                        <DrawerDescription className="col-span-1 lg:col-span-8 lg:justify-self-center mt-4">Dashboard Overview and Model Predictions</DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-5 ">
                        <CaseCount predicted={activePrediction} year={activePrediction?.YEAR} month={activePrediction?.MONTH ? months[activePrediction.MONTH - 1] : ""}/>
                        <TimeSeries predictedYear={predYear}/>
                    </div>
                    {/*<SeverityClass risklevel={riskLvl} year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <RecovChart year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <MortalChart year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <RadarRatio />*/}
                </div>
            </DrawerContent>
        </Drawer>
    )
}