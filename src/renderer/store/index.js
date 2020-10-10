import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: process.env.IS_WEB ? [] : [
    createPersistedState({
      blacklist: [
        'Spirit/INCR_PROGRESS',
        'Spirit/PAUSE_SCAN',
        'Spirit/RESUME_SCAN',
        'Spirit/SET_SCAN',
        'Searcher/UPDATE_RESULT_LIST'
      ]
    }),
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
