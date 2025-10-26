import { supabase } from "@/makeclient"
import { toast } from "sonner"

export default async function SendModel(modelfile: File) {
    const { error } = await supabase.storage
    .from('models')
    .upload(`versions/${modelfile.name}`, modelfile, {
      cacheControl: "3600",
      upsert: true, 
    })

    if (error) {toast(`Error Uploadoing PKL file to storage ${error}`)}
    else {toast(`Success Uploading file to storage`)}

}