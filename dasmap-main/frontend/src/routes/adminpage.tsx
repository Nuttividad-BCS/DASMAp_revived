import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import CurrentAcc from "@/components/admin/dash/acc"
import DropZone from "@/components/admin/dash/drop"
import HistoryList from "@/components/admin/dash/history"
import CsvList from '@/components/admin/dash/csvs'
import Predict from '@/components/admin/dash/batch_predict'

export const Route = createFileRoute('/adminpage')({
  component: RouteComponent,
})


function RouteComponent() {
  
  return (
    <div className="bg-grid min-h-screen">
      <header className="p-4 mb-4 col-span-4 grid grid-cols-4 just bg-red-500">
      <div className="flex justify-self-center col-span-4">
        <img className='w-[55px] ml-1 mr-1'src='./DASMA-P.png' />
        <Label 
          className="
                    font-[Formula] 
                    text-xl
                    lg:text-3xl 
                    text-white
                    justify-self-center
                    ">
          A S M A - P / ADMIN PAGE
        </Label>
      </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="mr-3 ml-3 lg:col-span-1 lg:h-[50vh]">
          <CurrentAcc />
        </div>
        <div className="mr-3 ml-3 lg:col-span-1 lg:h-[50vh]">
          <CsvList />
        </div>
        <div className="mr-3 ml-3 lg:col-span-1 lg:h-[50vh]">
          <Predict />
        </div>
        <div className="mr-3 ml-3 lg:col-span-1 lg:h-[50vh]">
          <DropZone />
        </div>
        <div className="mr-3 ml-3 lg:col-span-4 lg:h-[50vh]">
          <HistoryList />
        </div>
      </div>
    </div>
  )
}
