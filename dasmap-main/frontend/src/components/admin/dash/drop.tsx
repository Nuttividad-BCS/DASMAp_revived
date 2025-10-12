import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { useState } from 'react'


export default function DropZone() {
    const [files, setFiles] = useState<File[] | undefined>()
    const handleDrop = (files: File[]) => {
        setFiles(files)
    }

    return (
        
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upload or Drop CSV File for Model Updation</CardTitle>
                <CardDescription>Please Follow the CSV Format</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
                <Dropzone
                    className="h-full"
                    maxFiles={1}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={files}
                    >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </Dropzone>
            </CardContent>
        </Card>
    )
}