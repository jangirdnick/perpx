import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private config: ConfigService) {
    const dbUrl = config.getOrThrow<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString: dbUrl,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.warn('✅ Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.warn('❌ Prisma disconnected');
  }
}
