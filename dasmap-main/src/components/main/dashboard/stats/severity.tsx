"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SeverityClassProps {
  risklevel: string
}

export const description = "A radial chart with stacked sections"

const chartData = [{ month: "january", mobile: 59, max:100 }]

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function SeverityClass({risklevel}:SeverityClassProps) {
  return (
    <Card className="flex flex-col col-span-2 bg-[#282c34] border-[#3d4452] text-white ring-0 ring-red-400 hover:ring-3 transition ease-in-out">
      <CardHeader className="items-center pb-0">
        <CardTitle>Severity Level</CardTitle>
        <CardDescription>For the Month of: </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={130}
          > 
          
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]}>
              <Label
                className="text-white"
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text className="text-white" x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold fill-white"
                        >
                          {risklevel}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground bg-black"
                        >
                          Risk
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            
            <RadialBar
              dataKey="mobile"
              fill={risklevel == 'High' ? 'red' : risklevel == 'Low' ? 'green' : 'orange'}
              cornerRadius={0}
              background={{ fill: "#3d4452" }} // <-- full-track background
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Severity Level for current month
        </div>
      </CardFooter>
    </Card>
  )
}
