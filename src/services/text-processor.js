/**
 * Text processing utilities for TTS
 * Includes text cleaning and intelligent chunking
 */

/**
 * Clean text in multiple stages
 * - Remove Markdown formatting
 * - Remove emojis
 * - Remove URLs
 * - Normalize whitespace
 * - Remove quotes and special formatting
 */
export function cleanText(text, options = {}) {
  const {
    removeMarkdown = true,
    removeEmojis = true,
    removeUrls = true,
    removeHtmlTags = true,
    normalizeWhitespace = true,
  } = options;

  let cleaned = text;

  // Remove HTML tags
  if (removeHtmlTags) {
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  }

  // Remove Markdown formatting
  if (removeMarkdown) {
    cleaned = cleaned
      .replace(/#{1,6}\s+/g, '') // Headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
      .replace(/\*(.+?)\*/g, '$1') // Italic
      .replace(/__(.+?)__/g, '$1') // Bold alternative
      .replace(/_(.+?)_/g, '$1') // Italic alternative
      .replace(/~~(.+?)~~/g, '$1') // Strikethrough
      .replace(/`(.+?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
      .replace(/!\[.+?\]\(.+?\)/g, ''); // Images
  }

  // Remove URLs
  if (removeUrls) {
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  }

  // Remove emojis and special symbols
  if (removeEmojis) {
    // Remove common emoji patterns
    cleaned = cleaned
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
      .replace(/[\u{2600}-\u{27BF}]/gu, '') // Miscellaneous symbols
      .replace(/[\u{2300}-\u{23FF}]/gu, '') // Miscellaneous technical
      .replace(/[\u{2000}-\u{206F}]/gu, ''); // General punctuation
  }

  // Normalize whitespace
  if (normalizeWhitespace) {
    cleaned = cleaned
      .replace(/\r\n/g, '\n') // Convert CRLF to LF
      .replace(/\n+/g, ' ') // Replace multiple newlines with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  return cleaned;
}

/**
 * Intelligently chunk text by sentence boundaries
 * Respects max characters per chunk and tries to break at natural boundaries
 */
export function smartChunkText(text, maxChunkSize = 500) {
  if (!text || text.length === 0) {
    return [];
  }

  // Sentence delimiters
  const sentenceDelimiters = /([。！？\n]|[\.\!\?]\s+)/g;
  
  const chunks = [];
  let currentChunk = '';

  // Split by sentence delimiters while keeping them
  const sentences = text.split(sentenceDelimiters).filter(s => s && s.trim());

  for (const sentence of sentences) {
    const candidateChunk = (currentChunk + sentence).trim();

    if (candidateChunk.length <= maxChunkSize) {
      currentChunk = candidateChunk;
    } else {
      // Current chunk is full
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // If sentence itself is longer than maxChunkSize, split by words
      if (sentence.length > maxChunkSize) {
        const words = sentence.split(/\s+/);
        let wordChunk = '';

        for (const word of words) {
          if ((wordChunk + word).length <= maxChunkSize) {
            wordChunk = (wordChunk + ' ' + word).trim();
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
            }
            wordChunk = word;
          }
        }

        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = sentence.trim();
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Process and validate text for TTS
 */
export function processText(text, options = {}) {
  const {
    maxLength = 10000,
    minLength = 1,
    shouldClean = true,
    chunkSize = 500,
  } = options;

  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  let processed = text;

  // Clean text if requested
  if (shouldClean) {
    processed = cleanText(processed, options);
  }

  // Validate length
  if (processed.length < minLength) {
    throw new Error(`Text is too short. Minimum length: ${minLength}`);
  }

  if (processed.length > maxLength) {
    throw new Error(`Text is too long. Maximum length: ${maxLength}`);
  }

  return {
    original: text,
    cleaned: processed,
    chunks: smartChunkText(processed, chunkSize),
  };
}
