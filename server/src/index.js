import 'dotenv/config'
import { app } from './interface/http/index.js'
import db from './infrastructure/database/models/index.cjs'
import { startTokenCleanupJob, stopTokenCleanupJob } from './shared/services/jwt.service.js'
import logger from './shared/services/logger.service.js'

const PORT = process.env.PORT || 5000
let server = null

async function start() {
  try {
    await db.sequelize.authenticate()
    logger.info('Database connection established')

    startTokenCleanupJob(60 * 60 * 1000)

    server = app.listen(PORT, () => {
      logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server')
    process.exit(1)
  }
}

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down...')

  if (server) server.close(() => logger.info('HTTP server closed'))
  stopTokenCleanupJob()

  try {
    await db.sequelize.close()
    logger.info('Database closed')
  } catch (error) {
    logger.error({ err: error }, 'Error closing database')
  }

  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught Exception')
  shutdown('uncaughtException')
})
process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled Rejection'))

start()
