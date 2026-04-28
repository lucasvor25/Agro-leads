import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  @Get('health')
  keepAlive() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
