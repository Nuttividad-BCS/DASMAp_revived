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
import React from "react"

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
        if (activeBarangay == "") {
            setOpen(false)
        } else {setTimeout(() => {setOpen(true)},1000)}
    }, [activeBarangay])

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="hidden">Open</Button>
            </DrawerTrigger>
            <DrawerContent className="bg-[#1D2129] font-[Formula]">
                <DrawerHeader>
                <DrawerTitle className="text-white">{activeBarangay.split("_").join(" ")}</DrawerTitle>
                <DrawerDescription>Dashboard Overview and Model Predictions</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}