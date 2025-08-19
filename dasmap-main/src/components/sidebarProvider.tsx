import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebarMain"


export default function SideBar({children} : {children : React.ReactNode}) {
    return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
    )
}