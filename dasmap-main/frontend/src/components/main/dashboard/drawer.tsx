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
import { useState, useEffect } from "react"
import { motion, useDragControls } from "framer-motion"
import { Label as Lbl} from "@/components/ui/label"
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
    const years = Array.from({ length: 16 }, (_, i) => 2010 + i)
    //Open CSV Predictions
    //CHANGE THIS TO SUPABASE QUERYING
    const [ year, setYear ] = useState("2024")
    const [ month, setMonth] = useState("1")
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
                        <div className="col-span-1 lg:col-span-8 text-white grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-5 mb-3">
                            <Lbl className="lg:col-span-1 text-xl lg:justify-self-end">Year:</Lbl>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="w-full col-span-3 lg:col-span-3">
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
                            <Lbl className="lg:col-span-1 text-xl lg:justify-self-end">Month:</Lbl>
                            <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="w-full col-span-3 lg:col-span-3">
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
                        <DrawerDescription className="col-span-1 lg:col-span-8 lg:justify-self-center mt-4">Dashboard Overview and Model Predictions</DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-5 ">
                        <CaseCount predicted={predCases} year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                        <TimeSeries />
                    </div>
                    {/*<SeverityClass risklevel={riskLvl} year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <RecovChart year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <MortalChart year={year} month={month ? months[parseInt(month) - 1] : ""}/>
                    <RadarRatio />
                    <TimeSeries />*/}
                </div>
            </DrawerContent>
        </Drawer>
    )
}