import { supabase } from '@/makeclient.ts'
import { toast } from 'sonner'

async function GetCsv() {
    const {data, error } = await supabase
    .from('CsvLog')
    .select('*')

    if (error) {
        toast(`Error Uploading file: ${error}`)
    }

    
    return data
}

export default GetCsv