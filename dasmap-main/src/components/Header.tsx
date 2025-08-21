import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
export default function Header() {
  return (
    <header className="p-4 grid grid-cols-4 just bg-red-500">
      <Label 
        className="col-span-4 
                  font-[Formula] 
                  text-2xl 
                  text-white
                  justify-self-center
                  ">
        D A S M A - P
      </Label>
    </header>
  )
}
