import getDB from './persistence'
import { OUTLINE_MAP_INTERVAL } from '../../config'

export const TABLE_FIGHTS = 'fights'

export function getFights (name, success, error) {
  let sql = `SELECT * FROM ${TABLE_FIGHTS}`
  if (name !== '') {
    sql += ` WHERE name like "%${name}%"`
  }
  getDB().queryAll(sql, [], success, error)
}

export function getMinPosition (success, error) {
  let sql = `SELECT min(lat) lat, max(lng) lng FROM ${TABLE_FIGHTS}`
  let mySuccess = (rows) => {
    if (rows.length === 0) {
      error('empty result')
    } else {
      success(rows[0])
    }
  }
  getDB().queryAll(sql, [], mySuccess, error)
}

export function getFightsAggregation (success, error) {
  getMinPosition(point => {
    let sql = `SELECT CAST(AVG(lng) AS int) lng, CAST(AVG(lat) AS int) lat, COUNT(*) count FROM ${TABLE_FIGHTS} GROUP BY ((lng - ${point.lng}) / ${OUTLINE_MAP_INTERVAL}), ((lat - ${point.lat}) / ${OUTLINE_MAP_INTERVAL})`
    getDB().queryAll(sql, [], success, error)
  }, error)
}

export function insertFights (fights) {
  if (!fights || !(fights instanceof Array) || fights.length === 0) {
    return
  }
  let paramsList = fights.map(fight => {
    return [fight.lng, fight.lat, fight.name, fight.update_time]
  })
  getDB().executeBatch(`REPLACE INTO ${TABLE_FIGHTS}(lng, lat, name, update_time) VALUES (?, ?, ?, ?)`, paramsList)
}
