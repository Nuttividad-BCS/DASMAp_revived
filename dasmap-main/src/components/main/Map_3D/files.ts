import { useGLTF } from "@react-three/drei"
import { useEffect } from "react"

export default function ExtractPositions() {
  const { nodes } = useGLTF("./DASMA.glb") as any

  useEffect(() => {
    const data = Object.values(nodes)
      .filter((n: any) => n.isMesh)
      .map((n: any) => ({
        name: n.name,
        position: n.position.toArray(),
      }))

    console.log("Barangay positions:", JSON.stringify(data, null, 2))
  }, [nodes])

  return null
}
