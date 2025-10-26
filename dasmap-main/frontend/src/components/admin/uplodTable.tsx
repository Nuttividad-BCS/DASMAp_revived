import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/makeclient"
import { toast } from "sonner"
import GetCsv from "@/queries/getCsv"


export default function UploadTable() {
    const { data, error} = useQuery({
        queryKey: ['GetCsvs'],
        queryFn: GetCsv,
    })

    if (error) {toast(`Error Getting Csv Files ${error}`)}


    return (
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>File Link</TableHead>
            <TableHead>Upload Date</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
             {data && data.length > 0 ? (
          data.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.file_name}</TableCell>
              <TableCell>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View CSV
                </a>
              </TableCell>
              <TableCell>
                {new Date(file.created_at).toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                })}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-gray-500">
              No files uploaded yet.
            </TableCell>
          </TableRow>
        )}
        </TableBody>
        </Table>
    )
}