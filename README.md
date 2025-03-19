# File Conversion Chatbot

A web application that provides file conversion services using Cloudmersive API and an AI assistant powered by Groq.

## Features

- Convert files between various formats:
  - Document formats: PDF, DOCX, HTML, TXT, RTF, MD
  - Image formats: JPG, PNG, GIF, BMP, TIFF, WEBP
  - Data formats: CSV, XLSX, JSON, XML
- AI-powered assistant to help with conversion questions

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   CLOUDMERSIVE_API_KEY=your-api-key-here
   GROQ_API_KEY=your-api-key-here
   ```
4. Get your API keys:
   - Sign up for a Cloudmersive API key at [https://cloudmersive.com/](https://cloudmersive.com/)
   - Sign up for a Groq API key at [https://console.groq.com/](https://console.groq.com/)
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Implementation Notes

This application uses direct API calls to both Cloudmersive and Groq services instead of using their official Node.js client libraries. This approach eliminates dependency issues and provides a more consistent experience across different environments.

### Cloudmersive API Integration
The application directly calls Cloudmersive REST APIs using fetch, handling file uploads and conversions without needing the cloudmersive-convert-api-client package.

### Groq API Integration
The application uses direct HTTP requests to the Groq chat completion API, eliminating the need for the groq package.

## Troubleshooting

1. Verify your API keys are correctly set in the `.env.local` file.
2. Check browser console or server logs for any API-related errors.
3. Ensure you have a stable internet connection as the app makes direct API calls.
4. For large file conversions, be aware of API rate limits and file size constraints.

## Technologies Used

- Next.js
- React
- TypeScript
- Cloudmersive API for file conversions
- Groq API for AI chatbot
- Tailwind CSS & Shadcn UI components
