import { supabase } from "@/makeclient"
import { toast } from "sonner"
import { ActiveModel } from "@/components/admin/dash/acc"

export async function GetActiveModel(): Promise<ActiveModel | null> {
  // Query Supabase table for the model with is_active = true
  const { data, error } = await supabase
    .from("Models") // 👈 your Supabase table name
    .select("model_name, model_acc ,model_status, file_url")
    .eq("model_status", true)
    .single() // Expect only one true value

  if (error) {
    toast(`Error fetching active model: ${error.message}`)
    return null
  }

  if (!data) {
    console.warn("No active model found.")
    return null
  }

  return data
}