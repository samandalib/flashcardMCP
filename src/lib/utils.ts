import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract the first line of content as a note title
 * @param content - The note content
 * @param maxLength - Maximum length for the title (default: 200)
 * @param fallback - Fallback title if no content (default: "Untitled Note")
 * @returns The extracted title
 */
export function extractNoteTitle(
  content: string, 
  maxLength: number = 200, 
  fallback: string = "Untitled Note"
): string {
  const firstLine = content.trim().split('\n')[0];
  return firstLine && firstLine.length > 0 
    ? firstLine.substring(0, maxLength)
    : fallback;
}
