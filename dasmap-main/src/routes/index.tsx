"use client"
import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import { DasMap } from "@/components/Map_3D/Map"
import ExtractPositions from "@/components/Map_3D/files"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-1 justify-content-center">

    </div>
  )
}
