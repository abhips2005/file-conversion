"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleCheck, AlertCircle } from "lucide-react";

// This component provides a mock conversion when the API fails
export function MockFileConversion({ file, targetFormat, onConversionComplete }: { 
  file: File;
  targetFormat: string;
  onConversionComplete: (result: ArrayBuffer, fileName: string) => void;
}) {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMockConversion = async () => {
    setIsConverting(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    // Simulate conversion progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 300);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Just return the original file as a mock conversion
      const arrayBuffer = await file.arrayBuffer();
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      // Notify parent component
      setTimeout(() => {
        onConversionComplete(arrayBuffer, `converted.${targetFormat}`);
        setIsConverting(false);
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Error during mock conversion");
      setIsConverting(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CircleCheck className="h-4 w-4 text-green-500" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Mock conversion completed successfully. Downloading file...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200 mb-4">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-gray-500">API Connection Failed</Label>
          <p className="text-sm mt-1">Would you like to proceed with a mock conversion?</p>
        </div>
        
        {isConverting ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center">Converting... {progress}%</p>
          </div>
        ) : (
          <Button 
            onClick={handleMockConversion} 
            className="w-full"
          >
            Start Mock Conversion
          </Button>
        )}
      </div>
    </Card>
  );
}
