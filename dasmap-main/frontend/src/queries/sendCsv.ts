import { supabase } from "@/makeclient"
import { toast } from "sonner"
import Papa from "papaparse"


interface ModelDeets {
  model_name: string
  model_acc: number
  R2: number
  RMSE: number
  MAE: number
  date_created: string
  model_size: number
  model_type: string
}

interface SendCsvPayload extends ModelDeets {
  file: File
}

const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export default async function SendCsv(payload: SendCsvPayload) {
  const { id, file, model_name, R2, RMSE, MAE, model_acc, date_created, model_size, model_type } = payload
  console.log(model_type)
  // -----------------------------
  // 1. Upload CSV
  // -----------------------------
  const { error: uploadError } = await supabase.storage
    .from("models")
    .upload(`csvs/${Date.now()}-${file.name}`, file)

  if (uploadError) {
    toast(`❌ Upload error: ${uploadError.message}`)
    return
  }

  const { data: publicUrlData } = supabase.storage
    .from("models")
    .getPublicUrl(`csvs/${Date.now()}-${file.name}`)

  const fileUrl = publicUrlData.publicUrl

  // -----------------------------
  // 2. Parse CSV FIRST
  // -----------------------------
  const rows = await parseCSV(file)

  // -----------------------------
  // 3. Get MODEL_ID
  // -----------------------------
  const { data: modelData } = await supabase
    .from("Models")
    .select("MODEL_ID")
    .eq("model_name", model_type)
    .single()

  const model_id = modelData?.MODEL_ID

  // -----------------------------
  // 4. TABLE ROUTING
  // -----------------------------
  const tableMap: Record<string, string> = {
    RF: "RF",
    XGB: "XGB",
    LightGBM: "LightGBM",
    Hybrid: "Hybrid",
  }

  const table = tableMap[model_type]

  // -----------------------------
  // 5. UPSERT DATA
  // -----------------------------
  const { error: insertError } = await supabase
  .from(table)
  .upsert(
    rows.map((row: any) => ({
      BARANGAY: row.BARANGAY,
      YEAR: Number(row.YEAR),
      MONTH: Number(row.MONTH),
      Predicted_Cases: Number(row.Predicted_Cases),
      Predicted_Risk: row.Predicted_Risk,
      MODEL_ID: model_id,
    })),
    {
      onConflict: "BARANGAY,YEAR,MONTH,MODEL_ID",
    }
  )

  if (insertError) {
    toast(`❌ Insert error: ${insertError.message}`)
    return
  }

  // -----------------------------
  // 6. Save metadata LAST
  // -----------------------------

  await supabase
    .from("Models")
      .update({
        model_name,
        model_acc,
        R2,
        RMSE,
        MAE,
        date_created,
        model_size,
        file_url: fileUrl,
      })
    .eq("MODEL_ID", model_id)

  toast("✅ Upload + ingestion complete!")

  return { fileUrl }
}