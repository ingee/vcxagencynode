/**
 * Copyright 2020 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const winston = require('winston')
const path = require('path')
const { characterTruncater, jsonFormatter, tryAddRequestId } = require('./logger-common')

const prettyFormatter = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    msg => {
      return `[${msg.timestamp}] [${msg.filename}] [${msg.level}] [expressRequestId=${msg.expressRequestId}]: ${msg.message}`
    }
  )
)

function createConsoleLogger (mainLoggerName, formatter, logLevel, makeItSilent = false) {
  winston.loggers.add(mainLoggerName, {
    transports: [
      new winston.transports.Console({
        silent: makeItSilent,
        level: logLevel,
        format: winston.format.combine(
          characterTruncater(5000),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
          }),
          tryAddRequestId,
          formatter
        )
      })
    ]
  })
}

function addChildLogger (mainLoggerName, fullPath) {
  return winston.loggers.get(mainLoggerName).child({
    filename: path.basename(fullPath, path.extname(fullPath))
  })
}

const mainLoggerName = 'main'

const formatter = process.env.LOG_JSON_TO_CONSOLE === 'true' ? jsonFormatter : prettyFormatter
const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
createConsoleLogger(mainLoggerName, formatter, logLevel, process.env.SILENT_WINSTON)

module.exports = function (fullPath) {
  return addChildLogger(mainLoggerName, fullPath)
}
