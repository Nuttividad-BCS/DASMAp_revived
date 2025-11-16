"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { Label as Lbl} from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

interface PredCasesProps {
   predicted: {
    BARANGAY: string
    Risk_Level: string
    Predicted_Cases: number
  } | null
  year: string
  month: string
}

export const description = "A radial chart with text"

export default function CaseCount({predicted,year,month} : PredCasesProps) {
  const totalCases = predicted?.Predicted_Cases ?? 0
  const visibleValue = totalCases === 0 ? 0.1 : totalCases
  const chartData = [
    { 
      name: "Predicted Cases", 
      value: visibleValue, 
      fill: totalCases > 4 ? "#ff6060" : totalCases > 2 ? "#ff963a" : "#69ff79" 
    },
  ];

  const chartConfig = {
    value: {
      label: "Predicted Cases",
    },
  } satisfies ChartConfig
  return (
    <Card className="flex flex-col col-span-1 lg:col-span-2 bg-[#282c34] border-[#3d4452] text-white ring-0 ring-red-400 hover:ring-3 transition ease-in-out">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Predicted Cases</CardTitle>
        <CardDescription>For the Month and year of: {`${month}, ${year}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 justify-center items-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl fill-white font-bold"
                        >
                          {predicted?.Predicted_Cases.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Cases
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="value"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-desktop)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
        <Lbl className="grid grid-cols-6 justify-self-center items-center gap-2">
          <span className="col-span-4">SEVERITY LEVEL : </span>
          <span style={{
              color: totalCases > 4 ? "#ff6060" : totalCases > 2 ? "#ff963a" : "#69ff79"
            }} className="relative w-3 h-3 col-span-2">
            <span className="absolute inset-0 rounded-full border-2 border-current"></span>
            <span className="absolute inset-1 rounded-full bg-transparent"></span>
            <span className="absolute inset-0 ml-4">
            {predicted?.Predicted_Cases !== undefined
              ? Number(predicted.Predicted_Cases) > 7
                ? "High"
                : Number(predicted.Predicted_Cases) > 3
                ? "Medium"
                : "Low"
              : "-"}
          </span>
          </span> 
        </Lbl>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium mb-5">
          Month of {month} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}