import { supabase } from '@/makeclient.ts'
import { toast } from 'sonner'

async function SendCsv(csv: File) {
    const {data, error } = await supabase.storage
    .from('models')
    .upload(`csvs/${csv.name}`, csv, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
        toast(`Error Uploading file: ${error}`)
    }

    toast('File Uploaded Successfully')

    const { data: publicUrlData } = supabase.storage
    .from('models')
    .getPublicUrl(`csvs/${csv.name}`)

    const publicUrl = publicUrlData.publicUrl

    // ✅ Insert file metadata into a Supabase table (e.g. "model_files")
    const { error: insertError } = await supabase
        .from('CsvLog') // your table name
        .insert([
        {
            file_name: csv.name,
            file_url: publicUrl,
        },
        ])

    if (insertError) {
        toast(`Error saving metadata: ${insertError.message}`)
        return
    }

    toast('✅ File uploaded and metadata saved successfully!')
    return { uploadData: data, fileUrl: publicUrl }
    
}

export default SendCsv