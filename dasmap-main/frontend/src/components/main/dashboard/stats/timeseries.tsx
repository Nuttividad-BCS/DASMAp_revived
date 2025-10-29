"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"

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
import { months } from "@/components/admin/dash/batch_predict"

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
}

interface PredictedItem {
  BARANGAY: string
  Predicted_Cases: number
  MONTH: number
  YEAR: number
  Risk_Level: string
}

interface PredYearProps {
  predictedYear: Array<PredictedItem> | null
}

export function ChartTooltipC({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload; // Access the full data object for the month

  return (
    <div className="bg-[#1D2129] p-2 rounded-md border border-gray-600 text-white text-sm shadow-lg">
      <div className="font-bold mb-1">
        {months[(label as number) - 1]} {/* Month name */}
      </div>
      <div className="flex justify-between gap-2">
        <span>Predicted Cases: </span>
        <span>{data?.predicted}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span>Severity Level:</span>
        <span>{data?.risk_level}</span>
      </div>
    </div>
  );
}

export default function TimeSeries({predictedYear} : PredYearProps) {
  const chartData = predictedYear?.map(e => ({
    year: e.YEAR,
    month: e.MONTH,
    predicted: e.Predicted_Cases,
    risk_level: e.Risk_Level
  })) || []

  const chartConfig = {
    month: {
      label: "Month",
      color: "var(--chart-1)",
    },
    predicted: {
      label: "Cases",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col col-span-1 lg:col-span-6 bg-[#282c34] border-[#3d4452] text-white ring-0 ring-red-400 hover:ring-3 transition ease-in-out">
      <CardHeader>
        <CardTitle>Dengue Prediction Forecast for Year: {predictedYear?.[0]?.YEAR ?? "undefined"} </CardTitle>
        <CardDescription>
          Forecasted changes in dengue cases across the selected year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              type="number"
              domain={[0, 20]}         
              tickCount={6}            
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: "Cases",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { textAnchor: "middle", fill: "white", fontSize: 12 },
              }}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => months[value - 1].slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipC />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="predicted"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - December 
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
