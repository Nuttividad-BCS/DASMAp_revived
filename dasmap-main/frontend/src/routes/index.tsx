"use client"
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"

import Header from '../components/main/Header'
import { Bug, Info} from "lucide-react"
import Terms from "@/components/main/terms"
import PowerBiDash from "@/components/main/powerbiDash"


export const Route = createFileRoute("/")({
  component: App,
})

export default function App() {
  const [ openInfo, setOpenInfo ] = useState(true)
    return (
      <div className="flex flex-col flex-1 justify-content-center min-h-screen bg-[#1D2129]">
        <Terms openInfo={openInfo} setOpenInfo={setOpenInfo}/>
        <Header />
        
        <div className="fixed bottom-45 left-10 lg:bottom-16 lg:left-1/2 lg:-translate-x-1/2 z-50 flex gap-4">
          {/* Info Button */}
          <Button
            onClick={() => setOpenInfo(true)}
            className="lg:w-[50px] lg:h-[50px] w-[40px] h-[40px] rounded-4xl bg-red-700"
          >
            <Info />
          </Button>
          {/* How to Use Button - Desktop Only 
          <Button
            onClick={() => window.open('https://youtu.be/zdFgHLIszH8', '_blank')}
            className="hidden lg:block lg:w-[110px] lg:h-[50px] rounded-4xl bg-red-700"
          >
            <Lbl className="text-sm">How to Use?</Lbl>
          </Button>
          */}
        </div>
        <PowerBiDash />
      </div>
    
  )
}

