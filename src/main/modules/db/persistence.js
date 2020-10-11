import { app } from 'electron'
import { DB_FILE, USER_DATA_PATH } from '../../config'
import { TABLE_FIGHTS } from './dao'
const path = require('path')

const sqlite3 = require('sqlite3').verbose()

class DB {
  constructor () {
    this.db = new sqlite3.Database(this.getDBFilename())
    this.execute(`CREATE TABLE IF NOT EXISTS ${TABLE_FIGHTS}(lng INTEGER NOT NULL ON CONFLICT ROLLBACK, lat INTEGER NOT NULL ON CONFLICT ROLLBACK, name STRING (255) NOT NULL ON CONFLICT ROLLBACK, update_time INTEGER NOT NULL ON CONFLICT ROLLBACK, PRIMARY KEY (lng, lat))`)
  }

  static getInstance () {
    if (!DB.instance) {
      DB.instance = new DB()
    }
    return DB.instance
  }

  getDBFilename () {
    return path.join(app.getPath(USER_DATA_PATH), DB_FILE)
  }

  /**
   * 执行SQL，如增删改类操作
   * @param sql
   * @param params
   * @returns {*}
   */
  execute (sql, params = []) {
    this.db.serialize(() => {
      this.db.run(sql, params)
    })
  }

  /**
   * 批量执行多个语句
   * @param sql
   * @param paramsList
   */
  executeBatch (sql, paramsList) {
    let stmt = this.db.prepare(sql)
    this.db.parallelize(() => {
      paramsList.forEach(params => {
        stmt.run(...params)
      })
    })
    stmt.finalize()
  }

  /**
   *
   * @param sql
   * @param params
   * @param success
   * @param error
   */
  queryAll (sql, params, success, error) {
    const myCallback = (err, rows) => {
      if (err == null) {
        success(rows)
      } else {
        if (error) error(err)
      }
    }
    this.db.all(sql, params, myCallback)
  }
}

export default function getDB () {
  return DB.getInstance()
}
