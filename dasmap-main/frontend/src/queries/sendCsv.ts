import { supabase } from "@/makeclient"
import { toast } from "sonner"

interface ModelDeets {
  model_name: string
  model_acc: number
  date_created: string
  model_size: number
}

interface SendCsvPayload extends ModelDeets {
  file: File
}

export default async function SendCsv(payload: SendCsvPayload) {
  const { file, model_name, model_acc, date_created, model_size } = payload

  // -----------------------------
  // 1. Upload CSV to storage
  // -----------------------------
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("models")
    .upload(`csvs/${file.name}`, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    toast(`❌ Error uploading file: ${uploadError.message}`)
    return
  }

  // -----------------------------
  // 2. Get public file URL
  // -----------------------------
  const { data: publicUrlData } = supabase.storage
    .from("models")
    .getPublicUrl(`csvs/${file.name}`)

  const fileUrl = publicUrlData.publicUrl

  // -----------------------------
  // 3. Insert CSV log into CsvLog
  // -----------------------------
  const { error: insertCsvError } = await supabase
    .from("CsvLog")
    .insert([
      {
        file_name: file.name,
        file_url: fileUrl,
      },
    ])

  if (insertCsvError) {
    toast(`❌ Error saving CSV metadata: ${insertCsvError.message}`)
    return
  }

  // -----------------------------
  // 4. Insert MODEL DETAILS into Models table
  // -----------------------------
  const { error: modelError } = await supabase
    .from("Models")
    .insert([
      {
        model_name,
        model_acc,
        date_created,
        model_size,
        file_url: fileUrl, // optional: link the uploaded file to the model
      },
    ])

  if (modelError) {
    toast(`❌ Error saving model details: ${modelError.message}`)
    return
  }

  toast("✅ File + Model details uploaded successfully!")

  // Return everything
  return {
    fileUrl,
    uploadData,
  }
}