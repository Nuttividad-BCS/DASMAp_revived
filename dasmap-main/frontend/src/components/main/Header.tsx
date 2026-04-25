import { useNavigate } from "@tanstack/react-router"
import { UserCog } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Header() {
  const navigate = useNavigate()
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center bg-red-500 p-4">
      <div />

      <div className="flex items-center justify-self-center">
        <img className="ml-1 mr-1 w-[55px]" src="./DASMA-P.png" />
        <Label className="justify-self-center font-[Formula] text-3xl text-white">A S M A - P</Label>
      </div>

      <div className="justify-self-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="bg-red-700" onClick={() => navigate({ to: "/adminlog" })}>
              <UserCog />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin Login</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
