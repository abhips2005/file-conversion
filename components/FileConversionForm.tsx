"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { MockFileConversion } from "@/components/MockFileConversion";
import { 
  FileIcon, 
  ArrowRight,
  FileTextIcon,
  ImageIcon,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

// Define file format groups for conversion options
const fileFormats = {
  document: ["pdf", "docx", "html", "txt", "rtf", "md"],
  image: ["jpg", "png", "gif", "bmp", "tiff", "webp"],
  data: ["csv", "xlsx", "json", "xml"],
};

export default function FileConversionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<string[]>([]);
  const [apiError, setApiError] = useState(false);
  const [isMockConversion, setIsMockConversion] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionSuccess, setConversionSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConversionSuccess(false);
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Determine source format from file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || "";
      setSourceFormat(fileExtension);
      
      // Set conversion options based on source format
      const options = determineConversionOptions(fileExtension);
      setConversionOptions(options);
      setTargetFormat(""); // Reset target format when file changes
    }
  };

  // Determine available conversion options based on source format
  const determineConversionOptions = (format: string): string[] => {
    // Find which group this format belongs to
    let group: string | null = null;
    Object.entries(fileFormats).forEach(([groupName, formats]) => {
      if (formats.includes(format)) {
        group = groupName;
      }
    });
    
    if (!group) return [];
    
    // Return all formats in that group except the source format
    return fileFormats[group as keyof typeof fileFormats].filter(
      (fmt) => fmt !== format
    );
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!file || !targetFormat) {
      setError("Please select a file and target format");
      setShowAlert(true);
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      setApiError(false);
      setIsMockConversion(false);
      setConversionSuccess(false);
      
      // Start progress animation
      setConversionProgress(0);
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 300);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", targetFormat);
      formData.append("sourceFormat", sourceFormat);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        const errorData = await response.json();
        console.error("API Error:", errorData);
        setApiError(true);
        throw new Error(errorData.error || "Conversion failed");
      }

      // Check if this was a mock conversion
      const mockHeader = response.headers.get("X-Mock-Conversion");
      setIsMockConversion(mockHeader === "true");

      // Complete the progress
      clearInterval(progressInterval);
      setConversionProgress(100);
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      downloadFile(blob, `converted.${targetFormat}`);
      
      // Show success state
      setConversionSuccess(true);
      
      // Show success message
      if (mockHeader === "true") {
        setError("Note: A mock conversion was performed because the API could not complete the conversion.");
        setShowAlert(true);
      }
    } catch (err) {
      console.error("Error during conversion:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      if (!apiError) {
        setShowAlert(true);
      }
    } finally {
      if (!apiError) {
        setIsConverting(false);
      }
    }
  };

  const handleMockConversionComplete = (result: ArrayBuffer, fileName: string) => {
    const blob = new Blob([result], { type: getContentType(targetFormat) });
    downloadFile(blob, fileName);
    setApiError(false);
    setIsConverting(false);
    setConversionSuccess(true);
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getContentType = (format: string): string => {
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // ...other formats...
    };
    return contentTypes[format] || 'application/octet-stream';
  };

  const getFormatIcon = (format: string) => {
    if (["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"].includes(format?.toLowerCase() || "")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (["pdf", "docx", "doc", "html", "txt", "rtf", "md"].includes(format?.toLowerCase() || "")) {
      return <FileTextIcon className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* File Upload Area */}
        <div className="space-y-2">
          <Label htmlFor="file" className="text-sm font-medium">Upload File</Label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${file ? 'border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700'}`}>
            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  {getFormatIcon(sourceFormat)}
                  <span className="ml-2 font-medium text-sm">{file.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isConverting}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <>
                <FileIcon className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm font-medium">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supports PDF, DOCX, JPG, PNG, and more
                </p>
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isConverting}
                />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Target Format Selection */}
        {file && (
          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium">Convert To</Label>
            <Select
              value={targetFormat}
              onValueChange={setTargetFormat}
              disabled={isConverting || conversionOptions.length === 0}
            >
              <SelectTrigger id="format" className="w-full">
                <SelectValue placeholder="Select target format" />
              </SelectTrigger>
              <SelectContent>
                {conversionOptions.map((format) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center">
                      {getFormatIcon(format)}
                      <span className="ml-2">{format.toUpperCase()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Conversion Visualization */}
        {file && targetFormat && !isConverting && !conversionSuccess && (
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-center items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  {getFormatIcon(sourceFormat)}
                </div>
                <span className="text-xs mt-2">{sourceFormat.toUpperCase()}</span>
              </div>
              
              <ArrowRight className="text-blue-500" />
              
              <div className="flex flex-col items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
                  {getFormatIcon(targetFormat)}
                </div>
                <span className="text-xs mt-2">{targetFormat.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Conversion Progress */}
        {isConverting && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Converting {sourceFormat.toUpperCase()} to {targetFormat.toUpperCase()}</span>
                  <span>{conversionProgress}%</span>
                </div>
                <Progress value={conversionProgress} />
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {conversionSuccess && !isConverting && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900"
          >
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium text-green-800 dark:text-green-400">
                Conversion successful!
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your file has been converted and downloaded.
            </p>
            
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setFile(null)}>
                Convert another file
              </Button>
            </div>
          </motion.div>
        )}

        {/* Mock Conversion or Convert Button */}
        {apiError && file && targetFormat ? (
          <MockFileConversion 
            file={file}
            targetFormat={targetFormat}
            onConversionComplete={handleMockConversionComplete}
          />
        ) : (
          <>
            {file && targetFormat && !conversionSuccess && (
              <Button
                className="w-full"
                onClick={handleConvert}
                disabled={isConverting || !file || !targetFormat}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert Now"
                )}
              </Button>
            )}
            
            {isMockConversion && (
              <div className="text-amber-600 text-sm text-center mt-2">
                Note: This was a mock conversion. The actual conversion API was not available.
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {error && error.includes("mock conversion") ? "Conversion Note" : "Conversion Error"}
            </AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowAlert(false)}>OK</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
