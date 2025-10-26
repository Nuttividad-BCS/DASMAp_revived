import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label as Lbl} from "@/components/ui/label"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

export default function Predict() {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i)
    const [ year_s, setYear ] = useState(currentYear.toString())
    const [ month_s, setMonth] = useState("1")
    const [ openPanel, setOpenPanel ] = useState(false)
    const [predictions, setPredictions] = useState<any[]>([])

    const handleDownloadPDF = () => {

        const doc = new jsPDF();

        doc.text("Prediction Results", 14, 10);

        autoTable(doc, {
            head: [["Barangay", "Predicted Cases", "Risk Level"]],
            body: predictions.map(p => [
            p.BARANGAY,
            p.Predicted_Cases.toFixed(2),
            p.Risk_Level // format as 2 decimals
            ]),
            startY: 20,
        });


        doc.save(`prediction_${new Date().toISOString()}.pdf`);
    }

    const handleDownloadCSV = () => {
        
        if (predictions.length === 0) return

        // Convert JSON → CSV
        const headers = Object.keys(predictions[0])
        const csvRows = [
        headers.join(","),
        ...predictions.map(obj =>
            headers.map(header => JSON.stringify(obj[header] ?? "")).join(",")
        ),
        ];
        const csvString = csvRows.join("\n");

        const blob = new Blob([csvString], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `prediction_${new Date().toISOString()}.csv`
        a.click();
        URL.revokeObjectURL(url)
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center text-center justify-center pb-1">
                <CardTitle>Batch Predict and Export</CardTitle>
                <CardDescription>Current Active Model: {}</CardDescription>
            </CardHeader>
            <CardContent className="grid pb-0 h-full w-full">
                <div className="col-span-1 lg:col-span-8 grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-5 mb-3 font-[Formula] items-center">
                            <Lbl className="lg:col-span-2 text-xl">Year:</Lbl>
                            <Select value={year_s} onValueChange={setYear}>
                                <SelectTrigger className="w-full col-span-3 lg:col-span-6">
                                    <SelectValue placeholder="Select a Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectLabel>Year</SelectLabel>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                        {year}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Lbl className="lg:col-span-2 text-xl lg:justify-self-end">Month:</Lbl>
                            <Select value={month_s} onValueChange={setMonth}>
                            <SelectTrigger className="w-full col-span-3 lg:col-span-6">
                                <SelectValue placeholder="Select a Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {months.map((month, index) => (
                                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {month}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                            </Select>
                            <Button 
                    className="col-span-8 justify-center items-center"
                    onClick={async() => {
                        const response = await fetch("https://dasmaprevived-production.up.railway.app/predict", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ year: parseInt(year_s), month: parseInt(month_s)}),
                            })
                        const data = await response.json()
                        setPredictions(data)
                        setOpenPanel(true)
                    }}>
                    Batch Predict
                </Button>
                </div>
            </CardContent>
            <Dialog onOpenChange={setOpenPanel} open={openPanel}>
                <DialogContent className="overflow-y-auto max-h-[90vh] w-[800px]">
                    <DialogTitle>File Preview of Prediction for {months[parseInt(month_s) - 1]} {year_s}</DialogTitle>
                    <DialogDescription>You download the document Below.</DialogDescription>
                        <Table className="mt-4">
                            <TableHeader>
                            <TableRow>
                                <TableHead>Barangay</TableHead>
                                <TableHead>Predicted Cases</TableHead>
                                <TableHead>Risk Level</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {predictions.map((row, i) => (
                                <TableRow key={i}>
                                <TableCell>{row.BARANGAY}</TableCell>
                                <TableCell>{row.Predicted_Cases}</TableCell>
                                <TableCell>{row.Risk_Level}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    <Button onClick={handleDownloadPDF}>
                        Download PDF
                    </Button>
                    <Button onClick={handleDownloadCSV}>
                        Download CSV
                    </Button>
                </DialogContent>
            </Dialog>
            <CardFooter className="flex-col gap-3 text-sm">
                
            </CardFooter>
        </Card>
    )
}