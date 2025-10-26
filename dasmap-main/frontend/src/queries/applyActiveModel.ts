import { supabase } from "@/makeclient"
import { toast } from "sonner"

export async function ApplyModel(modelId: string) {
  if (!modelId) return

  const { error: errorReset } = await supabase
      .from("Models")
      .update({ model_status: false })
      .neq("model_status", false)
    if (errorReset) throw errorReset


    const { error: errorSet } = await supabase
      .from("Models")
      .update({ model_status: true })
      .eq("id", modelId)
    if (errorSet) throw errorSet

    toast.success(`Applied model: ${modelId}`)

}
