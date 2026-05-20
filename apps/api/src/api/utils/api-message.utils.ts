import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import type { ChatMessage, MessagePart } from '../api.types';
import { buildUserMessageContent } from './api-attachment.utils';
import type { Logger } from '@nestjs/common';

export async function buildMessages(
  systemPrompt: string,
  messages: ChatMessage[],
  pdfContext: string,
  logger?: Logger,
): Promise<(SystemMessage | HumanMessage | AIMessage)[]> {
  const chatMessages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  for (const msg of messages) {
    if (msg.role === 'user') {
      const content: string | MessagePart[] = await buildUserMessageContent(
        msg.content,
        msg.attachments,
        pdfContext,
        logger,
      );

      chatMessages.push(
        new HumanMessage({
          content,
        }),
      );
    } else {
      chatMessages.push(new AIMessage(msg.content));
    }
  }

  return chatMessages;
}

export function extractToken(chunk: AIMessage | { content?: unknown }): string {
  const content = chunk?.content;

  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return (content as { text?: string }[])
      .map((c) => (typeof c.text === 'string' ? c.text : ''))
      .join('');
  }

  return '';
}
