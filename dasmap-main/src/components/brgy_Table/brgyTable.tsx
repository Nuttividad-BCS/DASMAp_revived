import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSidebar } from "../ui/sidebar"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BARANGAYS } from "@/components/brgy_Table/barangays"
import { Input } from "@/components/ui/input"
import { CallName } from "../sidebarMain"

export const BrgyTable: React.FC<CallName> = ({
    handleClick,
    activeBarangay
}) => {

    const { setOpen, setOpenMobile } = useSidebar()
    
    //Remove "_" from brgy list
    const BrgyFix = BARANGAYS.map((e) => (e.split("_").join(" ")))
    const [filter, setFilter] = useState("")
    const filtered = BrgyFix.filter((brgy) =>
        brgy.toLowerCase().includes(filter.toLowerCase())
    )

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
                                className={`
                                    hover:ring 
                                    hover:ring-white-2
                                    hover:bg-red-500 
                                    hover:text-white 
                                    transition 
                                    transition-ease-in-out 
                                    ${activeBarangay === brgy.split(" ").join("_") 
                                    ? "bg-red-500 text-white ring ring-white-2" : ""}
                                `}
                                onClick={() => {
                                    handleClick(brgy.split(" ").join("_"))
                                    // setOpen(false) 
                                    setOpenMobile(false)
                                }}
                            >
                                <span className="font-[Formula] lg:text-[11px]">{brgy}</span>
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