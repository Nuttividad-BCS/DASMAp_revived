import { supabase } from "@/makeclient"
import { toast } from "sonner"

export interface Models {
  id: string
  model_name: string
  model_acc: number
  model_status: boolean
  model_size: number
  date_created: Date
}

export async function FetchModels(): Promise<Models[]> {
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from("Models")
    .select("id, model_name, model_acc, R2, MAE, RMSE,date_created, model_size, model_status")

  if (error) {
    toast(`Error fetching models: ${error}`)
    return []
  }

  // Map Supabase columns to your Model[] format
  const models: Models[] = data.map((row: any) => ({
    model_name: row.model_name,
    model_acc: row.model_acc,
    R2: row.R2,
    MAE: row.MAE,
    RMSE: row.RMSE,
    id: row.id,
    date_created: row.date_created,
    model_status: row.model_status,
    model_size: row.model_size
  }))

  return models
}
