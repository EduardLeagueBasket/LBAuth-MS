// src/interceptors/rpc-exception.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Si ya es un RpcException, simplemente lo relanzamos
        if (error instanceof RpcException) {
          return throwError(() => error);
        }
        // Convertimos la excepción original en un RpcException con estructura clara
        return throwError(
          () =>
            new RpcException({
              status: error.status || 500,
              message: error.message || 'Internal server error',
              error: error.name || 'Error',
            }),
        );
      }),
    );
  }
}
