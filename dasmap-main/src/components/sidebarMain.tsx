"use client"
import { useState, useRef } from "react"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import BrgyTable from "@/components/brgy_Table/brgyTable"
import * as THREE from "three"

export interface CallName {
  handleClick : (name:string) => void
  activeBarangay: string | null
}

export const AppSidebar: React.FC<CallName> = ({
    handleClick,
    activeBarangay
}) => {
  const { open } = useSidebar()

  return (
    <Sidebar 
    className={`overflow-hidden
        lg:${open ? "w-full lg:w-[30%]" : "w-[0%]"}
      `}
    >
      <SidebarContent className="bg-[#282c34] text-white scroll-smooth w-full">
        <SidebarGroup className="grid gap-4">
          <div className="grid grid-cols-4 gap-2">
            <SidebarTrigger className="col-span-4 justify-self-start invisible" />
            <SidebarGroupLabel className="col-span-4 text-md lg:text-lg text-white font-[Formula]">Dasmarinas Barangays</SidebarGroupLabel>
            <SidebarGroupLabel className="col-span-4 text-[13px] lg:text-md text-white font-[Formula]">Click on a Barangay to view details</SidebarGroupLabel>
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