import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { handleServiceError } from '../utils/errorHandler';
import { randomUUID } from 'crypto';

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private pinecone: Pinecone;
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-2-preview',
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async processAndStorePdf(fileUrl: string, chatId: string, fileName: string) {
    try {
      this.logger.log(`Starting PDF processing for chat: ${chatId}`);

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new BadRequestException('Failed to download PDF from S3');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 1. PDF Parsing
      const parser = new PDFParse({ data: buffer });
      let rawText = '';
      try {
        const textResult = await parser.getText();
        rawText = typeof textResult.text === 'string' ? textResult.text : '';
      } finally {
        await parser.destroy();
      }

      if (!rawText.trim()) {
        throw new BadRequestException('No readable text found in PDF');
      }

      // 2. Chunking
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const chunks = await splitter.splitText(rawText);
      const validChunks = chunks.filter((chunk) => chunk.trim().length > 0);

      if (validChunks.length === 0) {
        throw new BadRequestException('No records to upsert into Pinecone');
      }

      // 3. Generate Embeddings manually (Native approach)
      this.logger.log(
        `Generating embeddings for ${validChunks.length} chunks...`,
      );
      // Warning: Agar array bohot bada ho toh Promise.all Google API rate limit hit kar sakta hai,
      // but under ~50 chunks it's usually fine.
      const docRecords: PineconeRecord[] = await Promise.all(
        validChunks.map(async (chunk) => {
          const embeddingValues = await this.embeddings.embedQuery(chunk);
          return {
            id: randomUUID(),
            values: embeddingValues,
            metadata: {
              chatId,
              fileName,
              type: 'pdf',
              pageContent: chunk,
            },
          };
        }),
      );

      // 4. Upsert natively using official Pinecone SDK
      const pineconeIndex = this.pinecone.Index(
        process.env.PINECONE_INDEX_NAME!,
      );

      await pineconeIndex.namespace(`chat_${chatId}`).upsert({
        records: docRecords,
      });
      this.logger.log(
        `Successfully embedded and upserted ${docRecords.length} chunks into Pinecone.`,
      );

      return true;
    } catch (error) {
      this.logger.error('Error processing and storing PDF:', error);
      throw error;
    }
  }

  async searchPdfChunks(query: string, chatId: string, topK: number = 5) {
    try {
      // 1. Embed the search query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // 2. Query Pinecone natively
      const pineconeIndex = this.pinecone.Index(
        process.env.PINECONE_INDEX_NAME!,
      );
      const result = await pineconeIndex.namespace(`chat_${chatId}`).query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      if (!result.matches || result.matches.length === 0) return '';

      // 3. Extract text from metadata
      return result.matches
        .map(
          (match, i) =>
            `--- Excerpt ${i + 1} ---\n${(match.metadata?.pageContent as string) || ''}`,
        )
        .join('\n\n');
    } catch (error) {
      this.logger.error('Error searching PDF chunks:', error);
      return handleServiceError(error, 'Error searching PDF chunks');
    }
  }
}
