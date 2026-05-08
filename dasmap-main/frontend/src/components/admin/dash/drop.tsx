"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import SendCsv from "@/queries/sendCsv"

import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'

export default function DropZone() {
  const { register, handleSubmit, reset, setValue } = useForm({
  defaultValues: {
    R2: "",
    MAE: "",
    RMSE: "",
    model_acc: "",
    model_type: "",
    model_size: "",
    date_created: ""
  }
})

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  const submitAll = async (data: any) => {
  
    if (!files?.[0]) {
      toast("Please select a CSV file");
      return;
    }

    if (!files[0].name.endsWith(".csv")) {
      toast("❌ Please upload a valid CSV file");
      return;
    }

    await SendCsv({
      file: files[0],
      ...data,
    });

    reset();
    setFiles([]);
    setOpen(false);
  };

  function HandleUpload() {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Update Model Predictions</DialogTitle>
          <DialogDescription>
            Select model, metrics, and define update range (2025–2026 only).
          </DialogDescription>

          <form onSubmit={handleSubmit(submitAll)} className="grid gap-4 mt-3">

            {/* MODEL SELECT */}
            <div>
              <Label className="mb-2">Model *</Label>
              <Select
                onValueChange={(value) => {
                  setValue("model_type", value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="RF">Random Forest</SelectItem>
                  <SelectItem value="XGB">XGBoost</SelectItem>
                  <SelectItem value="LightGBM">LightGBM</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Classification Accuracy</Label>
                <Input type="number" step="0.01" min={0} max={1} {...register("model_acc", { required: true })} />
              </div>

              <div>
                <Label>R² Score</Label>
                <Input type="number" step="0.01" {...register("R2", { required: true })} />
              </div>

              <div>
                <Label>MAE</Label>
                <Input type="number" step="0.01" {...register("MAE", { required: true })} />
              </div>

              <div>
                <Label>RMSE</Label>
                <Input type="number" step="0.01" {...register("RMSE", { required: true })} />
              </div>
            </div>

            {/* DATE CREATED */}
            <div>
              <Label>Date Updated</Label>
              <Input type="date" {...register("date_created", { required: true })} />
            </div>

            {/* CSV SIZE */}
            <div>
              <Label>CSV Size (MB)</Label>
              <Input type="number" step="0.01" {...register("model_size", { required: true })} />
            </div>


            <DialogFooter className="flex gap-2 justify-end">
              <Button type="submit">Upload</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upload CSV File for Model Update</CardTitle>
        <CardDescription>
          Update prediction data for 2025–2026 only
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 flex flex-col h-full">
        <Dropzone
          className="ring-1 ring-gray-300 flex-1"
          maxFiles={1}
          accept={{ "text/csv": [".csv"] }}
          onDrop={handleDrop}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>

        <Button
          onClick={() => {
            if (!files?.length) {
              toast("Please upload a CSV first");
              return;
            }
            setOpen(true);
          }}
        >
          Continue
        </Button>
      </CardContent>

      <HandleUpload />
    </Card>
  );
}

