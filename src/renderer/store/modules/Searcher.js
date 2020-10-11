import { getFights } from '../../../main/modules/db/dao'
import { floatPoint, mars2bd } from '../../../main/modules/spirit/pointTransform'
import dateFormat from 'dateformat'

const state = {
  resultList: []
}

const getters = {
  resultTable (state) {
    let currentTs = Math.round(new Date().getTime() / 1000)
    return state.resultList.slice(0, 1000).map(row => {
      let tsDiff = currentTs - row['update_time']
      let updateTimeText = ''
      if (tsDiff < 60) {
        updateTimeText = '刚刚'
      } else if (tsDiff < 3600) {
        updateTimeText = Math.round(tsDiff / 60) + 'm'
      } else if (tsDiff < 86400) {
        updateTimeText = Math.round(tsDiff / 3600) + 'h'
      } else {
        updateTimeText = dateFormat(new Date(row['update_time'] * 1000), 'mm-dd')
      }
      return {
        'name': row.name,
        'lat': row.lat,
        'lng': row.lng,
        'update_time': updateTimeText
      }
    })
  }
}

const mutations = {
  UPDATE_RESULT_LIST (state, { resultList }) {
    state.resultList = resultList
  },
  EXPAND_RESULT_LIST (state, { resultList }) {
    state.resultList.apply(state.resultList, resultList)
  }
}

const actions = {
  search ({ commit }, { username }) {
    return new Promise((resolve, reject) => {
      getFights(username, rows => {
        let resultList = rows.map(row => {
          let bdPoint = mars2bd(floatPoint(row))
          row.lng = bdPoint.lng
          row.lat = bdPoint.lat
          return row
        })
        commit('UPDATE_RESULT_LIST', {resultList})
        resolve(resultList)
      }, (err) => {
        reject(err)
      })
    })
  },
  clear ({ commit }) {
    commit('UPDATE_RESULT_LIST', {resultList: []})
  },
  expand ({ commit }, { resultList }) {

  }
}

export default {
  namespaced: true,
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
}
