import OpenAI from "openai";
import { z } from "zod";

export const extractionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});

export type Extraction = z.infer<typeof extractionSchema>;

export class AIService {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey || "dummy-key",
    });
  }

  async extractFromText(text: string): Promise<Extraction> {
    if (this.client.apiKey === "dummy-key" || !this.client.apiKey) {
      throw new Error(
        "AI API key is missing. Configure OPENAI_API_KEY in your wrangler variables or .dev.vars file.",
      );
    }

    const systemPrompt = `You are a document parser. Analyze the provided text and extract metadata.
Respond ONLY with a raw JSON object. Do not wrap in markdown code blocks.

JSON Structure:
{
  "title": "Extracted title",
  "category": "Optional category",
  "summary": "Optional summary of the text"
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      });

      const choice = response.choices?.[0];
      if (!choice?.message?.content) {
        throw new Error("Empty response from AI API");
      }

      const jsonText = choice.message.content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      return extractionSchema.parse(JSON.parse(jsonText));
    } catch (err: any) {
      console.error("AI Extraction Failure:", err);
      throw new Error(`Failed to extract data: ${err?.message || err}`);
    }
  }
}
