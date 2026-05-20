import type { Logger } from '@nestjs/common';
import type { AttachmentInput, MessagePart } from '../api.types';

export function isImageAttachment(attachment: AttachmentInput): boolean {
  return (
    typeof attachment.type === 'string' && attachment.type.startsWith('image/')
  );
}

export function buildAttachmentContext(
  attachments?: AttachmentInput[],
): string {
  if (!attachments || attachments.length === 0) return '';

  return attachments
    .map((file, index) => {
      const name = typeof file.name === 'string' ? file.name : 'unknown';
      const type = typeof file.type === 'string' ? file.type : 'unknown';
      const fileUrl =
        typeof file.fileUrl === 'string' && file.fileUrl.length > 0
          ? file.fileUrl
          : 'N/A';

      return `Attachment ${index + 1}: name=${name}, type=${type}, url=${fileUrl}`;
    })
    .join('\n');
}

export async function fetchImageAsBase64(
  url: string,
  logger?: Logger,
): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${mimeType};base64,${base64}`;
  } catch (error: unknown) {
    logger?.error(`Failed to fetch image from URL for AI: ${url}`, error);
    return null;
  }
}

export async function buildUserMessageContent(
  text: string,
  attachments?: AttachmentInput[],
  pdfContext?: string,
  logger?: Logger,
): Promise<string | MessagePart[]> {
  if (!attachments || attachments.length === 0) return text;

  const parts: MessagePart[] = [];
  const imageAttachments = attachments.filter((file) =>
    isImageAttachment(file),
  );
  const nonImageAttachments = attachments.filter(
    (file) => !isImageAttachment(file),
  );

  let combinedText = text;

  if (pdfContext && pdfContext.length > 0) {
    combinedText += `\n\n=== RETRIEVED DOCUMENT CONTEXT ===\nHere is information retrieved from the user's documents. Use this to answer the query if relevant:\n${pdfContext}\n==================================\n`;
  }

  if (nonImageAttachments.length > 0) {
    combinedText += `\n\nAttached files metadata:\n${buildAttachmentContext(
      nonImageAttachments,
    )}\n\nImportant:\n- Use attached file metadata when relevant.\n- If direct file content is not available, say clearly that deeper file analysis is limited.\n`;
  }

  parts.push({
    type: 'text',
    text: combinedText,
  });

  for (const file of imageAttachments) {
    if (typeof file.fileUrl === 'string' && file.fileUrl.length > 0) {
      const base64Data = await fetchImageAsBase64(file.fileUrl, logger);

      if (base64Data) {
        parts.push({
          type: 'image_url',
          image_url: { url: base64Data },
        });
      }
    }
  }

  return parts;
}
