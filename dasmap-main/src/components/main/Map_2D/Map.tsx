import Map2D from "./svgs/Final_Map.svg?react"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch"
import { useEffect } from "react"

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

  useEffect(() => {
    const all = document.querySelectorAll("path")
      all.forEach((n) => {
        n.setAttribute("fill", "#6B6B6B") 
        n.setAttribute("pointer-events", "none")
      })
    
    const current = document.getElementById(activeBarangay ?? "")
    if (current) current.setAttribute("fill", "red")
    
    const timeout = setTimeout(() => {
      all.forEach((n) => n.setAttribute("pointer-events", "auto"));
    }, 500)

    return () => clearTimeout(timeout)

  }, [activeBarangay])

  return (
    <div className="flex justify-center w-full h-full">
      <TransformWrapper
        initialScale={1}
        initialPositionX={150}
        initialPositionY={100}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            
            <TransformComponent>

              <Map2D
                className="w-full h-[85vh] lg:h-[88vh] border-none"
                onMouseOver={(e) => {
                  const target = e.target as SVGElement;
                  if (target.tagName === "path") {
                    onHover(target.id)
                  }
                }}
                onMouseOut={() => onHover(null)}
                onClick={(e) => {
                  const target = e.target as SVGElement

                    console.log(target.id)
                    handleClick(target.id)

                }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}