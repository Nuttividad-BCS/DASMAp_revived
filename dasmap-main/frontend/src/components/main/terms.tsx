import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button'
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect} from "react"
import { toast } from "sonner"

export default function Terms({openInfo, setOpenInfo} : {openInfo:boolean, setOpenInfo:(value:boolean) => void }) {
    return (
        <Dialog open={openInfo} onOpenChange={setOpenInfo}>
            <DialogContent 
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="grid grid-cols-1 bg-[#1D2129] text-white h-[70vh] lg:h-[80vh] overflow-hidden">
            <div className="grid grid-cols-1 col-span-1 overflow-y-auto gap-3">
            <DialogHeader className="grid grid-cols-1 col-span-1 justify-center">
                <DialogTitle className="col-span-1 justify-self-center">Notes and Information</DialogTitle>
                <DialogDescription className="col-span-1 justify-self-center">Before using, please refer to the information below.</DialogDescription>
            </DialogHeader>
                <Separator/>
                <ul className="list-disc pl-6 space-y-2 text-md text-justify">
                    <li>
                        This system helps track dengue trends in each barangay in Dasmariñas by looking at <strong>past case records, weather patterns, and population</strong> data to estimate possible monthly cases.
                    </li>

                    <li>
                        The forecasts are based on data from <strong>2010–2024</strong>, so the projected results cover <strong>January 2025 to May 2026</strong>.
                    </li>

                    <li>
                        These <strong>predictions are only estimates</strong>. Actual dengue cases may vary due to sudden changes in weather, environment, or other real-world conditions.
                    </li>
                    <li>
                        Some barangays may have <strong>limited historical data</strong>. Predictions for these areas may be less accurate.   
                    </li>
                    <li>
                       As more recent data becomes available, the system can be updated to improve accuracy. 
                    </li>
                    <li>
                        Poplation data is <strong>ESTIMATED</strong> using the growth rate from philatlas.com and is <strong>NOT EXACT</strong>.
                    </li>
                </ul>
                <Button 
                    onClick={() => {setOpenInfo(false)}}
                    className="w-[40%] justify-self-center"
                >
                    Continue
                </Button>
                <DialogFooter className="grid justify-self-center">
                    <Label className="justify-self-center font-[Formula]">D A S M A - P</Label>
                </DialogFooter>
            </div>
            </DialogContent>
        </Dialog>
    )
}