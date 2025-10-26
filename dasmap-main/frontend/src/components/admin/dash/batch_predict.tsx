import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Predict() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center text-center justify-center pb-1">
                <CardTitle>Previously Uploaded CSVs</CardTitle>
                <CardDescription>Last Csv Upload</CardDescription>
            </CardHeader>
            <CardContent className="flex-2 pb-0 h-full">
                <Button onClick={() => {
                    fetch("https://dasmaprevived-production.up.railway.app/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ year: 2025, month: 6 }),
                        })
                        .then(res => res.json())
                        .then(data => console.log("Predictions:", data))
                        .catch(err => console.error(err));
                }}>
                    Test
                </Button>
            </CardContent>
            <CardFooter className="flex-col gap-3 text-sm">
                
            </CardFooter>
        </Card>
    )
}