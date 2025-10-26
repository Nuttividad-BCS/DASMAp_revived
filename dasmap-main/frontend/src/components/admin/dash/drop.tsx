import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import SendCsv from "@/queries/sendCsv"

async function TestButton() {
  try {
      const response = await fetch("https://dasmaprevived-production.up.railway.app/test-button", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Response from backend:", data.message);
    } catch (error) {
      console.error("Error calling backend:", error);
    }
}



export default function DropZone() {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<File[] | undefined>()
    const handleDrop = (files: File[]) => {
        setFiles(files)
    }


    function HandleUpload() {

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogTitle>Confirm Upload of Csv File: {files?.[0].name}?</DialogTitle>
                <DialogDescription>Please Confirm Below.</DialogDescription>
                <Button onClick={async () => {
                    await SendCsv(files?.[0]!)
                    setOpen(false)
                }}>
                    Yes
                </Button>
                <Button onClick={() => {setOpen(false)}}>
                    No
                </Button>
            </DialogContent>
        </Dialog>
    )
    }

    return (
        <>
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upload or Drop CSV File for Model Updation</CardTitle>
                <CardDescription>Please Follow the CSV Format</CardDescription>
            </CardHeader>
            <CardContent className="h-full grid grid-cols-1 gap-3 justify-center items-center">
                <Dropzone
                    className="h-full col-span-1 ring-1 ring-gray-400 "
                    maxFiles={1}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={files}
                    >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>
                <Button
                    className="col-span-1" 
                    onClick={() => {
                        if (!files || files.length === 0) {
                            toast('Please upload a file first!')
                            setOpen(false)
                        } else{ 
                            setOpen(true)
                        }
                    }}>
                    Submit Csv
                </Button>
            </CardContent>
        </Card>
        <HandleUpload />
        </>
    )
}