import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BARANGAYS } from "@/components/brgy_Table/barangays"
import { Input } from "@/components/ui/input"

function BrgyTable() {
    //Remove "_" from brgy listt
    const BrgyFix = BARANGAYS.map((e) => (e.split("_").join(" ")))

    const [filter, setFilter] = useState("")

    const filtered = BrgyFix.filter((brgy) =>
        brgy.toLowerCase().includes(filter.toLowerCase())
    )

    return  (
        <div className="col-span-1 lg:col-span-2">
        <Input 
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search for a Barangay" 
            className="col-span-1 lg:col-span-2 w-[95%] justify-self-center" />
        <br />
        <Table>
            <TableBody className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {filtered.map((brgy) => (
                    <TableRow key={brgy} className="bg-[#282c34] hover:bg-[#282c34] border-0">
                        <TableCell className="grid font-medium">
                            <Button className="hover:bg-red-500 hover:text-white transition transition-ease-in-out">
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