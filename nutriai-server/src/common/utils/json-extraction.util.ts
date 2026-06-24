import { Logger } from '@nestjs/common';

const logger = new Logger('JsonExtractionUtil');

export function extractJSON<T = any>(text: string): T {
  if (!text) {
    throw new Error('Input text is empty');
  }

  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
  }
  cleaned = cleaned.trim();

  // Try direct parsing first
  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    logger.debug(`Direct JSON parse failed, trying brace extraction: ${err.message}`);
  }

  // Find the first '{' and the last '}' or first '[' and last ']'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  let jsonStr = '';

  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    jsonStr = cleaned.slice(firstBracket, lastBracket + 1);
  }

  if (!jsonStr) {
    throw new Error('Could not locate JSON structure in the response');
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (err: any) {
    // Attempt basic cleanup for common LLM JSON syntax errors
    try {
      const fixedJsonStr = jsonStr
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/[\u201C\u201D]/g, '"'); // Replace curly double quotes
      return JSON.parse(fixedJsonStr) as T;
    } catch {
      throw new Error(`JSON extraction failed: ${err.message}. Original text snippet: ${text.substring(0, 100)}...`);
    }
  }
}
