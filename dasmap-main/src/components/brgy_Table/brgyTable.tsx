import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { BARANGAYS } from "@/components/brgy_Table/barangays"
import { Input } from "@/components/ui/input"
import { resetCamera } from "@/components/helpers/resetCam"
import * as THREE from 'three'

interface RefStruct {
  [key: string]: any 
}

function BrgyTable() {
    //props for click handling
    const [activeBarangay, setActiveBarangay] = useState("")
    const [clicked, setClicked] = useState(false)
    const [targetPosition, setTargetPosition] = useState([0, 0, 0]) 
    const brgyRef = useRef<RefStruct>({}) 

    //Remove "_" from brgy listt
    const BrgyFix = BARANGAYS.map((e) => (e.split("_").join(" ")))
    const [filter, setFilter] = useState("")
    const filtered = BrgyFix.filter((brgy) =>
        brgy.toLowerCase().includes(filter.toLowerCase())
    )
    //Filtering


    function handleClick(name:string) {

        if (activeBarangay === name) {
            setActiveBarangay("")
            setClicked(false)
            resetCamera(setClicked, setTargetPosition)

        } else if (!activeBarangay) {

            setActiveBarangay(name)
            setClicked(true)

            if (brgyRef.current && brgyRef.current[name]) {
                const mesh = brgyRef.current[name]
                const box = new THREE.Box3().setFromObject(mesh)
                const center = new THREE.Vector3()
                box.getCenter(center)
                setTargetPosition([center.x, center.y, center.z])
            }
        }
    }


    return  (
        <div className="col-span-1 lg:col-span-2 ">
        <Input 
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search for a Barangay" 
            className="col-span-1 lg:col-span-2 w-[95%] justify-self-center" />
        <br />
        <Table>
            <TableBody className="grid gap-4 grid-cols-1 lg:grid-cols-2 overflow-x-hidden">
                {filtered.map((brgy) => (
                    <TableRow key={brgy} className="bg-[#282c34] hover:bg-[#282c34] border-0">
                        <TableCell className="grid font-medium">
                            <Button
                                className="hover:bg-red-500 hover:text-white transition transition-ease-in-out"
                                onClick={() => handleClick(brgy.split(" ").join("_"))}
                            >
                                <span className="font-[Formula]">{brgy}</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </div>
    )
}

export default BrgyTable