import { generateObject } from "ai";
import { model } from "./provider";
import {
  suggestionResponseSchema,
  type SuggestionResponse,
} from "./schemas";

export async function parseSuggestionResponse(
  prompt: string
): Promise<SuggestionResponse> {
  const { object } = await generateObject({
    model,
    mode: "json",
    schema: suggestionResponseSchema,
    prompt,
  });

  return object;
}
