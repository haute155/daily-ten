import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 콤마로 구분된 여러 origin 허용 (예: 로컬 3000/3001)
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(
    ',',
  );
  app.enableCors({ origin: origins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 필드는 제거
      transform: true, // 페이로드를 DTO 클래스 인스턴스로 변환
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
