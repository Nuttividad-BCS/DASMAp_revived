import { supabase } from "@/makeclient"
import { toast } from "sonner"
import { ActiveModel } from "@/components/admin/dash/acc"

export async function FetchModels(): Promise<ActiveModel[]> {
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from("Models")
    .select("id, model_name, model_acc, date_created, model_size, model_status")

  if (error) {
    toast(`Error fetching models: ${error}`)
    return []
  }

  // Map Supabase columns to your Model[] format
  const models: ActiveModel[] = data.map((row: any) => ({
    model_name: row.model_name,
    model_acc: row.model_acc,
    id: row.id,
    date_created: row.date_created,
    model_status: row.model_status,
    model_size: row.model_size
  }))

  return models
}
