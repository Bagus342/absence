// import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
// import { BaseExceptionFilter } from '@nestjs/core';
// import { FastifyReply } from 'fastify';
// import { ZodValidationException } from 'nestjs-zod';
// import { ZodError } from 'zod';

// @Catch(HttpException)
// export class HttpExceptionFilter extends BaseExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<FastifyReply>();
//     const status = exception.getStatus();

//     if (exception instanceof ZodValidationException) {
//       const zodError = exception.getZodError();
//       if (zodError instanceof ZodError) {
//         const errors: any = JSON.parse(zodError.message);
//         response.status(status).send({
//           statusCode: status,
//           message: zodError.message,
//         });
//       }
//     }
//   }
// }
