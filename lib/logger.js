import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const createLogger = (serviceName = 'hootner', type = 'servers') => {
  const logDir = path.join(process.cwd(), 'logs');
  
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new DailyRotateFile({
        filename: path.join(logDir, type, `${serviceName}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d'
      }),
      new DailyRotateFile({
        filename: path.join(logDir, 'errors', `${serviceName}-error-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d'
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log')
      }),
      new winston.transports.Console({ 
        format: winston.format.simple() 
      })
    ]
  });
};

export default createLogger();
export { createLogger };