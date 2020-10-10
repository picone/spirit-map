import { SPIRIT_MAP_INCR } from '../../../main/config'
import { intPoint, pointInPath } from '../../../main/modules/spirit/pointTransform'
import { onSearchError, searchByPoly } from '../../../main/modules/spirit/crawler'

const state = {
  progressMax: 0,
  progressCur: 0,
  /**
   * isSearching = false, scanPath.length = 0 停止
   * isSearching = false, scanPath.length > 0 暂停
   * isSearching = true, scanPath.length > 0 扫描中
   */
  isSearching: false, // 是否扫描中
  scanPath: [], // 扫描路径
  pointGenerator: null, // 下一个点生成器
  openid: '', // 抓取的账号
  gwgoToken: '' // 抓取的账号token
}

const mutations = {
  INCR_PROGRESS (state) {
    state.progressCur += 1
  },
  PAUSE_SCAN (state) {
    state.isSearching = false
  },
  RESUME_SCAN (state) {
    state.isSearch = true
  },
  SET_SCAN (state, { isSearching, path }) {
    state.progress_cur = 0
    state.progress_max = 0
    state.isSearching = isSearching
    state.scanPath = path
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
      // 计算大致会有多少个点，用于进度条
      state.progressMax = Math.ceil((maxLat - minLat) / SPIRIT_MAP_INCR) * Math.ceil((maxLng - minLng) / SPIRIT_MAP_INCR)
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
   * 暂停/继续扫描
   * @param state
   * @param commit
   */
  toggleScan ({ state, commit }) {
    console.log(state.isSearching)
    if (state.isSearching) {
      commit('PAUSE_SCAN')
    } else {
      // 原来是停止的，恢复后开始搜索
      commit('RESUME_SCAN')
      searchByPoly(onSearchError)
    }
  },
  pauseScan ({ commit }) {
    commit('PAUSE_SCAN')
  },
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
  setAuth ({ commit }, { openid, gwgoToken }) {
    commit('SET_AUTH', {openid: openid, gwgoToken: gwgoToken})
  },
  getNextPoint ({ state, commit }) {
    commit('INCR_PROGRESS')
    if (state.pointGenerator !== null) {
      return state.pointGenerator.next()
    } else {
      return null
    }
  }
}

const getters = {
  curPercent (state) {
    return state.progressMax === 0 ? 0 : Math.round(100 * state.progressCur / state.progressMax)
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
  getters: getters,
  actions: actions,
  mutations: mutations
}
