import getDB from './persistence'

const TABLE_FIGHTS = 'fights'

export function getFights (name, success, error) {
  let sql = `SELECT * FROM ${TABLE_FIGHTS}`
  if (name !== '') {
    sql += ` WHERE name like "%${name}%"`
  }
  getDB().queryAll(sql, [], success, error)
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
