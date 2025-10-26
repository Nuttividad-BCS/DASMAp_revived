import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import UploadTable from "../uplodTable"

export default function CsvList() {
    return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center text-center justify-center pb-1">
        <CardTitle>Previously Uploaded CSVs</CardTitle>
        <CardDescription>Last Csv Upload</CardDescription>
      </CardHeader>
      <CardContent className="flex-2 pb-0 h-full">
        <UploadTable />
      </CardContent>
      <CardFooter className="flex-col gap-3 text-sm">
        
      </CardFooter>
    </Card>
    )
}