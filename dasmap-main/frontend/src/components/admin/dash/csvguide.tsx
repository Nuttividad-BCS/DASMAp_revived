import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CsvInfoPanel() {
  return (
    <Card className="w-full h-full overflow-y-auto max-w-2xl shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">CSV Upload Format</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ensure your CSV file follows the exact column structure below.
          Incorrect formats may cause upload errors.
        </p>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-2">
          <Badge variant="outline">BARANGAY</Badge>
          <Badge variant="outline">YEAR</Badge>
          <Badge variant="outline">MONTH</Badge>
          <Badge variant="outline">Predicted_Cases</Badge>
          <Badge variant="outline">Predicted_Risk</Badge>
        </div>

        {/* Example */}
        <div className="bg-muted p-3 rounded-xl text-sm font-mono overflow-x-auto">
{`BARANGAY,YEAR,MONTH,Predicted_Cases,Predicted_Risk
San Isidro,2023,5,12.5,High
Salawag,2023,5,3.2,Low`}
        </div>

        {/* Notes */}
        <div className="text-sm space-y-1">
          <p><strong>Notes:</strong></p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>Column names must match exactly (case-sensitive).</li>
            <li>YEAR and MONTH must be numeric.</li>
            <li>Predicted_Cases should be a number (float allowed).</li>
            <li>Predicted_Risk should be categorical (e.g., Low, Medium, High).</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
