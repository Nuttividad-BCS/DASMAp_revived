import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FetchModels } from "@/queries/getModels"
import { useState, useEffect } from "react"
import { ActiveModel } from "./acc"

export default function HistoryList() {
    const [models, setModels] = useState<ActiveModel[]>([])

    useEffect(() => {
      
    const loadModels = async () => {
      const fetchedModels = await FetchModels()
      setModels(fetchedModels)
    }
    
    loadModels()
  }, [])

    return (
        <Table className="mt-2 border rounded-xl bg-white border-none">
        <TableHeader>
          <TableRow className="bg-gray-200 hover:none pointer-events-none">
            <TableHead className="rounded-tl-xl">Model Name</TableHead>
            <TableHead>Accuracy</TableHead>
            <TableHead>Model Size</TableHead>
            <TableHead>Model Status</TableHead>
            <TableHead className="rounded-tr-xl">Date Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="pointer-events-none">
          {models.length > 0 ? (
            models.map((model) => (
              <TableRow key={model.model_name}>
                <TableCell>{model.model_name}</TableCell>
                <TableCell>{(model.model_acc * 100).toFixed(2)}%</TableCell>
                <TableCell>{`${model.model_size} MB`}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span
                        className={`h-2.5 w-2.5 rounded-full ${
                            model.model_status ? "bg-green-500" : "bg-gray-400"
                        }`}
                        />
                        <span
                        className={model.model_status ? "text-green-600 font-medium" : "text-gray-500"}
                        >
                        {model.model_status ? "Active" : "Disabled"}
                        </span>
                    </div>
                </TableCell>                
                <TableCell>{model.date_created
                            ? new Date(model.date_created).toLocaleDateString()
                            : "—"}
                </TableCell>
              </TableRow>
              
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-3">
                No models found
              </TableCell>
            </TableRow>
          )
          }
        </TableBody>
      </Table>
    )
}

