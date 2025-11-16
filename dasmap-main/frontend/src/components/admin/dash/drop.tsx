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
  DialogFooter
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import SendCsv from "@/queries/sendCsv"
import SendModelDeets from "@/queries/sendModelDeets"
import SendModel from "@/queries/sendModel"

interface ModelFormValues {
  model_name: string;
  model_acc: number;
  date_created: string;
  model_size: number;
}



export default function DropZone() {
    const { register, handleSubmit, reset } = useForm<ModelFormValues>()
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<File[] | undefined>()

    const handleDrop = (files: File[]) => {
        setFiles(files)
    }

    const submitAll = async (data: ModelFormValues) => {
        if (!files?.[0]) {
        toast("Please select a CSV file")
        return
        }

        await SendCsv({
        file: files[0],
        ...data,
        })

        reset()
        setFiles([])
        setOpen(false)
    }

    function HandleUpload() {

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogTitle>Upload CSV File</DialogTitle>
                <DialogDescription>
                Please fill out the details and select a file to upload.
                </DialogDescription>

                <form onSubmit={handleSubmit(submitAll)} className="grid gap-5 mt-2">
                <div>
                    <Label className="mb-2">CSV Name</Label>
                    <Input type="text" {...register("model_name", { required: true })} />
                </div>

                <div>
                    <Label className="mb-2">CSV Accuracy (0-1)</Label>
                    <Input
                    type="number"
                    step="0.01"
                    {...register("model_acc", { required: true, min: 0, max: 1 })}
                    />
                </div>

                <div>
                    <Label className="mb-2">Date Created</Label>
                    <Input type="date" {...register("date_created", { required: true })} />
                </div>

                <div>
                    <Label className="mb-2">CSV Size (MB)</Label>
                    <Input
                    type="number"
                    step="0.01"
                    {...register("model_size", { required: true, min: 0 })}
                    />
                </div>

                <DialogFooter className="flex justify-self-center gap-2">
                    <Button type="submit">Upload</Button>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
    )
    }

    return (
        <>
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upload CSV File for System Updation</CardTitle>
                <CardDescription>Please Follow the CSV Format</CardDescription>
            </CardHeader>
            <CardContent className="h-full grid grid-cols-4 gap-3 justify-center items-center">
                <Dropzone
                    className="h-full col-span-4 ring-1 ring-gray-400 "
                    maxFiles={1}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={files}
                    >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>
                <Button
                    className="col-span-4" 
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