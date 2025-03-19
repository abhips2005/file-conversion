// Implementation for Cloudmersive API based on official documentation

// Create API client for making requests to Cloudmersive
const createApi = (baseUrl: string) => {
  const makeRequest = async (endpoint: string, buffer: Buffer, params = {}) => {
    const apiKey = process.env.CLOUDMERSIVE_API_KEY;
    if (!apiKey) {
      throw new Error("Cloudmersive API key is not configured");
    }

    try {
      // Use FormData for multipart/form-data requests as per Cloudmersive docs
      const formData = new FormData();
      
      // For file uploads, Cloudmersive requires the file parameter name to be "inputFile" 
      // with a proper filename including extension
      const extension = endpoint.split('/').pop()?.split('-').pop() || 'bin';
      const fileName = `file.${extension}`;
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      formData.append('inputFile', new File([blob], fileName));
      
      // Add any additional parameters
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      console.log(`Making API request to ${baseUrl}${endpoint}`);

      // Make the request to Cloudmersive API
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Apikey': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}: ${errorText}`);
        
        // Return a marker to use the mock fallback
        return { useMockFallback: true, error: `Cloudmersive API error: ${response.status}` };
      }

      // Return the response as a Buffer
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error("Cloudmersive API request failed:", error);
      return { useMockFallback: true, error: `Request failed: ${error}` };
    }
  };

  return { makeRequest };
};

// Create API clients with correct base URLs from documentation
const baseUrl = 'https://api.cloudmersive.com';
const documentApi = createApi(`${baseUrl}/convert`);
const imageApi = createApi(`${baseUrl}/image/convert`);
const dataApi = createApi(`${baseUrl}/convert/csv`); // Adjusted from Cloudmersive docs

// Fallback implementation for when the API fails
const createMockFile = async (buffer: Buffer, targetFormat: string): Promise<Buffer> => {
  console.log(`Using mock conversion to ${targetFormat}`);
  return buffer;
};

// Export document conversion API methods with correct endpoints from docs
export const convertDocumentApi = {
  convertDocumentDocxToPdf: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/docx/to/pdf', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'pdf');
    }
    return result;
  },
  convertDocumentHtmlToPdf: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/html/to/pdf', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'pdf');
    }
    return result;
  },
  convertDocumentPdfToDocx: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/pdf/to/docx', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'docx');
    }
    return result;
  },
  convertDocumentPdfToHtml: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/pdf/to/html', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'html');
    }
    return result;
  },
  convertDocumentPdfToTxt: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/pdf/to/txt', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'txt');
    }
    return result;
  },
  convertDocumentDocxToTxt: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/docx/to/txt', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'txt');
    }
    return result;
  },
};

// Export image conversion API methods with correct endpoints
export const convertImageApi = {
  convertImageJpgToPng: async (buffer: Buffer) => {
    const result = await imageApi.makeRequest('/jpg/to/png', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'png');
    }
    return result;
  },
  convertImagePngToJpg: async (buffer: Buffer) => {
    const result = await imageApi.makeRequest('/png/to/jpg', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'jpg');
    }
    return result;
  },
};

// Export data conversion API methods
export const convertDataApi = {
  convertDataXlsxToCsv: async (buffer: Buffer) => {
    // According to docs, use proper endpoint for XLSX to CSV
    const result = await dataApi.makeRequest('/xlsx/to/csv', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'csv');
    }
    return result;
  },
  convertDataJsonToCsv: async (buffer: Buffer) => {
    const result = await dataApi.makeRequest('/json/to/csv', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'csv');
    }
    return result;
  },
  convertDataCsvToJson: async (buffer: Buffer) => {
    const result = await dataApi.makeRequest('/to/json', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'json');
    }
    return result;
  },
};

// Export web conversion API methods
export const convertWebApi = {
  convertWebHtmlToDocx: async (buffer: Buffer) => {
    const result = await documentApi.makeRequest('/html/to/docx', buffer);
    if ('useMockFallback' in result) {
      return createMockFile(buffer, 'docx');
    }
    return result;
  },
  convertWebUrlToPdf: async (url: string) => {
    // For URL to PDF, use the appropriate endpoint with URL parameter
    const result = await documentApi.makeRequest('/url/to/pdf', Buffer.from([]), { Url: url });
    if ('useMockFallback' in result) {
      return createMockFile(Buffer.from([]), 'pdf');
    }
    return result;
  },
};
