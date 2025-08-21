import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
export default function Header() {
  return (
    <header className="p-4 grid grid-cols-4 just bg-red-500">
      <div className="flex justify-self-center col-span-4">
        <img className='w-[55px] ml-1 mr-1'src='./DASMA-P.png' />
        <Label 
          className="
                    font-[Formula] 
                    text-3xl 
                    text-white
                    justify-self-center
                    ">
          A S M A - P
        </Label>
      </div>
    </header>
  )
}
