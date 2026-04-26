import { supabase } from "@/makeclient"
import { toast } from "sonner"
import { Model_Code } from "./model_ids"

export async function ApplyModel(modelId: string) {
  if (!modelId) return

  const resolvedModel = Model_Code[modelId as keyof typeof Model_Code]

  if (!resolvedModel) {
    throw new Error("Invalid model UUID")
  }

  // reset models
  const { error: errorReset } = await supabase
    .from("Models")
    .update({ model_status: false })
    .neq("model_status", false)

  if (errorReset) throw errorReset

  // activate selected model
  const { error: errorSet } = await supabase
    .from("Models")
    .update({ model_status: true })
    .eq("id", modelId)

  if (errorSet) throw errorSet

  // update ACTIVE MODEL POINTER (correct column)
  const { error: errorActive } = await supabase
    .from("active_dataset")
    .update({ active_model_id: resolvedModel })
    .eq("id", 1)

  if (errorActive) throw errorActive

  toast.success(`Applied model: ${resolvedModel}`)
}
