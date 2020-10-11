import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: process.env.IS_WEB ? [] : [
    createPersistedState({
      whitelist: [
        'Spirit/SET_AUTH'
      ]
    }),
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
