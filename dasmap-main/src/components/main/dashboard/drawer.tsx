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
import { Button } from "../../ui/button"
import { useState, useEffect } from "react"
import { motion, useDragControls } from "framer-motion"
import React from "react"
import RecovChart from "@/components/main/dashboard/stats/recovery"
import MortalChart from "@/components/main/dashboard/stats/mortality"
import RadarRatio from "@/components/main/dashboard/stats/RMratio"
import SeverityClass from "@/components/main/dashboard/stats/severity"
import TimeSeries from "@/components/main/dashboard/stats/timeseries"
import CaseCount from "@/components/main/dashboard/stats/cases"
import { Label } from "recharts"
import { BrgyMeshInfo } from "../Map_3D/meshInfo.withCoords"
import Papa from "papaparse"
import fs from "fs"



interface DashProps {
  handleClick : (name:string) => void
  activeBarangay: string
  mapOn : boolean
}

export const DashBoard: React.FC<DashProps> = ({
    handleClick,
    activeBarangay,
    mapOn
}) => {
    //Open CSV Predictions
    //CHANGE THIS TO SUPABASE QUERYING
    const [ predCases, setPredCases ] = useState("")
    const [ riskLvl, setRiskLvl ] = useState("")
    const [ open, setOpen ] = useState(false)
    const [ popu, setPopu ] = useState(0)
    const [ pc, setPc] = useState("")
    const [ coord, setCoord ] = useState([0,0])


    const loadCsv = async () => {
        const response = await fetch("/test_data.csv"); // fetch from /public/data.csv
        const text = await response.text()
        const parsed = Papa.parse(text, { header: true })
        return parsed.data as any[]   
    }

    useEffect(() => {
        if (activeBarangay == null || activeBarangay == "") {
            setOpen(false)
            setPopu(0)
            setPc("")
            setCoord([0,0])
        } else {
            const delay = setTimeout(() => {setOpen(true)}, mapOn ? 2000 : 1000)
            const current = BrgyMeshInfo.find(e => e.name === activeBarangay)

            //Get Predicted data from the CSV
            const fetchCsvAndMatch = async () => {
                try {
                    const result = await loadCsv()
                    const match = result.find(e => e.BARANGAY === current?.name.replace("_"," ").toUpperCase())
                    if (match) {
                        setPredCases(match.Predicted_Cases ?? "")
                        setRiskLvl(match.Risk_Level ?? "")
                    } else {
                        setPredCases("")
                        setRiskLvl("")
                    }
                } 
                catch (err) {
                    console.error(err)
                }
            }
            if (current && current.coordinates) {
                setPopu(current?.population2020)
                setPc(current?.pct_of_city)
                setCoord(current?.coordinates)
            }
            fetchCsvAndMatch()
            return () => clearTimeout(delay)
        }
    }, [activeBarangay, mapOn])

    return (
        <Drawer open={open} preventScrollRestoration={true} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="hidden">Open</Button>
            </DrawerTrigger>
            <DrawerContent className="
                text-center
                lg:text-left
                flex
                items-center
                scroll-hidden
                bg-[#1D2129] 
                font-[Formula] 
                h-[80vh] 
                lg:h-[800px] 
                lg:max-h-[500px] 
                bg-black/[0]
                lg:bg-black/[.70]
            ">
                <div className="
                scroll-hidden
                overflow-y-auto
                h-full
                grid
                grid-cols-1
                lg:grid-cols-6
                gap-8
                p-5">
                    <DrawerHeader className="grid col-span-1 lg:col-span-6 grid-cols-1 lg:grid-cols-4 justify-self-center">
                        <div className="col-span-1 lg:col-span-4 text-white grid lg:grid-cols-10 text-xl gap-5 lg:gap-0">
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Barangay Name: {activeBarangay.split("_").join(" ")}
                            </DrawerTitle>
                            <DrawerTitle className="col-span-1 lg:col-span-2 text-white ">
                                Population: {popu}
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
                        <DrawerDescription className="col-span-1 lg:col-span-8 lg:justify-self-center">Dashboard Overview and Model Predictions</DrawerDescription>
                    </DrawerHeader>
                    <CaseCount predicted={predCases}/>
                    <SeverityClass risklevel={riskLvl}/>
                    <RecovChart />
                    <MortalChart />
                    <RadarRatio />
                    <TimeSeries />
                </div>
            </DrawerContent>
        </Drawer>
    )
}