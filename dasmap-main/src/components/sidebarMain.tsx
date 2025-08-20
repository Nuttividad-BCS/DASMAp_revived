"use client"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import BrgyTable from "@/components/brgy_Table/brgyTable"

export function AppSidebar() {
  const { open } = useSidebar()

  return (
    <Sidebar 
    className={`overflow-hidden
        lg:${open ? "w-full lg:w-[35%]" : "w-[0%]"}
      `}
    >
      <SidebarContent className="bg-[#282c34] text-white scroll-smooth w-full">
        <SidebarGroup className="grid gap-4">
          <div className="grid grid-cols-4 ">
            <SidebarGroupLabel className="col-span-3 text-md lg:text-lg text-white font-[Formula]">Dasmarinas Barangays</SidebarGroupLabel>
            <SidebarTrigger className="col-span-1 justify-self-end" />
            <SidebarGroupLabel className="col-span-3 text-sm lg:text-md text-white font-[Formula]">Click on a Barangay to view details</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                 <BrgyTable />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar