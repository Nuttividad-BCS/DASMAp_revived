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
    const [open_m, setOpen_m] = useState(false)
    const [files, setFiles] = useState<File[] | undefined>()
    const [files_model, setFiles_model] = useState<File[] | undefined>()   

    const handleDrop = (files: File[]) => {
        setFiles(files)
    }

    const handleDrop_model = (files_model: File[]) => {
        setFiles_model(files_model)
    }

    const send_model = async(data:ModelFormValues) => {

        // Send model details to Supabase
        await SendModelDeets({
            model_name: data.model_name,
            model_acc: data.model_acc,
            date_created: data.date_created,
            model_size: data.model_size,
        });

        // Optionally, upload .pkl file here with SendCsv
        if (files_model?.[0]) await SendModel(files_model[0])

        setOpen_m(false)
        reset()
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

    function HandleUpload_model() {

    return (
        <Dialog open={open_m} onOpenChange={setOpen_m}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
            <DialogTitle>Upload Model: {files_model?.[0]?.name || "No File Selected"}</DialogTitle>
            <DialogDescription>Fill out the details below and confirm upload.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(send_model)} className="grid gap-5 mt-2">
            <div>
                <Label className="mb-2">Model Name</Label>
                <Input type="text" {...register("model_name", { required: true })} />
            </div>

            <div>
                <Label className="mb-2">Model Accuracy (0-1)</Label>
                <Input type="number" step="0.01" {...register("model_acc", { required: true, min: 0, max: 1 })} />
            </div>

            <div>
                <Label className="mb-2">Date Created</Label>
                <Input type="date" {...register("date_created", { required: true })} />
            </div>

            <div>
                <Label className="mb-2">Model Size (MB)</Label>
                <Input type="number" step="0.01" {...register("model_size", { required: true, min: 0 })} />
            </div>

            <DialogFooter className="flex justify-end gap-2">
                <Button type="submit">Upload</Button>
                <Button variant="outline" onClick={() => setOpen_m(false)}>Cancel</Button>
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
                <CardTitle>Upload CSV/Model File for System Updation</CardTitle>
                <CardDescription>Please Follow the CSV Format</CardDescription>
            </CardHeader>
            <CardContent className="h-full grid grid-cols-4 gap-3 justify-center items-center">
                <Dropzone
                    className="h-full col-span-2 ring-1 ring-gray-400 "
                    maxFiles={1}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={files}
                    >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>
                <Dropzone
                    className="h-full col-span-2 ring-1 ring-gray-400 "
                    maxFiles={1}
                    onDrop={handleDrop_model}
                    onError={console.error}
                    src={files_model}
                    >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>
                <Button
                    className="col-span-2" 
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
                <Button
                    className="col-span-2" 
                    onClick={() => {
                        if (!files_model || files_model.length === 0) {
                            toast('Please upload a file (pkl) first!')
                            setOpen_m(false)
                        } else{ 
                            setOpen_m(true)
                        }
                    }}>
                    Submit Model (.pkl)
                </Button>
            </CardContent>
        </Card>
        <HandleUpload_model />
        <HandleUpload />
        </>
    )
}