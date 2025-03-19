import { NextRequest, NextResponse } from "next/server";
import groqClient from "@/lib/groq";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Enhanced system message for the futuristic assistant
    const systemMessage = {
      role: "system", 
      content: `You are NeoConvert AI, an advanced file conversion assistant with cutting-edge capabilities.
      
You can help users convert files between different formats with AI-powered enhancements:
- PDF to DOCX/DOC and vice versa
- Images (JPG, PNG, GIF) to PDF and vice versa
- Data formats (CSV, JSON, XML) conversions
- And many other format conversions

You offer smart suggestions for optimizing files and can analyze file content for better conversion results.
Your tone is professional but friendly, with a slightly futuristic feel. You use technical terminology when appropriate.

Always suggest relevant conversion options based on the user's needs and the file type they're working with.
When users ask about specific formats, provide clear information about their pros and cons.`
    };

    // Add system message if it doesn't exist
    const apiMessages = messages[0]?.role === "system" 
      ? messages 
      : [systemMessage, ...messages];

    const completion = await groqClient.chat.completions.create({
      messages: apiMessages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Error processing chat request" },
      { status: 500 }
    );
  }
}

