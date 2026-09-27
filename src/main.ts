import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcExceptionInterceptor } from './common/exceptions/rpc-custom-exception.filter';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
        queue: 'auth-queue',
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new RpcExceptionInterceptor());

  await app.listen();
  logger.log('AuthService is listening on NATS');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
