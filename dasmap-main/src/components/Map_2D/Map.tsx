import Map2D from "./svgs/Map_2D_fixed.svg?react"

export interface MapActions2D {
  handleClick : (name:string) => void
  activeBarangay : string | null
}

export const DasMap2D: React.FC<MapActions2D> = ({
    handleClick,
    activeBarangay
  }) => {

  return (
      <Map2D
        style={{ pointerEvents: "all" }}
        className="w-full h-[80vh] object-contain border-none"
        onClick={(e) => {
          const target = e.target as SVGElement
        
            console.log(target.id)
            handleClick(target.id)
        
        }}
      />
  )
}