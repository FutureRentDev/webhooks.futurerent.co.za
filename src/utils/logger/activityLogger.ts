/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

// Interface for log data
export interface ActivityLogData {
  logId: string;
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  url: string;
  originalUrl: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  query: Record<string, any>;
  body: any;
  responseStatus?: number;
  responseTime?: number;
  error?: any;
}

// Configure Winston loggers
const activityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/activity.log',
      level: 'info', // Only log info and above (but not errors)
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Only log errors
    }),
  ],
});

const appControlLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/app_control.log',
      level: 'info', // Log authorization and control events
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      ),
    }),
  ],
});

class ActivityLogger {
  private static sanitizeHeaders(
    headers: Record<string, any>,
  ): Record<string, string> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'password',
      'token',
      'api-key',
    ];
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  private static sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'creditcard',
      'ssn',
      'cvv',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  static createLogData(
    req: Request,
    res: Response,
    startTime: number,
  ): ActivityLogData {
    const logId = uuidv4();
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    return {
      logId,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `${req.method} ${req.originalUrl}`,
      requestId,
      userId: (req as any).user?.id || (req.headers['x-user-id'] as string),
      ipAddress:
        req.ip ||
        req.connection.remoteAddress ||
        (req.headers['x-forwarded-for'] as string) ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      headers: this.sanitizeHeaders(req.headers),
      params: { ...req.params },
      query: { ...req.query },
      body: this.sanitizeBody(req.body),
      responseTime: Date.now() - startTime,
    };
  }

  static logRequest(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const logData = this.createLogData(req, res, startTime);

    // Store log data in request for response logging
    (req as any).activityLogData = logData;
    (req as any).requestStartTime = startTime;

    // Check for authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    console.log(req.socket.localAddress, 'here bru')
    // check if the url is not just the base url
    if (req.originalUrl !== '/assets/favicon.ico' && req.originalUrl !== '/' && !authHeader) {
      // Log to app_control.log for authorization events
      const authControlLog = {
        ...logData,
        responseStatus: 401,
        responseTime: Date.now() - startTime,
        level: 'warn',
        eventType: 'AUTHORIZATION_FAILED',
        reason: 'Missing authorization header',
        action: 'ACCESS_DENIED',
      };

      appControlLogger.warn('Authorization failed - Missing header', authControlLog);

      res.status(401).json({
        error: 'Access denied',
        message: 'Authorization header is required',
      });
      
      return;
    }

    // Log successful authorization to app_control.log
    const authSuccessLog = {
      ...logData,
      eventType: 'AUTHORIZATION_CHECK',
      status: 'HEADER_PRESENT',
      level: 'info',
    };
    
    appControlLogger.info('Authorization header present', authSuccessLog);

    // Log the incoming request to activity log
    activityLogger.info('Incoming request', logData);

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const responseLogData = {
        ...logData,
        responseStatus: res.statusCode,
        responseTime,
        level: res.statusCode === 400 ? 'error' : 'info',
      };

      if (res.statusCode === 400) {
        errorLogger.error(
          `Request failed with status ${res.statusCode}`,
          responseLogData,
        );
      } else {
        activityLogger.info(
          `Request completed successfully with status ${res.statusCode}`,
          responseLogData,
        );
      }
    });

    next();
  }

  static logError(error: any, req: Request, res: Response): void {
    const startTime = (req as any).requestStartTime || Date.now();
    const responseTime = Date.now() - startTime;
    const logData = (req as any).activityLogData || this.createLogData(req, res, startTime);

    const errorLogData = {
      ...logData,
      responseStatus: res.statusCode || 500,
      responseTime,
      level: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    };

    errorLogger.error('Request failed', errorLogData);
  }

  // New method specifically for app control events
  static logAppControlEvent(eventType: string, message: string, data?: any, req?: Request): void {
    const logData = {
      logId: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'info',
      eventType,
      message,
      ...data,
    };

    if (req) {
      const startTime = Date.now();
      const requestData = this.createLogData(req, {} as Response, startTime);
      Object.assign(logData, requestData);
    }

    appControlLogger.info(message, logData);
  }

  // Specific method for authorization events
  static logAuthorizationEvent(eventType: 'GRANTED' | 'DENIED' | 'EXPIRED' | 'INVALID', 
                              message: string, 
                              req: Request, 
                              additionalData?: any): void {
    const startTime = Date.now();
    const logData = this.createLogData(req, {} as Response, startTime);
    
    const authEventLog = {
      ...logData,
      eventType: `AUTHORIZATION_${eventType}`,
      level: eventType === 'GRANTED' ? 'info' : 'warn',
      ...additionalData,
    };

    appControlLogger.log(
      eventType === 'GRANTED' ? 'info' : 'warn',
      `Authorization ${eventType.toLowerCase()}: ${message}`,
      authEventLog
    );
  }

  static logCustomActivity(message: string, data?: any): void {
    const logData = {
      logId: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      customData: data,
    };

    activityLogger.info(message, logData);
  }
}

export default ActivityLogger;