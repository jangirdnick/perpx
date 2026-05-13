import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

type ModelType = 'gemini' | 'mistral';
type Role = 'user' | 'ai';

interface ChatMessage {
  role: Role;
  content: string;
}

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  // System prompts
  private readonly NORMAL_SYSTEM_PROMPT = `
    You are a helpful AI assistant.
    Reply in clear, natural language.
    Keep responses relevant to the user's message.
    If the user writes in Hindi or Hinglish, reply in the same style.
  `;

  private readonly TITLE_SYSTEM_PROMPT = `
    You generate short chat titles.
    Rules:
    - Return only one short title
    - Max 7 words
    - No quotes
    - No emoji
    - No extra explanation
    - The title should summarize the user's message
  `;

  // Model selection
  private getModel(model: ModelType): ChatGoogleGenerativeAI | ChatMistralAI {
    if (model === 'gemini') {
      return new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        streaming: true,
      });
    }

    if (model === 'mistral') {
      return new ChatMistralAI({
        model: 'mistral-small-latest',
        apiKey: process.env.MISTRAL_API_KEY,
        streaming: true,
      });
    }

    throw new BadRequestException('Invalid model');
  }

  // Message building
  private buildMessages(systemPrompt: string, messages: ChatMessage[]) {
    // Store system, human and ai messages
    const chatMessages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(systemPrompt),
    ];

    for (const msg of messages) {
      if (msg.role === 'user') {
        // User messages are converted to HumanMessage
        chatMessages.push(new HumanMessage(msg.content));
      } else {
        // AI messages are ignored for now
        chatMessages.push(new AIMessage(msg.content));
      }
    }

    return chatMessages;
  }

  // Stream chat message normal response
  async streamNormalResponse(
    messages: ChatMessage[],
    model: ModelType,
    onToken: (token: string) => void,
    onEnd: (full: string) => void,
  ) {
    try {
      const llm = this.getModel(model);

      const formatMessages = this.buildMessages(
        this.NORMAL_SYSTEM_PROMPT,
        messages,
      );

      const stream = await llm.stream(formatMessages);

      let fullResponse = '';

      // Stream tokens
      for await (const chunk of stream) {
        const token =
          typeof chunk.content === 'string'
            ? chunk.content
            : Array.isArray(chunk.content)
              ? (chunk.content as { text: string }[])
                  .map((c: { text: string }) => c.text || '')
                  .join('')
              : '';

        if (token) {
          fullResponse += token;
          onToken(token);
        }
      }

      onEnd(fullResponse);
    } catch (err) {
      this.logger.error('Stream error:', err);
      onEnd('[Error: Failed to get response]');
    }
  }

  // Generate chat title
  async generateTitle(message: string, model: ModelType) {
    const llm = this.getModel(model);

    const formatMessages = [
      new SystemMessage(this.TITLE_SYSTEM_PROMPT),
      new HumanMessage(message),
    ];

    const response = await llm.invoke(formatMessages);
    return response.content as string;
  }
}
