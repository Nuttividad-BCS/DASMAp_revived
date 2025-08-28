import { MapActions } from "@/components/Map_3D/Map"
import Map2D from "./svgs/Map_2D.svg?react"


export const DasMap2D: React.FC<MapActions> = ({
    handleClick,
    activeBarangay,
    targetPosition,
    brgyRef,
    onHover,
    rotate
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