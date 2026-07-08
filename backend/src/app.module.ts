import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VersionsModule } from './versions/versions.module';
import { EntriesModule } from './entries/entries.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    VersionsModule,
    EntriesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
