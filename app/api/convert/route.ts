import { NextRequest, NextResponse } from "next/server";
import { convertDocumentApi, convertImageApi, convertDataApi, convertWebApi } from "@/lib/cloudmersive";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = {
  document: ["pdf", "docx", "html", "txt", "rtf", "md"],
  image: ["jpg", "png", "gif", "bmp", "tiff", "webp"],
  data: ["csv", "xlsx", "json", "xml"],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = request.nextUrl.searchParams.get("format");

    // Validate input
    if (!file || !format) {
      return NextResponse.json(
        { error: "File and format are required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate format
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";
    if (!isValidConversion(fileExtension, format)) {
      return NextResponse.json(
        { error: `Conversion from ${fileExtension.toUpperCase()} to ${format.toUpperCase()} is not supported` },
        { status: 400 }
      );
    }

    // Get the appropriate API endpoint
    const apiUrl = getApiEndpoint(fileExtension, format);
    if (!apiUrl) {
      return NextResponse.json(
        { error: "Unsupported format" },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.CLOUDMERSIVE_API_KEY;
    if (!apiKey) {
      console.error("Cloudmersive API key is not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Create a new FormData instance for the Cloudmersive API
    const cloudmersiveFormData = new FormData();
    cloudmersiveFormData.append("file", file);

    // Call the Cloudmersive API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Accept": "application/json",
      },
      body: cloudmersiveFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudmersive API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: apiUrl
      });
      
      return NextResponse.json(
        { error: `Conversion failed: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    // Get the converted file as a blob
    const convertedBlob = await response.blob();
    
    if (!convertedBlob || convertedBlob.size === 0) {
      return NextResponse.json(
        { error: "Conversion resulted in an empty file" },
        { status: 500 }
      );
    }

    // Create a unique filename for the converted file
    const originalName = file.name;
    const newFileName = `${originalName.split(".")[0]}_converted.${format}`;

    // Convert blob to base64
    const arrayBuffer = await convertedBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Return the file data and metadata
    return NextResponse.json({
      fileData: base64,
      fileName: newFileName,
      format: format,
      size: convertedBlob.size,
      contentType: getContentType(format)
    });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert file" },
      { status: 500 }
    );
  }
}

function isValidConversion(sourceFormat: string, targetFormat: string): boolean {
  // Check if both formats are supported
  const sourceGroup = getFormatGroup(sourceFormat);
  const targetGroup = getFormatGroup(targetFormat);

  if (!sourceGroup || !targetGroup) {
    return false;
  }

  // Allow conversion within the same group
  if (sourceGroup === targetGroup) {
    return true;
  }

  // Allow specific cross-group conversions
  const crossGroupConversions = {
    document: ["image"],
    image: ["document"],
  };

  return crossGroupConversions[sourceGroup as keyof typeof crossGroupConversions]?.includes(targetGroup) || false;
}

function getFormatGroup(format: string): string | null {
  for (const [group, formats] of Object.entries(SUPPORTED_FORMATS)) {
    if (formats.includes(format)) {
      return group;
    }
  }
  return null;
}

function getApiEndpoint(sourceFormat: string, targetFormat: string): string | null {
  const baseUrl = "https://api.cloudmersive.com/convert";
  
  // Document conversions
  if (sourceFormat === "docx" && targetFormat === "pdf") {
    return `${baseUrl}/docx/to/pdf`;
  } else if (sourceFormat === "pdf" && targetFormat === "docx") {
    return `${baseUrl}/pdf/to/docx`;
  } else if (sourceFormat === "docx" && targetFormat === "txt") {
    return `${baseUrl}/docx/to/txt`;
  } else if (sourceFormat === "pdf" && targetFormat === "txt") {
    return `${baseUrl}/pdf/to/txt`;
  } else if (sourceFormat === "docx" && targetFormat === "html") {
    return `${baseUrl}/docx/to/html`;
  } else if (sourceFormat === "pdf" && targetFormat === "html") {
    return `${baseUrl}/pdf/to/html`;
  }
  
  // Image conversions
  else if (sourceFormat === "jpg" && targetFormat === "png") {
    return `${baseUrl}/image/jpg/to/png`;
  } else if (sourceFormat === "png" && targetFormat === "jpg") {
    return `${baseUrl}/image/png/to/jpg`;
  } else if (sourceFormat === "jpg" && targetFormat === "webp") {
    return `${baseUrl}/image/jpg/to/webp`;
  } else if (sourceFormat === "png" && targetFormat === "webp") {
    return `${baseUrl}/image/png/to/webp`;
  }
  
  // Data conversions
  else if (sourceFormat === "csv" && targetFormat === "xlsx") {
    return `${baseUrl}/csv/to/xlsx`;
  } else if (sourceFormat === "xlsx" && targetFormat === "csv") {
    return `${baseUrl}/xlsx/to/csv`;
  } else if (sourceFormat === "csv" && targetFormat === "json") {
    return `${baseUrl}/csv/to/json`;
  } else if (sourceFormat === "json" && targetFormat === "csv") {
    return `${baseUrl}/json/to/csv`;
  }

  return null;
}

async function handleDocumentConversion(buffer: Buffer, sourceFormat: string, targetFormat: string) {
  switch(targetFormat) {
    case 'pdf':
      if (sourceFormat === 'docx') {
        return await convertDocumentApi.convertDocumentDocxToPdf(buffer);
      } else if (sourceFormat === 'html') {
        return await convertDocumentApi.convertDocumentHtmlToPdf(buffer);
      }
      break;
    case 'docx':
      if (sourceFormat === 'pdf') {
        return await convertDocumentApi.convertDocumentPdfToDocx(buffer);
      }
      break;
    case 'html':
      if (sourceFormat === 'pdf') {
        return await convertDocumentApi.convertDocumentPdfToHtml(buffer);
      }
      break;
    case 'txt':
      if (sourceFormat === 'pdf') {
        return await convertDocumentApi.convertDocumentPdfToTxt(buffer);
      } else if (sourceFormat === 'docx') {
        return await convertDocumentApi.convertDocumentDocxToTxt(buffer);
      }
      break;
    // Add more document conversion cases as needed
  }

  throw new Error(`Unsupported document conversion from ${sourceFormat} to ${targetFormat}`);
}

async function handleImageConversion(buffer: Buffer, sourceFormat: string, targetFormat: string) {
  switch(targetFormat) {
    case 'png':
      if (['jpg', 'jpeg'].includes(sourceFormat)) {
        return await convertImageApi.convertImageJpgToPng(buffer);
      }
      break;
    case 'jpg':
    case 'jpeg':
      if (sourceFormat === 'png') {
        return await convertImageApi.convertImagePngToJpg(buffer);
      }
      break;
    // Add more image conversion cases as needed
  }

  throw new Error(`Unsupported image conversion from ${sourceFormat} to ${targetFormat}`);
}

async function handleDataConversion(buffer: Buffer, sourceFormat: string, targetFormat: string) {
  switch(targetFormat) {
    case 'csv':
      if (sourceFormat === 'xlsx') {
        return await convertDataApi.convertDataXlsxToCsv(buffer);
      } else if (sourceFormat === 'json') {
        return await convertDataApi.convertDataJsonToCsv(buffer);
      }
      break;
    case 'json':
      if (sourceFormat === 'csv') {
        return await convertDataApi.convertDataCsvToJson(buffer);
      }
      break;
    // Add more data conversion cases as needed
  }

  throw new Error(`Unsupported data conversion from ${sourceFormat} to ${targetFormat}`);
}

function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    html: 'text/html',
    txt: 'text/plain',
    rtf: 'application/rtf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    webp: 'image/webp',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json',
    xml: 'application/xml',
  };

  return contentTypes[format] || 'application/octet-stream';
}

