import { SPIRIT_MAP_INCR } from '../../../main/config'
import { intPoint, pointInPath } from '../../../main/modules/spirit/pointTransform'
import { onSearchError, searchByPoly } from '../../../main/modules/spirit/crawler'

const state = {
  /**
   * isSearching = false, scanPath.length = 0 停止
   * isSearching = false, scanPath.length > 0 暂停
   * isSearching = true, scanPath.length > 0 扫描中
   */
  isSearching: false, // 是否扫描中
  scanPath: [], // 扫描路径
  pointGenerator: null, // 下一个点生成器
  openid: '', // 抓取的账号
  gwgoToken: '', // 抓取的账号token
  eiiku_user: 'evenx',
  eiiku_token: 'bQD593ACLmeYO7HGjdFdX%25252F%25252F6gJELeGVf4kMw1A2XLLTEAZaWDHOtRzqsAbHTVxaNx5cUS5IAbN%25252FGbFf02d7gT7DP2fGIgymZIY58NwmGuY1imtt3OoEZwnSBItvzw02m%252BJ8WYDyJR0kgTOiB'
}

const mutations = {
  SET_SCAN (state, { isSearching, path }) {
    state.isSearching = isSearching
    if (path.length > 0) {
      state.scanPath = path
    }
    state.pointGenerator = null
    if (isSearching) {
      let path = state.scanPath.map(point => {
        return intPoint(point)
      })
      // 找到path的经纬度最大值最小值
      let maxLat = path[0].lat
      let maxLng = path[0].lng
      let minLat = path[0].lat
      let minLng = path[0].lng
      path.forEach(point => {
        maxLat = Math.max(maxLat, point.lat)
        maxLng = Math.max(maxLng, point.lng)
        minLat = Math.min(minLat, point.lat)
        minLng = Math.min(minLng, point.lng)
      })
      state.pointGenerator = pointGenerator(maxLat, maxLng, minLat, minLng, path)
    }
  },
  SET_AUTH (state, { openid, gwgoToken }) {
    state.openid = openid
    state.gwgoToken = gwgoToken
  }
}

const actions = {
  /**
   * 开始扫描
   * @param commit
   * @param dispatch
   * @param path
   */
  startScan ({ commit, dispatch }, { path }) {
    commit('SET_SCAN', {
      isSearching: true,
      path: path
    })
    searchByPoly(onSearchError)
  },
  /**
   * 停止扫描
   * @param commit
   */
  stopScan ({ commit }) {
    commit('SET_SCAN', {
      isSearching: false,
      path: []
    })
  },
  /**
   * 设置token
   * @param commit
   * @param openid
   * @param gwgoToken
   */
  async setAuth ({ commit }, { openid, gwgoToken }) {
    commit('SET_AUTH', {openid: openid, gwgoToken: gwgoToken})
  },
  getNextPoint ({ state, commit }) {
    if (state.pointGenerator !== null) {
      return state.pointGenerator.next()
    } else {
      return null
    }
  }
}

function* pointGenerator (maxLat, maxLng, minLat, minLng, path) {
  for (let lat = minLat; lat < maxLat; lat += SPIRIT_MAP_INCR) {
    for (let lng = minLng; lng < maxLng; lng += SPIRIT_MAP_INCR) {
      if (!pointInPath({ lng: lng, lat: lat }, path)) {
        continue
      }
      yield { lng: lng, lat: lat }
    }
  }
}

export default {
  namespaced: true,
  state: state,
  actions: actions,
  mutations: mutations
}
