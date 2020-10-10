import { CRAWL_URL } from '../../config'
import { bd2mars, floatPoint, intPoint, mars2bd } from './pointTransform'
import store from '../../../renderer/store'
import { insertFights } from '../db/dao'
const W3CWebSocket = require('websocket').w3cwebsocket

const ERROR = {
  ILLEGAL_PARAMS: 1,
  LOST_CONNECTION: 2,
  REQUEST_FREQUENCY: 3,
  LOGIN_TIMEOUT: 4,
  UNKNOWN: 5
}
Object.freeze(ERROR)

let crawlTimer = null

/**
 *
 * @param client
 * @param point
 */
function crawlPoint (client, point) {
  if (!store.state.Spirit.isSearching) {
    return false
  }
  if (point.done) {
    store.dispatch('Spirit/stopScan')
    return false
  }
  if (client.readyState !== client.OPEN) {
    return false
  }
  const marsPoint = intPoint(bd2mars(floatPoint(point.value)))
  const params = {
    request_type: '1002',
    latitude: marsPoint.lat,
    longtitude: marsPoint.lng,
    requestid: getRequestId(),
    platform: 0,
    appid: 'wx19376645db21af08',
    openid: store.state.Spirit.openid,
    gwgo_token: store.state.Spirit.gwgoToken
  }
  console.log(new Date().toLocaleString(), marsPoint)
  client.send(msgSerialize(params))
  return true
}

function getRequestId () {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 1000000)
}

function msgSerialize (msg) {
  let params = JSON.stringify(msg)
  let buf = Buffer.alloc(4 + params.length)
  buf.writeUInt32BE(params.length, 0)
  buf.write(params, 4, params.length, 'utf-8')
  return buf.buffer
}

/* eslint-disable */
function msgUnserialize (msg) {
  let buf = Buffer.from(msg)
  try {
    // 有些特殊字符得用eval解析，不折腾了就这样吧
    return eval('(' + buf.slice(4).toString('utf-8') + ')')
  } catch (e) {
    return {}
  }
}

function saveDojoList (dojoList) {
  if (!(dojoList instanceof Array)) {
    return
  }
  let curTs = Math.round(new Date().getTime() / 1000)
  let fights = dojoList.filter((dojo) => {
    return 'winner_name' in dojo
  }).map((dojo) => {
    let point = {
      lng: dojo['longtitude'],
      lat: dojo['latitude']
    }
    point = intPoint(mars2bd(floatPoint(point)))
    return {
      lng: point.lng,
      lat: point.lat,
      name: dojo['winner_name'],
      update_time: curTs
    }
  })
  insertFights(fights)
}

export function searchByPoly (error) {
  // 创建wss client
  const client = new W3CWebSocket(CRAWL_URL)
  client.onmessage = e => {
    if (typeof e.data === 'string') {
      // 来自tws的消息，直接json parse就行
      let data = JSON.parse(e.data)
      if (data['tws_notify_type'] === 'pass') {
        // 连接成功，开始爬
        if (crawlTimer !== null) {
          clearInterval(crawlTimer)
        }
        crawlTimer = setInterval(onTimerEvent, 300, client)
      } else if (data['tws_notify_type'] === 'close') {
        error(client, ERROR.LOST_CONNECTION)
      } else {
        error(client, ERROR.UNKNOWN, e.data)
      }
    } else if (typeof e.data === 'object') {
      let data = msgUnserialize(e.data)
      if (data['retcode'] === 10004) {
        // 登录过期
        error(client, ERROR.LOGIN_TIMEOUT)
      } else if (data['retcode'] === 10002) {
        // 请求过频繁
        error(client, ERROR.REQUEST_FREQUENCY)
      } else if (data['retcode'] === 0) {
        // 抓取成功
        saveDojoList(data['dojo_list'])
      } else {
        // 未知错误
        error(client, ERROR.UNKNOWN, JSON.stringify(data))
      }
    }
  }
}

function onTimerEvent (client) {
  store.dispatch('Spirit/getNextPoint').then(point => {
    if (!point || !crawlPoint(client, point)) {
      clearInterval(crawlTimer)
      crawlTimer = null
    }
  })
}

export function onSearchError (client, errno, error) {
  console.log(errno, error)
  store.dispatch('Spirit/pauseScan')
  client.close()
  clearInterval(crawlTimer)
  crawlTimer = null
}
