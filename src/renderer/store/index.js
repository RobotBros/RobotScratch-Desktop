import Vue from 'vue'
import Vuex from 'vuex'
import * as types from '@/renderer/store/types'

Vue.use(Vuex)

const MAX_ENTRIES_NUM = 50

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    logs: [],
    ble: {
      state: 'unknown'
    }
  },
  mutations: {
    [types.BLE_UPDATE_STATE]: (state, bleState) => {
      state.ble.state = bleState
    },
    [types.LOG_ADD_ENTRY]: (state, entry) => {
      state.logs.push(entry)
      if (state.logs.length > MAX_ENTRIES_NUM) {
        state.logs = state.logs.slice(1)
      }
    }
  }
})

export default store
