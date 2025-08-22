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
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import { motion, useDragControls } from "framer-motion"
import React from "react"
import RecovChart from "@/components/dashboard/stats/recovery"
import MortalChart from "@/components/dashboard/stats/mortality"
import RadarRatio from "@/components/dashboard/stats/RMratio"

interface DashProps {
  handleClick : (name:string) => void
  activeBarangay: string
}

export const DashBoard: React.FC<DashProps> = ({
    handleClick,
    activeBarangay
}) => {
    const [ open, setOpen ] = useState(false)
    

    useEffect(() => {
        if (activeBarangay == null || activeBarangay == "") {
            setOpen(false)
        } else {setTimeout(() => {setOpen(true)},2000)}
    }, [activeBarangay])

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
                overflow-y-auto
                h-full
                grid
                grid-cols-1
                lg:grid-cols-6
                gap-8
                p-5">
                    <DrawerHeader className="grid col-span-1 lg:col-span-6 grid-cols-1 lg:grid-cols-4 justify-self-center">
                        <DrawerTitle className="col-span-1 lg:col-span-4 text-white">
                            {activeBarangay.split("_").join(" ")}
                        </DrawerTitle>
                        <DrawerDescription className="col-span-1 lg:col-span-4 lg:justify-self-start">Dashboard Overview and Model Predictions</DrawerDescription>
                    </DrawerHeader>
                    <RecovChart />
                    <MortalChart />
                    <RadarRatio />
                </div>
            </DrawerContent>
        </Drawer>
    )
}