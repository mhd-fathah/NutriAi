import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || (res as any).error || JSON.stringify(res);
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      }
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errorDetails = exception.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    const logMessage = `${request.method} ${request.url} - Status: ${status} - Error: ${
      typeof message === 'object' ? JSON.stringify(message) : message
    }`;

    if (status >= 500) {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: typeof message === 'string' ? message : 'Bad Request',
      details: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
