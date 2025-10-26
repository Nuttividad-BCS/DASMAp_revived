import { supabase } from "@/makeclient"
import { toast } from "sonner"

interface ModelDeets {
  model_name: string
  model_acc: number
  date_created: string
  model_size: number
}

export default async function SendModelDeets(model: ModelDeets) {
    const { data, error} = await supabase
    .from("Models") 
    .insert([model])

    if (error) {toast(`Error uploading Model: ${error}`)}

    return data
}
