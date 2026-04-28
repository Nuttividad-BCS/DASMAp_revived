"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { FetchModels } from "@/queries/getModels"
import { GetActiveModel } from "@/queries/getActiveModel"
import { ApplyModel } from "@/queries/applyActiveModel"
import { Models } from "@/queries/getModels"

export interface ActiveModel {
  id?: string
  model_name: string
  model_acc: number
  R2: number
  MAE: number
  RMSE: number
  model_status?: boolean
  model_size?: number
  date_created? : Date
  file_url?: string
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function CurrentAcc() {
  const chartData = [
    { browser: "Accuracy", visitors: 100, fill: "var(--color-safari)" }
  ]
  const [models, setModels] = useState<Models[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ActiveModel | null>(null)
  const [activeModel, setActiveModel] = useState<ActiveModel | null>(null)

  useEffect(() => {
  
    const loadModels = async () => {
      const active = await GetActiveModel()
      if (active) setActiveModel(active)

      const fetchedModels = await FetchModels()
      setModels(fetchedModels)
    }
    
    loadModels()
  }, [])


  const handleConfirm = async(id:string) => {
    await ApplyModel(id)
    setOpenDialog(false)
  }

  return (
    <Card className="flex flex-col h-full overflow-y-auto scroll-hidden">
      <CardHeader className="items-center justify-center text-center pb-0">
        <CardTitle>Forecast Datasets</CardTitle>
        <CardDescription>Current Active Dataset: {activeModel?.model_name}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 pb-0 h-full">
        <ChartContainer
          config={chartConfig}
          className="col-span-1 mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={activeModel ? Math.round(activeModel.model_acc * 360): 0}
            innerRadius={50}
            outerRadius={60}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {activeModel ? `${(activeModel.model_acc * 100).toFixed(2)}%` : "Loading..."}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Accuracy
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <Separator />
        <div className="col-span-1 font-[Formula] text-sm overflow-y-auto">
          <Label>
            Model Selection
          </Label>
        <Table className="mt-2 border rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>Model Name</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.length > 0 ? (
            models.map((model) => (
              <TableRow key={model.model_name}>
                <TableCell>{model.model_name}</TableCell>
                <TableCell>
                  <Button
                    size="sm"     
                    onClick={() => {
                      setSelectedModel(model)
                      setOpenDialog(true)
                    }}
                  >
                    Apply
                  </Button>
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
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Model Application</DialogTitle>
              </DialogHeader>
              <p className="my-4">
                Are you sure you want to apply the model <strong>{selectedModel?.model_name}</strong>?
              </p>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  No
                </Button>
                <Button onClick={() => handleConfirm(selectedModel?.id ?? "")}>
                  Yes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableBody>
      </Table>
      </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">

      </CardFooter>
    </Card>
  )
}
