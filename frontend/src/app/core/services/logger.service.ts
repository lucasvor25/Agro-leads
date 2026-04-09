import { Injectable, isDevMode } from '@angular/core';
import pino from 'pino';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public pinoLogger: pino.Logger;

  constructor() {
    this.pinoLogger = pino({
      level: environment.production ? 'info' : 'debug',
      browser: {
        asObject: true,
        transmit: {
          level: 'error',
          send: (level, logEvent) => {
            const url = `${environment.apiUrl}/logs`;
            const data = {
              level,
              url: window.location.href,
              messages: logEvent.messages,
              time: logEvent.ts
            };
            
            // Usar fetch com keepalive para melhor consistência em SPAs
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
              keepalive: true
            }).catch(() => {});
          }
        }
      }
    });
  }

  info(msg: string, ...args: any[]) {
    this.pinoLogger.info({ context: window.location.pathname }, msg, ...args);
  }

  error(msg: string, ...args: any[]) {
    this.pinoLogger.error({ context: window.location.pathname }, msg, ...args);
  }

  warn(msg: string, ...args: any[]) {
    this.pinoLogger.warn({ context: window.location.pathname }, msg, ...args);
  }

  debug(msg: string, ...args: any[]) {
    this.pinoLogger.debug({ context: window.location.pathname }, msg, ...args);
  }
}
