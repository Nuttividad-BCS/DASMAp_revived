import { MapActions } from "@/components/Map_3D/Map"
import Map2D from "./svgs/Map_2D.svg?react"

export interface MapActions2D {
  handleClick : (name:string) => void
  activeBarangay : string | null
  onHover: (name: string | null) => void  
}

export const DasMap2D: React.FC<MapActions2D> = ({
    handleClick,
    activeBarangay,
    onHover
  }) => {

  return (
      <Map2D
        style={{ pointerEvents: "all" }}
        className="w-full h-auto bg-[#1D2129]"
        onClick={(e) => {
          const target = e.target as SVGElement
        
            console.log(target.id)
            onHover(target.id)
            handleClick(target.id)
        
        }}
      />
  )
}