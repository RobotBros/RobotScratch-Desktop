import Vue from 'vue'
import Vuex from 'vuex'
import noble from 'noble'
import * as types from '@/store/types'

Vue.use(Vuex)

const MAX_ENTRIES_NUM = 50
const SCAN_INTERVAL = 10000
const SERVICE_UUIDS = ['ff']
let scanTimer = null

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    snackbar: { // 弹出框
      show: false,
      color: '',
      text: '',
      timeout: 3000
    },
    alert: {
      show: false,
      title: null,
      body: null,
      alertAction: null
    },
    logs: [],
    ble: {
      scanning: false,
      state: 'unknown',
      dataToSend: null,
      connected: false
    }
  },
  mutations: {
    // change ble state
    [types.BLE_UPDATE_STATE]: (state, bleState) => {
      state.ble.state = bleState
    },

    // change scanning status
    [types.BLE_SET_SCANNING]: (state, scanning) => {
      state.ble.scanning = scanning
    },

    // change connected
    [types.BLE_SET_CONNECTED]: (state, connected) => {
      state.ble.connected = connected
    },

    // send data to ble
    [types.BLE_SEND_DATA]: (state, data) => {
      state.ble.dataToSend = data
    },

    // log add entry
    [types.LOG_ADD_ENTRY]: (state, entry) => {
      console.log(entry)
      state.logs.push(entry)
      if (state.logs.length > MAX_ENTRIES_NUM) {
        state.logs = state.logs.slice(1)
      }
    },

    // show snackbar
    [types.SHOW_SNACK]: (state, alert, color = '') => {
      state.snackbar.text = alert
      state.snackbar.color = color
      state.snackbar.show = true
    },

    // hide snackbar
    [types.HIDE_SNACK]: (state) => {
      state.snackbar.show = false
    },

    // show alert dialog
    [types.SHOW_ALERT]: (state, {title, body, actionCb}) => {
      state.alert.title = title
      state.alert.body = body
      state.alert.alertAction = actionCb
      state.alert.show = true
    },

    // hide alert dialg
    [types.HIDE_ALERT]: (state) => {
      state.alert.show = false
      if (state.alert.alertAction) {
        state.alert.alertAction(confirm)
      }
    }
  },
  actions: {
    // Setup ble
    [types.BLE_INIT]: (context) => {
      noble.on('stateChange', (state) => {
        context.commit(types.LOG_ADD_ENTRY, `Bluetooth manager state: ${state}`)
        context.commit(types.BLE_UPDATE_STATE, state)
      })

      noble.on('scanStart', () => {
        context.commit(types.BLE_SET_SCANNING, true)
      })

      noble.on('scanStop', () => {
        context.commit(types.BLE_SET_SCANNING, false)
      })

      noble.on('warning', (message) => {
        context.commit(types.LOG_ADD_ENTRY, `Bluetooth warning: ${message}`)
      })

      noble.on('disconnect', (peripheralUUID) => {
        context.commit(types.LOG_ADD_ENTRY, 'BLE Disconnected')
        context.commit(types.BLE_SET_CONNECTED, false)
      })
    },

    // Start ble scan
    [types.BLE_START_SCAN]: (context) => {
      context.commit(types.LOG_ADD_ENTRY, 'Start scanning...')
      noble.startScanning(SERVICE_UUIDS, false)
      scanTimer = setTimeout(() => {
        context.dispatch(types.BLE_STOP_SCAN)
      }, SCAN_INTERVAL)
    },

    // Stop ble scan
    [types.BLE_STOP_SCAN]: (context) => {
      if (scanTimer) {
        clearTimeout(scanTimer)
        scanTimer = null
      }
      context.commit(types.LOG_ADD_ENTRY, 'Stop scan')
      noble.stopScanning()
    },

    [types.SHOW_SNACK]: (context, alert, color = '', duration = 3000) => {
      context.commit(types.SHOW_SNACK, alert, color)
      setTimeout(() => {
        context.commit(types.HIDE_SNACK)
      }, duration)
    }
  }
})

export default store
