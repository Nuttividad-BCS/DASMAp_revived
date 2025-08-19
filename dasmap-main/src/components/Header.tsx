import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
export default function Header() {
  return (
    <header className="p-4 grid grid-cols-4 bg-red-500">
        <div className="col-span-1 justify-self-start">
          <SidebarTrigger />
        </div>
        <div className="px-2 col-span-2 justify-self-center font-bold">
          <Label className="font-[Formula] text-2xl text-white">D A S M A - P</Label>
        </div>
    </header>
  )
}
