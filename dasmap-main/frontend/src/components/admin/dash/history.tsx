import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function HistoryList() {
    return (
        <Table className="font-[Formula] bg-white rounded-xl">
            <TableCaption className="text-white">Past Model Details</TableCaption>
            <TableHeader>
                <TableRow className="bg-gray-200 hover:none pointer-events-none">
                    <TableHead className="rounded-tl-xl"><p>Date Created</p></TableHead>
                    <TableHead><p>Accuracy</p></TableHead>
                    <TableHead><p>Size</p></TableHead>
                    <TableHead className="rounded-tr-xl"><p>Status</p></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="pointer-events-none">
                <TableRow key={0}>
                    <TableCell>July 12, 2025</TableCell>
                    <TableCell>87.4%</TableCell>
                    <TableCell>14 MB</TableCell>
                    <TableCell>Deployed</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

