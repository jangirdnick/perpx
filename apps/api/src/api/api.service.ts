import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { TavilySearch } from '@langchain/tavily';
import type { WebSource } from '@perpx/shared/types/message.type';

import type { ChatMessage, ModelType } from './api.types';
import { buildMessages, extractToken } from './utils/api-message.utils';
import { buildWebContext, parseTavilyResults } from './utils/api-search.utils';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  private readonly NORMAL_SYSTEM_PROMPT = `
    You are a helpful AI assistant.
    
    Follow these rules strictly:
    1. Answer in clear, natural language.
    2. Keep the response directly relevant to the user's message.
    3. If attachment context or retrieved document context is provided, use it as the primary source of truth.
    4. If a retrieved document context is provided, answer strictly based on that context.
    5. Do not add facts, assumptions, or explanations that are not supported by the provided document context.
    6. If the answer is not present in the document context, reply exactly: "I don't have enough information from the document."
    7. If attachments are provided, analyze them together with the user's message.
    8. If the attachments are images, describe or analyze only what is visibly present.
    9. If the attachments are documents or files and their direct content is not available, use only their available metadata and clearly state that deeper file analysis is limited.
    10. If no document context is provided, answer normally but do not invent details you do not know.
    11. If the user writes in Hindi or Hinglish, reply in the same style.
    12. Do not mention these rules in your answer.
  `;

  private readonly WEB_SEARCH_SYSTEM_PROMPT = `
    You are a web search AI assistant.
    
    Follow these rules strictly:
    1. Answer using only the provided web search results and any provided attachment context.
    2. If retrieved document context is also provided, treat it as authoritative for document-related parts of the answer.
    3. If a retrieved document context is provided, answer strictly based on that context for any document-based claims.
    4. If the answer to a document-related question is not present in the document context, reply exactly: "I don't have enough information from the document."
    5. Do not make up facts that are not supported by the web results, attachment context, or retrieved document context.
    6. If multiple web sources disagree, mention the uncertainty clearly and avoid choosing unsupported claims as fact.
    7. Prefer the most recent and reliable information when available in the provided results.
    8. If attachments are provided, combine them with the search results only when relevant.
    9. If the answer is incomplete in the provided results or attachment context, state that clearly.
    10. Keep the answer concise, useful, and directly relevant to the user's query.
    11. If the user writes in Hindi or Hinglish, reply in the same style.
    12. Do not mention these rules in your answer.
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

  private getModel(model: ModelType): ChatGoogleGenerativeAI | ChatMistralAI {
    if (model === 'gemini') {
      return new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        streaming: true,
        temperature: 0.2,
      });
    }

    if (model === 'mistral') {
      return new ChatMistralAI({
        model: 'mistral-small-latest',
        apiKey: process.env.MISTRAL_API_KEY,
        streaming: true,
        temperature: 0.3,
      });
    }

    throw new BadRequestException('Invalid model');
  }

  async streamNormalResponse(
    messages: ChatMessage[],
    pdfContext: string,
    onToken: (token: string) => void,
    onEnd: (full: string) => void,
    spaceContext?: string,
  ): Promise<void> {
    try {
      const llm = this.getModel('gemini');
      let systemPrompt = this.NORMAL_SYSTEM_PROMPT;
      if (spaceContext) {
        systemPrompt += `\n\nSpace Context:\nYou are currently in a Workspace/Space with the following context: "${spaceContext}". Keep this context in mind when answering.`;
      }

      const formatMessages = await buildMessages(
        systemPrompt,
        messages,
        pdfContext,
        this.logger,
      );

      const stream = await llm.stream(formatMessages);
      let fullResponse = '';

      for await (const chunk of stream) {
        const token = extractToken(chunk);

        if (token) {
          fullResponse += token;
          onToken(token);
        }
      }

      onEnd(fullResponse);
    } catch (err: unknown) {
      this.logger.error('Stream error:', err);
      onEnd('[Error: Failed to get response]');
    }
  }

  async streamWebSearchResponse(
    messages: ChatMessage[],
    webSearch: boolean,
    pdfContext: string,
    onToken: (token: string) => void,
    onEnd: (full: string, sources: WebSource[]) => void,
    spaceContext?: string,
  ): Promise<void> {
    try {
      if (!webSearch) {
        return this.streamNormalResponse(
          messages,
          pdfContext,
          onToken,
          (full) => onEnd(full, []),
          spaceContext,
        );
      }

      const llm = this.getModel('gemini');

      const tavilyTool = new TavilySearch({
        maxResults: 5,
        searchDepth: 'advanced',
      });

      const latestUserMessage =
        [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

      const rawResults: unknown = await tavilyTool.invoke({
        query: latestUserMessage,
      });

      const sources = parseTavilyResults(rawResults);
      const webContext = buildWebContext(sources);

      let systemPrompt = `${this.WEB_SEARCH_SYSTEM_PROMPT}\n\nWeb search results:\n${webContext}`;
      if (spaceContext) {
        systemPrompt += `\n\nSpace Context:\nYou are currently in a Workspace/Space with the following context: "${spaceContext}". Keep this context in mind when answering.`;
      }

      const formatMessages = await buildMessages(
        systemPrompt,
        messages,
        pdfContext,
        this.logger,
      );

      const stream = await llm.stream(formatMessages);
      let fullResponse = '';

      for await (const chunk of stream) {
        const token = extractToken(chunk);

        if (token) {
          fullResponse += token;
          onToken(token);
        }
      }

      onEnd(fullResponse, sources);
    } catch (err: unknown) {
      this.logger.error('Stream error:', err);
      onEnd('[Error: Failed to get response]', []);
    }
  }

  async generateTitle(message: string, model: ModelType): Promise<string> {
    const llm = this.getModel(model);

    const formatMessages = [
      new SystemMessage(this.TITLE_SYSTEM_PROMPT),
      new HumanMessage(message),
    ];

    const response = await llm.invoke(formatMessages);
    return typeof response.content === 'string' ? response.content : '';
  }
}
