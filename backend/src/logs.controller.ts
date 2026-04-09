import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';

@Controller('logs')
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  @Post()
  @HttpCode(204)
  receiveClientLogs(@Body() body: any) {
    if (body.level === 'error') {
      this.logger.error('Client Error', body.messages, body);
    } else if (body.level === 'warn') {
      this.logger.warn('Client Warning', body);
    } else {
      this.logger.log('Client Log', body);
    }
  }
}
