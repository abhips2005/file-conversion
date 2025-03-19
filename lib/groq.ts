import { Groq } from "groq";

// Fallback implementation for Groq API
const groqClient = {
  chat: {
    completions: {
      create: async ({ messages, model, temperature, max_tokens }: any) => {
        // Make a direct fetch to Groq API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: model || "llama3-8b-8192",
            messages,
            temperature: temperature || 0.7,
            max_tokens: max_tokens || 1024
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to get response from Groq API");
        }

        return response.json();
      }
    }
  }
};

export default groqClient;
