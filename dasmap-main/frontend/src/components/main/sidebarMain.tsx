"use client"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { UserCog } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import BrgyTable from "@/components/main/brgy_Table/brgyTable"


export interface CallName {
  handleClick : (name:string) => void
  activeBarangay: string | null
}

export const AppSidebar: React.FC<CallName> = ({
    handleClick,
    activeBarangay
}) => {
  const { open } = useSidebar()
  const navigate = useNavigate()
  return (
    <Sidebar 
    className={`overflow-hidden
        lg:${open ? "w-full lg:w-[30%]" : "w-[0%]"}
      `}
    >
      <SidebarContent className="bg-[#282c34] text-white scroll-smooth w-full">
        <SidebarGroup className="grid gap-4">
          <div className="grid grid-cols-4 gap-2 items-center">
            <SidebarTrigger className="col-span-4 justify-self-start invisible" />
            <SidebarGroupLabel className="col-span-4 text-md lg:text-lg text-white font-[Formula]">Dasmarinas Barangays</SidebarGroupLabel>
            <SidebarGroupLabel className="col-span-3 text-[13px] lg:text-md text-white font-[Formula]">Click on a Barangay to view details</SidebarGroupLabel>
            <Tooltip>
              <TooltipTrigger asChild>
              <Button className="col-span-1"
                onClick={() => navigate({to: "/adminlog"})}
              >
                <UserCog />
              </Button>
              </TooltipTrigger>
              <TooltipContent >
                <p>Admin Login</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                 <BrgyTable handleClick={handleClick} activeBarangay={activeBarangay}/>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar