import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebarMain"
import { MapActions } from "./Map_3D/Map"

interface SideBarProps extends MapActions {
  children: React.ReactNode
}

export default function SideBar({
  children,
  handleClick
}: SideBarProps) {
  return (
    <SidebarProvider>
      <AppSidebar handleClick={handleClick} />
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
  )
}