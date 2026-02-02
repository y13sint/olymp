'use strict'

const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
const config = require('../config.cjs')

const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]
const db = {}

function sqlLogger(sql) {
  const sensitivePatterns = [
    /'\$2[aby]\$[^']+'/g,
    /'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'/g,
    /'[a-f0-9]{32,}'/gi,
    /password_hash\s*=\s*'[^']+'/gi,
  ]
  let maskedSql = sql
  for (const pattern of sensitivePatterns) {
    maskedSql = maskedSql.replace(pattern, "'[REDACTED]'")
  }
  console.debug('[SQL]', maskedSql)
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: env === 'development' ? sqlLogger : false,
  define: { underscored: true },
})

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-4) === '.cjs' && file.indexOf('.test.cjs') === -1)
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db)
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
