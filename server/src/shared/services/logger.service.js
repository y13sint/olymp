import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

// Конфигурация логгера
const loggerConfig = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  // В development используем красивый вывод, в production - JSON
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
}

export const logger = pino(loggerConfig)

// Хелперы для логирования с контекстом
export function createChildLogger(context) {
  return logger.child(context)
}

// Логгер для HTTP запросов
export function httpLogger(req, res, next) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
    }

    // Добавляем userId если авторизован
    if (req.user?.id) {
      logData.userId = req.user.id
    }

    // Логируем с разным уровнем в зависимости от статуса
    if (res.statusCode >= 500) {
      logger.error(logData, 'HTTP Request')
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'HTTP Request')
    } else {
      logger.info(logData, 'HTTP Request')
    }
  })

  next()
}

export default logger
